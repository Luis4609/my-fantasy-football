import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  let token = req.cookies?.token;

  if (!token) {
    const authHeader = req.headers['authorization'];
    token = authHeader && authHeader.split(' ')[1];
  }

  if (!token) {
    res.status(401).json({ message: 'Authentication token required' });
    return;
  }

  const secret = process.env.JWT_SECRET || 'fallback_secret_for_fantasy_football';

  jwt.verify(token, secret, (err: any, decoded: any) => {
    if (err) {
      res.status(403).json({ message: 'Invalid or expired token' });
      return;
    }

    // Attach decoded user payload to request
    const payload = decoded as { userId: string; email: string };
    req.user = {
      id: payload.userId,
      email: payload.email
    };
    next();
  });
};
