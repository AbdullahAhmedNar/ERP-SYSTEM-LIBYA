"use strict";
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");
class BackupManager {
  constructor(dbPath) {
    __publicField(this, "dbPath");
    __publicField(this, "backupDir");
    this.dbPath = dbPath;
    this.backupDir = path.join(path.dirname(dbPath), "backups");
    this.ensureBackupDir();
  }
  ensureBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }
  /** إنشاء نسخة احتياطية - نسخ بسيط بعد دمج WAL */
  createBackup(customPath) {
    try {
      if (!fs.existsSync(this.dbPath)) {
        return { success: false, error: "ملف قاعدة البيانات غير موجود" };
      }
      const destPath = customPath || path.join(
        this.backupDir,
        `powercore_backup_${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-")}.db`
      );
      fs.copyFileSync(this.dbPath, destPath);
      if (!customPath) this.cleanOldBackups(10);
      return { success: true, path: destPath };
    } catch (error) {
      return { success: false, error: (error == null ? void 0 : error.message) || "فشل النسخ" };
    }
  }
  /** التحقق من أن الملف قاعدة بيانات SQLite صالحة */
  validateSqliteFile(filePath) {
    try {
      const db = new Database(filePath, { readonly: true });
      db.prepare("SELECT 1").get();
      db.close();
      return true;
    } catch {
      return false;
    }
  }
  /** استعادة من ملف - مثل mg_fabric: التحقق أولاً بفتح الملف ثم الاستبدال */
  restoreFromFile(sourcePath) {
    try {
      if (!sourcePath || !fs.existsSync(sourcePath)) {
        return { success: false, error: "الملف غير موجود" };
      }
      if (!sourcePath.toLowerCase().endsWith(".db")) {
        return { success: false, error: "يرجى اختيار ملف .db فقط" };
      }
      const stats = fs.statSync(sourcePath);
      if (stats.size < 512) {
        return { success: false, error: "الملف فارغ أو تالف" };
      }
      if (!this.validateSqliteFile(sourcePath)) {
        return { success: false, error: "الملف ليس قاعدة بيانات SQLite صالحة" };
      }
      const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
      const beforeRestorePath = path.join(
        this.backupDir,
        `powercore_before_restore_${timestamp}.db`
      );
      if (fs.existsSync(this.dbPath)) {
        fs.copyFileSync(this.dbPath, beforeRestorePath);
      }
      const walPath = this.dbPath + "-wal";
      const shmPath = this.dbPath + "-shm";
      try {
        if (fs.existsSync(walPath)) fs.unlinkSync(walPath);
        if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath);
      } catch (_) {
      }
      fs.copyFileSync(sourcePath, this.dbPath);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error == null ? void 0 : error.message) || "فشل الاستعادة" };
    }
  }
  cleanOldBackups(keepCount = 10) {
    try {
      const files = fs.readdirSync(this.backupDir).filter((f) => f.startsWith("powercore_backup_") && f.endsWith(".db")).map((f) => ({
        name: f,
        path: path.join(this.backupDir, f),
        time: fs.statSync(path.join(this.backupDir, f)).mtime.getTime()
      })).sort((a, b) => b.time - a.time);
      if (files.length > keepCount) {
        files.slice(keepCount).forEach((file) => {
          try {
            fs.unlinkSync(file.path);
          } catch (_) {
          }
        });
      }
    } catch (_) {
    }
  }
  getBackups() {
    try {
      return fs.readdirSync(this.backupDir).filter((f) => f.startsWith("powercore_backup_") && f.endsWith(".db")).map((f) => {
        const fullPath = path.join(this.backupDir, f);
        const stat = fs.statSync(fullPath);
        return {
          name: f,
          path: fullPath,
          size: stat.size,
          time: stat.mtime
        };
      }).sort((a, b) => b.time.getTime() - a.time.getTime());
    } catch {
      return [];
    }
  }
}
exports.BackupManager = BackupManager;
