import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../utils/config';
import { registerSchema, loginSchema } from '../utils/validation';
import { BadRequestError, ConflictError, UnauthorizedError } from '../utils/errors';
import { userRepository } from '../db/userRepository';
import { ApiResponse, JwtPayload } from '../types';

const router = Router();

router.post(
  '/register',
  async (req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
    try {
      const validatedData = registerSchema.parse(req.body);

      if (userRepository.emailExists(validatedData.email)) {
        throw new ConflictError('Email already registered');
      }

      const hashedPassword = await bcrypt.hash(validatedData.password, config.bcryptRounds);
      const user = userRepository.create(validatedData.email, hashedPassword);

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
  async (req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
    try {
      const validatedData = loginSchema.parse(req.body);

      const user = userRepository.findByEmail(validatedData.email);
      if (!user) {
        throw new UnauthorizedError('Invalid email or password');
      }

      const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedError('Invalid email or password');
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
