import { Router, Response, NextFunction } from 'express';
import { taskRepository } from '../db/taskRepository';
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
      const tasks = taskRepository.findAllByUserId(userId);

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
      const userId = req.user!.userId;
      const data = createTaskSchema.parse(req.body);
      const task = taskRepository.create(userId, data);

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
      const userId = req.user!.userId;
      const taskId = parseInt(req.params.id, 10);

      if (isNaN(taskId)) {
        throw new AppError(400, 'Invalid task ID');
      }

      const existingTask = taskRepository.findByIdAndUserId(taskId, userId);
      if (!existingTask) {
        throw new AppError(404, 'Task not found');
      }

      const data = updateTaskSchema.parse(req.body);
      const task = taskRepository.update(taskId, userId, data);

      res.json({
        success: true,
        data: task,
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
      const userId = req.user!.userId;
      const taskId = parseInt(req.params.id, 10);

      if (isNaN(taskId)) {
        throw new AppError(400, 'Invalid task ID');
      }

      const deleted = taskRepository.delete(taskId, userId);
      if (!deleted) {
        throw new AppError(404, 'Task not found');
      }

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
