import { Request, Response } from 'express';
import { saveLog, updateLogPdf, deleteLog } from '../db/database'; 
import { processAudioReport } from '../services/geminiService';
import { generateReportPDF } from '../services/pdfService';
import path from 'path';
import fs from 'fs';

interface MulterFiles { [fieldname: string]: Express.Multer.File[]; }

export const submitReport = async (req: Request, res: Response) => {
    try {
        console.log("📨 Receiving Report...");
        const files = req.files as MulterFiles;
        const body = req.body;
        const audioFile = files['audio'] ? files['audio'][0] : null;
        const photoFiles = files['photo'] || [];

        let aiData = { materials: [], blocker: null, comments: "", originalLanguage: "en" };
        
        if (audioFile) {
            if (audioFile.mimetype !== 'application/octet-stream') {
                aiData = await processAudioReport(audioFile.path, audioFile.mimetype);
            } else {
                console.log("⚠️ Skipping AI for generic/empty audio");
            }
        }

        const finalBlocker = body.blocker || aiData.blocker; 
        const finalComments = body.comments || aiData.comments;

        let photoPathEntry = null;
        if (photoFiles.length > 0) { photoPathEntry = photoFiles[0].path; }

        const reportData = {
            workPackage: body.workPackage || "UNKNOWN-WP",
            user: body.user || "Unknown User",
            taskStatus: finalBlocker ? "BLOCKED" : (body.taskStatus || "YES"), 
            materials: aiData.materials,
            comments: finalComments,
            blocker: finalBlocker,
            lang: body.lang || aiData.originalLanguage || "en",
            pdfPath: null,
            audioPath: audioFile ? audioFile.path : null,
            photoPath: photoPathEntry,
            quantity: body.quantity || "0"
        };

        const logId = await saveLog(reportData);
        if (!logId) throw new Error("Failed to save log to DB");

        try {
            const outputDir = path.join(process.cwd(), 'ACC_Sync');
            if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

            const summaryString = `AI Analysis: ${finalBlocker ? 'BLOCKER DETECTED: ' + finalBlocker : 'Progress Validated.'}`;
            const pdfFilename = await generateReportPDF(reportData, summaryString, outputDir);
            await updateLogPdf(logId, pdfFilename);
            console.log(`✅ PDF Created & Linked: ${pdfFilename}`);
        } catch (pdfError) {
            console.error("⚠️ PDF Generation failed:", pdfError);
        }

        res.json({ success: true, data: reportData });

    } catch (error) {
        console.error("❌ Submission Error:", error);
        res.status(500).send("Server Error");
    }
};

// ✅ EXPORTED DELETE FUNCTION
export const deleteReport = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        if (!id) return res.status(400).json({ error: "Invalid ID" });

        const success = await deleteLog(id);
        if (success) {
            console.log(`🗑️ Deleted Log #${id}`);
            res.json({ success: true, message: `Log #${id} deleted` });
        } else {
            res.status(404).json({ error: "Log not found" });
        }
    } catch (error) {
        console.error("❌ Delete Error:", error);
        res.status(500).send("Server Error");
    }
};
