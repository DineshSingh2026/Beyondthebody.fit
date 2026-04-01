/**
 * Force NODE_ENV=development for `next dev`.
 * If the shell has NODE_ENV=production (e.g. after deploying), Next's CSS loader breaks.
 */
process.env.NODE_ENV = 'development';

const { spawnSync } = require('child_process');
const path = require('path');
const nextBin = require.resolve('next/dist/bin/next');
const args = process.argv.slice(2);

const result = spawnSync(process.execPath, [nextBin, 'dev', ...args], {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'development' },
  cwd: path.join(__dirname, '..'),
});

process.exit(result.status ?? 1);
