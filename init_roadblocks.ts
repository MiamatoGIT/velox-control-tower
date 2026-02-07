import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

async function initRoadblocks() {
    const db = await open({
        filename: path.join(process.cwd(), 'velox_core.db'),
        driver: sqlite3.Database
    });

    console.log("🚧 Initializing Roadblocks Table...");

    // Create Table matching Torje's Excel structure
    await db.exec(`
        CREATE TABLE IF NOT EXISTS roadblocks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uid TEXT UNIQUE,                  -- e.g., "RB-104"
            type TEXT CHECK( type IN ('FIELD', 'OFFICE') ) DEFAULT 'FIELD',
            status TEXT DEFAULT 'OPEN',       -- OPEN, CLOSED, IN_PROGRESS
            priority TEXT DEFAULT 'MEDIUM',   -- CRITICAL, HIGH, MEDIUM, LOW
            
            description TEXT NOT NULL,        -- "Clash between cable tray and HVAC"
            action_required TEXT,             -- "Issue TQ to Engineering"
            
            area TEXT,                        -- "L02 - Switchroom"
            owner TEXT,                       -- "Engineering", "Procurement", "Site"
            reported_by TEXT,                 -- "Tony Stark"
            due_date TEXT,
            
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    console.log("✅ Table 'roadblocks' created.");

    // Seed with some Dummy Data for the Demo
    const count = await db.get("SELECT count(*) as c FROM roadblocks");
    if (count.c === 0) {
        console.log("🌱 Seeding dummy roadblocks...");
        await db.run(`
            INSERT INTO roadblocks (uid, type, status, priority, description, action_required, area, owner, reported_by, due_date)
            VALUES 
            ('RB-001', 'OFFICE', 'OPEN', 'CRITICAL', 'Missing Wiring Diagram for Axis 12', 'Release Revision C immediately', 'Substation L01', 'Engineering', 'Torje', '2026-02-10'),
            ('RB-002', 'FIELD', 'OPEN', 'HIGH', 'Scaffolding blocking access to Tray 4B', 'Dismantle scaffold', 'Corridor B', 'Site Team', 'Foreman John', '2026-02-06'),
            ('RB-003', 'OFFICE', 'IN_PROGRESS', 'MEDIUM', 'Cable Drum #402 delivery delayed', 'Expedite shipment from supplier', 'Laydown Area', 'Procurement', 'Logistics', '2026-02-15');
        `);
    }

    console.log("🚀 Roadblock System Ready.");
}

initRoadblocks();