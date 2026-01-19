import { Request, Response } from 'express';
import { saveLog } from '../db/database';
import { processAudioReport } from '../services/geminiService';

interface MulterFiles { [fieldname: string]: Express.Multer.File[]; }

export const submitReport = async (req: Request, res: Response) => {
    try {
        console.log("📨 Receiving Report...");
        const files = req.files as MulterFiles;
        const body = req.body; // ✅ Capture text fields (user, workPackage, blocker, etc.)
        const audioFile = files['audio'] ? files['audio'][0] : null;
        const photoFiles = files['photo'] || [];

        // 1. AI PROCESSING (Try to extract data, but don't crash if it fails)
        let aiData = { materials: [], blocker: null, comments: "", originalLanguage: "en" };
        
        if (audioFile) {
            // Only send to AI if it looks like a real audio file
            if (audioFile.mimetype !== 'application/octet-stream') {
                aiData = await processAudioReport(audioFile.path, audioFile.mimetype);
            } else {
                console.log("⚠️ Skipping AI for generic/empty audio (Test Mode detected)");
            }
        }

        // 2. MERGE DATA (Manual Input overrides AI)
        // This allows your CURL command to work even if AI fails!
        const finalBlocker = body.blocker || aiData.blocker; 
        const finalComments = body.comments || aiData.comments;

        console.log(`🛑 Final Blocker Status: ${finalBlocker ? finalBlocker : 'None'}`);

        // Handle Photos
        let photoPathEntry = null;
        if (photoFiles.length > 0) { photoPathEntry = JSON.stringify(photoFiles.map(f => f.path)); }

        const reportData = {
            workPackage: body.workPackage || "UNKNOWN-WP",
            user: body.user || "Unknown User",
            // If we have a blocker, force status to BLOCKED
            taskStatus: finalBlocker ? "BLOCKED" : (body.taskStatus || "YES"), 
            materials: aiData.materials, // Keep AI materials
            comments: finalComments,
            blocker: finalBlocker,       // ✅ USES YOUR CURL INPUT
            lang: aiData.originalLanguage,
            pdfPath: null,
            audioPath: audioFile ? audioFile.path : null,
            photoPath: photoPathEntry
        };

        await saveLog(reportData);
        res.json({ success: true, data: reportData });

    } catch (error) {
        console.error("❌ Submission Error:", error);
        res.status(500).send("Server Error");
    }
};