const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { app, nativeImage } = require('electron');

const PROJECT_ROOT = path.join(__dirname, '..');
const BUILD_DIR = path.join(PROJECT_ROOT, 'build');
const BUILD_PNG = path.join(BUILD_DIR, 'app-icon.png');
const BUILD_ICO = path.join(BUILD_DIR, 'app-icon.ico');
const APP_DATA = process.env.APPDATA ?? path.join(os.homedir(), 'AppData', 'Roaming');
const USER_DATA_DIRS = [
  path.join(APP_DATA, 'xinyuexia-desktop-dev'),
  path.join(APP_DATA, 'xinyuexia-desktop'),
];
const USER_ICON_NAMES = ['custom-app-icon.png', 'default-app-icon.png'];
const ICON_SIZES = [16, 24, 32, 48, 64, 128, 256];

function getRoundedRectCoverage(x, y, width, height, radius) {
  const samples = 3;
  let covered = 0;
  for (let sy = 0; sy < samples; sy += 1) {
    for (let sx = 0; sx < samples; sx += 1) {
      const cx = x + (sx + 0.5) / samples;
      const cy = y + (sy + 0.5) / samples;
      const innerX = Math.max(radius, Math.min(cx, width - radius));
      const innerY = Math.max(radius, Math.min(cy, height - radius));
      const dx = cx - innerX;
      const dy = cy - innerY;
      if (dx * dx + dy * dy <= radius * radius) covered += 1;
    }
  }
  return covered / (samples * samples);
}

function roundImage(sourceImage, size) {
  const image = sourceImage.resize({ width: size, height: size, quality: 'best' });
  const imageSize = image.getSize();
  const bitmap = image.toBitmap();
  const radius = Math.round(Math.min(imageSize.width, imageSize.height) * 0.22);

  for (let y = 0; y < imageSize.height; y += 1) {
    for (let x = 0; x < imageSize.width; x += 1) {
      const offset = (y * imageSize.width + x) * 4;
      bitmap[offset + 3] = Math.round(bitmap[offset + 3] * getRoundedRectCoverage(x, y, imageSize.width, imageSize.height, radius));
    }
  }

  return nativeImage.createFromBitmap(bitmap, imageSize);
}

function makeIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + images.length * 16;
  const entries = images.map(({ size, data }) => {
    const entry = Buffer.alloc(16);
    entry[0] = size >= 256 ? 0 : size;
    entry[1] = size >= 256 ? 0 : size;
    entry[2] = 0;
    entry[3] = 0;
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    return entry;
  });

  return Buffer.concat([header, ...entries, ...images.map((image) => image.data)]);
}

function findSourceIconPath() {
  const candidates = [
    ...USER_DATA_DIRS.flatMap((dir) => USER_ICON_NAMES.map((name) => path.join(dir, name))),
    BUILD_PNG,
    BUILD_ICO,
  ];
  return candidates.find((filePath) => fs.existsSync(filePath));
}

function writePng(filePath, image) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, image.toPNG());
}

app.whenReady().then(() => {
  const sourcePath = process.argv[2] || findSourceIconPath();
  if (!sourcePath) throw new Error('No source icon found.');

  const sourceImage = nativeImage.createFromPath(sourcePath);
  if (sourceImage.isEmpty()) throw new Error(`Unable to read source icon: ${sourcePath}`);

  const rounded256 = roundImage(sourceImage, 256);
  writePng(BUILD_PNG, rounded256);

  const icoImages = ICON_SIZES.map((size) => ({
    size,
    data: roundImage(sourceImage, size).toPNG(),
  }));
  fs.writeFileSync(BUILD_ICO, makeIco(icoImages));

  USER_DATA_DIRS.forEach((dir) => {
    USER_ICON_NAMES.forEach((name) => {
      const filePath = path.join(dir, name);
      if (fs.existsSync(filePath)) writePng(filePath, rounded256);
    });
  });

  console.log(`Rounded app icon from ${sourcePath}`);
  console.log(`Updated ${BUILD_PNG}`);
  console.log(`Updated ${BUILD_ICO}`);
  app.quit();
}).catch((error) => {
  console.error(error);
  app.exit(1);
});
