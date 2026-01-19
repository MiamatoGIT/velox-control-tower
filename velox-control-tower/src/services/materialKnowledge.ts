import fs from 'fs';
import path from 'path';

// Singleton cache to prevent reading the disk on every request
let materialCache: string | null = null;

export const getMaterialContext = (): string => {
    if (materialCache) return materialCache;

    try {
        const csvPath = path.join(process.cwd(), 'src', 'data', 'Materials.csv');
        
        if (fs.existsSync(csvPath)) {
            console.log("📚 Loading Master Material List into Memory...");
            const rawData = fs.readFileSync(csvPath, 'utf-8');
            
            // Format it clearly for the LLM
            materialCache = `
=== MASTER MATERIAL DATABASE (CSV) ===
The following is the official list of valid items and their categories (Product Group).
Use this to standardize the 'name' and identify the 'category'.

${rawData}
=== END OF DATABASE ===
            `;
            return materialCache;
        } else {
            console.warn("⚠️ Warning: src/data/Materials.csv not found. AI will use generic names.");
            return "";
        }
    } catch (e) {
        console.error("❌ Error reading material list:", e);
        return "";
    }
};