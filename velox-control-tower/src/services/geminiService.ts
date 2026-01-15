import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import fs from 'fs'; // ✅ REQUIRED: This was missing before!

dotenv.config();

// ✅ RECOMMENDATION: Try "gemini-1.5-flash" first. 
// If it fails with a permission error, switch back to "gemini-robotics-er-1.5-preview"
const MODEL_NAME = "gemini-robotics-er-1.5-preview"; 
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    console.error("❌ GEMINI_API_KEY is missing in .env file");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

export const processAudioReport = async (filePath: string, mimeType: string): Promise<any> => {
    try {
        console.log(`📤 Sending audio to Gemini (${MODEL_NAME})...`);

        // 1. ✅ THE FIX: Read the file into a buffer
        // (This block was missing in the previous version, causing the crash)
        const fileBuffer = fs.readFileSync(filePath);
        const base64Audio = fileBuffer.toString('base64');

        // 2. THE PROMPT
        const prompt = `
        You are a construction site data analyst. 
        Listen to this audio report from a foreman.

        Extract the following structured data as JSON:
        1. "materials": An array of items installed. 
           - Separate different items (e.g., "20 sockets and 50m cable" -> 2 items).
           - "name": The object (e.g., "Wall Socket", "Cat6 Cable"). Clean up the name.
           - "quantity": The number (numeric).
           - "unit": The unit (e.g., "pcs", "m", "kg"). Use "pcs" if countable.
        2. "comments": A brief summary of the work or issues (max 15 words).
        3. "originalLanguage": The language spoken.

        Example Output:
        {
          "materials": [
            { "name": "Power Socket", "quantity": 20, "unit": "pcs" },
            { "name": "Cat6 Cable", "quantity": 150, "unit": "m" }
          ],
          "comments": "Installation complete in Zone B.",
          "originalLanguage": "English"
        }

        If no quantity/materials are mentioned, return an empty "materials" array [].
        Return ONLY valid JSON.
        `;

        // 3. SEND TO GEMINI
        const result = await model.generateContent([
            prompt, 
            { 
                inlineData: { 
                    data: base64Audio, 
                    mimeType: mimeType 
                } 
            }
        ]);

        const responseText = result.response.text();
        console.log("📥 Gemini Response:", responseText);

        // 4. CLEAN JSON
        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson);

    } catch (error) {
        console.error("❌ Gemini Error:", error);
        return { 
            materials: [], 
            comments: "AI Processing Failed", 
            originalLanguage: "Unknown" 
        };
    }
};