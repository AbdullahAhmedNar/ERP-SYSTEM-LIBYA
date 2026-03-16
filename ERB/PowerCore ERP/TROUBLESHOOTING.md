# استكشاف الأخطاء - PowerCore ERP

## التطبيق لا يفتح عند النقر على الأيقونة

1. **تحقق من ملف السجل**: افتح المسار التالي وابحث عن أخطاء:
   ```
   %AppData%\powercore-erp\powercore-error.log
   ```

2. **إعادة بناء الموديولات الأصلية**:
   ```bash
   npx electron-rebuild -f -w better-sqlite3
   npm run build:win
   ```

3. **تشغيل من سطر الأوامر لرؤية الأخطاء**:
   ```bash
   cd release\win-unpacked
   "PowerCore ERP.exe"
   ```

## الأيقونة لا تظهر

1. تأكد من وجود ملف `src/imgaes/nar.jpg` (أو `src/images/nar.jpg`)
2. قبل البناء: `node scripts/prepare-icon.js`
3. يجب أن يظهر `build/icon.ico` و `build/icon.png`
4. أعد البناء: `npm run build:win`
