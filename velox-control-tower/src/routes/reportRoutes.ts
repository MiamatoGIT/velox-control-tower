import { Router } from 'express';
import { submitReport } from '../controllers/reportController';

const router = Router();

// When someone posts to /, use the submitReport controller
router.post('/', submitReport);

export default router;