import fs from 'fs';
import path from 'path';

// Locate the database file
const dbPath = path.join(process.cwd(), 'velox_core.db');

console.log("🛑 STOPPING OPERATIONS...");
console.log("📍 Target Database:", dbPath);

if (fs.existsSync(dbPath)) {
    try {
        fs.unlinkSync(dbPath);
        console.log("✅ SUCCESS: Old database deleted.");
        console.log("🚀 Please restart the server to rebuild the schema.");
    } catch (error) {
        console.error("❌ ERROR: Could not delete file. It might be open in another program.");
        console.error("👉 ACTION: Close any DB viewers (SQLite Browser) and try again.");
    }
} else {
    console.log("⚠️  File not found. You are already clean!");
}