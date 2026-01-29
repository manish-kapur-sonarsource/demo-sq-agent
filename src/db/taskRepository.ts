import db from './database';
import { Task, CreateTaskInput, UpdateTaskInput } from '../types';

export const taskRepository = {
  findAllByUserId(userId: number): Task[] {
    const stmt = db.prepare('SELECT * FROM tasks WHERE userId = ? ORDER BY createdAt DESC');
    return stmt.all(userId) as Task[];
  },

  findById(id: number): Task | undefined {
    const stmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
    return stmt.get(id) as Task | undefined;
  },

  findByIdAndUserId(id: number, userId: number): Task | undefined {
    const stmt = db.prepare('SELECT * FROM tasks WHERE id = ? AND userId = ?');
    return stmt.get(id, userId) as Task | undefined;
  },

  create(userId: number, data: CreateTaskInput): Task {
    const stmt = db.prepare(`
      INSERT INTO tasks (title, description, status, priority, dueDate, userId)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      data.title,
      data.description || null,
      data.status || 'pending',
      data.priority || 'medium',
      data.dueDate || null,
      userId
    );
    return this.findById(result.lastInsertRowid as number)!;
  },

  update(id: number, userId: number, data: UpdateTaskInput): Task | undefined {
    const existingTask = this.findByIdAndUserId(id, userId);
    if (!existingTask) {
      return undefined;
    }

    const updates: string[] = [];
    const values: (string | number | null)[] = [];

    if (data.title !== undefined) {
      updates.push('title = ?');
      values.push(data.title);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description || null);
    }
    if (data.status !== undefined) {
      updates.push('status = ?');
      values.push(data.status);
    }
    if (data.priority !== undefined) {
      updates.push('priority = ?');
      values.push(data.priority);
    }
    if (data.dueDate !== undefined) {
      updates.push('dueDate = ?');
      values.push(data.dueDate || null);
    }

    if (updates.length === 0) {
      return existingTask;
    }

    updates.push("updatedAt = datetime('now')");
    values.push(id, userId);

    const stmt = db.prepare(`
      UPDATE tasks 
      SET ${updates.join(', ')}
      WHERE id = ? AND userId = ?
    `);
    stmt.run(...values);

    return this.findByIdAndUserId(id, userId);
  },

  delete(id: number, userId: number): boolean {
    const stmt = db.prepare('DELETE FROM tasks WHERE id = ? AND userId = ?');
    const result = stmt.run(id, userId);
    return result.changes > 0;
  },
};
