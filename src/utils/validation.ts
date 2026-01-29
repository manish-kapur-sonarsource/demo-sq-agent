import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  status: z.enum(['pending', 'completed']).default('pending'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  dueDate: z.string().datetime().optional().or(z.literal('')),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').max(255, 'Title must be less than 255 characters').optional(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  status: z.enum(['pending', 'completed']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.string().datetime().optional().or(z.literal('')).or(z.null()),
});

export const taskIdSchema = z.object({
  id: z.string().uuid('Invalid task ID format'),
});
