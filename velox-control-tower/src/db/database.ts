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
                blocker_reason TEXT -- ✅ NEW COLUMN
            )
        `);

        // 2. SELF-HEALING: Try to add 'blocker_reason' if it doesn't exist
        try {
            await db.exec("ALTER TABLE field_logs ADD COLUMN blocker_reason TEXT;");
            console.log("🔧 Database Patched: Added 'blocker_reason' column.");
        } catch (e) {
            // Ignore error if column already exists
        }

        // 3. Create Daily Summaries & Consents
        await db.exec(`CREATE TABLE IF NOT EXISTS daily_summaries (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, report_date TEXT, prepared_by TEXT, report_json TEXT)`);
        await db.exec(`CREATE TABLE IF NOT EXISTS consents (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, device_id TEXT, device_name TEXT, device_model TEXT, os_version TEXT, ip_address TEXT)`);

        return db;
    } catch (error) {
        console.error("❌ Database Init Error:", error);
    }
};

export const saveLog = async (data: any) => {
    const db = await open({ filename: DB_PATH, driver: sqlite3.Database });
    const matJson = JSON.stringify(data.materials || []);
    // Default fallback for legacy UI
    const firstMat = data.materials && data.materials.length > 0 ? data.materials[0] : { quantity: 0, unit: 'mixed' };

    await db.run(
        `INSERT INTO field_logs (
            work_package_id, user_name, status, 
            materials_json, quantity_value, quantity_unit,
            comments, original_lang, pdf_path, audio_path, photo_path,
            blocker_reason -- ✅ SAVE BLOCKER
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            data.workPackage, data.user, data.taskStatus,
            matJson, firstMat.quantity, firstMat.unit,
            data.comments, data.lang, data.pdfPath, data.audioPath, data.photoPath,
            data.blocker || null // Value from Gemini
        ]
    );
};

export const saveConsent = async (data: any) => { /* Keep existing */ };
export const getStats = async () => { /* Keep existing */ };
export const getConsents = async () => { /* Keep existing */ };