import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createUser, getUserByEmail } from '../db/userRepository';
import { registerSchema, loginSchema } from '../utils/validation';
import { config } from '../utils/config';
import { AppError } from '../middleware/errorHandler';
import { JwtPayload } from '../types';

const router = Router();

router.post(
  '/register',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      const existingUser = getUserByEmail(validatedData.email);
      if (existingUser) {
        throw new AppError(409, 'User with this email already exists');
      }

      const hashedPassword = await bcrypt.hash(
        validatedData.password,
        config.bcryptRounds
      );

      const user = createUser(validatedData.email, hashedPassword);

      const payload: JwtPayload = {
        userId: user.id,
        email: user.email,
      };

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
      const validatedData = loginSchema.parse(req.body);

      const user = getUserByEmail(validatedData.email);
      if (!user) {
        throw new AppError(401, 'Invalid email or password');
      }

      const isPasswordValid = await bcrypt.compare(
        validatedData.password,
        user.password
      );

      if (!isPasswordValid) {
        throw new AppError(401, 'Invalid email or password');
      }

      const payload: JwtPayload = {
        userId: user.id,
        email: user.email,
      };

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
