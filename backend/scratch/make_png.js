const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function makePng(width, height, outputPath) {
  // CRC32 table
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    crcTable[n] = c;
  }

  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const typeAndData = Buffer.concat([typeBuf, data]);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(typeAndData), 0);
    return Buffer.concat([len, typeAndData, crcBuf]);
  }

  // PNG Header
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 2; // RGB
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Raw image data (RGB, 3 bytes per pixel + 1 filter byte per line)
  const lineSize = 1 + width * 3;
  const rawData = Buffer.alloc(height * lineSize);

  const cx = width / 2;
  const cy = height / 2;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * lineSize;
    rawData[rowOffset] = 0; // filter byte = 0 (None)
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 3;
      // Draw background Indigo #4F46E5 -> RGB(79, 70, 229)
      let rCol = 79, gCol = 70, bCol = 229;

      // House roof (triangle) & body (rect)
      const hScale = width / 512;
      const roofPeakY = cy - 80 * hScale;
      const roofBaseY = cy;
      const roofHalfW = 100 * hScale;
      
      const bodyTopY = cy;
      const bodyBotY = cy + 100 * hScale;
      const bodyHalfW = 75 * hScale;

      const inRoof = (y >= roofPeakY && y <= roofBaseY) &&
                     (Math.abs(x - cx) <= (roofHalfW * (y - roofPeakY) / (roofBaseY - roofPeakY)));
      const inBody = (y >= bodyTopY && y <= bodyBotY) && (Math.abs(x - cx) <= bodyHalfW);

      if (inRoof || inBody) {
        // Gold #FBBF24
        rCol = 251; gCol = 191; bCol = 36;
      }

      // Door (white rectangle)
      const doorTopY = cy + 40 * hScale;
      const doorBotY = bodyBotY;
      const doorHalfW = 25 * hScale;
      if (y >= doorTopY && y <= doorBotY && Math.abs(x - cx) <= doorHalfW) {
        rCol = 255; gCol = 255; bCol = 255;
      }

      rawData[pxOffset] = rCol;
      rawData[pxOffset + 1] = gCol;
      rawData[pxOffset + 2] = bCol;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  const pngBuffer = Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
  fs.writeFileSync(outputPath, pngBuffer);
  console.log(`Generated PNG: ${outputPath} (${width}x${height})`);
}

const targetDir = path.join(__dirname, '../../frontend/public');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

makePng(192, 192, path.join(targetDir, 'pwa-192x192.png'));
makePng(512, 512, path.join(targetDir, 'pwa-512x512.png'));
