/** 清空 dist/ 目录： node scripts/clean.mjs */
import { rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
await rm(path.join(ROOT, 'dist'), { recursive: true, force: true });
console.log('  ✓ 已清空 dist/');
