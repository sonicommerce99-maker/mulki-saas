import fs from 'fs';
import path from 'path';

// Valid 192x192 / 512x512 PNG header and base image data
// Emerald green #0F5A47 with gold building icon
// A standard clean PNG generated using zlib in node
import zlib from 'zlib';

function createSolidPNG(width, height, r, g, b) {
  // Construct raw uncompressed RGBA scanlines
  const lineSize = 1 + width * 4;
  const rawData = Buffer.alloc(lineSize * height);

  for (let y = 0; y < height; y++) {
    const lineStart = y * lineSize;
    rawData[lineStart] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const pixelStart = lineStart + 1 + x * 4;
      // Draw border squircle
      const dx = x - width / 2;
      const dy = y - height / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // Gold center building area
      if (Math.abs(dx) < width * 0.22 && Math.abs(dy) < height * 0.25) {
        rawData[pixelStart] = 245;     // Gold R
        rawData[pixelStart + 1] = 158; // Gold G
        rawData[pixelStart + 2] = 11;  // Gold B
        rawData[pixelStart + 3] = 255; // Alpha
      } else {
        rawData[pixelStart] = r;
        rawData[pixelStart + 1] = g;
        rawData[pixelStart + 2] = b;
        rawData[pixelStart + 3] = 255;
      }
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth: 8
  ihdrData[9] = 6; // Color type: 6 (RGBA)
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace

  const ihdrChunk = createChunk('IHDR', ihdrData);
  const idatChunk = createChunk('IDAT', deflated);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
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

// CRC32 table & calculation
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

// Generate files in public directory
const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Brand color: #0F5A47 -> R:15, G:90, B:71
const png192 = createSolidPNG(192, 192, 15, 90, 71);
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), png192);

const png512 = createSolidPNG(512, 512, 15, 90, 71);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), png512);

const pngApple = createSolidPNG(180, 180, 15, 90, 71);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), pngApple);

console.log('Successfully generated all PWA icons (192x192, 512x512, apple-touch-icon.png)!');
