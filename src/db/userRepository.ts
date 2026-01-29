import { v4 as uuidv4 } from 'uuid';
import db from './database';
import { User } from '../types';

export function createUser(email: string, hashedPassword: string): User {
  const id = uuidv4();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO users (id, email, password, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?)
  `);

  stmt.run(id, email, hashedPassword, now, now);

  return {
    id,
    email,
    password: hashedPassword,
    createdAt: now,
    updatedAt: now,
  };
}

export function findUserByEmail(email: string): User | undefined {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  return stmt.get(email) as User | undefined;
}

export function findUserById(id: string): User | undefined {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id) as User | undefined;
}

export function emailExists(email: string): boolean {
  const stmt = db.prepare('SELECT 1 FROM users WHERE email = ?');
  return stmt.get(email) !== undefined;
}
