import { css } from './styles';
import { js } from './scripts';

export const renderLayout = (data: any) => {
    // Safety checks to prevent crashes if data is missing
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
            
            <div class="header">
                <div class="flex flex-col">
                     <h1><span class="text-blue">VELOX</span> STARGATE</h1>
                     <span class="mono" style="font-size: 10px; color: #64748b;">DIGITAL TWIN OPERATION | LIVE FEED</span>
                </div>
                <div class="mono" style="text-align: right; font-size: 12px;">
                    <div>PROJECT: <span style="background:rgba(56, 189, 248, 0.1); color:#38bdf8; padding:2px 6px; border-radius:4px;">${safeData.meta.project}</span></div>
                    <div style="margin-top:5px; color:#94a3b8;">${safeData.meta.date}</div>
                </div>
            </div>

            <div class="sidebar">
                <div class="card" id="card-STRATEGY" onclick="selectSection('STRATEGY')" style="border-left: 3px solid var(--accent-blue); flex: 2; cursor: pointer;">
                    <div class="card-header">💡 STRATEGY</div>
                    <div id="strategy-content" class="card-list"></div>
                </div>
                
                <div class="card" id="card-HSE" onclick="selectSection('HSE')" style="border-left: 3px solid var(--accent-green); flex: 1; cursor: pointer;">
                    <div class="card-header">🛡️ HSE DASHBOARD</div>
                    <div id="hse-content" class="card-list"></div>
                </div>

                <div class="card" id="card-COMPANIES" onclick="selectSection('COMPANIES')" style="border-left: 3px solid var(--accent-amber); flex: 1; cursor: pointer;">
                    <div class="card-header">🏗️ SITE PARTNERS</div>
                    <div id="companies-content" class="card-list"></div>
                </div>
            </div>

            <div class="main-stage">
                <div id="main-stage-title" class="card-header" style="background:transparent; border-bottom:1px solid rgba(56, 189, 248, 0.3); color:#38bdf8; padding-left:0;">WAITING FOR INPUT...</div>
                <div id="main-stage-content" class="card-list" style="padding:0; margin-top:20px;"></div>
            </div>

            <div class="bottom-dock">
                <div class="card" id="card-READINESS" onclick="selectSection('READINESS')" style="border-top: 3px solid var(--accent-red);">
                    <div class="card-header">1. READINESS (${safeData.readiness.length})</div>
                    <div id="list-READINESS" class="card-list"></div>
                </div>
                <div class="card" id="card-PROCUREMENT" onclick="selectSection('PROCUREMENT')" style="border-top: 3px solid var(--accent-green);">
                    <div class="card-header">2. PROCUREMENT (${safeData.procurement.length})</div>
                    <div id="list-PROCUREMENT" class="card-list"></div>
                </div>
                <div class="card" id="card-EXECUTION" onclick="selectSection('EXECUTION')" style="border-top: 3px solid var(--accent-blue);">
                    <div class="card-header">3. EXECUTION</div>
                    <div id="list-EXECUTION" class="card-list"></div>
                </div>
                <div class="card" id="card-COMMISSIONING" onclick="selectSection('COMMISSIONING')" style="border-top: 3px solid var(--accent-amber);">
                    <div class="card-header">4. COMMISSIONING</div>
                    <div id="list-COMMISSIONING" class="card-list"></div>
                </div>
            </div>

        </div>

        <div id="drawer-budget" class="drawer">
            <div class="drawer-handle" style="top: 20%; background: #34d399;" onclick="toggleDrawer('budget')">
                BUDGET
            </div>
            <div class="drawer-content">
                <h2 style="color:#34d399; margin-bottom:20px;">💰 MASTER BUDGET CONSUMPTION</h2>
                
                <div style="display:flex; gap:10px; margin-bottom:30px;">
                    <div style="flex:1; background:rgba(52, 211, 153, 0.1); padding:15px; border-radius:8px;">
                        <div class="mono small" style="color:#34d399;">TOTAL BUDGET</div>
                        <div style="font-size:20px; font-weight:bold; color:#fff;">NOK 234M</div>
                    </div>
                    <div style="flex:1; background:rgba(239, 68, 68, 0.1); padding:15px; border-radius:8px;">
                        <div class="mono small" style="color:#ef4444;">SPENT (EST)</div>
                        <div style="font-size:20px; font-weight:bold; color:#fff;">NOK 42M</div>
                    </div>
                </div>

                <div id="budget-list-container">
                    <div class="budget-row">
                        <div style="flex:1;">
                            <div style="color:#fff;">EPOD LV IT 1</div>
                            <div class="mono small" style="color:#94a3b8;">PRO-2140</div>
                        </div>
                        <div style="text-align:right;">
                            <div class="text-green">15% Used</div>
                            <div class="mono small">NOK 1.4M / 9.2M</div>
                        </div>
                    </div>
                    <div class="budget-bar"><div class="budget-fill" style="width: 15%;"></div></div>
                </div>
            </div>
        </div>

        <div id="drawer-wp" class="drawer" style="border-left-color: #f59e0b;">
            <div class="drawer-handle" style="top: 35%; background: #f59e0b;" onclick="toggleDrawer('wp')">
                WP SCOPE
            </div>
            <div class="drawer-content">
                <h2 style="color:#f59e0b; margin-bottom:20px;">📂 ACTIVE WORK PACKAGES</h2>
                <div id="wp-list-container">
                    <div class="mono" style="opacity:0.5;">No WPs loaded. Upload Zip to ingest.</div>
                </div>
            </div>
        </div>

        <script>
            function toggleDrawer(id) {
                const el = document.getElementById('drawer-' + id);
                const isOpen = el.classList.contains('open');
                
                // Close all first
                document.querySelectorAll('.drawer').forEach(d => d.classList.remove('open'));
                
                // Toggle requested one
                if (!isOpen) el.classList.add('open');
            }
        </script>

        <script>window.DASHBOARD_DATA = ${JSON.stringify(safeData)};</script>
        
        ${js}
    </body>
    </html>
    `;
};