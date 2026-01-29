import { Router, Response, NextFunction } from 'express';
import { taskRepository } from '../db/taskRepository';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createTaskSchema, updateTaskSchema, taskIdSchema } from '../utils/validation';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import { AuthenticatedRequest, ApiResponse } from '../types';

const router = Router();

router.use(authMiddleware);

router.get(
  '/',
  (req: AuthenticatedRequest, res: Response<ApiResponse>, next: NextFunction): void => {
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
  validate(createTaskSchema),
  (req: AuthenticatedRequest, res: Response<ApiResponse>, next: NextFunction): void => {
    try {
      const userId = req.user!.userId;
      const task = taskRepository.create(userId, req.body);

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
  validate(taskIdSchema, 'params'),
  validate(updateTaskSchema),
  (req: AuthenticatedRequest, res: Response<ApiResponse>, next: NextFunction): void => {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const existingTask = taskRepository.findById(id);
      if (!existingTask) {
        throw new NotFoundError('Task not found');
      }

      if (existingTask.userId !== userId) {
        throw new ForbiddenError('You do not have permission to update this task');
      }

      const updatedTask = taskRepository.update(id, userId, req.body);

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
  validate(taskIdSchema, 'params'),
  (req: AuthenticatedRequest, res: Response<ApiResponse>, next: NextFunction): void => {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const existingTask = taskRepository.findById(id);
      if (!existingTask) {
        throw new NotFoundError('Task not found');
      }

      if (existingTask.userId !== userId) {
        throw new ForbiddenError('You do not have permission to delete this task');
      }

      taskRepository.delete(id, userId);

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
