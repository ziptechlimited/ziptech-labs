import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { config } from '../config/env';

interface DecodedToken {
  id: string;
  iat: number;
  exp: number;
}

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, config.JWT_SECRET) as DecodedToken;

      // Get user from the token
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
         res.status(401).json({ message: 'Not authorized, user not found' });
         return;
      }

      req.user = user;

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};
