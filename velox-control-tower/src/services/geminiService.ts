import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import fs from 'fs';
import { getMaterialContext } from './materialKnowledge';

dotenv.config();

const MODEL_NAME = "gemini-robotics-er-1.5-preview"; 
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) { console.error("❌ GEMINI_API_KEY is missing"); process.exit(1); }

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

// ============================================================
// 1. AUDIO PROCESSOR
// ============================================================
export const processAudioReport = async (filePath: string, mimeType: string): Promise<any> => {
    try {
        console.log(`📤 Sending audio to Gemini...`);
        const fileBuffer = fs.readFileSync(filePath);
        const base64Audio = fileBuffer.toString('base64');
        const materialContext = getMaterialContext();

        // ✅ Use Helper Function for the "Brain"
        const prompt = getAudioPrompt(materialContext);

        const result = await model.generateContent([
            prompt, 
            { inlineData: { data: base64Audio, mimeType: mimeType } }
        ]);

        return cleanAndParseJson(result.response.text());

    } catch (error) {
        console.error("❌ Gemini Audio Error:", error);
        return { materials: [], comments: "Processing Failed", originalLanguage: "Unknown" };
    }
};

// ============================================================
// 2. PDF PROCESSOR
// ============================================================
export const processPdfReport = async (filePath: string): Promise<any> => {
    try {
        console.log(`📄 Reading PDF...`);
        const fileBuffer = fs.readFileSync(filePath);
        const base64Pdf = fileBuffer.toString('base64');

        // ✅ Use Helper Function for the "Brain"
        const prompt = getPdfPrompt();

        const result = await model.generateContent([
            prompt, 
            { inlineData: { data: base64Pdf, mimeType: "application/pdf" } }
        ]);

        return cleanAndParseJson(result.response.text());

    } catch (error) {
        console.error("❌ Gemini PDF Error:", error);
        return null;
    }
};

// ============================================================
// 🧠 BRAIN DEFINITIONS (PROMPTS)
// ============================================================

function getAudioPrompt(context: string): string {
    return `
    You are a Construction Supervisor AI. You are listening to a Foreman's report from a NOISY site.
    
    **CONTEXT:**
    ${context}

    **NOISE CONTROL:**
    - Focus ONLY on the human voice. 
    - IGNORE drills, trucks, wind, and background shouting.

    **YOUR GOAL:**
    Analyze the work reported. It is NOT just a shopping list. 
    They might be "Pulling Cable", "Installing", "Preparing", "Measuring", or "Testing".
    
    **EXTRACT THESE 3 THINGS:**
    1. **MATERIALS INSTALLED:** What was actually used/consumed? (e.g., "Installed 50m tray").
    2. **ACTIVITY TYPE:** What were they doing? (e.g., "Preparation", "Installation", "QC Check").
    3. **BLOCKER / REASON:** Did they stop? Why? (e.g., "Missing Bolts", "No Access", "Rain").
       - If there is a blocker, extract a SHORT reason (2-5 words) for the database.

    **OUTPUT FORMAT (JSON ONLY):**
    {
        "materials": [
            { "name": "Standardized Name", "category": "Category", "quantity": 10, "unit": "m", "status": "INSTALLED" }
        ],
        "blocker": "Missing M12 Bolts",  <-- Return NULL if no blocker
        "comments": "Start with 'ACTIVITY: [Type]'. Then summarize the report.",
        "originalLanguage": "Portuguese"
    }
    `;
}

function getPdfPrompt(): string {
    return `
    You are a Project Controls Manager. Extract data from this Daily Progress Report PDF.
    
    **MAPPING INSTRUCTIONS:**
    1. **Meta:** Project Name, Date, Prepared By.
    2. **Strategy:** Executive Strategy focus.
    3. **HSE:** Incidents and Inspections.
    4. **Main Activity:** Critical activity from Execution/Commissioning.
    5. **Procurement:** Procurement table items.
    6. **Readiness:** Work Packages/Readiness table items.
    7. **Commissioning:** Commissioning section (Description, Target%, Actual%, Status).

    **OUTPUT FORMAT (JSON ONLY):**
    {
        "meta": { "project": "String", "date": "YYYY-MM-DD", "preparedBy": "String" },
        "strategy": { "focus": "String" },
        "hse": { "incidents": "String", "inspections": "String" },
        "mainActivity": { "description": "String", "targetPercent": Number, "actualPercent": Number, "status": "String" },
        "procurement": [ { "material": "String", "expectedDate": "String", "status": "String" } ],
        "readiness": [ { "wpId": "String", "drawingsStatus": "String", "readinessStatus": "String" } ],
        "commissioning": { "description": "String", "targetPercent": Number, "actualPercent": Number, "status": "String" }
    }
    `;
}

function cleanAndParseJson(text: string): any {
    const clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(clean);
}