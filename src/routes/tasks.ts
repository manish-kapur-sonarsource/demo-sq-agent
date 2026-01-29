import { Router, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/auth';
import { taskRepository } from '../db/taskRepository';
import { createTaskSchema, updateTaskSchema } from '../utils/validation';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { AuthenticatedRequest, ApiResponse, Task } from '../types';

const router = Router();

router.use(authMiddleware);

router.get(
  '/',
  (req: AuthenticatedRequest, res: Response<ApiResponse<Task[]>>, next: NextFunction) => {
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
  (req: AuthenticatedRequest, res: Response<ApiResponse<Task>>, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const input = createTaskSchema.parse(req.body);
      const task = taskRepository.create(input, userId);

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
  (req: AuthenticatedRequest, res: Response<ApiResponse<Task>>, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      if (!id) {
        throw new BadRequestError('Task ID is required');
      }

      const input = updateTaskSchema.parse(req.body);
      const task = taskRepository.update(id, userId, input);

      if (!task) {
        throw new NotFoundError('Task not found');
      }

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
  (req: AuthenticatedRequest, res: Response<ApiResponse>, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      if (!id) {
        throw new BadRequestError('Task ID is required');
      }

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
