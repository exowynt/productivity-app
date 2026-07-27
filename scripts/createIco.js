const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const pngToIco = require('png-to-ico');

const buildDir = path.join(__dirname, '../build');
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

function generateIconPng() {
  const size = 256;
  const png = new PNG({ width: size, height: size });

  const cx = 128;
  const cy = 128;
  const ringR = 75;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const absX = Math.abs(x - 128);
      const absY = Math.abs(y - 128);
      const isInsideCard = Math.pow(Math.max(0, absX - 80), 2) + Math.pow(Math.max(0, absY - 80), 2) <= 2304;

      if (isInsideCard) {
        const t = (x + y) / (size * 2);
        const r = Math.round(15 + t * 40);
        const g = Math.round(23 + t * 30);
        const b = Math.round(42 + t * 80);

        if (Math.abs(dist - ringR) < 8) {
          png.data[idx] = 99;     // R
          png.data[idx + 1] = 102; // G
          png.data[idx + 2] = 241; // B
          png.data[idx + 3] = 255; // A
        } else if (dist <= 30) {
          png.data[idx] = 248;
          png.data[idx + 1] = 250;
          png.data[idx + 2] = 252;
          png.data[idx + 3] = 255;
        } else {
          png.data[idx] = r;
          png.data[idx + 1] = g;
          png.data[idx + 2] = b;
          png.data[idx + 3] = 255;
        }
      } else {
        png.data[idx + 3] = 0;
      }
    }
  }

  const pngPath = path.join(buildDir, 'icon.png');
  const buffer = PNG.sync.write(png);
  fs.writeFileSync(pngPath, buffer);
  console.log('Successfully generated build/icon.png');
  return pngPath;
}

async function run() {
  try {
    const pngPath = generateIconPng();
    const converter = typeof pngToIco === 'function' ? pngToIco : pngToIco.default;
    if (typeof converter === 'function') {
      const icoBuffer = await converter([pngPath]);
      const icoPath = path.join(buildDir, 'icon.ico');
      fs.writeFileSync(icoPath, icoBuffer);
      console.log('Successfully generated build/icon.ico!');
    }
  } catch (err) {
    console.error('Error generating ICO icon:', err);
  }
}

run();
