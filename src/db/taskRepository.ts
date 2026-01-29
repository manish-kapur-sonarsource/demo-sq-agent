import db from './database';
import { Task, TaskStatus, TaskPriority } from '../types';

export interface CreateTaskData {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  userId: number;
}

export interface UpdateTaskData {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
}

export function createTask(data: CreateTaskData): Task {
  const stmt = db.prepare(`
    INSERT INTO tasks (title, description, status, priority, dueDate, userId)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    data.title,
    data.description ?? null,
    data.status ?? 'pending',
    data.priority ?? 'medium',
    data.dueDate ?? null,
    data.userId
  );
  
  return getTaskById(result.lastInsertRowid as number, data.userId)!;
}

export function getTasksByUserId(userId: number): Task[] {
  const stmt = db.prepare('SELECT * FROM tasks WHERE userId = ? ORDER BY createdAt DESC');
  return stmt.all(userId) as Task[];
}

export function getTaskById(id: number, userId: number): Task | undefined {
  const stmt = db.prepare('SELECT * FROM tasks WHERE id = ? AND userId = ?');
  return stmt.get(id, userId) as Task | undefined;
}

export function updateTask(id: number, userId: number, data: UpdateTaskData): Task | undefined {
  const existingTask = getTaskById(id, userId);
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
    values.push(data.description);
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
    values.push(data.dueDate);
  }

  if (updates.length === 0) {
    return existingTask;
  }

  updates.push('updatedAt = CURRENT_TIMESTAMP');
  values.push(id, userId);

  const stmt = db.prepare(`
    UPDATE tasks
    SET ${updates.join(', ')}
    WHERE id = ? AND userId = ?
  `);
  
  stmt.run(...values);
  return getTaskById(id, userId);
}

export function deleteTask(id: number, userId: number): boolean {
  const stmt = db.prepare('DELETE FROM tasks WHERE id = ? AND userId = ?');
  const result = stmt.run(id, userId);
  return result.changes > 0;
}
