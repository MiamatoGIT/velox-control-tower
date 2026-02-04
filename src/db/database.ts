import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

// Path to your database file
const DB_PATH = path.join(process.cwd(), 'velox_core.db');
let db: Database | null = null;

// --- INITIALIZE DATABASE ---
export const initDB = async () => {
    try {
        db = await open({ filename: DB_PATH, driver: sqlite3.Database });
        console.log(`💾 Velox Core Database Online: ${DB_PATH}`);

        // 1. FIELD LOGS (Site Reports)
        await db.exec(`
            CREATE TABLE IF NOT EXISTS field_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
                work_package_id TEXT,
                user_name TEXT,
                status TEXT,
                quantity_value REAL, 
                quantity_unit TEXT,
                materials_json TEXT, 
                comments TEXT,
                language TEXT,
                pdf_path TEXT,
                audio_path TEXT,
                photo_path TEXT,
                synced_to_cloud INTEGER DEFAULT 0,
                blocker_reason TEXT
            )
        `);

        // 2. DAILY SUMMARIES
        await db.exec(`
            CREATE TABLE IF NOT EXISTS daily_summaries (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                timestamp TEXT DEFAULT CURRENT_TIMESTAMP, 
                report_date TEXT, 
                prepared_by TEXT, 
                report_json TEXT
            )
        `);

        // 3. CONSENTS
        await db.exec(`
            CREATE TABLE IF NOT EXISTS consents (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                timestamp TEXT DEFAULT CURRENT_TIMESTAMP, 
                device_id TEXT, 
                device_name TEXT, 
                device_model TEXT, 
                os_version TEXT, 
                ip_address TEXT
            )
        `);

        // 4. USERS
        await db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE,
                password_hash TEXT,
                role TEXT,
                full_name TEXT
            )
        `);

        // 5. BUDGET MASTER (New)
        await db.exec(`
            CREATE TABLE IF NOT EXISTS budget_master (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                cost_code TEXT,
                description TEXT,
                uom TEXT,
                total_qty REAL,
                unit_rate REAL,
                total_budget REAL,
                wp_ref TEXT,
                qty_ordered REAL DEFAULT 0,
                qty_stock REAL DEFAULT 0,
                qty_installed REAL DEFAULT 0
            )
        `);

        // 6. WP SCOPES (New)
        await db.exec(`
            CREATE TABLE IF NOT EXISTS wp_scopes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                wp_id TEXT UNIQUE,
                description TEXT,
                materials_json TEXT,
                docs_path TEXT,
                status TEXT DEFAULT 'ACTIVE'
            )
        `);

        // --- SELF-HEALING ---
        try { await db.exec("ALTER TABLE field_logs ADD COLUMN blocker_reason TEXT;"); } catch (e) {}
        try { await db.exec("ALTER TABLE users ADD COLUMN work_package_id TEXT DEFAULT 'WP-GENERAL';"); } catch (e) {}
        try { await db.exec("ALTER TABLE budget_master ADD COLUMN qty_ordered REAL DEFAULT 0;"); } catch (e) {}
        try { await db.exec("ALTER TABLE budget_master ADD COLUMN qty_stock REAL DEFAULT 0;"); } catch (e) {}
        try { await db.exec("ALTER TABLE budget_master ADD COLUMN qty_installed REAL DEFAULT 0;"); } catch (e) {}

        return db;
    } catch (error) {
        console.error("❌ Database Init Error:", error);
        return null;
    }
};

// --- DATA ACCESS METHODS ---

export const saveLog = async (data: any) => {
    if (!db) await initDB();
    
    let totalVal = 0;
    let primaryUnit = "Mixed";
    if (data.materials && data.materials.length > 0) {
        totalVal = data.materials.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0);
        primaryUnit = data.materials[0].unit;
    }

    const result = await db?.run(
        `INSERT INTO field_logs (
            work_package_id, user_name, status, 
            quantity_value, quantity_unit, materials_json,
            comments, language, pdf_path, audio_path, photo_path,
            blocker_reason
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
        [
            data.workPackage || "UNKNOWN_WP",
            data.user || "Unknown",
            data.taskStatus,
            totalVal,
            primaryUnit,
            JSON.stringify(data.materials || []),
            data.comments,
            data.lang,
            data.pdfPath,
            data.audioPath || null,
            data.photoPath || null,
            data.blocker || null
        ]
    );
    return result?.lastID;
};

export const updateLogPdf = async (id: number, pdfFilename: string) => {
    if (!db) await initDB();
    await db?.run('UPDATE field_logs SET pdf_path = ? WHERE id = ?', [pdfFilename, id]);
};

export const saveConsent = async (data: any) => {
    if (!db) await initDB();
    await db?.run(
        `INSERT INTO consents (device_id, device_name, device_model, os_version, ip_address) VALUES (?, ?, ?, ?, ?)`,
        [data.deviceId, data.deviceName, data.deviceModel, data.osVersion, data.ipAddress]
    );
};

// ✅ RESTORED: Needed by dashboardController
export const getStats = async () => {
    if (!db) await initDB();
    return await db?.get(`
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'BLOCKED' THEN 1 ELSE 0 END) as blocked,
            SUM(CASE WHEN status = 'YES' THEN 1 ELSE 0 END) as completed
        FROM field_logs 
        WHERE date(timestamp) = date('now')
    `);
};

// ✅ RESTORED: Needed by dashboardController
export const getConsents = async () => {
    if (!db) await initDB();
    return await db?.all('SELECT * FROM consents ORDER BY timestamp DESC');
};

// ✅ RESTORED: Needed by dashboardController
export const getLogs = async () => {
    if (!db) await initDB();
    return await db?.all('SELECT * FROM field_logs ORDER BY timestamp DESC');
};

export const deleteLog = async (id: number) => {
    if (!db) await initDB();
    const result = await db?.run('DELETE FROM field_logs WHERE id = ?', [id]);
    return result?.changes ? result.changes > 0 : false;
};

// --- AUTH HELPERS ---

export const getUserByUsername = async (username: string) => {
    if (!db) await initDB();
    return await db?.get('SELECT * FROM users WHERE username = ?', [username]);
};

// ✅ FIXED: Signature matches usage
export const createUser = async (username: string, hash: string, fullName: string, role: string) => {
    if (!db) await initDB();
    try {
        const result = await db?.run(
            'INSERT INTO users (username, password_hash, full_name, role) VALUES (?, ?, ?, ?)',
            [username, hash, fullName, role]
        );
        return result?.lastID;
    } catch (e) {
        throw new Error("Username already exists");
    }
};