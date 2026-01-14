import { Request, Response } from 'express';
import { translate } from 'google-translate-api-x';
import { generateReportPDF } from '../services/pdfService';
import path from 'path';
import fs from 'fs';

// Helper to find root dir
const ROOT_DIR = process.cwd();
const ACC_FOLDER = path.join(ROOT_DIR, 'ACC_Sync');

// Ensure folder exists
if (!fs.existsSync(ACC_FOLDER)) {
  fs.mkdirSync(ACC_FOLDER);
}

export const submitReport = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body;
        console.log("--- 📨 INCOMING REPORT ---");
        
        // 1. Translation Service Logic
        let translatedText = "No comments recorded.";
        
        if (data.comments && data.comments.length > 1) {
            try {
                const langMap: Record<string, string> = { 'en': 'en', 'no': 'no', 'pl': 'pl', 'pt': 'pt', 'fr': 'fr', 'es': 'es' };
                const sourceLang = langMap[data.lang] || 'auto';

                if (sourceLang === 'en') {
                    translatedText = data.comments;
                } else {
                    const result = await translate(data.comments, {from: sourceLang, to: 'en'});
                    translatedText = typeof result === 'object' ? (result as any).text : result; 
                }
            } catch (err) {
                console.error("Translation Failed:", err);
                translatedText = "Translation Unavailable";
            }
        }

        // 2. Call PDF Service
        const filename = await generateReportPDF(data, translatedText, ACC_FOLDER);
        
        console.log(`✅ SUCCESS: Created ${filename}`);
        res.json({ status: 'success', file: filename, translated: translatedText });

    } catch (error) {
        console.error("Error processing report:", error);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
};