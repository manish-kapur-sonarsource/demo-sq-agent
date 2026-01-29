import { Router, Request, Response, NextFunction } from 'express';
import { createUser, findUserByEmail, emailExists } from '../db/userRepository';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema } from '../utils/validation';
import { AppError } from '../middleware/errorHandler';
import { ApiResponse } from '../types';

const router = Router();

router.post(
  '/register',
  validate(registerSchema),
  async (req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (emailExists(email)) {
        throw new AppError(409, 'Email already registered');
      }

      const hashedPassword = await hashPassword(password);
      const user = createUser(email, hashedPassword);

      const token = generateToken({ userId: user.id, email: user.email });

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            createdAt: user.createdAt,
          },
          token,
        },
        message: 'User registered successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/login',
  validate(loginSchema),
  async (req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;

      const user = findUserByEmail(email);
      if (!user) {
        throw new AppError(401, 'Invalid email or password');
      }

      const isValidPassword = await comparePassword(password, user.password);
      if (!isValidPassword) {
        throw new AppError(401, 'Invalid email or password');
      }

      const token = generateToken({ userId: user.id, email: user.email });

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
          },
          token,
        },
        message: 'Login successful',
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
