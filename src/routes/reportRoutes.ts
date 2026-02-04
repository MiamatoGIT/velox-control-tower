import { Router } from 'express';
import multer from 'multer';
import { submitReport, deleteReport } from '../controllers/reportController';
import path from 'path';
import fs from 'fs';

const router = Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder = 'ACC_Sync'; 
        if (file.fieldname === 'audio') folder = 'ACC_Sync/Audio_Logs';
        if (file.fieldname === 'photo') folder = 'ACC_Sync/Site_Photos';
        
        const fullPath = path.join(process.cwd(), folder);
        fs.mkdirSync(fullPath, { recursive: true });
        cb(null, fullPath);
    },
    filename: (req, file, cb) => {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const ext = path.extname(file.originalname);
        const uniqueSuffix = Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}_${timestamp}_${uniqueSuffix}${ext}`);
    }
});

const upload = multer({ storage });

const uploadFields = upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'photo', maxCount: 5 } 
]);

router.post('/', uploadFields, submitReport);
router.delete('/logs/:id', deleteReport);

export default router;
