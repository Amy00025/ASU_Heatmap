import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

export interface DbUser {
  id: string;
  email: string;
  name: string;
  role: string;
  password_hash: string;
  created_at: string;
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'auth.db');

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (dbInstance) return dbInstance;

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  dbInstance = db;
  return db;
}

export function findUserByEmail(email: string): DbUser | undefined {
  const db = getDb();
  return db
    .prepare('SELECT * FROM users WHERE lower(email) = lower(?)')
    .get(email.trim()) as DbUser | undefined;
}

export function findUserById(id: string): DbUser | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as DbUser | undefined;
}

export function createUser(user: Omit<DbUser, 'created_at'> & { created_at?: string }): DbUser {
  const db = getDb();
  const created_at = user.created_at ?? new Date().toISOString();
  db.prepare(
    `INSERT INTO users (id, email, name, role, password_hash, created_at)
     VALUES (@id, @email, @name, @role, @password_hash, @created_at)`
  ).run({
    id: user.id,
    email: user.email.trim().toLowerCase(),
    name: user.name.trim(),
    role: user.role,
    password_hash: user.password_hash,
    created_at,
  });
  return findUserById(user.id)!;
}

export function updateUserPassword(userId: string, passwordHash: string): void {
  const db = getDb();
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, userId);
}

/** Public user shape (never includes password_hash). */
export function toPublicUser(user: DbUser) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.created_at,
  };
}
