import { css } from './styles';
import { js } from './scripts';

export const renderLayout = (data: any) => {
    const safeData = {
        ...data,
        procurement: data.procurement || [],
        readiness: data.readiness || [],
        liveAlerts: data.liveAlerts || []
    };

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>VELOX STARGATE | Mission Control</title>
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:wght@300;400;600;900&display=swap" rel="stylesheet">
        ${css}
    </head>
    <body>
        <div id="alert-modal" class="modal-overlay"><div id="modal-content" class="modal-box"></div></div>

        <div class="dashboard-container">
            
            <div class="header glass-panel">
                <div class="flex flex-col">
                     <h1><span class="text-blue">VELOX</span> STARGATE</h1>
                     <span class="mono" style="font-size: 10px; color: #64748b; letter-spacing: 2px;">DIGITAL TWIN OPERATION</span>
                </div>
                <div class="mono" style="text-align: right; font-size: 12px;">
                    <div>PROJECT <span style="color:#38bdf8;">${safeData.meta.project}</span></div>
                    <div style="color:#94a3b8;">${safeData.meta.date}</div>
                </div>
            </div>

            <div style="grid-column: 1; grid-row: 2; display:flex; flex-direction:column; gap:16px;">
                <div class="card" id="card-STRATEGY" onclick="selectSection('STRATEGY')" style="flex: 1; cursor: pointer;">
                    <div class="card-header">💡 STRATEGY</div>
                    <div id="strategy-content" class="card-list"></div>
                </div>
                
                <div class="card" id="card-HSE" onclick="selectSection('HSE')" style="height: 200px; cursor: pointer;">
                    <div class="card-header">🛡️ HSE STATUS</div>
                    <div id="hse-content" class="card-list"></div>
                </div>

                <div class="card" id="card-COMPANIES" onclick="selectSection('COMPANIES')" style="height: 150px; cursor: pointer;">
                    <div class="card-header">🏗️ PARTNERS</div>
                    <div id="companies-content" class="card-list"></div>
                </div>
            </div>

            <div class="card" style="grid-column: 2; grid-row: 2;">
                <div id="main-stage-title" class="card-header" style="background:transparent; color:#fff; font-size:14px;">SYSTEM STANDBY</div>
                <div id="main-stage-content" class="card-list" style="padding:20px;"></div>
            </div>

            <div class="index-tabs-container">
                
                <div class="glass-tab tab-budget" onclick="toggleDrawer('budget')" title="Open Master Budget">
                    BUDGET
                </div>
                
                <div class="glass-tab tab-scope" onclick="toggleDrawer('wp')" title="Open Work Packages">
                    SCOPE
                </div>

                <div class="glass-tab tab-system" onclick="alert('System Diagnostics: OK')" title="System Status">
                    SYSTEM
                </div>

            </div>

            <div class="bottom-dock" style="grid-column: 1 / -1; grid-row: 3; display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 16px;">
                <div class="card" id="card-READINESS" onclick="selectSection('READINESS')" style="border-top: 3px solid var(--neon-red);">
                    <div class="card-header">1. READINESS (${safeData.readiness.length})</div>
                    <div id="list-READINESS" class="card-list"></div>
                </div>
                <div class="card" id="card-PROCUREMENT" onclick="selectSection('PROCUREMENT')" style="border-top: 3px solid var(--neon-green);">
                    <div class="card-header">2. PROCUREMENT (${safeData.procurement.length})</div>
                    <div id="list-PROCUREMENT" class="card-list"></div>
                </div>
                <div class="card" id="card-EXECUTION" onclick="selectSection('EXECUTION')" style="border-top: 3px solid var(--neon-blue);">
                    <div class="card-header">3. EXECUTION</div>
                    <div id="list-EXECUTION" class="card-list"></div>
                </div>
                <div class="card" id="card-COMMISSIONING" onclick="selectSection('COMMISSIONING')" style="border-top: 3px solid var(--neon-amber);">
                    <div class="card-header">4. COMMISSIONING</div>
                    <div id="list-COMMISSIONING" class="card-list"></div>
                </div>
            </div>

        </div>

        <div id="drawer-budget" class="drawer">
            <div class="drawer-content">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                    <h2 style="color:var(--neon-green); margin:0;">💰 BUDGET</h2>
                    <button onclick="toggleDrawer('budget')" style="background:none; border:none; color:#fff; font-size:20px; cursor:pointer;">✕</button>
                </div>
                
                <div style="display:flex; gap:10px; margin-bottom:30px;">
                    <div style="flex:1; background:rgba(52, 211, 153, 0.1); padding:15px; border-radius:8px; border:1px solid rgba(52, 211, 153, 0.2);">
                        <div class="mono small" style="color:var(--neon-green);">TOTAL</div>
                        <div style="font-size:20px; font-weight:bold; color:#fff;">NOK 234M</div>
                    </div>
                    <div style="flex:1; background:rgba(239, 68, 68, 0.1); padding:15px; border-radius:8px; border:1px solid rgba(239, 68, 68, 0.2);">
                        <div class="mono small" style="color:var(--neon-red);">SPENT</div>
                        <div style="font-size:20px; font-weight:bold; color:#fff;">NOK 42M</div>
                    </div>
                </div>

                <div id="budget-list-container"></div>
            </div>
        </div>

        <div id="drawer-wp" class="drawer">
            <div class="drawer-content">
                 <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                    <h2 style="color:var(--neon-amber); margin:0;">📂 WORK PACKAGES</h2>
                    <button onclick="toggleDrawer('wp')" style="background:none; border:none; color:#fff; font-size:20px; cursor:pointer;">✕</button>
                </div>
                <div id="wp-list-container">
                    <div class="mono" style="opacity:0.5;">No WPs loaded.</div>
                </div>
            </div>
        </div>

        <script>
            function toggleDrawer(id) {
                const el = document.getElementById('drawer-' + id);
                const isOpen = el.classList.contains('open');
                document.querySelectorAll('.drawer').forEach(d => d.classList.remove('open'));
                if (!isOpen) el.classList.add('open');
            }
        </script>

        <script>window.DASHBOARD_DATA = ${JSON.stringify(safeData)};</script>
        
        ${js}
    </body>
    </html>
    `;
};