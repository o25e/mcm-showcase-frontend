import fs from 'node:fs/promises';
import path from 'node:path';

const srcDir = path.resolve('assets');
const destDir = path.resolve('public/assets');

try {
  await fs.access(srcDir);
} catch {
  process.exit(0);
}

await fs.rm(destDir, { recursive: true, force: true });
await fs.mkdir(path.dirname(destDir), { recursive: true });
await fs.cp(srcDir, destDir, { recursive: true });
