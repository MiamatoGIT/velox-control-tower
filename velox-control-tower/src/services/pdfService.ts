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
        const doc = new PDFDocument({ margins: { top: 50, bottom: 50, left: 50, right: 50 } });
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `DSAR_${timestamp}_${data.lang.toUpperCase()}.pdf`;
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
           .text('  |  AUTONOMOUS CONTROL TOWER');
           
        // Metadata (Small Grey Text in Header)
        doc.fontSize(9).fillColor('#94a3b8').font('Helvetica');
        doc.text(`GENERATED: ${new Date().toLocaleString()}`, 50, 75);
        doc.text(`REF: ${filename}`, 50, 90);

        doc.moveDown(4); // Move cursor out of header area

        // ================= 1. EXECUTIVE SUMMARY =================
        const startY = 140;
        doc.fillColor(TEXT_DARK).fontSize(12).font('Helvetica-Bold').text('1. EXECUTIVE SUMMARY', 50, startY);
        
        // Grey Box Container
        doc.rect(50, startY + 20, 510, 60).fillAndStroke(BOX_BG, BOX_BORDER);
        
        // Column 1: Foreman
        doc.fillColor(TEXT_LIGHT).fontSize(8).font('Helvetica-Bold').text('FOREMAN / LEAD', 70, startY + 35);
        doc.fillColor(TEXT_DARK).fontSize(11).font('Helvetica').text(data.user || "Unknown", 70, startY + 50);

        // Column 2: Zone
        doc.fillColor(TEXT_LIGHT).fontSize(8).font('Helvetica-Bold').text('ZONE / LOCATION', 240, startY + 35);
        doc.fillColor(TEXT_DARK).fontSize(11).font('Helvetica').text(data.workPackage || "N/A", 240, startY + 50);

        // Column 3: Language
        doc.fillColor(TEXT_LIGHT).fontSize(8).font('Helvetica-Bold').text('SOURCE LANGUAGE', 410, startY + 35);
        doc.fillColor(TEXT_DARK).fontSize(11).font('Helvetica').text(data.lang.toUpperCase(), 410, startY + 50);

        // ================= 2. PROGRESS VALIDATION =================
        const progressY = startY + 100;
        doc.fillColor(TEXT_DARK).fontSize(12).font('Helvetica-Bold').text('2. PROGRESS VALIDATION', 50, progressY);

        // Status Box (Green if YES, Red if NO)
        const isComplete = data.taskStatus === 'YES';
        const statusColor = isComplete ? '#dcfce7' : '#fee2e2'; // Light Green vs Light Red
        const statusText = isComplete ? '#166534' : '#991b1b'; // Dark Green vs Dark Red
        const statusBorder = isComplete ? '#22c55e' : '#ef4444';

        doc.rect(50, progressY + 20, 510, 50).fillAndStroke(statusColor, statusBorder);
        
        doc.fillColor(statusText).fontSize(16).font('Helvetica-Bold')
           .text(isComplete ? 'TASK COMPLETED' : 'TASK INCOMPLETE / BLOCKED', 
                 50, progressY + 38, { align: 'center', width: 510 });

        // ================= 3. QUANTITY LOG =================
        const qtyY = progressY + 90;
        doc.fillColor(TEXT_DARK).fontSize(12).font('Helvetica-Bold').text('3. QUANTITY LOG', 50, qtyY);

        // White Box with Border
        doc.rect(50, qtyY + 20, 510, 50).fillAndStroke('#ffffff', BOX_BORDER);
        
        // Label (Left)
        doc.fillColor(TEXT_LIGHT).fontSize(9).font('Helvetica-Bold')
           .text('REPORTED QUANTITY (RAW INPUT)', 70, qtyY + 40);
           
        // Value (Center/Right)
        doc.fillColor(TEXT_DARK).fontSize(14).font('Helvetica-Bold')
           .text(data.quantity || "0", 300, qtyY + 38);

        // ================= 4. DIGITAL TRANSCRIPT =================
        const transcriptY = qtyY + 90;
        doc.fillColor(TEXT_DARK).fontSize(12).font('Helvetica-Bold').text('4. DIGITAL TRANSCRIPT', 50, transcriptY);

        // Box 1: Original Audio
        doc.rect(50, transcriptY + 20, 245, 120).fillAndStroke(BOX_BG, BOX_BORDER);
        doc.fillColor(TEXT_LIGHT).fontSize(8).text('ORIGINAL AUDIO / COMMENTS', 65, transcriptY + 35);
        doc.fillColor(TEXT_DARK).fontSize(10).font('Helvetica-Oblique')
           .text(`"${data.comments}"`, 65, transcriptY + 55, { width: 215 });

        // Box 2: AI Translation (Simulated layout - using same text for now if no separate translation exists)
        doc.rect(315, transcriptY + 20, 245, 120).fillAndStroke('#f0fdf4', '#86efac'); // Green tinted box
        doc.fillColor('#166534').fontSize(8).font('Helvetica-Bold').text('AI ENGINE TRANSLATION (EN)', 330, transcriptY + 35);
        doc.fillColor('#14532d').fontSize(10).font('Helvetica')
           .text(`"${data.comments}"`, 330, transcriptY + 55, { width: 215 });

        // ================= PAGE 2: VISUAL EVIDENCE =================
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
            } catch (e) {
                doc.text("Image loading failed.", 60, 100);
            }
        }

        // Footer
        doc.fontSize(8).fillColor(TEXT_LIGHT).text('Velox Digital Architecture | Stargate Project 2026', 50, 750, { align: 'center', width: 510 });

        doc.end();
        stream.on('finish', () => resolve(filename));
        stream.on('error', (err) => reject(err));
    });
};