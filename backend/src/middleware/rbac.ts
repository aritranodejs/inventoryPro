import { Response, NextFunction } from 'express';
import { AuthRequest, UserRole } from '../types';

export const authorize = (...roles: UserRole[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        if (!roles.includes(req.user.role as UserRole)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        next();
    };
};
