const fs = require('fs');
const path = require('path');

const srcDir = __dirname;
const destDir = path.join(__dirname, 'www');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const filesToCopy = [
  'index.html',
  'manifest.json',
  'sw.js',
  'script.js',
  'mode2.css',
  'mode3.css',
  'CSS - Copy.css',
  'icon.svg',
  'icon-192.png',
  'icon-512.png',
  'title1.svg',
  'title2.svg',
  'title3.svg',
  'title4.svg'
];

filesToCopy.forEach((file) => {
  const src = path.join(srcDir, file);
  const dest = path.join(destDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${file} -> www/`);
  }
});

// Copy api directory if present
const apiSrc = path.join(srcDir, 'api');
const apiDest = path.join(destDir, 'api');
if (fs.existsSync(apiSrc)) {
  fs.cpSync(apiSrc, apiDest, { recursive: true });
  console.log('Copied api/ -> www/api/');
}

console.log('Mobile assets preparation complete!');
