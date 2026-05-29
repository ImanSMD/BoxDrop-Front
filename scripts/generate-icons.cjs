// Generates flat PWA icons (orange field + white box glyph) without any image
// deps — handy as Phase 1 placeholders. Re-run after editing colors/sizes.
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const ORANGE = [0xff, 0x45, 0x00];
const WHITE = [0xff, 0xff, 0xff];

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function makePng(size) {
  const raw = Buffer.alloc(size * (size * 4 + 1));
  // White box glyph occupies the centred 46%–54% band as a simple cube.
  const inset = Math.round(size * 0.28);
  const lid = Math.round(size * 0.42);
  let p = 0;
  for (let y = 0; y < size; y++) {
    raw[p++] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const inBox = x >= inset && x < size - inset && y >= inset && y < size - inset;
      const onLid = inBox && y < lid;
      const onSeam = inBox && Math.abs(x - size / 2) < Math.max(2, size * 0.012);
      let col = ORANGE;
      if (inBox) col = WHITE;
      if (onLid) col = [0xff, 0xe6, 0xd6];
      if (onSeam) col = ORANGE;
      raw[p++] = col[0];
      raw[p++] = col[1];
      raw[p++] = col[2];
      raw[p++] = 0xff;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const idat = zlib.deflateSync(raw, { level: 9 });

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const outDir = path.join(__dirname, "..", "public", "icons");
fs.mkdirSync(outDir, { recursive: true });
const targets = [
  ["icon-192.png", 192],
  ["icon-512.png", 512],
  ["apple-touch-icon-180.png", 180],
];
for (const [name, size] of targets) {
  fs.writeFileSync(path.join(outDir, name), makePng(size));
  console.log("wrote", name, size);
}
