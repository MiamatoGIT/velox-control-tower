import { Router } from 'express';
import multer from 'multer';
import { submitReport } from '../controllers/reportController';
import path from 'path';
import fs from 'fs';

const router = Router();

// Configure Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Determine folder based on file type
        let folder = 'ACC_Sync'; // Default
        if (file.fieldname === 'audio') folder = 'ACC_Sync/Audio_Logs';
        if (file.fieldname === 'photo') folder = 'ACC_Sync/Site_Photos';
        
        const fullPath = path.join(process.cwd(), folder);
        fs.mkdirSync(fullPath, { recursive: true });
        cb(null, fullPath);
    },
    filename: (req, file, cb) => {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const ext = path.extname(file.originalname);
        // Add a random number to handle multiple simultaneous uploads
        const uniqueSuffix = Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}_${timestamp}_${uniqueSuffix}${ext}`);
    }
});

const upload = multer({ storage });

// ✅ UPDATED: Allow up to 5 photos
const uploadFields = upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'photo', maxCount: 5 } 
]);

router.post('/', uploadFields, submitReport);

export default router;