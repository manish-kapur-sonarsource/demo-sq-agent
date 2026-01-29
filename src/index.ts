import express from 'express';
import { config } from './utils/config';
import { initializeDatabase } from './db/database';
import { requestLogger } from './middleware/requestLogger';
import { rateLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
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
  console.log(`Server running on port ${config.port}`);
  console.log(`Health check: http://localhost:${config.port}/health`);
});

export default app;
