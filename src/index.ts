import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';
import multer from 'multer';

// Controllers
import { renderDashboard } from './controllers/dashboardController';
import { renderMissionControl, acknowledgeBlocker, getLiveStats } from './controllers/missionControlController'; 
import { register, login, webLogin } from './controllers/authController'; 
import { uploadBudget, uploadWP } from './controllers/ingestionController';

// Services
import { startFileWatcher } from './services/fileWatcher'; // 👈 IMPORTED

// Routes & DB
import reportRoutes from './routes/reportRoutes';
import { initDB, saveConsent } from './db/database';

// Views
import { renderLogin } from './views/missionControl/login'; 

// Middleware
import { authenticateToken } from './middleware/authMiddleware'; 
import { webAuthMiddleware } from './middleware/webAuthMiddleware'; 

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const PUBLIC_HOST = "34.51.236.211"; 

const upload = multer({ dest: 'temp_uploads/' }); 

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/files', express.static(path.join(process.cwd(), 'ACC_Sync')));

// --- AUTH ---
const authRouter = express.Router();
authRouter.post('/register', register);
authRouter.post('/login', login);         
authRouter.post('/web-login', webLogin);  
app.use('/auth', authRouter);

// --- ROUTES ---
app.get('/login', (req, res) => res.send(renderLogin()));
app.get('/mission-control', webAuthMiddleware, renderMissionControl);
app.get('/api/live', webAuthMiddleware, getLiveStats); 
app.post('/api/ack', webAuthMiddleware, acknowledgeBlocker);
app.get('/', renderDashboard);
app.get('/api/stats/live', webAuthMiddleware, getLiveStats);
app.post('/api/logs/acknowledge', webAuthMiddleware, acknowledgeBlocker);

// --- MOBILE APP ---
app.post('/api/consent', async (req, res) => {
    try { await saveConsent(req.body); res.json({ success: true }); } 
    catch (e) { res.status(500).json({ error: "Consent failed" }); }
});
app.use('/submit', authenticateToken, reportRoutes);

// --- INGESTION ---
app.post('/ingest/budget', upload.single('file'), uploadBudget);
app.post('/ingest/wp', upload.single('file'), uploadWP);

// --- START SERVER ---
app.listen(port, async () => {
    await initDB();
    startFileWatcher(); // 👈 START WATCHER
    console.log(`🚀 VELOX CORE ONLINE`);
    console.log(`---------------------------------------------`);
    console.log(`🔐 AUTH MODE:         ENABLED (JWT + Cookies)`);
    console.log(`📊 FIELD DASHBOARD:   http://${PUBLIC_HOST}:${port}`);
    console.log(`🌌 MISSION CONTROL:   http://${PUBLIC_HOST}:${port}/mission-control`);
    console.log(`---------------------------------------------`);
});