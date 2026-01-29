import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../utils/config';
import { UnauthorizedError } from '../utils/errors';
import { AuthenticatedRequest, JwtPayload } from '../types';

export function authenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedError('No authorization header provided');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedError('Invalid authorization header format');
    }

    const token = parts[1];

    try {
      const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
      req.user = decoded;
      next();
    } catch (jwtError) {
      throw new UnauthorizedError('Invalid or expired token');
    }
  } catch (error) {
    next(error);
  }
}
