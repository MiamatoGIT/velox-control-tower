import { Request, Response } from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { DailyReportData } from '../types/dailyReport';
import { renderLayout } from '../views/missionControl/layout';

export const renderMissionControl = async (req: Request, res: Response) => {
    try {
        const db = await open({
            filename: path.join(process.cwd(), 'velox_core.db'),
            driver: sqlite3.Database
        });

        // 1. Fetch Strategic Data (PDF/JSON)
        const latestReportRow = await db.get("SELECT report_json FROM daily_summaries ORDER BY id DESC LIMIT 1");
        
        // 2. ⚡ LIVE FEED: Fetch Active Blockers from Field Ops (Last 24h)
        const liveBlockers = await db.all(`
            SELECT work_package_id, blocker_reason, user_name, timestamp 
            FROM field_logs 
            WHERE status = 'BLOCKED' 
            ORDER BY id DESC LIMIT 5
        `);

        let data: DailyReportData | null = null;
        if (latestReportRow) {
            data = JSON.parse(latestReportRow.report_json);
        } else {
            // Fallback if no PDF uploaded yet
            data = {
                meta: { project: "WAITING FOR DATA", date: "-", preparedBy: "-" },
                strategy: { focus: "System Standby" },
                hse: { incidents: "0", inspections: "0" },
                mainActivity: { description: "No Active Work", targetPercent: 0, actualPercent: 0, status: "Idle" },
                procurement: [], readiness: [], commissioning: { description: "-", targetPercent: 0, actualPercent: 0, status: "-" }
            };
        }

        // 3. Inject Live Blockers into the Data Object
        // We attach this new "liveAlerts" array to the data passed to the view
        const augmentedData = {
            ...data,
            liveAlerts: liveBlockers
        };
        
        const html = renderLayout(augmentedData);
        res.send(html);

    } catch (error) {
        console.error("Mission Control Error:", error);
        res.status(500).send("System Offline");
    }
};