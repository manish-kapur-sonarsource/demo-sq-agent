import express from 'express';
import { config } from './utils/config';
import { initializeDatabase } from './db/database';
import { requestLogger } from './middleware/logger';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimit';
import authRoutes from './routes/auth';
import taskRoutes from './routes/tasks';
import healthRoutes from './routes/health';

const app = express();

initializeDatabase();

app.use(express.json());
app.use(requestLogger);
app.use(rateLimiter);

app.use('/health', healthRoutes);
app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
  console.log('Available endpoints:');
  console.log('  GET  /health');
  console.log('  POST /auth/register');
  console.log('  POST /auth/login');
  console.log('  GET  /tasks');
  console.log('  POST /tasks');
  console.log('  PUT  /tasks/:id');
  console.log('  DELETE /tasks/:id');
});

export default app;
