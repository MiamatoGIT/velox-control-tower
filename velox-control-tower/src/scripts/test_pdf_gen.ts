import fs from 'fs';
import path from 'path';
// ✅ FIX 1: Import the correct function name from your pdfService.ts
import { generateReportPDF } from '../services/pdfService'; 

const MOCK_REPORT = {
    // ✅ FIX 2: Match the fields your PDF template expects
    user: "Antonio (Simulated)", 
    workPackage: "KSB1-CTS-B1-00-DR-E-69201",
    lang: "en",
    taskStatus: "NO", // "NO" triggers the red box in your PDF logic
    quantity: "20m",
    comments: "SCAFFOLDING OBSTRUCTION. Cannot proceed with tray installation.",
    photoPath: null 
};

async function runTest() {
    console.log("🖨️  Starting PDF Generation Test...");
    
    try {
        // ✅ FIX 3: Point to the ACC_Sync folder
        const outputDir = path.join(process.cwd(), 'ACC_Sync');
        
        // Ensure folder exists
        if (!fs.existsSync(outputDir)) {
            console.log("Creating folder:", outputDir);
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // ✅ FIX 4: Pass the 3 arguments your service requires:
        // 1. Data Object
        // 2. AI Summary String (Simulated)
        // 3. Output Folder path
        const generatedFileName = await generateReportPDF(
            MOCK_REPORT, 
            "AI Summary: User reported a scaffolding block preventing installation.", 
            outputDir
        );

        console.log(`✅ Success! PDF saved to: ${path.join(outputDir, generatedFileName)}`);
    } catch (error) {
        console.error("❌ PDF Generation Failed:");
        console.error(error);
    }
}

runTest();