const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.error('No .env file found.');
  process.exit(1);
}

const content = fs.readFileSync(envPath, 'utf8');
const line = content
  .split(/\r?\n/)
  .map((s) => s.trim())
  .find((s) => s.startsWith('DATABASE_URL='));

if (!line) {
  console.log('DATABASE_URL is not set in .env');
  process.exit(0);
}

const databaseUrl = line.slice('DATABASE_URL='.length);
let host = 'unknown';
let profile = 'custom';

try {
  const parsed = new URL(databaseUrl);
  host = parsed.host || 'unknown';
  if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
    profile = 'local';
  } else if (parsed.hostname.includes('render.com')) {
    profile = 'render';
  }
} catch {
  // Keep defaults when URL parsing fails.
}

console.log(`Active DB profile: ${profile}`);
console.log(`DATABASE_URL host: ${host}`);
