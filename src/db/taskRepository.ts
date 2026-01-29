import { v4 as uuidv4 } from 'uuid';
import db from './database';
import { Task, CreateTaskInput, UpdateTaskInput } from '../types';

export function createTask(userId: string, input: CreateTaskInput): Task {
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
}

export function findTasksByUserId(userId: string): Task[] {
  const stmt = db.prepare('SELECT * FROM tasks WHERE userId = ? ORDER BY createdAt DESC');
  return stmt.all(userId) as Task[];
}

export function findTaskById(id: string): Task | undefined {
  const stmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
  return stmt.get(id) as Task | undefined;
}

export function updateTask(id: string, input: UpdateTaskInput): Task | undefined {
  const task = findTaskById(id);
  if (!task) return undefined;

  const now = new Date().toISOString();
  const updates: string[] = [];
  const values: (string | null)[] = [];

  if (input.title !== undefined) {
    updates.push('title = ?');
    values.push(input.title);
  }
  if (input.description !== undefined) {
    updates.push('description = ?');
    values.push(input.description);
  }
  if (input.status !== undefined) {
    updates.push('status = ?');
    values.push(input.status);
  }
  if (input.priority !== undefined) {
    updates.push('priority = ?');
    values.push(input.priority);
  }
  if (input.dueDate !== undefined) {
    updates.push('dueDate = ?');
    values.push(input.dueDate);
  }

  updates.push('updatedAt = ?');
  values.push(now);
  values.push(id);

  const stmt = db.prepare(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`);
  stmt.run(...values);

  return findTaskById(id);
}

export function deleteTask(id: string): boolean {
  const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

export function taskBelongsToUser(taskId: string, userId: string): boolean {
  const stmt = db.prepare('SELECT 1 FROM tasks WHERE id = ? AND userId = ?');
  return stmt.get(taskId, userId) !== undefined;
}
