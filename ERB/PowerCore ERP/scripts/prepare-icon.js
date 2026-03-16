/**
 * نسخ أيقونة nar من src/images إلى build/icon.ico
 * يدعم ملف .ico مباشرة أو تحويل PNG/JPG إلى .ico
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const toIco = require('to-ico');

const root = path.join(__dirname, '..');
const buildDir = path.join(root, 'build');

// أولوية: nar من src/images (أو src/imgaes للتوافق مع الخطأ الإملائي)
const icoPaths = [
  path.join(root, 'src', 'images', 'nar.ico'),
  path.join(root, 'src', 'imgaes', 'nar.ico'),
];
const rasterPaths = [
  path.join(root, 'src', 'images', 'nar.png'),
  path.join(root, 'src', 'images', 'nar.jpg'),
  path.join(root, 'src', 'imgaes', 'nar.png'),
  path.join(root, 'src', 'imgaes', 'nar.jpg'),
  path.join(root, 'images', 'nar.png'),
  path.join(root, 'images', 'nar.jpg'),
];

if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

async function run() {
  try {
    let icoFound = null;
    for (const p of icoPaths) {
      if (fs.existsSync(p)) {
        icoFound = p;
        break;
      }
    }
    if (icoFound) {
      fs.copyFileSync(icoFound, path.join(buildDir, 'icon.ico'));
      const publicDir = path.join(root, 'public');
      if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
      fs.copyFileSync(icoFound, path.join(publicDir, 'favicon.ico'));
      console.log('✓ تم نسخ nar.ico إلى build/icon.ico و public/favicon.ico');
      return;
    }

    let found = null;
    for (const p of rasterPaths) {
      if (fs.existsSync(p)) {
        found = p;
        break;
      }
    }

    if (!found) {
      console.warn('لم يتم العثور على أيقونة nar (nar.ico أو nar.png) في مجلد images أو src/images. تخطي التحويل.');
      process.exit(0);
    }

    const meta = await sharp(found).metadata();
    const srcSize = Math.min(512, meta.width || 256, meta.height || 256);

    const highQuality = await sharp(found)
      .resize(srcSize, srcSize, { fit: 'cover', kernel: sharp.kernel.lanczos3 })
      .png({ compressionLevel: 0 })
      .toBuffer();

    await sharp(highQuality).resize(256, 256).png({ compressionLevel: 0 }).toFile(path.join(buildDir, 'icon.png'));

    const icoSizes = [256, 48, 32, 16];
    const icoBuffers = await Promise.all(
      icoSizes.map((s) => sharp(highQuality).resize(s, s, { kernel: sharp.kernel.lanczos3 }).png({ compressionLevel: 0 }).toBuffer())
    );

    const icoBuffer = await toIco(icoBuffers);
    fs.writeFileSync(path.join(buildDir, 'icon.ico'), icoBuffer);

    const publicDir = path.join(root, 'public');
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
    fs.copyFileSync(path.join(buildDir, 'icon.ico'), path.join(publicDir, 'favicon.ico'));

    console.log('✓ تم إنشاء build/icon.png و build/icon.ico و public/favicon.ico');
  } catch (err) {
    console.error('خطأ في تحويل الأيقونة:', err.message);
    process.exit(1);
  }
}

run();
