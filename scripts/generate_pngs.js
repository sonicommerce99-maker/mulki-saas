import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Pure Node.js high-precision vector rasterizer for the "مَحْفَظَتِي العَقَارِيَّة" Mint-Green, Emerald & Gold Phone Icon
function pointInPolygon(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1];
    const xj = poly[j][0], yj = poly[j][1];
    const intersect = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi + 1e-9) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const l2 = dx * dx + dy * dy;
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function createPortfolioIconPNG(width, height) {
  const lineSize = 1 + width * 4;
  const rawData = Buffer.alloc(lineSize * height);

  const setPixel = (x, y, r, g, b) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const p = y * lineSize + 1 + x * 4;
    rawData[p] = r;
    rawData[p + 1] = g;
    rawData[p + 2] = b;
    rawData[p + 3] = 255;
  };

  // Map pixel (x,y) to 100x100 normalized coordinate space
  for (let y = 0; y < height; y++) {
    rawData[y * lineSize] = 0;
    const ny = (y / height) * 100;
    for (let x = 0; x < width; x++) {
      const nx = (x / width) * 100;

      // 1. Soft Mint-Pistachio Background (#D2EBD4 -> R:210, G:235, B:212)
      let r = 210, g = 235, b = 212;

      // Subtle inner border
      if (nx < 2.5 || nx > 97.5 || ny < 2.5 || ny > 97.5) {
        r = 185; g = 218; b = 188;
      }

      // 2. Left Emerald Tower: (21,40) -> (36,27) -> (36,76) -> (21,88)
      if (pointInPolygon(nx, ny, [[21, 40], [36, 27], [36, 76], [21, 88]])) {
        r = 22; g = 115; b = 84;
        // Gold inner frame on left tower
        if (
          distToSegment(nx, ny, 29, 48, 34, 43) < 1.3 ||
          distToSegment(nx, ny, 29, 48, 29, 76) < 1.3
        ) {
          r = 214; g = 177; b = 93;
        }
      }

      // 3. Center Tall Skyscraper Left Face: (38,20) -> (55,7) -> (55,62) -> (38,75)
      if (pointInPolygon(nx, ny, [[38, 20], [55, 7], [55, 62], [38, 75]])) {
        r = 12; g = 86; b = 62;
        // Gold H-frame
        if (
          distToSegment(nx, ny, 38, 34, 47, 26) < 1.4 ||
          distToSegment(nx, ny, 47, 26, 47, 64) < 1.4 ||
          distToSegment(nx, ny, 47, 44, 55, 37) < 1.4
        ) {
          r = 225; g = 190; b = 104;
        }
      }

      // Center Skyscraper Right Striped Wing: (55,7) -> (71,20) -> (71,54) -> (55,42)
      if (pointInPolygon(nx, ny, [[55, 7], [71, 20], [71, 54], [55, 42]])) {
        if (
          distToSegment(nx, ny, 55, 7, 71, 20) < 1.4 ||
          distToSegment(nx, ny, 71, 20, 71, 54) < 1.4 ||
          distToSegment(nx, ny, 55, 17, 71, 30) < 1.4 ||
          distToSegment(nx, ny, 55, 27, 71, 40) < 1.4 ||
          distToSegment(nx, ny, 55, 37, 71, 50) < 1.4
        ) {
          r = 20; g = 110; b = 80;
        }
      }

      // Central Vertical Gold Spine
      if (distToSegment(nx, ny, 55, 7, 55, 62) < 1.6) {
        r = 225; g = 190; b = 104;
      }

      // 4. Portfolio Wallet Body (Bottom-Right):
      if (pointInPolygon(nx, ny, [[27, 89], [47, 68], [55, 76], [71, 55], [85, 55], [85, 89]])) {
        r = 11; g = 82; b = 59;
        // Gold inner stitch border & diagonal
        if (
          distToSegment(nx, ny, 65, 59, 81, 59) < 1.1 ||
          distToSegment(nx, ny, 81, 59, 81, 85) < 1.1 ||
          distToSegment(nx, ny, 60, 85, 81, 85) < 1.1 ||
          distToSegment(nx, ny, 47, 68, 64, 89) < 1.1
        ) {
          r = 214; g = 177; b = 93;
        }
      }

      // Wallet Clasp Strap (x: 67..87, y: 66..78)
      if (nx >= 67 && nx <= 87 && ny >= 66 && ny <= 78) {
        r = 18; g = 105; b = 76;
        if (nx < 68.5 || nx > 85.5 || ny < 67.5 || ny > 76.5) {
          r = 214; g = 177; b = 93;
        }
        // Gold Clasp Button at (73.5, 72)
        if (Math.hypot(nx - 73.5, ny - 72) <= 2.8) {
          r = 240; g = 206; b = 118;
        }
      }

      // 5. Ascending Zig-Zag Growth Arrow
      const dArrow1 = distToSegment(nx, ny, 14, 89, 46, 57);
      const dArrow2 = distToSegment(nx, ny, 46, 57, 54, 65);
      const dArrow3 = distToSegment(nx, ny, 54, 65, 83, 34);
      const dArrowMin = Math.min(dArrow1, dArrow2, dArrow3);

      if (dArrowMin < 4.5) {
        // Mint halo separation
        r = 210; g = 235; b = 212;
      }
      // Gold lower parallel accent line
      const dGold1 = distToSegment(nx, ny, 18, 89, 46, 61);
      const dGold2 = distToSegment(nx, ny, 46, 61, 54, 69);
      const dGold3 = distToSegment(nx, ny, 54, 69, 82, 39);
      if (Math.min(dGold1, dGold2, dGold3) < 1.3) {
        r = 214; g = 177; b = 93;
      }
      if (dArrowMin < 2.6) {
        // Main Emerald Arrow Shaft
        r = 10; g = 76; b = 54;
      }

      // Arrowhead Triangle at Top-Right: (71,31) -> (90,26) -> (85,45)
      if (pointInPolygon(nx, ny, [[70, 31], [90, 25], [85, 45]])) {
        r = 10; g = 76; b = 54;
      }

      setPixel(x, y, r, g, b);
    }
  }

  const deflated = zlib.deflateSync(rawData);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6;
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;

  return Buffer.concat([
    signature,
    createChunk('IHDR', ihdrData),
    createChunk('IDAT', deflated),
    createChunk('IEND', Buffer.alloc(0)),
  ]);
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(len + 12);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crc = crc32(chunk.subarray(4, len + 8));
  chunk.writeUInt32BE(crc >>> 0, len + 8);
  return chunk;
}

const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return c ^ 0xffffffff;
}

const publicDir = path.resolve('public');
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPortfolioIconPNG(192, 192));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPortfolioIconPNG(512, 512));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPortfolioIconPNG(180, 180));
fs.writeFileSync(path.join(publicDir, 'app-logo.jpg'), createPortfolioIconPNG(512, 512));
fs.writeFileSync(path.join(publicDir, 'portfolio-logo.jpg'), createPortfolioIconPNG(512, 512));
console.log('Generated MY REAL ESTATE PORTFOLIO (مَحْفَظَتِي العَقَارِيَّة) PNGs successfully.');
