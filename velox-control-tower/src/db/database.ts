import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'velox_core.db');
let db: Database | null = null;

export const initDB = async () => {
  db = await open({ filename: DB_PATH, driver: sqlite3.Database });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS field_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
      work_package_id TEXT,
      user_name TEXT,
      status TEXT,
      
      -- ⚠️ NEW: We keep these for backwards compatibility / quick sums
      quantity_value REAL, 
      quantity_unit TEXT,
      
      -- ✅ NEW: The detailed list
      materials_json TEXT, 

      comments TEXT,
      language TEXT,
      pdf_path TEXT,
      audio_path TEXT,
      photo_path TEXT,
      synced_to_cloud INTEGER DEFAULT 0
    );
  `);
  
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_wp_id ON field_logs(work_package_id);`);
  console.log("💾 Velox Core Database Online:", DB_PATH);
  return db;
};

export const saveLog = async (data: any) => {
  if (!db) await initDB();
  
  // Calculate a "Total Quantity" just for the dashboard summary (sum of all numbers)
  // e.g., 20 sockets + 50m cable = 70 (rough estimate for the graph)
  let totalVal = 0;
  let primaryUnit = "Mixed";
  
  if (data.materials && data.materials.length > 0) {
      totalVal = data.materials.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0);
      primaryUnit = data.materials[0].unit; // Grab the first unit
  }

  await db?.run(
    `INSERT INTO field_logs (
      work_package_id, user_name, status, 
      quantity_value, quantity_unit, materials_json,
      comments, language, pdf_path, audio_path, photo_path
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
    [
      data.workPackage || "UNKNOWN_WP",
      data.user || "Unknown",
      data.taskStatus,
      totalVal,    // Saved for quick sorting
      primaryUnit, // Saved for quick sorting
      JSON.stringify(data.materials || []), // ✅ SAVE THE LIST
      data.comments,
      data.lang,
      data.pdfPath,
      data.audioPath || null,
      data.photoPath || null
    ]
  );
  console.log(`💾 Saved with Materials: ${JSON.stringify(data.materials || [])}`);
};

// ... keep getStats as is ...
export const getStats = async () => {
    if (!db) await initDB();
    const result = await db?.get(`
        SELECT COUNT(*) as total_reports, SUM(quantity_value) as total_installed FROM field_logs
    `);
    return result;
};