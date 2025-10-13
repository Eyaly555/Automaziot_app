const fs = require('fs');
const path = require('path');

const copyFiles = () => {
  // Corrected paths relative to discovery-assistant workspace
  const sourceDir = path.resolve(__dirname, '../../node_modules/@ffmpeg/core/dist/esm');
  const destDir = path.resolve(__dirname, '../public/ffmpeg-core');

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const filesToCopy = [
    'ffmpeg-core.js',
    'ffmpeg-core.wasm',
    'ffmpeg-core.worker.js'
  ];

  filesToCopy.forEach(file => {
    const srcFile = path.join(sourceDir, file);
    const destFile = path.join(destDir, file);
    if (fs.existsSync(srcFile)) {
      fs.copyFileSync(srcFile, destFile);
      console.log(`Copied ${file} to ${destDir}`);
    } else {
      console.error(`Error: ${srcFile} not found.`);
    }
  });
};

copyFiles();
