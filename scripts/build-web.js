const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist');
const assets = ['index.html', 'baixar.html', 'manifest.json', 'sw.js', 'css', 'js', 'assets', 'downloads'];

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

for (const asset of assets) {
  fs.cpSync(path.join(root, asset), path.join(output, asset), { recursive: true });
}

console.log('Web bundle criado em dist/.');
