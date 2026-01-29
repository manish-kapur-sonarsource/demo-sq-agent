import express, { Application, Request, Response } from 'express';
import morgan from 'morgan';
import { initializeDatabase } from './db/database';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { config } from './utils/config';
import authRoutes from './routes/auth';
import taskRoutes from './routes/tasks';
import healthRoutes from './routes/health';
import { ApiResponse } from './types';

const app: Application = express();

initializeDatabase();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));
app.use(rateLimiter);

app.use('/health', healthRoutes);
app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);

app.use((req: Request, res: Response<ApiResponse>) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
  console.log(`Health check: http://localhost:${config.port}/health`);
});

export default app;
