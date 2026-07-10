const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const OUT_DIR = path.join(__dirname, '..', 'build');
const ORANGE = [249, 115, 22, 255];
const WHITE = [255, 255, 255, 255];

function crc32(buffer) {
  let crc = 0xffffffff;
  for (let i = 0; i < buffer.length; i += 1) {
    crc ^= buffer[i];
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  const crc = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function encodePng(width, height, rgba) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', header),
    pngChunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

function setPixel(buffer, size, x, y, color, alpha = 1) {
  if (x < 0 || y < 0 || x >= size || y >= size) return;
  const offset = (y * size + x) * 4;
  const sourceAlpha = (color[3] / 255) * alpha;
  const targetAlpha = buffer[offset + 3] / 255;
  const outAlpha = sourceAlpha + targetAlpha * (1 - sourceAlpha);
  if (outAlpha <= 0) return;

  for (let i = 0; i < 3; i += 1) {
    buffer[offset + i] = Math.round(
      (color[i] * sourceAlpha + buffer[offset + i] * targetAlpha * (1 - sourceAlpha)) / outAlpha,
    );
  }
  buffer[offset + 3] = Math.round(outAlpha * 255);
}

function fillRoundedRect(buffer, size, x, y, width, height, radius, color) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = Math.ceil(x + width);
  const y1 = Math.ceil(y + height);
  const samples = 3;

  for (let py = y0; py < y1; py += 1) {
    for (let px = x0; px < x1; px += 1) {
      let covered = 0;
      for (let sy = 0; sy < samples; sy += 1) {
        for (let sx = 0; sx < samples; sx += 1) {
          const cx = px + (sx + 0.5) / samples;
          const cy = py + (sy + 0.5) / samples;
          const innerX = Math.max(x + radius, Math.min(cx, x + width - radius));
          const innerY = Math.max(y + radius, Math.min(cy, y + height - radius));
          const dx = cx - innerX;
          const dy = cy - innerY;
          if (dx * dx + dy * dy <= radius * radius) covered += 1;
        }
      }
      if (covered > 0) setPixel(buffer, size, px, py, color, covered / (samples * samples));
    }
  }
}

function makeIconPng(size) {
  const rgba = Buffer.alloc(size * size * 4);
  fillRoundedRect(rgba, size, 0, 0, size, size, size * 0.22, ORANGE);

  const stroke = Math.max(2, Math.round(size * 0.09));
  const left = size * 0.28;
  const right = size * 0.72;
  const top = size * 0.22;
  const bottom = size * 0.78;
  const radius = stroke * 0.5;

  fillRoundedRect(rgba, size, left, top, stroke, bottom - top, radius, WHITE);
  fillRoundedRect(rgba, size, left, top, right - left, stroke, radius, WHITE);
  fillRoundedRect(rgba, size, right - stroke, top, stroke, bottom - top, radius, WHITE);
  fillRoundedRect(rgba, size, left + stroke * 0.85, size * 0.45, right - left - stroke * 1.3, stroke, radius, WHITE);
  fillRoundedRect(rgba, size, left + stroke * 0.85, size * 0.61, right - left - stroke * 1.3, stroke, radius, WHITE);

  return encodePng(size, size, rgba);
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

fs.mkdirSync(OUT_DIR, { recursive: true });

const sizes = [16, 24, 32, 48, 64, 128, 256];
const images = sizes.map((size) => ({ size, data: makeIconPng(size) }));

fs.writeFileSync(path.join(OUT_DIR, 'app-icon.png'), images.find((image) => image.size === 256).data);
fs.writeFileSync(path.join(OUT_DIR, 'app-icon.ico'), makeIco(images));
fs.writeFileSync(
  path.join(OUT_DIR, 'app-icon.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" rx="56" fill="#f97316"/><path d="M72 56h112v144M72 56v144M92 116h76M92 156h76" fill="none" stroke="#fff" stroke-width="23" stroke-linecap="round" stroke-linejoin="round"/></svg>\n`,
);

console.log(`Created ${path.join(OUT_DIR, 'app-icon.ico')}`);
