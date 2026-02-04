import { Request, Response } from 'express';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import AdmZip from 'adm-zip';
import XLSX from 'xlsx'; // 👈 CHANGED FROM "import * as XLSX"

const DB_PATH = path.join(process.cwd(), 'velox_core.db');
const DOCS_ROOT = path.join(process.cwd(), 'ACC_Sync/Reference_Docs');

if (!fs.existsSync(DOCS_ROOT)) fs.mkdirSync(DOCS_ROOT, { recursive: true });

// --- A. UPLOAD BUDGET ---
export const uploadBudget = async (req: Request, res: Response) => {
    try {
        const file = req.file;
        if (!file) return res.status(400).json({ error: "No file provided" });

        console.log(`📂 Opening Budget File: ${file.originalname}`);
        const db = await open({ filename: DB_PATH, driver: sqlite3.Database });
        
        // 1. Read Excel
        // Using "XLSX.readFile" directly on the default import
        const workbook = XLSX.readFile(file.path);
        
        const sheetName = workbook.SheetNames.find(n => n.includes("Pricing")) || workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        console.log(`📊 Reading Sheet: ${sheetName}`);

        // 2. Convert to JSON (Row 7 Header)
        const rawData = XLSX.utils.sheet_to_json(sheet, { range: 6, defval: null });

        if (rawData.length > 0) {
            console.log("🧐 First Row Detected:", JSON.stringify(rawData[0]).substring(0, 100) + "...");
        }

        // 3. Clear Old Budget
        await db.run("DELETE FROM budget_master");

        const stmt = await db.prepare(`
            INSERT INTO budget_master (cost_code, description, uom, total_qty, unit_rate, total_budget, wp_ref, qty_ordered, qty_stock, qty_installed)
            VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, 0)
        `);

        let importCount = 0;

        for (const row of rawData as any[]) {
            const desc = row['Description'];
            if (!desc) continue; 

            // Handle duplicate "Total Price" headers (XLSX adds _1, _2 suffixes)
            const grandTotal = parseFloat(row['Total Price_2'] || row['Total Price_1'] || row['Total Price'] || '0');
            const qty = parseFloat(row['Qt.']) || 1; 
            const unitRate = grandTotal / qty;

            await stmt.run(
                row['Item'] || 'MISC',
                desc,
                row['Unit.'] || 'ls',
                qty,
                unitRate,
                grandTotal,
                'General'
            );
            importCount++;
        }

        await stmt.finalize();
        console.log(`✅ SUCCESS: Imported ${importCount} budget lines.`);
        res.json({ success: true, count: importCount, message: "Budget Linked Successfully" });

    } catch (e) {
        console.error("❌ Ingestion Error:", e);
        res.status(500).json({ error: "Budget Ingestion Failed" });
    }
};

// --- B. UPLOAD WORK PACKAGE ---
export const uploadWP = async (req: Request, res: Response) => {
    try {
        const file = req.file;
        const { wpId, description } = req.body; 
        
        if (!file || !wpId) return res.status(400).json({ error: "File and WP ID required" });

        const extractPath = path.join(DOCS_ROOT, `WP_${wpId}`);
        const zip = new AdmZip(file.path);
        zip.extractAllTo(extractPath, true);

        let materials = [];
        const files = fs.readdirSync(extractPath);
        const bomFile = files.find(f => f.match(/bom|material|quantity/i));
        
        if (bomFile) {
            if (bomFile.endsWith('.json')) {
                const raw = fs.readFileSync(path.join(extractPath, bomFile), 'utf-8');
                materials = JSON.parse(raw);
            } else if (bomFile.endsWith('.xlsx')) {
                const wb = XLSX.readFile(path.join(extractPath, bomFile));
                materials = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
            }
        }

        const db = await open({ filename: DB_PATH, driver: sqlite3.Database });
        await db.run(`
            INSERT INTO wp_scopes (wp_id, description, materials_json, docs_path)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(wp_id) DO UPDATE SET 
                materials_json=excluded.materials_json, docs_path=excluded.docs_path
        `, [wpId, description, JSON.stringify(materials), extractPath]);

        res.json({ success: true, wpId, bomCount: materials.length });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "WP Ingestion Failed" });
    }
};