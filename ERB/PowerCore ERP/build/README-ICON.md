# إضافة أيقونة للتطبيق

لإضافة أيقونة مخصصة للتطبيق (ملف exe + المتصفح):

1. ضع ملف الأيقونة في مجلد `src/images/`:
   - `src/images/nar.ico` (مفضل)
   - أو `src/images/nar.png` / `src/images/nar.jpg`
2. شغّل البناء: `npm run build:win`

سيتم تلقائياً نسخ الأيقونة إلى:
- `build/icon.ico` لملف exe
- `public/favicon.ico` لأيقونة المتصفح/التبويب
