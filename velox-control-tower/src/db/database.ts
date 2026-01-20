import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'velox_core.db');

export const initDB = async () => {
    try {
        const db = await open({ filename: DB_PATH, driver: sqlite3.Database });
        console.log(`💾 Velox Core Database Online: ${DB_PATH}`);

        // 1. Create Field Logs Table
        await db.exec(`
            CREATE TABLE IF NOT EXISTS field_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                work_package_id TEXT,
                user_name TEXT,
                status TEXT,
                materials_json TEXT, 
                quantity_value TEXT,
                quantity_unit TEXT,
                comments TEXT,
                original_lang TEXT,
                pdf_path TEXT,
                audio_path TEXT,
                photo_path TEXT,
                blocker_reason TEXT
            )
        `);

        // 2. SELF-HEALING: Add 'blocker_reason' if missing
        try {
            await db.exec("ALTER TABLE field_logs ADD COLUMN blocker_reason TEXT;");
        } catch (e) {}

        // 3. Create Daily Summaries & Consents
        await db.exec(`CREATE TABLE IF NOT EXISTS daily_summaries (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, report_date TEXT, prepared_by TEXT, report_json TEXT)`);
        await db.exec(`CREATE TABLE IF NOT EXISTS consents (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, device_id TEXT, device_name TEXT, device_model TEXT, os_version TEXT, ip_address TEXT)`);

        // 4. Users Table (For Auth)
        await db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                full_name TEXT NOT NULL,
                role TEXT DEFAULT 'FOREMAN', 
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 5. ✅ NEW: Add 'work_package_id' to Users if missing
        try {
            await db.exec("ALTER TABLE users ADD COLUMN work_package_id TEXT DEFAULT 'WP-GENERAL';");
            console.log("🔧 Database Patched: Added 'work_package_id' to users.");
        } catch (e) { 
            // Ignore if column exists 
        }

        return db;
    } catch (error) {
        console.error("❌ Database Init Error:", error);
    }
};

// --- DATA ACCESS METHODS ---

export const saveLog = async (data: any) => {
    const db = await open({ filename: DB_PATH, driver: sqlite3.Database });
    
    const matJson = JSON.stringify(data.materials || []);
    const firstMat = data.materials && data.materials.length > 0 ? data.materials[0] : { quantity: 0, unit: 'mixed' };
    const finalQty = data.quantity || firstMat.quantity;

    const result = await db.run(
        `INSERT INTO field_logs (
            work_package_id, user_name, status, 
            materials_json, quantity_value, quantity_unit,
            comments, original_lang, pdf_path, audio_path, photo_path,
            blocker_reason
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            data.workPackage, data.user, data.taskStatus,
            matJson, finalQty, firstMat.unit,
            data.comments, data.lang, data.pdfPath, data.audioPath, data.photoPath,
            data.blocker || null 
        ]
    );

    return result.lastID;
};

export const updateLogPdf = async (id: number, pdfFilename: string) => {
    const db = await open({ filename: DB_PATH, driver: sqlite3.Database });
    await db.run(
        `UPDATE field_logs SET pdf_path = ? WHERE id = ?`,
        [pdfFilename, id]
    );
    console.log(`🔄 Database Updated: Log #${id} linked to PDF ${pdfFilename}`);
};

export const saveConsent = async (data: any) => { 
    const db = await open({ filename: DB_PATH, driver: sqlite3.Database });
    await db.run(
        `INSERT INTO consents (device_id, device_name, device_model, os_version, ip_address) VALUES (?, ?, ?, ?, ?)`,
        [data.deviceId, data.deviceName, data.deviceModel, data.osVersion, data.ipAddress]
    );
};

export const getStats = async () => {
    const db = await open({ filename: DB_PATH, driver: sqlite3.Database });
    return await db.get(`
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'BLOCKED' THEN 1 ELSE 0 END) as blocked,
            SUM(CASE WHEN status = 'YES' THEN 1 ELSE 0 END) as completed
        FROM field_logs 
        WHERE date(timestamp) = date('now')
    `);
};

export const getConsents = async () => {
    const db = await open({ filename: DB_PATH, driver: sqlite3.Database });
    return await db.all('SELECT * FROM consents ORDER BY timestamp DESC');
};

export const getLogs = async () => {
    const db = await open({ filename: DB_PATH, driver: sqlite3.Database });
    return await db.all('SELECT * FROM field_logs ORDER BY timestamp DESC');
};

export const deleteLog = async (id: number) => {
    const db = await open({ filename: DB_PATH, driver: sqlite3.Database });
    const result = await db.run('DELETE FROM field_logs WHERE id = ?', [id]);
    return result.changes ? result.changes > 0 : false;
};

// --- AUTH HELPERS ---

export const createUser = async (username: string, hash: string, fullName: string, role: string) => {
    const db = await open({ filename: DB_PATH, driver: sqlite3.Database });
    try {
        const result = await db.run(
            `INSERT INTO users (username, password_hash, full_name, role) VALUES (?, ?, ?, ?)`,
            [username, hash, fullName, role]
        );
        return result.lastID;
    } catch (e) {
        throw new Error("Username already exists");
    }
};

export const getUserByUsername = async (username: string) => {
    const db = await open({ filename: DB_PATH, driver: sqlite3.Database });
    return await db.get(`SELECT * FROM users WHERE username = ?`, [username]);
};