import { Router, Response, NextFunction } from 'express';
import { taskRepository } from '../db/taskRepository';
import { authMiddleware } from '../middleware/auth';
import { validateBody, validateParams } from '../middleware/validate';
import { createTaskSchema, updateTaskSchema, idParamSchema } from '../utils/validation';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import { AuthenticatedRequest, ApiResponse, CreateTaskInput, UpdateTaskInput } from '../types';

const router = Router();

router.use(authMiddleware);

router.get('/', (req: AuthenticatedRequest, res: Response<ApiResponse>, next: NextFunction) => {
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
});

router.post(
  '/',
  validateBody(createTaskSchema),
  (req: AuthenticatedRequest, res: Response<ApiResponse>, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const input: CreateTaskInput = req.body;

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
  validateParams(idParamSchema),
  validateBody(updateTaskSchema),
  (req: AuthenticatedRequest, res: Response<ApiResponse>, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const taskId = parseInt(req.params.id, 10);
      const input: UpdateTaskInput = req.body;

      const existingTask = taskRepository.findById(taskId);
      if (!existingTask) {
        throw new NotFoundError('Task not found');
      }

      if (existingTask.userId !== userId) {
        throw new ForbiddenError('You do not have permission to update this task');
      }

      const updatedTask = taskRepository.update(taskId, userId, input);

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
  validateParams(idParamSchema),
  (req: AuthenticatedRequest, res: Response<ApiResponse>, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const taskId = parseInt(req.params.id, 10);

      const existingTask = taskRepository.findById(taskId);
      if (!existingTask) {
        throw new NotFoundError('Task not found');
      }

      if (existingTask.userId !== userId) {
        throw new ForbiddenError('You do not have permission to delete this task');
      }

      const deleted = taskRepository.delete(taskId, userId);

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
