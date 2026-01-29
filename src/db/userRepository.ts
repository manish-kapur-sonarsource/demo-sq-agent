import db from './database';
import { User } from '../types';

export interface CreateUserData {
  email: string;
  password: string;
}

export const userRepository = {
  findByEmail(email: string): User | undefined {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email) as User | undefined;
  },

  findById(id: number): User | undefined {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id) as User | undefined;
  },

  create(data: CreateUserData): User {
    const stmt = db.prepare(`
      INSERT INTO users (email, password)
      VALUES (?, ?)
    `);
    const result = stmt.run(data.email, data.password);
    return this.findById(result.lastInsertRowid as number)!;
  },

  emailExists(email: string): boolean {
    const stmt = db.prepare('SELECT 1 FROM users WHERE email = ?');
    return stmt.get(email) !== undefined;
  },
};
