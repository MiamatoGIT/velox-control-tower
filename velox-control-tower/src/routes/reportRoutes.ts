import { Router } from 'express';
import multer from 'multer';
import { submitReport } from '../controllers/reportController';
import path from 'path';
import fs from 'fs';

const router = Router();

// Configure Multer (Where to save temp files)
const uploadDir = path.join(process.cwd(), 'temp_uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const upload = multer({ dest: uploadDir });

// ✅ CORRECT ROUTE: Accepts both 'audio' and 'photo' files
router.post('/', upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'photo', maxCount: 1 }
]), submitReport);

export default router;