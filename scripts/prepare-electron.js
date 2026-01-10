// Script to prepare the standalone build for Electron packaging
const fs = require('fs');
const path = require('path');

console.log('Preparing standalone build for Electron...');

const standalonePath = path.join(__dirname, '..', '.next', 'standalone');

if (!fs.existsSync(standalonePath)) {
    console.error('Error: .next/standalone folder not found. Run "npm run build" first.');
    process.exit(1);
}

// Copy static files if not present
const staticSrc = path.join(__dirname, '..', '.next', 'static');
const staticDest = path.join(standalonePath, '.next', 'static');

if (!fs.existsSync(staticDest)) {
    console.log('Note: Static files will be copied by electron-builder');
}

// Copy public folder if not present
const publicSrc = path.join(__dirname, '..', 'public');
const publicDest = path.join(standalonePath, 'public');

if (!fs.existsSync(publicDest) && fs.existsSync(publicSrc)) {
    console.log('Note: Public files will be copied by electron-builder');
}

console.log('Preparation complete!');
