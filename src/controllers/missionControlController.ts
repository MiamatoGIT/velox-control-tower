import { Request, Response } from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { renderLayout } from '../views/missionControl/layout';

const getDb = async () => {
    return open({
        filename: path.join(process.cwd(), 'velox_core.db'),
        driver: sqlite3.Database
    });
};

// ============================================================
// 🔧 THE MASTER TRANSLATOR (Safe Merge)
// ============================================================
const normalizeList = (input: any) => {
    if (!input) return [];
    const list = Array.isArray(input) ? input : [input];
    
    return list.map((i: any) => ({
        ...i,
        // 1. Description Mapping
        // ✅ PRESERVED: 'material' is kept for Procurement
        description: i.description || i.material || i.Activity || i.task || i.Tasks || i['Activity Name'] || i['Task Planned'] || "Details pending...",
        
        // 2. Work Package / ID Mapping (The Fix for Execution)
        // ✅ ADDED: Aggressive checks (WP_ID, work_package_id, id) to stop "General"
        workPackage: i.workPackage || i.work_package_id || i.wpId || i['WP ID'] || i.WP_ID || i.ID || i.id || "General",
        
        // 3. Status Mapping
        status: i.status || i.readinessStatus || "Pending",
        
        // 4. User / Owner Mapping
        user: i.user || i.responsible || i['Responsible Person'] || i.owner || "System",
        
        // 5. Add Timestamp for UI
        timestamp: new Date().toISOString()
    }));
};

// --- HELPER: ROBUST HSE PARSER ---
const parseHSE = (hseData: any) => {
    if (!hseData) return { peopleOnSite: 0, incidents: 0, toolboxes: 0, dra: 0, observations: 0, workingHours: "-" };
    return {
        peopleOnSite: hseData.peopleOnSite || hseData['People on site'] || 0,
        incidents: hseData.incidents || 0,
        toolboxes: hseData.toolboxes || hseData.Toolboxes || 0,
        dra: hseData.dra || hseData.DRA || 0,
        observations: hseData.observations || hseData.Observations || 0,
        workingHours: hseData.workingHours || hseData['Working Hours'] || "-"
    };
};

export const renderMissionControl = async (req: Request, res: Response) => {
    try {
        const db = await getDb();
        
        // 1. GET DATA
        const latestReportRow = await db.get("SELECT report_json FROM daily_summaries ORDER BY id DESC LIMIT 1");
        let reportData: any = {};
        if (latestReportRow && latestReportRow.report_json) {
            try { reportData = JSON.parse(latestReportRow.report_json); } catch (e) { console.error(e); }
        }

        const budgetItems = await db.all("SELECT * FROM budget_master ORDER BY total_budget DESC");
        const wpItems = await db.all("SELECT * FROM wp_scopes WHERE status = 'ACTIVE'");

        // 2. GET ALERTS
        const fieldBlockers = await db.all(`SELECT * FROM field_logs WHERE status = 'BLOCKED' ORDER BY id DESC LIMIT 20`);
        
        // 🚨 ROADBLOCK FIX: Fetch ALL non-resolved items so they stay in the drawer
        const allRoadblocks = await db.all(`
            SELECT * FROM roadblocks 
            WHERE status != 'RESOLVED' 
            ORDER BY priority = 'CRITICAL' DESC, id DESC
        `);

        // 🚨 POPUP FIX: Calculate 'acknowledged_by' dynamically
        const virtualLogs = allRoadblocks.map(rb => ({
            id: `RB-${rb.id}`,
            work_package_id: rb.uid,
            blocker_reason: rb.description,
            user_name: rb.owner,
            timestamp: rb.timestamp,
            // If status is NOT 'OPEN', it is acknowledged.
            acknowledged_by: (rb.status !== 'OPEN') ? (rb.reported_by || 'System') : null,
            status: 'BLOCKED',
            is_roadblock: true
        }));

        const unifiedAlerts = [...virtualLogs, ...fieldBlockers];

        // 3. MAP PARTNERS
        const rawPartners = reportData.externalCompanies || [];
        const partners = Array.isArray(rawPartners) ? rawPartners.map((p: any) => ({
            name: p.name || p['Company name'] || "Partner",
            personnel: p.personnel || p['No. of worker'] || 0,
            role: p.role || p.Work || "General Scope"
        })) : [];

        // 4. CONSTRUCT SAFE DATA
        const safeData = {
            meta: reportData.meta || { project: "WAITING FOR PDF", date: "-" },
            strategy: reportData.strategy || { focus: "System Standby" },
            hse: parseHSE(reportData.hse),
            externalCompanies: partners,
            
            // ✅ MAPPED LISTS (Uses the safer normalizeList)
            execution: normalizeList(reportData.execution || reportData.mainActivity),
            procurement: normalizeList(reportData.procurement),
            readiness: normalizeList(reportData.readiness),       
            commissioning: normalizeList(reportData.commissioning),

            liveAlerts: unifiedAlerts,
            budget: budgetItems,
            wps: wpItems,
            roadblocks: allRoadblocks // Sends full list to drawer
        };

        const html = renderLayout(safeData);
        res.send(html);

    } catch (error) {
        console.error("Mission Control Error:", error);
        res.status(500).send("System Offline");
    }
};

// --- API ENDPOINTS ---
export const acknowledgeBlocker = async (req: Request, res: Response) => {
    try {
        const { id, user } = req.body; 
        const db = await getDb();
        const idStr = id.toString();
        
        if (idStr.startsWith('RB-')) {
            // 🚨 ACK FIX: Set status to IN_PROGRESS (keeps it in drawer)
            await db.run(
                `UPDATE roadblocks SET status = 'IN_PROGRESS', reported_by = ? WHERE id = ?`, 
                [`Ack by ${user}`, idStr.replace('RB-', '')]
            );
        } else {
            await db.run(
                `UPDATE field_logs SET acknowledged_by = ?, acknowledged_at = CURRENT_TIMESTAMP WHERE id = ?`, 
                [user, id]
            );
        }
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: "Failed" }); }
};

export const getLiveStats = async (req: Request, res: Response) => {
    try {
        const db = await getDb();
        const row = await db.get("SELECT report_json FROM daily_summaries ORDER BY id DESC LIMIT 1");
        let data: any = {};
        if (row && row.report_json) try { data = JSON.parse(row.report_json); } catch (e) {}

        const fieldBlockers = await db.all(`SELECT id, work_package_id, blocker_reason, user_name, timestamp, acknowledged_by FROM field_logs WHERE status = 'BLOCKED' ORDER BY id DESC LIMIT 20`);
        
        // 🚨 ROADBLOCK FIX (Live): Fetch non-resolved
        const allRoadblocks = await db.all(`
            SELECT * FROM roadblocks 
            WHERE status != 'RESOLVED' 
            ORDER BY priority = 'CRITICAL' DESC, id DESC
        `);

        // 🚨 POPUP FIX (Live): Dynamic Ack
        const virtualLogs = allRoadblocks.map(rb => ({
            id: `RB-${rb.id}`,
            work_package_id: rb.uid,
            blocker_reason: rb.description,
            user_name: rb.owner,
            timestamp: rb.timestamp,
            acknowledged_by: (rb.status !== 'OPEN') ? (rb.reported_by || 'System') : null,
            status: 'BLOCKED',
            is_roadblock: true
        }));

        const rawPartners = data.externalCompanies || [];
        const partners = Array.isArray(rawPartners) ? rawPartners.map((p: any) => ({
            name: p.name || p['Company name'] || "Partner",
            personnel: p.personnel || p['No. of worker'] || 0,
            role: p.role || p.Work || "General Scope"
        })) : [];

        res.json({
            alerts: [...virtualLogs, ...fieldBlockers],
            roadblocks: allRoadblocks, // Full list for drawer
            strategy: data.strategy || { focus: "No Data" },
            hse: parseHSE(data.hse),
            externalCompanies: partners,
            
            // ✅ LIVE LISTS
            execution: normalizeList(data.execution || data.mainActivity),
            procurement: normalizeList(data.procurement),
            readiness: normalizeList(data.readiness),
            commissioning: normalizeList(data.commissioning)
        });
    } catch (error) { res.status(500).json({ error: "Polling failed" }); }
};