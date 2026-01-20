import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import chokidar from 'chokidar';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Controllers
import { renderDashboard } from './controllers/dashboardController';
import { submitReport } from './controllers/reportController'; 
import { renderMissionControl } from './controllers/missionControlController'; 
import { register, login } from './controllers/authController'; // ✅ NEW: Auth Controller

// Services
import { processPdfReport } from './services/geminiService';

// Routes
import reportRoutes from './routes/reportRoutes';
import { initDB, saveConsent } from './db/database';

// Middleware
import { authenticateToken } from './middleware/authMiddleware'; // ✅ NEW: Middleware

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const PUBLIC_HOST = "34.51.236.211"; 

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/files', express.static(path.join(process.cwd(), 'ACC_Sync')));

// --- 🔐 AUTHENTICATION ROUTES ---
const authRouter = express.Router();
authRouter.post('/register', register);
authRouter.post('/login', login);
app.use('/auth', authRouter);

// --- 🚦 PUBLIC ROUTES ---
app.get('/', renderDashboard);
app.get('/mission-control', renderMissionControl);

app.post('/api/consent', async (req, res) => {
    try {
        await saveConsent(req.body);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: "Consent failed" }); }
});

// --- 🛡️ PROTECTED ROUTES ---
// We wrap reportRoutes with authenticateToken. 
// The mobile app must now send "Authorization: Bearer <token>"
app.use('/submit', authenticateToken, reportRoutes);


// --- 📂 SMART DROP ZONE LOGIC (UNCHANGED) ---
const INBOX_DIR = path.join(process.cwd(), 'ACC_Sync/Mission_Control_Inbox');
const PROCESSED_DIR = path.join(process.cwd(), 'ACC_Sync/Mission_Control_Processed');

const processInboxFile = async (filePath: string) => {
    if (path.basename(filePath).startsWith('.')) return;

    try {
        const ext = path.extname(filePath).toLowerCase();
        console.log(`📨 Detected ${ext} file: ${path.basename(filePath)}`);

        let data = null;

        // --- STRATEGY A: It's a JSON file (Direct Upload) ---
        if (ext === '.json') {
            const rawData = fs.readFileSync(filePath, 'utf-8');
            if (rawData) data = JSON.parse(rawData);
        }
        // --- STRATEGY B: It's a PDF (AI Extraction) ---
        else if (ext === '.pdf') {
            console.log("🤖 Asking Gemini to read the PDF...");
            data = await processPdfReport(filePath);
        } 
        else {
            console.log("⚠️ Unsupported file type. Skipping.");
            return;
        }

        // --- SAVE TO DATABASE ---
        if (data && data.meta && data.mainActivity) {
            const db = await open({
                filename: path.join(process.cwd(), 'velox_core.db'),
                driver: sqlite3.Database
            });

            await db.run(
                `INSERT INTO daily_summaries (report_date, prepared_by, report_json) VALUES (?, ?, ?)`,
                [data.meta.date, data.meta.preparedBy, JSON.stringify(data)]
            );

            console.log("✅ Mission Control Updated Successfully!");
            
            // Move to Processed
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

// Start Watcher
chokidar.watch(INBOX_DIR, { 
    ignoreInitial: true, 
    persistent: true,
    awaitWriteFinish: { stabilityThreshold: 2000, pollInterval: 100 }
}).on('add', processInboxFile);

// Start Server
app.listen(port, async () => {
    await initDB();
    console.log(`🚀 VELOX CORE ONLINE`);
    console.log(`---------------------------------------------`);
    console.log(`🔐 AUTH MODE:         ENABLED (JWT)`);
    console.log(`📥 DROP ZONE:         ${INBOX_DIR}`);
    console.log(`📊 FIELD DASHBOARD:   http://${PUBLIC_HOST}:${port}`);
    console.log(`🌌 MISSION CONTROL:   http://${PUBLIC_HOST}:${port}/mission-control`);
    console.log(`---------------------------------------------`);
});