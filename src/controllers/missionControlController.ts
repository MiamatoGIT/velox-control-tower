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

        // 1. Get Latest Daily Report (PDF Data)
        const latestReportRow = await db.get("SELECT report_json FROM daily_summaries ORDER BY id DESC LIMIT 1");
        
        // 2. Get Live Blockers (Field App Data)
        const liveBlockers = await db.all(`
            SELECT id, work_package_id, blocker_reason, user_name, timestamp, acknowledged_by 
            FROM field_logs WHERE status = 'BLOCKED' ORDER BY id DESC LIMIT 10
        `);

        // 3. ✅ NEW: Get Master Budget (Ingested Excel Data)
        // Ordered by highest value first
        const budgetItems = await db.all("SELECT * FROM budget_master ORDER BY total_budget DESC");

        // 4. ✅ NEW: Get Active WPs (Ingested Zip Data)
        const wpItems = await db.all("SELECT * FROM wp_scopes WHERE status = 'ACTIVE'");

        // --- Data Parsing ---
        let data: any = {};
        if (latestReportRow && latestReportRow.report_json) {
            try { data = JSON.parse(latestReportRow.report_json); } catch (e) { console.error("JSON Error", e); }
        }

        // Helper to ensure lists are arrays (Backward Compatibility)
        const normalizeList = (item: any) => {
            if (!item) return [];
            if (Array.isArray(item)) return item;
            return [item]; // Wrap single object in array
        };

        const safeData = {
            // PDF / Daily Report Data
            meta: data.meta || { project: "WAITING FOR DATA", date: "-", preparedBy: "-" },
            strategy: data.strategy || { focus: "System Standby" },
            
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

            externalCompanies: normalizeList(data.externalCompanies),
            execution: normalizeList(data.execution || data.mainActivity),
            procurement: normalizeList(data.procurement),
            readiness: normalizeList(data.readiness),
            commissioning: normalizeList(data.commissioning), 
            
            // Database / Live Data
            liveAlerts: liveBlockers,
            budget: budgetItems, // 👈 Injecting Budget for the Drawer
            wps: wpItems,        // 👈 Injecting WPs for the Drawer

            isExampleData: false 
        };
        
        const html = renderLayout(safeData);
        res.send(html);

    } catch (error) {
        console.error("Mission Control Error:", error);
        res.status(500).send("System Offline");
    }
};

// --- B. API: ACKNOWLEDGE BLOCKER ---
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

// --- C. API: LIVE POLLING STATS ---
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