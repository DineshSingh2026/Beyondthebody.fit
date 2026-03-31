const fs = require('fs');
const path = require('path');

const target = (process.argv[2] || '').trim().toLowerCase();
const validTargets = new Set(['local', 'render']);

if (!validTargets.has(target)) {
  console.error('Usage: node scripts/switch-env.js <local|render>');
  process.exit(1);
}

const root = path.join(__dirname, '..');
const sourceFile = path.join(root, `.env.${target}`);
const destinationFile = path.join(root, '.env');

if (!fs.existsSync(sourceFile)) {
  console.error(`Missing source file: ${sourceFile}`);
  process.exit(1);
}

fs.copyFileSync(sourceFile, destinationFile);
console.log(`Switched environment to "${target}" by copying .env.${target} -> .env`);
