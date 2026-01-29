import express from 'express';
import { initializeDatabase } from './db/database';
import { config } from './utils/config';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { rateLimiter } from './middleware/rateLimit';
import authRoutes from './routes/auth';
import taskRoutes from './routes/tasks';
import healthRoutes from './routes/health';

const app = express();

app.use(express.json());
app.use(requestLogger);
app.use(rateLimiter);

app.use('/health', healthRoutes);
app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);

app.use(errorHandler);

initializeDatabase();

app.listen(config.port, () => {
  console.log(`Server is running on http://localhost:${config.port}`);
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
