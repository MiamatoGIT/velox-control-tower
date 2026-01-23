import { Request, Response } from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { DailyReportData } from '../types/dailyReport';
import { renderLayout } from '../views/missionControl/layout';

// --- A. MAIN DASHBOARD RENDERER ---
export const renderMissionControl = async (req: Request, res: Response) => {
    try {
        const db = await open({
            filename: path.join(process.cwd(), 'velox_core.db'),
            driver: sqlite3.Database
        });

        // 1. Fetch Strategic Data (PDF/JSON)
        const latestReportRow = await db.get("SELECT report_json FROM daily_summaries ORDER BY id DESC LIMIT 1");
        
        // 2. Fetch Active Blockers (Initial Load)
        // We fetch these separately because they come from the Mobile App (Live), not the PDF
        const liveBlockers = await db.all(`
            SELECT id, work_package_id, blocker_reason, user_name, timestamp, acknowledged_by 
            FROM field_logs 
            WHERE status = 'BLOCKED' 
            ORDER BY id DESC LIMIT 10
        `);

        // 3. Parse Data with Safety Checks
        let data: any = {}; // Using 'any' to allow flexible property access
        if (latestReportRow && latestReportRow.report_json) {
            try {
                data = JSON.parse(latestReportRow.report_json);
            } catch (e) {
                console.error("JSON Parse Error:", e);
            }
        }

        // 4. Construct Safe Data Object (Merging DB Data with Defaults)
        // ⚠️ LOGIC UPDATE: We use real DB values first. Defaults are now empty/zero, not fake data.
        const safeData = {
            meta: data.meta || { project: "WAITING FOR DATA", date: "-", preparedBy: "-" },
            strategy: data.strategy || { focus: "System Standby" },
            
            // ✅ HSE: Use DB values. Fallback to "0" or "N/A" only if missing.
            hse: {
                workingHours: data.hse?.workingHours || "N/A",
                peopleOnSite: data.hse?.peopleOnSite || 0,
                incidents: data.hse?.incidents || 0,
                toolboxes: data.hse?.toolboxes || 0,
                dra: data.hse?.dra || 0,
                observations: data.hse?.observations || 0,
                training: data.hse?.training || "-",
                inspections: data.hse?.inspections || "0"
            },

            // ✅ COMPANIES: Use DB first. Fallback to empty array (No more fake Apex Scaffolding).
            externalCompanies: data.externalCompanies || [],

            // ✅ LISTS: Standard fallbacks
            mainActivity: data.mainActivity || { description: "No Active Work", targetPercent: 0, actualPercent: 0, status: "Idle" },
            procurement: data.procurement || [],
            readiness: data.readiness || [],
            commissioning: data.commissioning || { description: "-", targetPercent: 0, actualPercent: 0, status: "-" },
            
            // ✅ LIVE FEED: Inject the real blockers found in Step 2
            liveAlerts: liveBlockers,
            
            // Flag to turn off the "Yellow Warning Bar" in the UI
            isExampleData: false 
        };
        
        const html = renderLayout(safeData);
        res.send(html);

    } catch (error) {
        console.error("Mission Control Error:", error);
        res.status(500).send("System Offline");
    }
};

// --- B. API: ACKNOWLEDGE BLOCKER (UNCHANGED) ---
export const acknowledgeBlocker = async (req: Request, res: Response) => {
    try {
        const { id, user } = req.body; 
        const db = await open({ filename: path.join(process.cwd(), 'velox_core.db'), driver: sqlite3.Database });
        
        await db.run(
            `UPDATE field_logs SET acknowledged_by = ?, acknowledged_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [user, id]
        );
        
        console.log(`✅ Blocker #${id} acknowledged by ${user}`);
        res.json({ success: true });
    } catch (error) {
        console.error("Ack Error:", error);
        res.status(500).json({ error: "Failed to ack" });
    }
};

// --- C. API: LIVE POLLING STATS (UNCHANGED) ---
export const getLiveStats = async (req: Request, res: Response) => {
    try {
        const db = await open({ filename: path.join(process.cwd(), 'velox_core.db'), driver: sqlite3.Database });
        
        // Fetch ONLY active blockers
        const alerts = await db.all(`
            SELECT id, work_package_id, blocker_reason, user_name, timestamp, acknowledged_by 
            FROM field_logs 
            WHERE status = 'BLOCKED' 
            ORDER BY id DESC LIMIT 10
        `);
        
        res.json({ alerts });
    } catch (error) {
        console.error("Polling Error:", error);
        res.status(500).json({ error: "Polling failed" });
    }
};