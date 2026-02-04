import { Request, Response } from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { DailyReportData } from '../types/dailyReport';

export const uploadDailyReport = async (req: Request, res: Response) => {
    try {
        console.log("📥 Receiving Daily Report...");
        const data: DailyReportData = req.body;

        // Basic validation to ensure it's the right shape
        if (!data.meta || !data.mainActivity) {
             res.status(400).json({ success: false, error: "Invalid report format" });
             return;
        }

        const db = await open({
            filename: path.join(process.cwd(), 'velox_core.db'),
            driver: sqlite3.Database
        });

        await db.run(
            `INSERT INTO daily_summaries (report_date, prepared_by, report_json) VALUES (?, ?, ?)`,
            [data.meta.date, data.meta.preparedBy, JSON.stringify(data)]
        );

        console.log("✅ Daily Report Saved!");
        res.json({ success: true, message: "Report accepted" });

    } catch (error) {
        console.error("❌ Report Upload Error:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
};