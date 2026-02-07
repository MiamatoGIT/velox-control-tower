import { Request, Response } from 'express';
import { saveLog, updateLogPdf, deleteLog } from '../db/database'; 
import { processAudioReport } from '../services/geminiService';
import { generateReportPDF } from '../services/pdfService';
import path from 'path';
import fs from 'fs';

// Database imports for Roadblocks
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

interface MulterFiles { [fieldname: string]: Express.Multer.File[]; }

export const submitReport = async (req: Request, res: Response) => {
    try {
        console.log("📨 Receiving Report...");
        const files = req.files as MulterFiles;
        const body = req.body;
        const audioFile = files['audio'] ? files['audio'][0] : null;
        const photoFiles = files['photo'] || [];

        // Default AI Data structure
        let aiData: any = { materials: [], roadblocks: [], blocker: null, comments: "", originalLanguage: "en" };
        
        // 1. PROCESS AUDIO WITH GEMINI
        if (audioFile) {
            if (audioFile.mimetype !== 'application/octet-stream') {
                aiData = await processAudioReport(audioFile.path, audioFile.mimetype);
            } else {
                console.log("⚠️ Skipping AI for generic/empty audio");
            }
        }

        // 2. 🚧 SAVE ROADBLOCKS TO NEW TABLE
        if (aiData.roadblocks && Array.isArray(aiData.roadblocks) && aiData.roadblocks.length > 0) {
            console.log(`🚨 Saving ${aiData.roadblocks.length} Roadblocks...`);
            
            try {
                const db = await open({
                    filename: path.join(process.cwd(), 'velox_core.db'),
                    driver: sqlite3.Database
                });

                const reporter = body.user || "Unknown User";

                for (const rb of aiData.roadblocks) {
                    await db.run(`
                        INSERT INTO roadblocks (
                            uid, type, status, priority, description, 
                            action_required, area, owner, reported_by, due_date
                        ) VALUES (
                            'RB-' || hex(randomblob(2)), 
                            ?, 'OPEN', ?, ?, 
                            ?, ?, ?, ?, date('now', '+7 days')
                        )
                    `, [
                        rb.type || 'FIELD',         
                        rb.priority || 'MEDIUM',    
                        rb.description,
                        rb.action_required || 'Assess on site',
                        rb.area || 'General Site',
                        rb.owner || 'Site Team',
                        reporter
                    ]);
                }
            } catch (dbError) {
                console.error("❌ Failed to save roadblocks:", dbError);
            }
        }

        // 🚨 2.5 LEGACY BRIDGE: Map new "Roadblocks" to old "Blocker" field
        // This ensures the report turns RED in the main list
        let calculatedBlocker = body.blocker || aiData.blocker;
        
        if (!calculatedBlocker && aiData.roadblocks && aiData.roadblocks.length > 0) {
            // Take the description of the first roadblock found
            calculatedBlocker = aiData.roadblocks[0].description;
            console.log(`🔗 Linking Roadblock to Field Log: "${calculatedBlocker}"`);
        }

        // 🚨 CRITICAL FIX: FORCE STATUS TO 'BLOCKED' IF BLOCKER EXISTS
        // This guarantees the Dashboard Popup will trigger
        let finalStatus = body.taskStatus || "PENDING";
        if (calculatedBlocker) {
            console.log("🛑 FORCE OVERRIDE: Status set to BLOCKED due to issue detection.");
            finalStatus = 'BLOCKED';
        }

        const finalComments = body.comments || aiData.comments;

        let photoPathEntry = null;
        if (photoFiles.length > 0) { photoPathEntry = photoFiles[0].path; }

        const reportData = {
            workPackage: body.workPackage || "UNKNOWN-WP",
            user: body.user || "Unknown User",
            taskStatus: finalStatus,    // <--- Using the forced status here
            blocker: calculatedBlocker, // <--- Using the detected blocker here
            comments: finalComments,
            quantity: body.quantity ? body.quantity.toString() : "0",
            timestamp: new Date().toISOString(),
            photoPath: photoPathEntry
        };

        const logId = await saveLog(reportData);
        if (!logId) throw new Error("Failed to save log to DB");

        // 4. GENERATE PDF
        try {
            const outputDir = path.join(process.cwd(), 'ACC_Sync');
            if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

            const summaryString = `AI Analysis: ${calculatedBlocker ? 'BLOCKER DETECTED: ' + calculatedBlocker : 'Progress Validated.'}`;
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
        console.error("Delete Error:", error);
        res.status(500).json({ error: "Server error" });
    }
};