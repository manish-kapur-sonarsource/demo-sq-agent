import { v4 as uuidv4 } from 'uuid';
import db from './database';
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

    const task: Task = {
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

    const stmt = db.prepare(`
      INSERT INTO tasks (id, title, description, status, priority, dueDate, userId, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      task.id,
      task.title,
      task.description,
      task.status,
      task.priority,
      task.dueDate,
      task.userId,
      task.createdAt,
      task.updatedAt
    );

    return task;
  },

  update(id: string, userId: string, input: UpdateTaskInput): Task | null {
    const existingTask = this.findByIdAndUserId(id, userId);
    if (!existingTask) {
      return null;
    }

    const now = new Date().toISOString();

    const updatedTask: Task = {
      ...existingTask,
      title: input.title ?? existingTask.title,
      description: input.description !== undefined ? (input.description || null) : existingTask.description,
      status: input.status ?? existingTask.status,
      priority: input.priority ?? existingTask.priority,
      dueDate: input.dueDate !== undefined ? (input.dueDate || null) : existingTask.dueDate,
      updatedAt: now,
    };

    const stmt = db.prepare(`
      UPDATE tasks
      SET title = ?, description = ?, status = ?, priority = ?, dueDate = ?, updatedAt = ?
      WHERE id = ? AND userId = ?
    `);

    stmt.run(
      updatedTask.title,
      updatedTask.description,
      updatedTask.status,
      updatedTask.priority,
      updatedTask.dueDate,
      updatedTask.updatedAt,
      id,
      userId
    );

    return updatedTask;
  },

  delete(id: string, userId: string): boolean {
    const stmt = db.prepare('DELETE FROM tasks WHERE id = ? AND userId = ?');
    const result = stmt.run(id, userId);
    return result.changes > 0;
  },
};
