const fs = require('fs');

// Read compiled files
let js = fs.readFileSync('dist/index.js', 'utf8');
let dts = fs.readFileSync('dist/index.d.ts', 'utf8');

// Fix paths to reference dist/ folder
js = js.replace(/require\("\.\/Axon"\)/g, 'require("./dist/Axon")');
dts = dts.replace(/from '\.\/Axon'/g, "from './dist/Axon'");

// Write to root
fs.writeFileSync('index.js', js);
fs.writeFileSync('index.d.ts', dts);

console.log('✓ index.js and index.d.ts copied to root with fixed paths');
