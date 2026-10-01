const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.resolve(__dirname, '../public');
const ICONS_DIR = path.join(PUBLIC_DIR, 'pwa-icons');
const SVG_PATH = path.join(PUBLIC_DIR, 'favicon.svg');

if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

const svgBuffer = fs.readFileSync(SVG_PATH);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

sizes.forEach(size => {
  sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(path.join(ICONS_DIR, `icon-${size}x${size}.png`))
    .then(() => console.log(`✅ icon-${size}x${size}.png`))
    .catch(err => console.error(`❌ icon-${size}x${size}.png:`, err));
});

sharp(svgBuffer)
  .resize(512, 512)
  .extend({ top: 50, bottom: 50, left: 50, right: 50, background: { r: 26, g: 115, b: 232, alpha: 1 } })
  .png()
  .toFile(path.join(ICONS_DIR, 'maskable-512x512.png'))
  .then(() => console.log('✅ maskable-512x512.png'))
  .catch(err => console.error('❌ maskable-512x512.png:', err));

sharp(svgBuffer)
  .resize(180, 180)
  .png()
  .toFile(path.join(PUBLIC_DIR, 'apple-touch-icon.png'))
  .then(() => console.log('✅ apple-touch-icon.png'))
  .catch(err => console.error('❌ apple-touch-icon.png:', err));

console.log('\nDone!\n');