import { Router, Response, NextFunction } from 'express';
import {
  createTask,
  getTasksByUserId,
  getTaskById,
  updateTask,
  deleteTask,
} from '../db/taskRepository';
import { createTaskSchema, updateTaskSchema } from '../utils/validation';
import { authMiddleware } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../types';

const router = Router();

router.use(authMiddleware);

router.get(
  '/',
  (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      const userId = req.user!.userId;
      const tasks = getTasksByUserId(userId);

      res.json({
        success: true,
        data: tasks,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/',
  (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      const validatedData = createTaskSchema.parse(req.body);
      const userId = req.user!.userId;

      const task = createTask({
        ...validatedData,
        userId,
      });

      res.status(201).json({
        success: true,
        data: task,
        message: 'Task created successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  '/:id',
  (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      const taskId = parseInt(req.params.id, 10);
      if (isNaN(taskId)) {
        throw new AppError(400, 'Invalid task ID');
      }

      const validatedData = updateTaskSchema.parse(req.body);
      const userId = req.user!.userId;

      const existingTask = getTaskById(taskId, userId);
      if (!existingTask) {
        throw new AppError(404, 'Task not found');
      }

      const updatedTask = updateTask(taskId, userId, validatedData);

      res.json({
        success: true,
        data: updatedTask,
        message: 'Task updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/:id',
  (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      const taskId = parseInt(req.params.id, 10);
      if (isNaN(taskId)) {
        throw new AppError(400, 'Invalid task ID');
      }

      const userId = req.user!.userId;

      const existingTask = getTaskById(taskId, userId);
      if (!existingTask) {
        throw new AppError(404, 'Task not found');
      }

      deleteTask(taskId, userId);

      res.json({
        success: true,
        message: 'Task deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
