import fs from 'fs';
import path from 'path';
import chokidar from 'chokidar';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { processPdfReport } from './geminiService';

const INBOX_DIR = path.join(process.cwd(), 'ACC_Sync/Mission_Control_Inbox');
const PROCESSED_DIR = path.join(process.cwd(), 'ACC_Sync/Mission_Control_Processed');

// Ensure directories exist
if (!fs.existsSync(INBOX_DIR)) fs.mkdirSync(INBOX_DIR, { recursive: true });
if (!fs.existsSync(PROCESSED_DIR)) fs.mkdirSync(PROCESSED_DIR, { recursive: true });

const processInboxFile = async (filePath: string) => {
    if (path.basename(filePath).startsWith('.')) return;

    try {
        const ext = path.extname(filePath).toLowerCase();
        console.log(`📨 Detected ${ext} file: ${path.basename(filePath)}`);

        let data = null;

        if (ext === '.json') {
            const rawData = fs.readFileSync(filePath, 'utf-8');
            if (rawData) data = JSON.parse(rawData);
        }
        else if (ext === '.pdf') {
            console.log("🤖 Asking Gemini to read the PDF...");
            data = await processPdfReport(filePath);
        } 
        else {
            console.log("⚠️ Unsupported file type in Inbox. Skipping.");
            return;
        }

        if (data && data.meta && (data.mainActivity || data.execution)) {
            const db = await open({
                filename: path.join(process.cwd(), 'velox_core.db'),
                driver: sqlite3.Database
            });

            await db.run(
                `INSERT INTO daily_summaries (report_date, prepared_by, report_json) VALUES (?, ?, ?)`,
                [data.meta.date, data.meta.preparedBy, JSON.stringify(data)]
            );

            console.log("✅ Mission Control Updated Successfully!");
            
            const newPath = path.join(PROCESSED_DIR, `${Date.now()}_${path.basename(filePath)}`);
            fs.renameSync(filePath, newPath);
            console.log(`📦 Archived to Processed folder.`);
        } else {
            console.error("❌ Data Extraction Failed or Invalid Format.");
        }

    } catch (error) {
        console.error("❌ Error processing file:", error);
    }
};

export const startFileWatcher = () => {
    console.log(`📥 Starting File Watcher on: ${INBOX_DIR}`);
    chokidar.watch(INBOX_DIR, { 
        ignoreInitial: true, 
        persistent: true,
        awaitWriteFinish: { stabilityThreshold: 2000, pollInterval: 100 }
    }).on('add', processInboxFile);
};