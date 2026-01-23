import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'velox-secret-key-change-me';

export const webAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // 1. Look for token in COOKIES (not header)
    const token = req.cookies?.auth_token;

    if (!token) {
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        (req as any).user = decoded;
        next(); // Valid token, proceed to dashboard
    } catch (err) {
        console.log("⛔ Invalid Cookie Token");
        res.clearCookie('auth_token');
        return res.redirect('/login');
    }
};