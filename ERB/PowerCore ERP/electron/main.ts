import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import fs from 'fs';

const isDev = process.env.NODE_ENV === 'development';

let dbModule: typeof import('./database/appDb') | null = null;
async function ensureDb() {
  if (!dbModule) {
    try {
      dbModule = await import('./database/appDb');
      dbModule.getAppDatabase();
    } catch (err) {
      logError('فشل تحميل قاعدة البيانات', err);
      throw err;
    }
  }
  return dbModule;
}

let mainWindow: BrowserWindow | null = null;

function getLogPath() {
  return path.join(app.getPath('userData'), 'powercore-error.log');
}

function logError(msg: string, err?: unknown) {
  try {
    const logPath = getLogPath();
    const line = `[${new Date().toISOString()}] ${msg}${err ? ': ' + (err instanceof Error ? err.message : String(err)) : ''}\n`;
    fs.appendFileSync(logPath, line);
  } catch (_) {}
}

function getIconPath(): string | undefined {
  const base = path.join(__dirname, '..');
  for (const name of ['icon.ico', 'icon.png']) {
    const p = path.join(base, 'build', name);
    if (fs.existsSync(p)) return p;
  }
  return undefined;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    frame: true,
    titleBarStyle: 'default',
    icon: getIconPath(),
    show: false,
    backgroundColor: '#0A1628',
    title: 'PowerCore ERP - نظام إدارة متكامل',
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    mainWindow?.focus();
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    const indexPath = path.join(__dirname, '../dist/index.html');
    mainWindow.loadFile(indexPath).catch((err) => {
      logError('فشل تحميل الصفحة', err);
    });
  }

  mainWindow.webContents.on('did-fail-load', (_, code, desc) => {
    logError(`فشل التحميل: ${code} ${desc}`);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  app.whenReady().then(async () => {
    process.on('uncaughtException', (err) => {
      logError('uncaughtException', err);
    });
    process.on('unhandledRejection', (reason) => {
      logError('unhandledRejection', reason);
    });

    try {
      createWindow();
      registerIpcHandlers();
      await ensureDb();
    } catch (err: any) {
      const errMsg = err instanceof Error ? err.message : String(err);
      logError('خطأ عند بدء التطبيق', err);
      dialog.showErrorBox(
        'خطأ - فشل بدء التطبيق',
        `${errMsg}\n\nراجع السجل: ${getLogPath()}`
      );
      app.quit();
      return;
    }

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

function registerIpcHandlers() {
  // ═══════════════════════════════════════════════════════════════
  // PowerCore ERP - SQLite Sync (Zustand)
  // ═══════════════════════════════════════════════════════════════

  ipcMain.handle('db:loadState', async () => {
    try {
      const { loadState } = await ensureDb();
      return loadState();
    } catch (err) {
      logError('db:loadState', err);
      return null;
    }
  });

  ipcMain.handle('db:saveState', async (_e, state: Parameters<typeof import('./database/appDb')['saveState']>[0]) => {
    try {
      const { saveState } = await ensureDb();
      saveState(state);
      return { success: true };
    } catch (err) {
      logError('db:saveState', err);
      return { success: false };
    }
  });

  ipcMain.handle('db:getBackupPath', async () => {
    const { getDatabasePath } = await ensureDb();
    return getDatabasePath();
  });

  ipcMain.handle('backup:copySqlite', async (_e, state?: Parameters<typeof import('./database/appDb')['saveState']>[0]) => {
    const defaultName = `PowerCore-Backup-${new Date().toISOString().split('T')[0]}.db`;
    const { filePath } = await dialog.showSaveDialog({
      title: 'حفظ نسخة احتياطية',
      defaultPath: defaultName,
      filters: [{ name: 'SQLite Database', extensions: ['db'] }],
    });
    if (!filePath) return { success: false, message: 'تم الإلغاء' };

    try {
      const dbMod = await ensureDb();
      const Database = (await import('better-sqlite3')).default;
      const targetPath = dbMod.getDatabasePath();

      // إذا وُردت الحالة من الواجهة: كتابتها أولاً ثم دمج WAL لضمان وجود البيانات في الملف
      if (state && typeof state === 'object') {
        try {
          dbMod.saveState(state);
        } catch (saveErr: any) {
          logError('backup:copySqlite saveState', saveErr);
          return { success: false, message: saveErr?.message || 'فشل حفظ البيانات قبل النسخ' };
        }
      }

      // دمج WAL في الملف الرئيسي قبل النسخ
      dbMod.checkpointBeforeBackup?.();
      await new Promise(r => setTimeout(r, 50));

      const currentDb = new Database(targetPath);
      const tableCount = (currentDb.prepare(`
        SELECT COUNT(*) as count FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
      `).get() as any).count;
      currentDb.close();

      if (tableCount === 0) {
        return { success: false, message: 'لا توجد بيانات للنسخ الاحتياطي' };
      }

      fs.copyFileSync(targetPath, filePath);
      return { success: true, filePath, message: `تم حفظ النسخة الاحتياطية (${tableCount} جداول)` };
    } catch (err: any) {
      logError('backup:copySqlite', err);
      return { success: false, message: err?.message || 'فشل النسخ' };
    }
  });

  ipcMain.handle('backup:restoreFromSqlite', async () => {
    const { filePaths } = await dialog.showOpenDialog(mainWindow!, {
      title: 'استعادة من نسخة احتياطية SQLite',
      filters: [{ name: 'ملف SQLite', extensions: ['db'] }, { name: 'جميع الملفات', extensions: ['*'] }],
      properties: ['openFile'],
    });
    if (!filePaths?.[0]) return { success: false, message: 'تم الإلغاء' };

    const sourcePath = filePaths[0];
    if (!sourcePath.toLowerCase().endsWith('.db')) {
      return { success: false, message: 'يرجى اختيار ملف نسخة احتياطية بصيغة .db فقط' };
    }

    try {
      // التحقق من أن الملف هو ملف SQLite صحيح
      const header = (fs.readFileSync(sourcePath) as Buffer).slice(0, 16);
      const sqliteMagic = Buffer.from('SQLite format 3\x00');
      if (!header.equals(sqliteMagic)) {
        return { success: false, message: 'الملف المحدد ليس ملف قاعدة بيانات SQLite صالح' };
      }

      // التحقق من حجم الملف الاحتياطي
      const stats = fs.statSync(sourcePath);
      if (stats.size < 512) {
        return { success: false, message: 'الملف الاحتياطي يبدو أنه تالف أو فارغ جداً' };
      }

      // إغلاق قاعدة البيانات الحالية
      const dbMod = await ensureDb();
      dbMod.closeDatabase();
      
      const targetPath = dbMod.getDatabasePath();
      const walPath = targetPath + '-wal';
      const shmPath = targetPath + '-shm';
      
      // حذف ملفات WAL والملفات المؤقتة
      await new Promise(r => setTimeout(r, 100)); // انتظر قليلاً للتأكد من إغلاق الاتصال
      try {
        if (fs.existsSync(walPath)) fs.unlinkSync(walPath);
        if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath);
        if (fs.existsSync(targetPath)) fs.unlinkSync(targetPath);
      } catch (_) {}
      
      // نسخ الملف الاحتياطي إلى موقع قاعدة البيانات
      fs.copyFileSync(sourcePath, targetPath);
      
      // إعادة تعيين المتغير العام
      dbModule = null;
      
      // إعادة تهيئة قاعدة البيانات من الملف المستعاد
      const restoredDbMod = await ensureDb();
      const restoredDb = restoredDbMod.getAppDatabase?.() || restoredDbMod as any;
      
      // التحقق من وجود الجداول الأساسية
      const tables = restoredDb.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
      `).all() as any[];
      
      if (tables.length === 0) {
        return { success: false, message: 'الملف الاحتياطي لا يحتوي على جداول صالحة' };
      }
      
      // محاولة قراءة البيانات من الملف المستعاد
      const newState = restoredDbMod.loadState?.();
      if (!newState) {
        return { success: false, message: 'فشل قراءة البيانات من الملف. تأكد أن الملف نسخة احتياطية صالحة من PowerCore ERP.' };
      }

      return { success: true, state: newState, message: `تم استعادة النسخة الاحتياطية بنجاح - تم استعادة ${tables.length} جداول` };
    } catch (err: any) {
      logError('backup:restoreFromSqlite', err);
      return { success: false, message: err?.message || 'فشل الاستعادة' };
    }
  });
}
