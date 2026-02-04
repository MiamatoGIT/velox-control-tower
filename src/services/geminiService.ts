import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import fs from 'fs';
import { getMaterialContext } from './materialKnowledge';

dotenv.config();

const MODEL_NAME = "gemini-robotics-er-1.5-preview"; // Valid model name
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) { console.error("❌ GEMINI_API_KEY is missing"); process.exit(1); }

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

// ============================================================
// 1. AUDIO PROCESSOR (UNCHANGED)
// ============================================================
export const processAudioReport = async (filePath: string, mimeType: string): Promise<any> => {
    try {
        console.log(`📤 Sending audio to Gemini...`);
        const fileBuffer = fs.readFileSync(filePath);
        const base64Audio = fileBuffer.toString('base64');
        const materialContext = getMaterialContext();

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
// 2. PDF PROCESSOR (UPDATED)
// ============================================================
export const processPdfReport = async (filePath: string): Promise<any> => {
    try {
        console.log(`📄 Reading PDF...`);
        const fileBuffer = fs.readFileSync(filePath);
        const base64Pdf = fileBuffer.toString('base64');

        // ✅ Updated Prompt with HSE & Company Extraction
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

// ✅ NEW: Enhanced PDF Prompt
function getPdfPrompt(): string {
    return `
    You are a Project Controls Manager. Extract data from this Daily Progress Report PDF.
    
    **CRITICAL EXTRACTION RULES:**
    1. **EXECUTION PROGRESS (Detailed):**
       - Look for the "EXECUTION PROGRESS" table.
       - Extract EVERY ROW as an item in the "execution" array.
       - Map columns: 
         - "Activity" -> description
         - "Act %" or "Actual %" -> actualPercent (Number)
         - "Status" -> status
         - "WP ID" -> wpId
       - Example: "Earthing white space" (85%) and "Earthing loading bay" (30%) must be SEPARATE items.

    2. **HSE STATUS (Health, Safety, Environment):**
       - Look for the HSE Table or Section.
       - Extract "Working Hours" (e.g., "7 a.m. - 7 p.m." becomes "07:00 - 19:00").
       - Extract counts for: "People on site", "Incidents", "Toolboxes" (TBT), "DRA" (Risk Assessment), "Observations".
       - Extract "Extra Training" or "Training" text.
       - Extract "Site Inspections" status.

    3. **SUBCONTRACTORS (External Companies):**
       - Look for tables labeled "Subcontractors", "Site Partners", or "External Companies".
       - Extract Company Name, Work Description (Role), and Finish Date/Status.
       - If personnel count is not explicitly listed, estimate based on context or set to 0.

    4. **STANDARD SECTIONS:**
       - Meta: Project Name, Date, Prepared By.
       - Strategy: Executive Strategy focus points.
       - Main Activity: The primary Execution item (Progress %).
       - Procurement: The Procurement tracking table.
       - Readiness: The Work Package Preparation table.


    5. **COMMISSIONING (Detailed):**
       - Look for the "COMMISSIONING" table.
       - Extract EVERY ROW as an item in the "commissioning" array.
       - Map columns: 
         - "WP ID" -> wpId
         - "Activity" -> description
         - "Level 1" -> level1 (e.g. "Done")
         - "Level 2" -> level2
         - "Level 3" -> level3
         - "Level 4" -> level4
         - "Level 5" -> level5
         - "Notes" -> notes

    **OUTPUT FORMAT (JSON ONLY):**
    {
        "meta": { "project": "String", "date": "YYYY-MM-DD", "preparedBy": "String" },
        "strategy": { "focus": "String" },
        
        "hse": { 
            "workingHours": "String",
            "peopleOnSite": Number,
            "incidents": Number,
            "toolboxes": Number,
            "dra": Number,
            "observations": Number,
            "training": "String",
            "inspections": "String"
        },

        "externalCompanies": [ 
            { "name": "String", "role": "String", "personnel": Number } 
        ],

        "mainActivity": { "description": "String", "targetPercent": Number, "actualPercent": Number, "status": "String" },
        "procurement": [ { "material": "String", "expectedDate": "String", "status": "String" } ],
        "readiness": [ { "wpId": "String", "description": "String", "drawingsStatus": "String", "readinessStatus": "String" } ],
        "commissioning": { "description": "String", "targetPercent": Number, "actualPercent": Number, "status": "String" }
    }
    `;
}

function cleanAndParseJson(text: string): any {
    const clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(clean);
}