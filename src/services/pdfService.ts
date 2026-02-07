import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const VELOX_GREEN = '#00ff9d';
const VELOX_DARK = '#0f172a';
const BOX_BG = '#f8fafc';
const BOX_BORDER = '#cbd5e1';
const TEXT_DARK = '#334155';
const TEXT_LIGHT = '#94a3b8';

export const generateReportPDF = (data: any, aiSummary: string, outputFolder: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margins: { top: 50, bottom: 50, left: 50, right: 50 } });
            
            // ✅ SAFETY FIX: Handle missing language safely
            const safeLang = (data.lang || data.originalLanguage || 'EN').toUpperCase();
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `DSAR_${timestamp}_${safeLang}.pdf`;
            const filePath = path.join(outputFolder, filename);

            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            // ================= HEADER =================
            // Dark Strip Background
            doc.rect(0, 0, 612, 120).fill(VELOX_DARK);
            
            // "VELOX" (Green)
            doc.fontSize(24).font('Helvetica-Bold').fillColor(VELOX_GREEN)
               .text('VELOX', 50, 40, { continued: true });
            
            // " | AUTONOMOUS CONTROL TOWER" (White)
            doc.fillColor('#ffffff').font('Helvetica')
               .text(' | AUTONOMOUS CONTROL TOWER', { fontSize: 14 });

            // Meta Info (Right Aligned)
            doc.fontSize(10).font('Helvetica').fillColor('#94a3b8')
               .text(`DATE: ${new Date().toLocaleDateString()}`, 400, 45, { align: 'right' })
               .text(`REF: ${timestamp.substring(0, 15)}`, 400, 60, { align: 'right' });

            // ================= SECTION 1: REPORT DATA =================
            let yPos = 140;
            
            // Draw Box
            doc.rect(50, yPos, 510, 100).fill(BOX_BG).stroke(BOX_BORDER);
            
            // User & WP Info
            doc.fillColor(TEXT_DARK).fontSize(10).font('Helvetica-Bold')
               .text('USER:', 70, yPos + 20)
               .text('WORK PACKAGE:', 250, yPos + 20)
               .text('STATUS:', 420, yPos + 20);

            doc.font('Helvetica').fillColor(TEXT_LIGHT)
               .text((data.user || "Unknown").toUpperCase(), 70, yPos + 35)
               .text((data.workPackage || "N/A").toUpperCase(), 250, yPos + 35)
               .text((data.taskStatus || "PENDING").toUpperCase(), 420, yPos + 35);

            // Quantity
            doc.font('Helvetica-Bold').fillColor(TEXT_DARK)
               .text('REPORTED PROGRESS:', 70, yPos + 60);
            
            doc.font('Helvetica').fillColor(VELOX_DARK).fontSize(14)
               .text(`${data.quantity || 0} UNITS`, 70, yPos + 75);

            // ================= SECTION 2: AI TRANSCRIPT =================
            yPos += 120;
            
            doc.fontSize(12).fillColor(VELOX_DARK).font('Helvetica-Bold').text('2. VOICE TRANSCRIPT (AI PROCESSED)', 50, yPos);
            yPos += 20;

            // Draw Transcript Box
            doc.rect(50, yPos, 510, 80).stroke(BOX_BORDER);
            doc.fontSize(10).font('Helvetica-Oblique').fillColor(TEXT_DARK)
               .text(`"${data.comments || 'No audio transcript available.'}"`, 60, yPos + 15, { width: 490 });

            // ================= SECTION 3: AI ANALYSIS =================
            yPos += 100;
            
            // AI Box (Green or Amber based on blocker)
            const isBlocker = aiSummary.includes('BLOCKER');
            const boxColor = isBlocker ? '#fef2f2' : '#f0fdf4'; // Red-ish or Green-ish
            const borderColor = isBlocker ? '#fca5a5' : '#86efac';
            const titleColor = isBlocker ? '#b91c1c' : '#166534';

            doc.rect(50, yPos, 510, 60).fillAndStroke(boxColor, borderColor);
            
            doc.fillColor(titleColor).fontSize(10).font('Helvetica-Bold')
               .text('AI ENGINE ANALYSIS', 70, yPos + 15);
            
            doc.fillColor(TEXT_DARK).font('Helvetica')
               .text(aiSummary, 70, yPos + 30, { width: 470 });

            // ================= SECTION 4: VISUAL EVIDENCE =================
            if (data.photoPath && fs.existsSync(data.photoPath)) {
                doc.addPage();
                
                // Header for Page 2
                doc.rect(0, 0, 612, 60).fill(VELOX_DARK);
                doc.fontSize(14).fillColor(VELOX_GREEN).font('Helvetica-Bold').text('5. VISUAL EVIDENCE', 50, 25);
                
                // Draw Photo Frame
                doc.rect(50, 80, 510, 400).stroke(BOX_BORDER);
                
                try {
                    doc.image(data.photoPath, 55, 85, { fit: [500, 390], align: 'center' });
                    doc.fontSize(10).fillColor(TEXT_LIGHT).text(`Source File: ${path.basename(data.photoPath)}`, 50, 490, { align: 'center' });
                } catch (imgErr) {
                    doc.text("Error loading image.", 100, 200);
                }
            }

            // Finalize
            doc.end();

            stream.on('finish', () => resolve(filename));
            stream.on('error', (err) => reject(err));

        } catch (error) {
            console.error("PDF Kit Error:", error);
            reject(error);
        }
    });
};