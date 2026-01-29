import db from './database';
import { User } from '../types';

export function createUser(email: string, hashedPassword: string): User {
  const stmt = db.prepare(`
    INSERT INTO users (email, password)
    VALUES (?, ?)
  `);
  
  const result = stmt.run(email, hashedPassword);
  return getUserById(result.lastInsertRowid as number)!;
}

export function getUserByEmail(email: string): User | undefined {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  return stmt.get(email) as User | undefined;
}

export function getUserById(id: number): User | undefined {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id) as User | undefined;
}
