import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError, ValidationError } from '../utils/errors';
import { ApiResponse } from '../types';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): void {
  console.error('Error:', err);

  if (err instanceof ZodError) {
    const errors = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      message: errors.join(', '),
    });
    return;
  }

  if (err instanceof ValidationError) {
    res.status(err.statusCode).json({
      success: false,
      error: 'Validation failed',
      message: err.errors.join(', '),
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
