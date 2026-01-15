import { Request, Response } from 'express';
import { generateReportPDF } from '../services/pdfService';
import { processAudioReport } from '../services/geminiService';
import { saveLog, getStats } from '../db/database';
import path from 'path';
import fs from 'fs';

const ROOT_DIR = process.cwd();
const ACC_FOLDER = path.join(ROOT_DIR, 'ACC_Sync');
const PHOTOS_FOLDER = path.join(ACC_FOLDER, 'Site_Photos');

// Ensure folders exist
if (!fs.existsSync(ACC_FOLDER)) fs.mkdirSync(ACC_FOLDER);
if (!fs.existsSync(PHOTOS_FOLDER)) fs.mkdirSync(PHOTOS_FOLDER);

export const submitReport = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log("--- 📨 INCOMING REPORT ---");

        // 1. CAPTURE FILES
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const audioFile = files?.['audio']?.[0];
        const tempPhoto = files?.['photo']?.[0];

        // 2. PROCESS PHOTO (Move from Temp -> Permanent Folder)
        let finalPhotoPath = null;
        if (tempPhoto) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            // Clean the username to be filename-safe
            const safeUser = (req.body.user || "User").replace(/[^a-zA-Z0-9]/g, '');
            const newFilename = `IMG_${timestamp}_${safeUser}.jpg`;
            
            finalPhotoPath = path.join(PHOTOS_FOLDER, newFilename);
            
            // Move file
            fs.renameSync(tempPhoto.path, finalPhotoPath);
            console.log("📸 Photo Secured:", newFilename);
        }

        // 3. INITIALIZE DATA OBJECT
        let reportData = {
            taskStatus: req.body.taskStatus || "UNKNOWN",
            // We use a temporary string for quantity, will be overwritten by AI or Manual logic
            quantity: req.body.manualQty || req.body.quantity || "N/A",
            comments: req.body.manualComments || req.body.comments || "No comments",
            lang: req.body.lang || "en",
            workPackage: req.body.workPackage || "UNKNOWN_WP",
            user: req.body.user || "Unknown User",
            audioPath: audioFile ? audioFile.path : null,
            photoPath: finalPhotoPath, // ✅ Linked to the permanent file
            materials: [] as any[] // ✅ Initialize empty array for structured items
        };

        // 4. AI PROCESSING
        if (audioFile) {
            console.log("🎧 Processing Audio...");
            try {
                const aiData = await processAudioReport(audioFile.path, audioFile.mimetype);
                console.log("🧠 Brain Result:", aiData);

                // ✅ CAPTURE STRUCTURED MATERIALS LIST
                if (aiData.materials && Array.isArray(aiData.materials) && aiData.materials.length > 0) {
                    reportData.materials = aiData.materials;
                    
                    // Create a summary string for the PDF "Quantity" box
                    const summary = aiData.materials.map((m: any) => `${m.quantity} ${m.unit} ${m.name}`).join(', ');
                    reportData.quantity = summary; 
                } else {
                    // Fallback if AI didn't find materials but audio exists
                    // We parse the manual input just in case
                    const qtyString = req.body.manualQty || "";
                    if (qtyString) {
                         const match = qtyString.match(/(\d+(\.\d+)?)/);
                         const val = match ? parseFloat(match[0]) : 0;
                         const unit = qtyString.replace(/[0-9.]/g, '').trim() || "Unit";
                         reportData.materials = [{ name: "Manual Input", quantity: val, unit: unit }];
                    }
                }

                if (aiData.comments && aiData.comments !== "AI Processing Failed") {
                    reportData.comments = aiData.comments;
                }
                if (aiData.originalLanguage && aiData.originalLanguage !== "Unknown") {
                    reportData.lang = aiData.originalLanguage;
                }

            } catch (e) { 
                console.error("AI Error:", e); 
            }
        } else {
            // 🛑 MANUAL FALLBACK (No Audio)
            // If the user typed "50 Meters" manually, we treat it as one material item
            const qtyString = req.body.manualQty || "";
            const match = qtyString.match(/(\d+(\.\d+)?)/);
            const val = match ? parseFloat(match[0]) : 0;
            const unit = qtyString.replace(/[0-9.]/g, '').trim() || "Unit";
            
            reportData.materials = [{ name: "Manual Input", quantity: val, unit: unit }];
        }

        // 5. GENERATE PDF
        const filename = await generateReportPDF(reportData, reportData.comments, ACC_FOLDER);
        const pdfPath = path.join(ACC_FOLDER, filename);

        // 6. SAVE TO DATABASE
        // The saveLog function in database.ts will handle JSON.stringify for reportData.materials
        await saveLog({
            ...reportData,
            pdfPath: pdfPath
        });

        // 7. GET LIVE STATS
        const stats = await getStats();
        console.log(`📊 STATS: ${stats?.total_installed || 0} Units / ${stats?.total_reports || 0} Reports`);

        res.json({ status: 'success', file: filename, data: reportData });

    } catch (error) {
        console.error("Error processing report:", error);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
};