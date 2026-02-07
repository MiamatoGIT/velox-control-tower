import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import fs from 'fs';
import { getMaterialContext } from './materialKnowledge';

dotenv.config();

// ✅ CRITICAL: Keeping your specific model
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

        const prompt = getAudioPrompt(materialContext);

        const result = await model.generateContent([
            prompt, 
            { inlineData: { data: base64Audio, mimeType: mimeType } }
        ]);

        return cleanAndParseJson(result.response.text());

    } catch (error) {
        console.error("❌ Gemini Audio Error:", error);
        return { materials: [], roadblocks: [], comments: "Processing Failed", originalLanguage: "Unknown" };
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
// 🧠 BRAIN DEFINITIONS (MERGED LOGIC)
// ============================================================

function getAudioPrompt(context: string): string {
    return `
    You are a Construction Supervisor AI listening to a site report.
    
    **CONTEXT:**
    ${context}

    **GOAL:** Extract Progress AND Critical Roadblocks for the "Single Source of Truth" dashboard.
    
    **1. PROGRESS EXTRACTION:**
    - **MATERIALS:** What was used? (e.g., "Installed 50m tray").
    - **ACTIVITY:** What were they doing? (e.g., "Preparation", "QC Check").

    **2. ROADBLOCK CLASSIFICATION (CRITICAL):**
    If the user mentions a delay, missing item, clash, or stoppage, create a "roadblock" entry.
    - **TYPE:** - "FIELD" -> Physical issues (Access, Weather, Broken Tool, Scaffolding).
      - "OFFICE" -> Paperwork issues (Missing Drawing, Design Clash, Material Delivery delay).
    - **OWNER:** Who must fix it? (Engineering, Procurement, Site Team, HSE).
    - **PRIORITY:** - "CRITICAL" (Stops work completely).
      - "HIGH" (Slows work significantly).
      - "MEDIUM" (Needs attention).

    **OUTPUT FORMAT (JSON ONLY):**
    {
        "materials": [
            { "name": "String", "category": "String", "quantity": Number, "unit": "String", "status": "INSTALLED" }
        ],
        "roadblocks": [
            {
                "description": "Short description of the issue",
                "type": "FIELD" | "OFFICE",
                "priority": "CRITICAL" | "HIGH" | "MEDIUM",
                "owner": "Engineering" | "Procurement" | "Site Team",
                "area": "String (Infer from context)",
                "action_required": "What needs to be done?"
            }
        ],
        "comments": "Summary of report",
        "originalLanguage": "Portuguese"
    }
    `;
}

function getPdfPrompt(): string {
    return `
    You are a Project Controls Manager. Extract data from this PDF for the Daily Report.
    
    **CRITICAL EXTRACTION RULES:**

    1. **ROADBLOCKS / ISSUES (New Requirement):**
       - Look for sections labeled "Issues", "Concerns", "Blockers", or "Constraints".
       - **CLASSIFY** each issue:
         - **FIELD:** Site constraints, access, weather, HSE.
         - **OFFICE:** Design missing, Engineering TQ, Procurement delay.
       - **EXTRACT:** Owner (Engineering, Procurement, Site) and Priority.
       - If a due date is not listed, estimate +7 days or leave null.

    2. **EXECUTION PROGRESS:**
       - Extract the "EXECUTION PROGRESS" table rows into the "execution" array.
       - Map: Description, Actual %, Status, WP ID.

    3. **HSE STATUS:**
       - Extract: Working Hours, People on site, Incidents, Toolboxes, DRA, Observations.

    4. **SUBCONTRACTORS:**
       - Extract: Company Name, Role, Personnel count.

    5. **COMMISSIONING:**
       - Extract table rows into "commissioning" array.
    
    6. **READINESS:**
       - Extract: WP ID, Description, Readiness Status.

    7. **PROCUREMENT:**
       - Extract: Material, Expected Date, Status.

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
            "observations": Number
        },

        "roadblocks": [
            {
                "description": "String",
                "type": "FIELD" | "OFFICE",
                "priority": "CRITICAL" | "HIGH" | "MEDIUM",
                "owner": "String",
                "area": "String",
                "action_required": "String",
                "due_date": "YYYY-MM-DD"
            }
        ],

        "externalCompanies": [ { "name": "String", "role": "String", "personnel": Number } ],

        "mainActivity": { "description": "String", "targetPercent": Number, "actualPercent": Number, "status": "String" },
        "procurement": [ { "material": "String", "expectedDate": "String", "status": "String" } ],
        "execution": [ { "description": "String", "status": "String", "percent": Number } ],
        "readiness": [ { "wpId": "String", "description": "String", "readinessStatus": "String" } ],
        "commissioning": { "description": "String", "status": "String" }
    }
    `;
}

function cleanAndParseJson(text: string): any {
    try {
        const clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(clean);
    } catch (e) {
        console.error("❌ JSON Parse Error. Raw Gemini Output:", text);
        // Return a safe fallback to prevent crash
        return { 
            meta: {}, 
            materials: [], 
            roadblocks: [], 
            comments: "Error parsing AI response" 
        };
    }
}