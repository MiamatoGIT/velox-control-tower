import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

async function wipeDatabase() {
    console.log("🧹 Starting Database Cleanup...");

    try {
        const db = await open({
            filename: path.join(process.cwd(), 'velox_core.db'),
            driver: sqlite3.Database
        });

        // 1. Delete all Field Logs (Blockers & Reports)
        await db.run("DELETE FROM field_logs");
        console.log("✅ Cleared 'field_logs' table.");

        // 2. Delete all Daily Summaries (PDF Reports)
        await db.run("DELETE FROM daily_summaries");
        console.log("✅ Cleared 'daily_summaries' table.");

        // Optional: Reset the Auto-Increment counters so IDs start at 1 again
        await db.run("DELETE FROM sqlite_sequence WHERE name='field_logs'");
        await db.run("DELETE FROM sqlite_sequence WHERE name='daily_summaries'");
        console.log("✅ Reset ID counters to 0.");

    } catch (error) {
        console.error("❌ Error during cleanup:", error);
    }
}

wipeDatabase();