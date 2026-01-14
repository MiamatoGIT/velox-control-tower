import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export const generateReportPDF = (data: any, translatedText: string, accFolder: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `DSAR_${timestamp}_${(data.lang || 'EN').toUpperCase()}.pdf`;
        const filePath = path.join(accFolder, filename);

        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);

        // --- COLORS & FONTS ---
        const colorPrimary = '#10b981'; // Velox Green
        const colorDark = '#1e293b';    // Slate Dark
        const colorGray = '#64748b';    // Slate Gray
        const colorLight = '#f1f5f9';   // Light Gray background

        // --- HEADER ---
        doc.rect(0, 0, 612, 120).fill(colorDark); 
        
        doc.fillColor(colorPrimary)
           .fontSize(20)
           .font('Helvetica-Bold')
           .text('VELOX', 50, 45);
           
        doc.fillColor('white')
           .fontSize(20)
           .font('Helvetica') 
           .text(' | AUTONOMOUS CONTROL TOWER', 125, 45);

        doc.fontSize(10)
           .fillColor('#94a3b8')
           .text(`GENERATED: ${new Date().toLocaleString()}`, 50, 75);

        doc.text(`REF: ${filename}`, 50, 90);

        // --- SECTION 1: EXECUTIVE SUMMARY ---
        let yPos = 160;
        doc.fillColor('black').fontSize(14).font('Helvetica-Bold').text('1. EXECUTIVE SUMMARY', 50, yPos);
        yPos += 25;

        doc.rect(50, yPos, 510, 70).fill(colorLight);
        doc.strokeColor('#e2e8f0').lineWidth(1).rect(50, yPos, 510, 70).stroke();

        // Foreman
        doc.fillColor(colorGray).fontSize(8).font('Helvetica-Bold').text('FOREMAN / LEAD', 70, yPos + 15);
        doc.fillColor(colorDark).fontSize(12).font('Helvetica').text('Velox Supervisor', 70, yPos + 35);

        // Zone
        doc.fillColor(colorGray).fontSize(8).font('Helvetica-Bold').text('ZONE / LOCATION', 220, yPos + 15);
        doc.fillColor(colorDark).fontSize(12).text('Zone B (Server Hall)', 220, yPos + 35);

        // Lang
        doc.fillColor(colorGray).fontSize(8).font('Helvetica-Bold').text('SOURCE LANGUAGE', 370, yPos + 15);
        doc.fillColor(colorDark).fontSize(12).text((data.lang || 'EN').toUpperCase(), 370, yPos + 35);

        yPos += 100;

        // --- SECTION 2: STATUS ---
        doc.fillColor('black').fontSize(14).font('Helvetica-Bold').text('2. PROGRESS VALIDATION', 50, yPos);
        yPos += 25;

        const isYes = data.taskStatus === 'YES';
        const statusColor = isYes ? '#dcfce7' : '#fee2e2'; 
        const statusBorder = isYes ? '#16a34a' : '#dc2626';
        const statusText = isYes ? '#15803d' : '#991b1b'; 

        doc.rect(50, yPos, 510, 60).fillAndStroke(statusColor, statusBorder);
        doc.fillColor(statusText).fontSize(16).font('Helvetica-Bold')
           .text(isYes ? 'TASK COMPLETED' : 'TASK INCOMPLETE / ISSUE FOUND', 50, yPos + 22, { align: 'center', width: 510 });

        yPos += 90;

        // --- SECTION 3: QUANTITY ---
        doc.fillColor('black').fontSize(14).text('3. QUANTITY LOG', 50, yPos);
        yPos += 25;

        doc.rect(50, yPos, 510, 50).fillAndStroke('white', '#cbd5e1');
        doc.fillColor(colorGray).fontSize(10).text('REPORTED QUANTITY (RAW INPUT)', 70, yPos + 18);
        doc.fillColor('black').fontSize(12).font('Helvetica-Bold').text(data.quantity || "N/A", 300, yPos + 18);

        yPos += 80;

        // --- SECTION 4: TRANSCRIPT ---
        doc.fillColor('black').fontSize(14).text('4. DIGITAL TRANSCRIPT', 50, yPos);
        yPos += 25;

        const originalText = data.comments || "No audio input provided.";

        // Original Box
        doc.rect(50, yPos, 245, 150).fillAndStroke('#f8fafc', '#e2e8f0');
        doc.fillColor(colorGray).fontSize(8).text(`ORIGINAL AUDIO (${(data.lang || 'EN').toUpperCase()})`, 65, yPos + 15);
        doc.fillColor('#334155').fontSize(10).font('Helvetica-Oblique')
           .text(`"${originalText}"`, 65, yPos + 35, { width: 215 });

        // Translated Box
        doc.rect(315, yPos, 245, 150).fillAndStroke('#f0fdf4', '#10b981'); 
        doc.fillColor('#059669').fontSize(8).font('Helvetica-Bold').text('AI ENGINE TRANSLATION (EN)', 330, yPos + 15);
        doc.fillColor('black').fontSize(10).font('Helvetica')
           .text(`"${translatedText}"`, 330, yPos + 35, { width: 215 });

        // Footer
        doc.fontSize(8).fillColor('#94a3b8').text('Velox Digital Architecture | Stargate Project 2026', 50, 720, { align: 'center', width: 512 });

        doc.end();

        writeStream.on('finish', () => resolve(filename));
        writeStream.on('error', (err) => reject(err));
    });
};