import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../utils/config';
import { registerSchema, loginSchema } from '../utils/validation';
import { userRepository } from '../db/userRepository';
import { ConflictError, UnauthorizedError } from '../utils/errors';
import { ApiResponse } from '../types';

const router = Router();

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
  };
}

router.post(
  '/register',
  async (req: Request, res: Response<ApiResponse<AuthResponse>>, next: NextFunction) => {
    try {
      const { email, password } = registerSchema.parse(req.body);

      const existingUser = userRepository.findByEmail(email);
      if (existingUser) {
        throw new ConflictError('Email already registered');
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const user = userRepository.create(email, hashedPassword);

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
      );

      res.status(201).json({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
          },
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
  async (req: Request, res: Response<ApiResponse<AuthResponse>>, next: NextFunction) => {
    try {
      const { email, password } = loginSchema.parse(req.body);

      const user = userRepository.findByEmail(email);
      if (!user) {
        throw new UnauthorizedError('Invalid email or password');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedError('Invalid email or password');
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
      );

      res.json({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
          },
        },
        message: 'Login successful',
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
