import { Request, Response } from 'express';
import { getStats } from '../db/database';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

export const renderDashboard = async (req: Request, res: Response) => {
    try {
        // Connect directly to read the logs
        const db = await open({
            filename: path.join(process.cwd(), 'velox_core.db'),
            driver: sqlite3.Database
        });

        // Get all logs, sorted by newest first
        const logs = await db.all("SELECT * FROM field_logs ORDER BY id DESC");
        const stats = await getStats();

        // --- HTML TEMPLATE ---
        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Velox Mission Control</title>
            <meta http-equiv="refresh" content="10"> <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
            <style>
                body { 
                    background-color: #0f172a; 
                    color: #fff; 
                    font-family: 'Inter', sans-serif; 
                    padding: 40px; 
                }
                
                /* HEADER */
                h1 { color: #00ff9d; font-weight: 800; letter-spacing: -1px; margin: 0; }
                .subtitle { color: #64748b; font-size: 14px; margin-top: 5px; font-family: 'JetBrains Mono', monospace; }

                /* STATS CARDS */
                .stats-grid { display: flex; gap: 20px; margin: 40px 0; }
                .card { 
                    background: #1e293b; 
                    padding: 25px; 
                    border-radius: 12px; 
                    border: 1px solid #334155; 
                    min-width: 200px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }
                .card h3 { margin: 0; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
                .card .value { font-size: 32px; font-weight: 800; margin-top: 10px; color: #fff; }
                .card .unit { font-size: 14px; color: #64748b; font-weight: normal; }

                /* TABLE STYLES */
                .table-container { 
                    border-radius: 12px; 
                    border: 1px solid #334155; 
                    overflow: hidden; 
                    background: #1e293b;
                }
                table { width: 100%; border-collapse: collapse; font-size: 14px; }
                
                th { 
                    text-align: left; 
                    color: #94a3b8; 
                    background: #0f172a; 
                    padding: 16px; 
                    text-transform: uppercase; 
                    font-size: 11px; 
                    letter-spacing: 1px;
                    border-bottom: 1px solid #334155;
                }
                
                td { padding: 16px; border-bottom: 1px solid #334155; vertical-align: top; }
                tr:last-child td { border-bottom: none; }
                tr:hover { background-color: #27354f; }

                /* DATA TAGS */
                .tag { padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
                .tag-YES { background: rgba(16, 185, 129, 0.2); color: #34d399; }
                .tag-NO { background: rgba(239, 68, 68, 0.2); color: #f87171; }
                
                .user-badge { 
                    background: #334155; 
                    color: #e2e8f0; 
                    padding: 4px 8px; 
                    border-radius: 6px; 
                    font-size: 12px; 
                    font-weight: 600;
                }

                .wp-code { font-family: 'JetBrains Mono', monospace; color: #94a3b8; font-size: 11px; }

                /* MATERIAL LIST STYLING */
                .mat-item { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
                .mat-qty { color: #fff; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
                .mat-unit { color: #64748b; font-size: 12px; }
                .mat-name { color: #38bdf8; font-weight: 500; }

                /* LINKS */
                a.btn { 
                    text-decoration: none; 
                    font-size: 11px; 
                    font-weight: 700; 
                    padding: 6px 12px; 
                    border-radius: 6px; 
                    transition: all 0.2s;
                    display: inline-block;
                }
                .btn-photo { background: rgba(56, 189, 248, 0.1); color: #38bdf8; }
                .btn-photo:hover { background: rgba(56, 189, 248, 0.2); }
                
                .btn-pdf { background: rgba(255, 255, 255, 0.05); color: #fff; }
                .btn-pdf:hover { background: rgba(255, 255, 255, 0.1); }

            </style>
        </head>
        <body>
            <div>
                <h1>VELOX MISSION CONTROL</h1>
                <div class="subtitle">REAL-TIME FIELD OPERATIONS | SYSTEM ONLINE 🟢</div>
            </div>
            
            <div class="stats-grid">
                <div class="card">
                    <h3>Total Reports</h3>
                    <div class="value">${stats?.total_reports || 0}</div>
                </div>
                <div class="card">
                    <h3>Total Quantity</h3>
                    <div class="value">${stats?.total_installed || 0} <span class="unit">Estimated Units</span></div>
                </div>
            </div>

            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th width="5%">ID</th>
                            <th width="10%">TIME</th>
                            <th width="15%">FOREMAN</th>
                            <th width="20%">WORK PACKAGE</th>
                            <th width="8%">STATUS</th>
                            <th width="20%">MATERIALS & QUANTITY</th>
                            <th width="15%">COMMENTS</th>
                            <th width="7%">PHOTO</th>
                            <th width="7%">REPORT</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${logs.map((log: any) => {
                            // 1. LINK GENERATION
                            const pdfLink = log.pdf_path ? `/files/${path.basename(log.pdf_path)}` : '#';
                            const photoLink = log.photo_path ? `/files/Site_Photos/${path.basename(log.photo_path)}` : null;
                            
                            // 2. MATERIAL LIST PARSING (The Core Logic)
                            let matHtml = '';
                            try {
                                if (log.materials_json && log.materials_json !== '[]') {
                                    const list = JSON.parse(log.materials_json);
                                    matHtml = list.map((m: any) => `
                                        <div class="mat-item">
                                            <span class="mat-qty">${m.quantity}</span>
                                            <span class="mat-unit">${m.unit}</span>
                                            <span class="mat-name">${m.name}</span>
                                        </div>
                                    `).join('');
                                } else {
                                    // Fallback for old data or simple manual inputs
                                    matHtml = `<div class="mat-item">
                                        <span class="mat-qty">${log.quantity_value}</span>
                                        <span class="mat-unit">${log.quantity_unit}</span>
                                    </div>`;
                                }
                            } catch (e) { matHtml = '<span style="color:red">Data Error</span>'; }

                            return `
                            <tr>
                                <td style="color:#64748b; font-family:'JetBrains Mono'">#${log.id}</td>
                                <td>
                                    <div style="font-weight:600">${log.timestamp.split(' ')[1].slice(0,5)}</div>
                                    <div style="color:#64748b; font-size:11px">${log.timestamp.split(' ')[0]}</div>
                                </td>
                                <td><span class="user-badge">${log.user_name || 'Unknown'}</span></td>
                                <td class="wp-code">${log.work_package_id}</td>
                                <td><span class="tag tag-${log.status}">${log.status}</span></td>
                                
                                <td>${matHtml}</td>
                                
                                <td style="color:#94a3b8; font-style:italic">"${log.comments}"</td>
                                
                                <td>
                                    ${photoLink 
                                        ? `<a href="${photoLink}" target="_blank" class="btn btn-photo">📷 VIEW</a>` 
                                        : '<span style="color:#475569">-</span>'}
                                </td>
                                <td><a href="${pdfLink}" target="_blank" class="btn btn-pdf">📄 PDF</a></td>
                            </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </body>
        </html>
        `;

        res.send(html);

    } catch (error) {
        console.error("Dashboard Error:", error);
        res.status(500).send("Dashboard Unavailable");
    }
};