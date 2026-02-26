import { Request, Response, NextFunction } from 'express';

export const requireVerified = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authorized' });
    return;
  }
  if (!req.user.isVerified) {
    res.status(403).json({ message: 'Email not verified' });
    return;
  }
  next();
};

