import { v4 as uuidv4 } from 'uuid';
import { db } from './database';
import { Task, CreateTaskInput, UpdateTaskInput } from '../types';

export const taskRepository = {
  findAllByUserId(userId: string): Task[] {
    const stmt = db.prepare('SELECT * FROM tasks WHERE userId = ? ORDER BY createdAt DESC');
    return stmt.all(userId) as Task[];
  },

  findById(id: string): Task | undefined {
    const stmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
    return stmt.get(id) as Task | undefined;
  },

  findByIdAndUserId(id: string, userId: string): Task | undefined {
    const stmt = db.prepare('SELECT * FROM tasks WHERE id = ? AND userId = ?');
    return stmt.get(id, userId) as Task | undefined;
  },

  create(userId: string, input: CreateTaskInput): Task {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO tasks (id, title, description, status, priority, dueDate, userId, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      input.title,
      input.description || null,
      input.status || 'pending',
      input.priority || 'medium',
      input.dueDate || null,
      userId,
      now,
      now
    );

    return {
      id,
      title: input.title,
      description: input.description || null,
      status: input.status || 'pending',
      priority: input.priority || 'medium',
      dueDate: input.dueDate || null,
      userId,
      createdAt: now,
      updatedAt: now,
    };
  },

  update(id: string, userId: string, input: UpdateTaskInput): Task | undefined {
    const existing = this.findByIdAndUserId(id, userId);
    if (!existing) {
      return undefined;
    }

    const now = new Date().toISOString();
    const updated: Task = {
      ...existing,
      title: input.title ?? existing.title,
      description: input.description !== undefined ? input.description : existing.description,
      status: input.status ?? existing.status,
      priority: input.priority ?? existing.priority,
      dueDate: input.dueDate !== undefined ? input.dueDate || null : existing.dueDate,
      updatedAt: now,
    };

    const stmt = db.prepare(`
      UPDATE tasks
      SET title = ?, description = ?, status = ?, priority = ?, dueDate = ?, updatedAt = ?
      WHERE id = ? AND userId = ?
    `);

    stmt.run(
      updated.title,
      updated.description,
      updated.status,
      updated.priority,
      updated.dueDate,
      now,
      id,
      userId
    );

    return updated;
  },

  delete(id: string, userId: string): boolean {
    const stmt = db.prepare('DELETE FROM tasks WHERE id = ? AND userId = ?');
    const result = stmt.run(id, userId);
    return result.changes > 0;
  },
};
