// Run every browser walkthrough against a running dev server.
// Usage: npm run walkthrough -- [url]   (default http://localhost:3000)
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const url = process.argv[2] ?? 'http://localhost:3000';
const here = dirname(fileURLToPath(import.meta.url));
let failed = false;
for (const script of ['curriculum-map.mjs', 'phase-one-games.mjs']) {
  console.log(`\n== ${script}`);
  const result = spawnSync(process.execPath, [join(here, script), url], { stdio: 'inherit' });
  if (result.status !== 0) failed = true;
}
process.exit(failed ? 1 : 0);
