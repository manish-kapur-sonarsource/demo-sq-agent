import db from './database';
import { User } from '../types';

export const userRepository = {
  findByEmail(email: string): User | undefined {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email) as User | undefined;
  },

  findById(id: number): User | undefined {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id) as User | undefined;
  },

  create(email: string, hashedPassword: string): User {
    const stmt = db.prepare(`
      INSERT INTO users (email, password)
      VALUES (?, ?)
    `);
    const result = stmt.run(email, hashedPassword);
    return this.findById(result.lastInsertRowid as number) as User;
  },
};
