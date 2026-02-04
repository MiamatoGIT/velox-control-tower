import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'velox-secret-key-change-me';

// Extend Express Request interface to include user data
export interface AuthRequest extends Request {
    user?: any;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer <TOKEN>"

    if (!token) return res.sendStatus(401); // No token? Unauthorized.

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (err) return res.sendStatus(403); // Invalid token? Forbidden.
        
        req.user = user; // Attach user info to the request object
        next(); // Pass control to the next handler (submitReport)
    });
};