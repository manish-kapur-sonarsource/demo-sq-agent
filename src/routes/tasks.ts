import { Router, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { createTaskSchema, updateTaskSchema, taskIdSchema } from '../utils/validation';
import { NotFoundError } from '../utils/errors';
import { taskRepository } from '../db/taskRepository';
import { AuthenticatedRequest, ApiResponse } from '../types';

const router = Router();

router.use(authenticate);

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
  (req: AuthenticatedRequest, res: Response<ApiResponse>, next: NextFunction): void => {
    try {
      const userId = req.user!.userId;
      const validatedData = createTaskSchema.parse(req.body);

      const task = taskRepository.create(userId, {
        title: validatedData.title,
        description: validatedData.description,
        status: validatedData.status,
        priority: validatedData.priority,
        dueDate: validatedData.dueDate || undefined,
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
  (req: AuthenticatedRequest, res: Response<ApiResponse>, next: NextFunction): void => {
    try {
      const userId = req.user!.userId;
      const { id } = taskIdSchema.parse(req.params);
      const validatedData = updateTaskSchema.parse(req.body);

      const existingTask = taskRepository.findByIdAndUserId(id, userId);
      if (!existingTask) {
        throw new NotFoundError('Task not found');
      }

      const updatedTask = taskRepository.update(id, userId, validatedData);

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
      const userId = req.user!.userId;
      const { id } = taskIdSchema.parse(req.params);

      const deleted = taskRepository.delete(id, userId);
      if (!deleted) {
        throw new NotFoundError('Task not found');
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
