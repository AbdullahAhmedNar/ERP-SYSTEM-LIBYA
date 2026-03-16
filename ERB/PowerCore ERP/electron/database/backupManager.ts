/**
 * PowerCore ERP - Backup Manager
 * مستوحى من نظام mg_fabric - نسخ احتياطي واستعادة بسيطة وموثوقة
 */

import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

export class BackupManager {
  private dbPath: string;
  private backupDir: string;

  constructor(dbPath: string) {
    this.dbPath = dbPath;
    this.backupDir = path.join(path.dirname(dbPath), 'backups');
    this.ensureBackupDir();
  }

  private ensureBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  /** إنشاء نسخة احتياطية - نسخ بسيط بعد دمج WAL */
  createBackup(customPath?: string): { success: boolean; path?: string; error?: string } {
    try {
      if (!fs.existsSync(this.dbPath)) {
        return { success: false, error: 'ملف قاعدة البيانات غير موجود' };
      }

      const destPath = customPath || path.join(
        this.backupDir,
        `powercore_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.db`
      );

      fs.copyFileSync(this.dbPath, destPath);
      if (!customPath) this.cleanOldBackups(10);
      return { success: true, path: destPath };
    } catch (error: any) {
      return { success: false, error: error?.message || 'فشل النسخ' };
    }
  }

  /** التحقق من أن الملف قاعدة بيانات SQLite صالحة */
  private validateSqliteFile(filePath: string): boolean {
    try {
      const db = new Database(filePath, { readonly: true });
      db.prepare('SELECT 1').get();
      db.close();
      return true;
    } catch {
      return false;
    }
  }

  /** استعادة من ملف - مثل mg_fabric: التحقق أولاً بفتح الملف ثم الاستبدال */
  restoreFromFile(sourcePath: string): { success: boolean; error?: string } {
    try {
      if (!sourcePath || !fs.existsSync(sourcePath)) {
        return { success: false, error: 'الملف غير موجود' };
      }

      if (!sourcePath.toLowerCase().endsWith('.db')) {
        return { success: false, error: 'يرجى اختيار ملف .db فقط' };
      }

      const stats = fs.statSync(sourcePath);
      if (stats.size < 512) {
        return { success: false, error: 'الملف فارغ أو تالف' };
      }

      if (!this.validateSqliteFile(sourcePath)) {
        return { success: false, error: 'الملف ليس قاعدة بيانات SQLite صالحة' };
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const beforeRestorePath = path.join(
        this.backupDir,
        `powercore_before_restore_${timestamp}.db`
      );

      if (fs.existsSync(this.dbPath)) {
        fs.copyFileSync(this.dbPath, beforeRestorePath);
      }

      const walPath = this.dbPath + '-wal';
      const shmPath = this.dbPath + '-shm';

      try {
        if (fs.existsSync(walPath)) fs.unlinkSync(walPath);
        if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath);
      } catch (_) {}

      fs.copyFileSync(sourcePath, this.dbPath);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error?.message || 'فشل الاستعادة' };
    }
  }

  private cleanOldBackups(keepCount = 10) {
    try {
      const files = fs
        .readdirSync(this.backupDir)
        .filter((f) => f.startsWith('powercore_backup_') && f.endsWith('.db'))
        .map((f) => ({
          name: f,
          path: path.join(this.backupDir, f),
          time: fs.statSync(path.join(this.backupDir, f)).mtime.getTime(),
        }))
        .sort((a, b) => b.time - a.time);

      if (files.length > keepCount) {
        files.slice(keepCount).forEach((file) => {
          try {
            fs.unlinkSync(file.path);
          } catch (_) {}
        });
      }
    } catch (_) {}
  }

  getBackups(): { name: string; path: string; size: number; time: Date }[] {
    try {
      return fs
        .readdirSync(this.backupDir)
        .filter((f) => f.startsWith('powercore_backup_') && f.endsWith('.db'))
        .map((f) => {
          const fullPath = path.join(this.backupDir, f);
          const stat = fs.statSync(fullPath);
          return {
            name: f,
            path: fullPath,
            size: stat.size,
            time: stat.mtime,
          };
        })
        .sort((a, b) => b.time.getTime() - a.time.getTime());
    } catch {
      return [];
    }
  }
}
