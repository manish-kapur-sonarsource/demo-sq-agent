import { Router, Response, NextFunction } from 'express';
import {
  createTask,
  findTasksByUserId,
  findTaskById,
  updateTask,
  deleteTask,
  taskBelongsToUser,
} from '../db/taskRepository';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createTaskSchema, updateTaskSchema } from '../utils/validation';
import { AppError } from '../middleware/errorHandler';
import { AuthenticatedRequest, ApiResponse } from '../types';

const router = Router();

router.use(authMiddleware);

router.get('/', (req: AuthenticatedRequest, res: Response<ApiResponse>): void => {
  const userId = req.user!.userId;
  const tasks = findTasksByUserId(userId);

  res.json({
    success: true,
    data: tasks,
  });
});

router.post(
  '/',
  validate(createTaskSchema),
  (req: AuthenticatedRequest, res: Response<ApiResponse>, next: NextFunction): void => {
    try {
      const userId = req.user!.userId;
      const task = createTask(userId, req.body);

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
  validate(updateTaskSchema),
  (req: AuthenticatedRequest, res: Response<ApiResponse>, next: NextFunction): void => {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const existingTask = findTaskById(id);
      if (!existingTask) {
        throw new AppError(404, 'Task not found');
      }

      if (!taskBelongsToUser(id, userId)) {
        throw new AppError(403, 'You do not have permission to update this task');
      }

      const updatedTask = updateTask(id, req.body);

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
  (req: AuthenticatedRequest, res: Response<ApiResponse>, next: NextFunction): void => {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const existingTask = findTaskById(id);
      if (!existingTask) {
        throw new AppError(404, 'Task not found');
      }

      if (!taskBelongsToUser(id, userId)) {
        throw new AppError(403, 'You do not have permission to delete this task');
      }

      deleteTask(id);

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
