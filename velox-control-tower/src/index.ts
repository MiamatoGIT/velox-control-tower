import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import chokidar from 'chokidar';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import cookieParser from 'cookie-parser'; // 👈 NEW IMPORT

// Controllers
import { renderDashboard } from './controllers/dashboardController';
import { submitReport } from './controllers/reportController'; 
import { renderMissionControl, acknowledgeBlocker, getLiveStats } from './controllers/missionControlController'; 
import { register, login, webLogin } from './controllers/authController'; // 👈 Added webLogin

// Services
import { processPdfReport } from './services/geminiService';

// Routes & DB
import reportRoutes from './routes/reportRoutes';
import { initDB, saveConsent } from './db/database';

// Views
import { renderLogin } from './views/missionControl/login'; // 👈 New View

// Middleware
import { authenticateToken } from './middleware/authMiddleware'; 
import { webAuthMiddleware } from './middleware/webAuthMiddleware'; // 👈 New Middleware

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const PUBLIC_HOST = "34.51.236.211"; 

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // 👈 ACTIVATE COOKIE PARSER
app.use('/files', express.static(path.join(process.cwd(), 'ACC_Sync')));

// --- 🔐 AUTHENTICATION ROUTES ---
const authRouter = express.Router();
authRouter.post('/register', register);
authRouter.post('/login', login);         // Mobile App (JSON)
authRouter.post('/web-login', webLogin);  // Web Dashboard (Cookie) 👈
app.use('/auth', authRouter);

// --- 🚦 ROUTES ---

// 1. Login Page (Public)
app.get('/login', (req, res) => res.send(renderLogin())); // 👈

// 2. Mission Control (PROTECTED)
// Now protected by webAuthMiddleware
app.get('/mission-control', webAuthMiddleware, renderMissionControl); // 👈 Protected

// 3. Mission Control APIs (PROTECTED)
// These are called by the scripts.ts on the dashboard
app.get('/api/live', webAuthMiddleware, getLiveStats); 
app.post('/api/ack', webAuthMiddleware, acknowledgeBlocker);

// 4. Legacy Dashboard (Public or Protected? Your choice. Leaving Public for now)
app.get('/', renderDashboard);

// 5. Mobile App Consent
app.post('/api/consent', async (req, res) => {
    try {
        await saveConsent(req.body);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: "Consent failed" }); }
});

// --- 🛡️ MOBILE REPORTING ROUTES ---
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

        if (ext === '.json') {
            const rawData = fs.readFileSync(filePath, 'utf-8');
            if (rawData) data = JSON.parse(rawData);
        }
        else if (ext === '.pdf') {
            console.log("🤖 Asking Gemini to read the PDF...");
            data = await processPdfReport(filePath);
        } 
        else {
            console.log("⚠️ Unsupported file type. Skipping.");
            return;
        }

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
    console.log(`🔐 AUTH MODE:         ENABLED (JWT + Cookies)`);
    console.log(`📥 DROP ZONE:         ${INBOX_DIR}`);
    console.log(`📊 FIELD DASHBOARD:   http://${PUBLIC_HOST}:${port}`);
    console.log(`🌌 MISSION CONTROL:   http://${PUBLIC_HOST}:${port}/mission-control`);
    console.log(`---------------------------------------------`);
});