import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository } from '../db/userRepository';
import { config } from '../utils/config';
import { registerSchema, loginSchema } from '../utils/validation';
import { validate } from '../middleware/validate';
import { ConflictError, UnauthorizedError } from '../utils/errors';
import { ApiResponse, RegisterInput, LoginInput, JwtPayload } from '../types';

const router = Router();

router.post(
  '/register',
  validate(registerSchema),
  async (req: Request<object, ApiResponse, RegisterInput>, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (userRepository.emailExists(email)) {
        throw new ConflictError('Email already registered');
      }

      const hashedPassword = await bcrypt.hash(password, config.bcryptSaltRounds);
      const user = userRepository.create({ email, password: hashedPassword });

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
  validate(loginSchema),
  async (req: Request<object, ApiResponse, LoginInput>, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;

      const user = userRepository.findByEmail(email);
      if (!user) {
        throw new UnauthorizedError('Invalid email or password');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedError('Invalid email or password');
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
