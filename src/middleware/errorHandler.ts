import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors';
import { ApiResponse } from '../types';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response<ApiResponse>,
  _next: NextFunction
): void {
  console.error('Error:', err);

  if (err instanceof ZodError) {
    const errors = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    res.status(400).json({
      success: false,
      error: 'Validation error',
      message: errors,
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
    return;
  }

  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
}
