import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository } from '../db/userRepository';
import { registerSchema, loginSchema } from '../utils/validation';
import { config } from '../utils/config';
import { AppError } from '../middleware/errorHandler';
import { JwtPayload } from '../types';

const router = Router();

router.post(
  '/register',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = registerSchema.parse(req.body);

      const existingUser = userRepository.findByEmail(data.email);
      if (existingUser) {
        throw new AppError(409, 'User with this email already exists');
      }

      const hashedPassword = await bcrypt.hash(data.password, config.bcryptRounds);
      const user = userRepository.create(data.email, hashedPassword);

      const payload: JwtPayload = { userId: user.id, email: user.email };
      const token = jwt.sign(payload, config.jwtSecret, {
        expiresIn: config.jwtExpiresIn,
      });

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
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = loginSchema.parse(req.body);

      const user = userRepository.findByEmail(data.email);
      if (!user) {
        throw new AppError(401, 'Invalid email or password');
      }

      const isValidPassword = await bcrypt.compare(data.password, user.password);
      if (!isValidPassword) {
        throw new AppError(401, 'Invalid email or password');
      }

      const payload: JwtPayload = { userId: user.id, email: user.email };
      const token = jwt.sign(payload, config.jwtSecret, {
        expiresIn: config.jwtExpiresIn,
      });

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            createdAt: user.createdAt,
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
