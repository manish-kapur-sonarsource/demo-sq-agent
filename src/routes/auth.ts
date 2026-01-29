import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository } from '../db/userRepository';
import { config } from '../utils/config';
import { registerSchema, loginSchema } from '../utils/validation';
import { validateBody } from '../middleware/validate';
import { BadRequestError, ConflictError, UnauthorizedError } from '../utils/errors';
import { ApiResponse, JwtPayload, RegisterInput, LoginInput } from '../types';

const router = Router();

router.post(
  '/register',
  validateBody(registerSchema),
  async (req: Request<object, ApiResponse, RegisterInput>, res: Response<ApiResponse>, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      const existingUser = userRepository.findByEmail(email);
      if (existingUser) {
        throw new ConflictError('User with this email already exists');
      }

      const hashedPassword = await bcrypt.hash(password, config.bcryptRounds);
      const user = userRepository.create(email, hashedPassword);

      const payload: JwtPayload = { userId: user.id, email: user.email };
      const token = jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

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
  validateBody(loginSchema),
  async (req: Request<object, ApiResponse, LoginInput>, res: Response<ApiResponse>, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      const user = userRepository.findByEmail(email);
      if (!user) {
        throw new UnauthorizedError('Invalid email or password');
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new UnauthorizedError('Invalid email or password');
      }

      const payload: JwtPayload = { userId: user.id, email: user.email };
      const token = jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

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
