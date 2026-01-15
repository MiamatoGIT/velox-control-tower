import express from 'express';
import path from 'path';
import reportRoutes from './routes/reportRoutes';
import { initDB } from './db/database';
import { renderDashboard } from './controllers/dashboardController';

const app = express();
const PORT = 3000;

app.use(express.json());

// 1. ✅ STATIC FILES: This makes your PDF and Photos accessible to the browser
// URL: http://localhost:3000/files/MyReport.pdf
const ACC_FOLDER = path.join(process.cwd(), 'ACC_Sync');
app.use('/files', express.static(ACC_FOLDER));

// 2. ROUTES
app.use('/submit', reportRoutes);
app.get('/', renderDashboard);

// 3. START SERVER
app.listen(PORT, async () => { 
    try {
        await initDB();
        console.log(`🚀 Velox Systems Active on http://localhost:${PORT}`);
        console.log(`📂 ACC Sync Folder: ${ACC_FOLDER}`);
        console.log(`📊 LIVE DASHBOARD: http://localhost:${PORT}`);
    } catch (error) {
        console.error("❌ Failed to start Database:", error);
    }
});