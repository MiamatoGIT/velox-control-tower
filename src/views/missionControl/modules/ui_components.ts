export const uiComponentsJS = `
    /** UI COMPONENTS - v9.4 FINAL MERGE (RICH DATA + FULL LOGIC) */
    
    // 1. CSS INJECTION (Includes Tooltips, Glass, Grid, & Partner Lists)
    const tooltipStyle = \`
        <style>
            .has-tooltip { position: relative; cursor: help; }
            .has-tooltip:hover::after {
                content: attr(data-tooltip); position: absolute; bottom: 140%; left: 50%; 
                transform: translateX(-50%); background: rgba(0,0,0,0.9); color: #fff; 
                padding: 6px 10px; border-radius: 4px; font-size: 11px; white-space: nowrap; 
                border: 1px solid #ef4444; z-index: 999; pointer-events: none;
            }
            .has-tooltip:hover::before {
                content: ''; position: absolute; bottom: 120%; left: 50%; transform: translateX(-50%);
                border-width: 5px; border-style: solid;
                border-color: #ef4444 transparent transparent transparent;
                z-index: 999;
            }
            .glass-item { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); transition: transform 0.2s, background 0.2s; }
            .glass-item:hover { background: rgba(255, 255, 255, 0.06); transform: translateX(4px); }
            .glass-alert { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); backdrop-filter: blur(15px); animation: pulse-border 2s infinite; }
            @keyframes pulse-border { 0% { border-color: rgba(239, 68, 68, 0.3); } 50% { border-color: rgba(239, 68, 68, 0.6); } 100% { border-color: rgba(239, 68, 68, 0.3); } }
            .btn-ack:hover { background: #ef4444 !important; box-shadow: 0 0 15px #ef4444; color: #000 !important; }
            
            /* RICH HSE GRID LAYOUT */
            .hse-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 12px; }
            .hse-stat { background: rgba(255,255,255,0.05); padding: 8px; border-radius: 6px; text-align: center; border: 1px solid rgba(255,255,255,0.05); }
            .hse-val { font-family: 'JetBrains Mono'; font-weight: bold; color: #fff; font-size: 14px; }
            .hse-label { font-size: 9px; color: #94a3b8; letter-spacing: 0.5px; margin-top: 2px; }

            /* RICH PARTNER LIST LAYOUT */
            .partner-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
            .partner-row:last-child { border-bottom: none; }
            .worker-badge { background: #f59e0b; color: #000; font-weight: bold; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-family: 'JetBrains Mono'; }
        </style>
    \`;

    if (!document.getElementById('tooltip-css')) {
        const styleEl = document.createElement('div');
        styleEl.id = 'tooltip-css';
        styleEl.innerHTML = tooltipStyle;
        document.head.appendChild(styleEl);
    }

    // 2. DEFINE COMPONENTS
    const UI_Components = {
        
        renderStrategyMini(strategy) {
            const focus = strategy?.focus || "No Strategy Set";
            return '<div style="padding:20px; height:100%; display:flex; flex-direction:column; justify-content:center;">' +
                   '<div style="font-size:28px; margin-bottom:8px; opacity:0.8;">🎯</div>' +
                   '<div class="mono" style="color:#38bdf8; font-weight:bold; font-size:9px; letter-spacing:1px; margin-bottom:6px; text-transform:uppercase;">Current Focus</div>' +
                   '<div class="mono small" style="color:#e2e8f0; font-size:11px; line-height:1.4;">' + focus + '</div>' +
                   '</div>';
        },

        // ✅ RICH HSE GRID (Preserved)
        renderHSEMini(hse) {
            const safe = (hse?.incidents === 0);
            const statusColor = safe ? '#34d399' : '#ef4444';
            const statusText = safe ? 'SAFE' : 'INCIDENT';
            const people = hse?.peopleOnSite || 0;
            const hours = hse?.workingHours || "7am - 7pm";

            const toolboxes = hse?.toolboxes || 0;
            const dra = hse?.dra || 0;
            const observations = hse?.observations || 0;

            return \`
                <div style="padding:20px; height:100%; display:flex; flex-direction:column;">
                    <div class="flex" style="justify-content:space-between; align-items:center; margin-bottom:10px;">
                        <span style="font-size:22px;">🛡️</span>
                        <div class="flex-col" style="text-align:right;">
                            <span style="font-weight:bold; color:\${statusColor}; font-size:12px; letter-spacing:1px; border:1px solid \${statusColor}; padding:2px 6px; border-radius:4px;">\${statusText}</span>
                            <span class="mono" style="font-size:9px; color:#64748b; margin-top:4px;">\${hours}</span>
                        </div>
                    </div>
                    
                    <div class="mono" style="color:#94a3b8; font-size:20px; font-weight:bold; margin-bottom:12px;">
                        \${people} <span style="font-size:10px; color:#64748b; font-weight:normal;">ON SITE</span>
                    </div>

                    <div class="hse-grid">
                        <div class="hse-stat">
                            <div class="hse-val">\${toolboxes}</div>
                            <div class="hse-label">TOOLBOX</div>
                        </div>
                        <div class="hse-stat">
                            <div class="hse-val">\${dra}</div>
                            <div class="hse-label">DRA</div>
                        </div>
                        <div class="hse-stat" style="grid-column: span 2;">
                            <div class="hse-val">\${observations}</div>
                            <div class="hse-label">OBSERVATIONS</div>
                        </div>
                    </div>
                </div>
            \`;
        },

        // ✅ RICH PARTNERS LIST (Preserved)
        renderCompaniesMini(companies) {
            const count = companies ? companies.length : 0;
            
            const listHtml = companies && companies.length > 0 
                ? companies.slice(0, 3).map(c => \`
                    <div class="partner-row">
                        <div style="display:flex; flex-direction:column;">
                            <span style="font-size:11px; color:#fff; font-weight:bold;">\${c.name}</span>
                            <span style="font-size:9px; color:#64748b;">\${c.role ? c.role.substring(0, 20) : 'General'}</span>
                        </div>
                        <span class="worker-badge">👤 \${c.personnel}</span>
                    </div>
                  \`).join('')
                : '<div class="mono" style="font-size:10px; opacity:0.5;">No active partners</div>';

            return \`
                <div style="padding:20px; height:100%; display:flex; flex-direction:column;">
                    <div class="flex" style="align-items:center; gap:10px; margin-bottom:15px;">
                        <span style="font-size:22px;">🏗️</span>
                        <div>
                            <div style="color:#f59e0b; font-weight:bold; font-size:16px; line-height:1;">\${count} PARTNERS</div>
                            <div class="mono small" style="color:#94a3b8; font-size:9px; letter-spacing:0.5px;">ACTIVE ON SITE</div>
                        </div>
                    </div>
                    <div style="flex:1; overflow-y:auto;">
                        \${listHtml}
                    </div>
                </div>
            \`;
        },

        // ✅ RESTORED: Full List Logic (Ack Button + Ack Text)
        renderList(items, type, mode = 'MINI') {
            if (!items || items.length === 0) return '<div class="mono" style="padding:20px; opacity:0.3; text-align:center;">NO DATA SIGNAL</div>';

            return items.map(item => {
                const isBlocked = (item.status === 'BLOCKED' || item.blocker_reason);
                const safeId = typeof item.id === 'string' ? "\\\\'" + item.id + "\\\\'" : item.id;
                const glassClass = isBlocked ? 'glass-alert' : 'glass-item';
                const icon = isBlocked ? '🛑' : '✅';
                const textColor = isBlocked ? '#ef4444' : '#fff';

                return \`
                <div class="\${glassClass}" style="margin-bottom:12px; padding:16px; border-radius:12px;">
                    <div class="flex justify-between" style="margin-bottom:8px;">
                        <div style="font-weight:900; color:\${textColor}; font-size:11px; text-transform:uppercase;">
                            \${icon} \${item.workPackage || item.work_package_id || 'GENERAL'}
                        </div>
                        <div class="mono" style="font-size:10px; opacity:0.5;">\${item.timestamp ? item.timestamp.substring(11, 16) : ''}</div>
                    </div>
                    <div style="font-size:13px; color:rgba(255,255,255,0.85); line-height:1.5; margin-bottom:12px;">
                        \${item.blocker_reason || item.description || item.comments || 'Validating...'}
                    </div>
                    <div class="flex justify-between" style="align-items:center;">
                        <div class="mono" style="font-size:10px; color:#38bdf8;">USR: \${(item.user_name || item.user || 'SYSTEM').toUpperCase()}</div>
                        
                        \${isBlocked && !item.acknowledged_by ? \`
                            <button onclick="window.acknowledge(\${safeId})" 
                                class="btn-ack"
                                style="background:rgba(239, 68, 68, 0.2); border:1px solid #ef4444; color:#fff; 
                                       padding:4px 10px; border-radius:4px; font-size:9px; cursor:pointer; 
                                       font-family:'JetBrains Mono'; font-weight:bold;">
                                ACKNOWLEDGE
                            </button>
                        \` : ''}
                        
                        \${item.acknowledged_by ? \`
                            <div class="mono" style="font-size:9px; color:#34d399; font-weight:bold;">
                                ✓ ACK BY \${item.acknowledged_by}
                            </div>
                        \` : ''}
                    </div>
                </div>\`;
            }).join('');
        },

        // ✅ RESTORED: Alert Badges Helper
        createAlertBadges(alerts) { 
            if (!alerts || alerts.length === 0) return '';
            return alerts.map(a => {
                const isAck = !!a.acknowledged_by;
                const reason = a.blocker_reason || a.reason || "Field Issue";
                const tooltipText = "⛔ " + reason.replace(/"/g, "'");
                
                const style = isAck 
                    ? 'border:1px solid #34d399; color:#34d399; background:rgba(52, 211, 153, 0.1);' 
                    : 'border:1px solid #ef4444; color:#ef4444; background:rgba(239, 68, 68, 0.15); animation:blink 1.5s infinite;';
                
                const icon = isAck ? '✔' : '⚠️';
                return '<span class="has-tooltip" data-tooltip="' + tooltipText + '" style="display:inline-flex; align-items:center; gap:4px; padding:2px 6px; border-radius:4px; font-size:9px; font-weight:bold; ' + style + '">' + icon + '</span>';
            }).join('');
        }
    };

    // 3. EXPOSE TO WINDOW
    window.UI_Components = UI_Components;
    window.UI = window.UI || {};
    window.UI.renderStrategy = UI_Components.renderStrategyMini;
    window.UI.renderHSE = UI_Components.renderHSEMini;
    window.UI.renderCompanies = UI_Components.renderCompaniesMini;
    window.UI.renderList = UI_Components.renderList;
    window.UI.createAlertBadges = UI_Components.createAlertBadges;

    console.log("✅ UI COMPONENTS REGISTERED (RICH HSE/PARTNERS + FULL FEATURES)");
`;