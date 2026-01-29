import { Router, Request, Response } from 'express';
import { ApiResponse } from '../types';

const router = Router();

router.get('/', (_req: Request, res: Response<ApiResponse>): void => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

export default router;
