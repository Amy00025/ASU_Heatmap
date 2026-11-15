#!/usr/bin/env node
/**
 * Deletes the local auth database (and WAL/SHM sidecars).
 * Local-only — never run against a shared production store.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');
const files = ['auth.db', 'auth.db-wal', 'auth.db-shm'];

let removed = 0;
for (const name of files) {
  const full = path.join(dataDir, name);
  if (fs.existsSync(full)) {
    fs.unlinkSync(full);
    console.log(`Removed ${full}`);
    removed += 1;
  }
}

if (removed === 0) {
  console.log('No auth database files found — already clean.');
} else {
  console.log('Local auth database reset. Run `npm run db:init` or sign up again.');
}
