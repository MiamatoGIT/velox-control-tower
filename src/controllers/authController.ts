import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createUser, getUserByUsername } from '../db/database';

// ⚠️ MOVE TO .ENV IN PRODUCTION
const JWT_SECRET = process.env.JWT_SECRET || 'velox-secret-key-change-me';

// ... (Keep 'register' function exactly as it is) ...
export const register = async (req: Request, res: Response) => {
    /* ... your existing code ... */
    try {
        const { username, password, fullName, role } = req.body;
        if (!username || !password) return res.status(400).send("Missing fields");

        const hash = await bcrypt.hash(password, 10);
        await createUser(username, hash, fullName || username, role || 'FOREMAN');
        
        res.status(201).json({ message: "User created" });
    } catch (error) {
        res.status(500).json({ error: "User creation failed" });
    }
};

// ... (Keep 'login' function exactly as it is for Mobile App) ...
export const login = async (req: Request, res: Response) => {
    /* ... your existing code ... */
    try {
        const { username, password } = req.body;
        const user = await getUserByUsername(username);

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role, fullName: user.full_name }, 
            JWT_SECRET, 
            { expiresIn: '24h' }
        );

        res.json({ 
            token, 
            user: { 
                username: user.username, 
                fullName: user.full_name, 
                role: user.role,
                assignedWP: user.work_package_id || "WP-GENERAL" 
            } 
        });
    } catch (error) {
        res.status(500).send("Login error");
    }
};

// ✅ NEW: WEB LOGIN (Cookie Based)
export const webLogin = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        const user = await getUserByUsername(username);

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Generate Token
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        // 🍪 SET HTTP-ONLY COOKIE (Secure & Invisible to JS)
        res.cookie('auth_token', token, {
            httpOnly: true,
            maxAge: 8 * 60 * 60 * 1000 // 8 hours
        });

        res.json({ success: true });

    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
};