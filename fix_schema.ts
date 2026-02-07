import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

async function fixSchema() {
    const db = await open({
        filename: path.join(process.cwd(), 'velox_core.db'),
        driver: sqlite3.Database
    });

    console.log("🛠️ Fixing Database Schema...");

    // 1. DROP the old table
    await db.run("DROP TABLE IF EXISTS roadblocks");
    console.log("🗑️ Old 'roadblocks' table deleted.");

    // 2. CREATE the new table with UID
    await db.run(`
        CREATE TABLE roadblocks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uid TEXT UNIQUE,                  -- ✅ The missing column
            type TEXT CHECK( type IN ('FIELD', 'OFFICE') ) DEFAULT 'FIELD',
            status TEXT DEFAULT 'OPEN',       
            priority TEXT DEFAULT 'MEDIUM',   
            
            description TEXT NOT NULL,        
            action_required TEXT,             
            
            area TEXT,                        
            owner TEXT,                       
            reported_by TEXT,                 
            due_date TEXT,
            
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log("✅ New 'roadblocks' table created with UID column.");
}

fixSchema();