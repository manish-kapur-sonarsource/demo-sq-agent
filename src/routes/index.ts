import { Router } from 'express';
import authRoutes from './auth';
import taskRoutes from './tasks';
import healthRoutes from './health';

const router = Router();

router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);
router.use('/health', healthRoutes);

export default router;
