/**
 * حذف مجلد release قبل البناء لتجنب خطأ "Access is denied"
 * يحاول إغلاق التطبيق تلقائياً إن كان يعمل
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const releaseDir = path.join(__dirname, '..', 'release');

if (!fs.existsSync(releaseDir)) process.exit(0);

try {
  execSync('taskkill /F /IM "PowerCore ERP.exe" 2>nul', { stdio: 'ignore' });
  const end = Date.now() + 2000;
  while (Date.now() < end) {}
} catch (_) {}

try {
  fs.rmSync(releaseDir, { recursive: true, force: true });
  console.log('✓ تم حذف مجلد release');
} catch (err) {
  console.warn('⚠ لم يتم حذف مجلد release:', err.message);
  console.warn('');
  console.warn('  الحل: أغلق التطبيق والمستكشف ثم نفّذ:');
  console.warn('  Remove-Item -Recurse -Force release');
  console.warn('  npm run build:win');
  console.warn('');
  process.exit(1);
}
