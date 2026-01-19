import { DailyReportData } from '../types/dailyReport';

export const renderMissionControlHtml = (data: DailyReportData) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>VELOX STARGATE | Mission Control</title>
        <meta http-equiv="refresh" content="60"> 
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
        <style>
            :root { --bg-dark: #0f172a; --card-bg: #1e293b; --text-primary: #ffffff; --text-secondary: #94a3b8; --accent-blue: #38bdf8; --accent-red: #ef4444; --accent-green: #34d399; }
            body { background-color: var(--bg-dark); color: var(--text-primary); font-family: 'Inter', sans-serif; padding: 20px; margin: 0; }
            .mono { font-family: 'JetBrains Mono', monospace; }
            .text-blue { color: var(--accent-blue); } .text-red { color: var(--accent-red); } .text-green { color: var(--accent-green); }
            .flex { display: flex; } .flex-col { flex-direction: column; } .gap-4 { gap: 16px; } .gap-2 { gap: 8px; } .justify-between { justify-content: space-between; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #334155; padding-bottom: 20px; }
            .header h1 { margin: 0; font-weight: 900; letter-spacing: 1px; font-size: 28px; }
            .project-badge { background: #334155; padding: 4px 12px; border-radius: 20px; color: var(--accent-blue); font-weight: bold; }
            .main-grid { display: grid; grid-template-columns: 350px 1fr; gap: 25px; }
            .bottom-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 25px; margin-top: 25px; }
            .card { background: var(--card-bg); border-radius: 16px; padding: 20px; border: 1px solid #334155; position: relative; overflow: hidden; }
            .card-title { font-size: 14px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; display: flex; justify-content: space-between; }
            .card-strategy { border-top: 3px solid var(--accent-blue); }
            .card-main { border: 2px solid var(--accent-blue); background: linear-gradient(180deg, rgba(56, 189, 248, 0.05) 0%, var(--card-bg) 100%); }
            .card-red { border-top: 3px solid var(--accent-red); } .card-green { border-top: 3px solid var(--accent-green); }
            .progress-container { background: #0f172a; border-radius: 12px; height: 24px; overflow: hidden; position: relative; border: 1px solid #334155; }
            .progress-bar { height: 100%; border-radius: 12px; }
            .bg-blue { background: linear-gradient(90deg, var(--accent-blue), #0ea5e9); } .bg-red { background: linear-gradient(90deg, var(--accent-red), #dc2626); }
            .data-label { font-size: 12px; color: var(--text-secondary); }
            .status-badge { padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
            .status-blocked { background: rgba(239, 68, 68, 0.2); color: var(--accent-red); border: 1px solid var(--accent-red); }
            .status-ontrack { background: rgba(52, 211, 153, 0.2); color: var(--accent-green); border: 1px solid var(--accent-green); }
        </style>
    </head>
    <body>
        <div class="header">
            <h1><span class="project-badge">${data.meta.project}</span> MISSION CONTROL</h1>
            <div style="color: #94a3b8; font-size: 14px; margin-top: 10px;" class="mono">DATE: ${data.meta.date} | PREPARED BY: ${data.meta.preparedBy.toUpperCase()}</div>
        </div>

        <div class="main-grid">
            <div class="flex flex-col gap-4">
                <div class="card card-strategy">
                    <div class="card-title">💡 Executive Strategy</div>
                    <div style="font-size: 18px; font-weight: 300;">Focus: <span style="color:#fff; font-weight: 600;">${data.strategy.focus}</span></div>
                </div>
                <div class="card">
                     <div class="card-title">🛡️ HSE Status</div>
                     <div class="flex flex-col gap-2">
                        <div><span class="text-green">✔</span> ${data.hse.incidents}</div>
                        <div><span class="text-blue">ℹ</span> ${data.hse.inspections}</div>
                     </div>
                </div>
            </div>

            <div class="card card-main">
                <div class="card-title"><span>🚀 SELECTED ITEM DETAILS</span><span class="text-red">⚠️ BLOCKERS DETECTED</span></div>
                <div style="margin-bottom: 30px;">
                    <div class="data-label mono">ACTIVITY:</div>
                    <div style="font-size: 32px; font-weight: 800;">${data.mainActivity.description}</div>
                    <div class="status-badge status-blocked mono" style="display:inline-block; margin-top:10px;">Status: ${data.mainActivity.status}</div>
                </div>
                <div class="flex flex-col gap-4">
                    <div>
                        <div class="flex justify-between" style="margin-bottom:5px;"><span class="data-label mono">TARGET %</span><span class="text-blue mono" style="font-weight:bold;">${data.mainActivity.targetPercent}%</span></div>
                         <div class="progress-container"><div class="progress-bar bg-blue" style="width: ${data.mainActivity.targetPercent}%"></div></div>
                    </div>
                     <div>
                        <div class="flex justify-between" style="margin-bottom:5px;"><span class="data-label mono">ACTUAL %</span><span class="text-red mono" style="font-weight:bold;">${data.mainActivity.actualPercent}%</span></div>
                         <div class="progress-container"><div class="progress-bar bg-red" style="width: ${data.mainActivity.actualPercent}%"></div></div>
                    </div>
                </div>
            </div>
        </div>

        <div class="bottom-grid">
            <div class="card card-red">
                <div class="card-title">1. WP READINESS 🛑</div>
                ${data.readiness.map(wp => `
                    <div style="border-bottom:1px solid #334155; padding-bottom: 10px; margin-bottom: 10px;">
                        <div class="data-label mono">${wp.wpId}</div>
                        <div class="flex justify-between" style="margin-top:5px;">
                            <span class="mono" style="font-size:12px;">Drawings: <span class="text-red">${wp.drawingsStatus}</span></span>
                            <span class="status-badge status-blocked">${wp.readinessStatus}</span>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="card card-green">
                <div class="card-title">2. PROCUREMENT 🟢</div>
                 ${data.procurement.map(item => `
                    <div style="border-bottom:1px solid #334155; padding-bottom: 10px; margin-bottom: 10px;">
                         <div style="font-size: 16px; font-weight: 600;">${item.material}</div>
                        <div class="flex justify-between" style="margin-top:5px;">
                            <span class="data-label mono">Expected: ${item.expectedDate}</span>
                            <span class="status-badge status-ontrack">${item.status}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
            
             <div class="card" style="border-top: 3px solid #334155;">
                <div class="card-title">3. EXECUTION SUMMARY</div>
                 <div style="opacity: 0.7;">
                    <div class="data-label mono">Current Focus:</div>
                    <div>${data.mainActivity.description}</div>
                    <div class="flex gap-4" style="margin-top:15px;">
                         <div><div class="data-label">Target</div><div class="text-blue mono">${data.mainActivity.targetPercent}%</div></div>
                         <div><div class="data-label">Actual</div><div class="text-red mono">${data.mainActivity.actualPercent}%</div></div>
                    </div>
                 </div>
            </div>
        </div>
        <div style="text-align: center; margin-top: 40px; color: #94a3b8; font-size: 12px;" class="mono">VELOX DIGITAL ARCHITECTURE | STARGATE PROJECT 2026</div>
    </body>
    </html>
    `;
};