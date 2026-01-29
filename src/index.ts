import express, { Request, Response } from 'express';
import morgan from 'morgan';
import { config } from './utils/config';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { ApiResponse } from './types';

const app = express();

app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);

app.use('/', routes);

app.use((_req: Request, res: Response<ApiResponse>) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
  });
});

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
  console.log(`Health check: http://localhost:${config.port}/health`);
});

export default app;
