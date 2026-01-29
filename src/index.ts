import express from 'express';
import { config } from './utils/config';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/logger';
import { rateLimiter } from './middleware/rateLimit';
import healthRoutes from './routes/health';
import authRoutes from './routes/auth';
import taskRoutes from './routes/tasks';

const app = express();

app.use(express.json());
app.use(requestLogger);
app.use(rateLimiter);

app.use('/health', healthRoutes);
app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);

app.use(errorHandler);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
  });
});

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
  console.log(`Health check: http://localhost:${config.port}/health`);
});

export default app;
