export const js = `
<script>
    const DATA = window.DASHBOARD_DATA;

    // --- 1. SMART RENDERER (Mini vs Detail) ---
    const renderList = (items, type, viewMode = 'MINI') => {
        if (!items || items.length === 0) return '<div class="mono" style="opacity:0.5; padding:20px;">No data available</div>';
        
        return items.map(item => {
            // -- COLORS --
            let border = '#334155';
            let statusColor = '#94a3b8';
            if (type === 'PROCUREMENT') { border = '#34d399'; statusColor = '#34d399'; } 
            else if (type === 'READINESS') { border = '#ef4444'; statusColor = '#ef4444'; } 
            else if (type === 'EXECUTION') { border = '#38bdf8'; statusColor = '#38bdf8'; }

            // -- DATA EXTRACTION --
            // Handle both PDF data structure AND Live Alert structure
            const title = item.material || item.wpId || item.description || "Unknown";
            const status = item.status || item.readinessStatus || (item.actualPercent ? item.actualPercent + '%' : "Pending");
            
            const date = item.expectedDate || item.siteArrival || "N/A";
            const sub = item.activityName || item.technicalSpecs || "";
            const extra = item.contractType || item.drawingsStatus || ""; 

            // -- ALERT CHECK (EXECUTION ONLY) --
            let alertBadge = '';
            
            // ✅ CHANGE: Only check for alerts inside the EXECUTION box
            if (type === 'EXECUTION') {
                const hasAlert = DATA.liveAlerts && DATA.liveAlerts.find(a => 
                    title.includes(a.work_package_id) || (a.work_package_id && a.work_package_id.includes(title))
                );
                
                if (hasAlert) {
                    border = '#ef4444'; // Red Border for Blockers
                    
                    const reasonText = hasAlert.blocker_reason.length > 20 
                        ? hasAlert.blocker_reason.substring(0, 20) + '...' 
                        : hasAlert.blocker_reason;

                    const reason = viewMode === 'MINI' ? '⚠️ BLOCKER' : '⚠️ ' + reasonText;
                    alertBadge = \`<span class="mini-alert">\${reason}</span>\`;
                }
            }

            // -- RENDER HTML --
            if (viewMode === 'MINI') {
                return \`
                    <div class="list-item" style="border-left-color: \${border};">
                        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                            <span style="font-weight:700; color:#fff;">\${title.substring(0,25)}...</span>
                            <span class="mono" style="color:\${statusColor}; font-size:10px;">\${status}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between;">
                            <div class="mono" style="font-size:9px; color:#64748b;">\${alertBadge}</div>
                        </div>
                    </div>
                \`;
            } else {
                // DETAIL VIEW
                return \`
                    <div class="detail-item" style="border-left: 4px solid \${border}; background: rgba(0,0,0,0.2);">
                        <div>
                            <div style="font-size:18px; font-weight:bold; color:#fff; margin-bottom:5px;">\${title}</div>
                            <div class="mono" style="color:#94a3b8; font-size:12px;">\${sub}</div>
                            \${alertBadge ? \`<div style="margin-top:10px;">\${alertBadge}</div>\` : ''}
                        </div>
                        <div class="mono text-blue">\${date}</div>
                        <div class="mono" style="color:#cbd5e1;">\${extra}</div>
                        <div style="font-weight:bold; color:\${statusColor}; text-align:right;">\${status}</div>
                    </div>
                \`;
            }
        }).join('');
    };

    // --- 2. CLICK HANDLER ---
    function selectSection(key) {
        document.querySelectorAll('.card').forEach(el => el.classList.remove('active'));
        const clickedCard = document.getElementById('card-' + key);
        if(clickedCard) clickedCard.classList.add('active');

        const stage = document.getElementById('main-stage-content');
        const title = document.getElementById('main-stage-title');
        
        // A. SIDEBAR
        if (key === 'STRATEGY') {
            title.innerText = "EXECUTIVE STRATEGY";
            stage.innerHTML = \`
                <div style="padding: 40px; display:flex; flex-direction:column; justify-content:center; height:100%;">
                    <div class="mono" style="color:#38bdf8; margin-bottom:20px;">CURRENT FOCUS GOAL</div>
                    <div style="font-size: 36px; font-weight: 800; line-height: 1.4; color: #fff;">
                        "\${DATA.strategy.focus}"
                    </div>
                    <div style="margin-top:40px; border-top:1px solid rgba(255,255,255,0.1); padding-top:20px;">
                        <div class="mono" style="color:#94a3b8; font-size:12px;">AUTHOR: \${DATA.meta.preparedBy}</div>
                        <div class="mono" style="color:#94a3b8; font-size:12px;">DATE: \${DATA.meta.date}</div>
                    </div>
                </div>
            \`;
            return;
        }
        if (key === 'HSE') {
            title.innerText = "HEALTH, SAFETY & ENVIRONMENT";
            stage.innerHTML = \`
                <div style="display:flex; height:100%; align-items:center; justify-content:space-around;">
                    <div style="text-align:center; padding:40px; background:rgba(34, 197, 94, 0.1); border-radius:20px; border:1px solid #22c55e;">
                        <div style="font-size: 80px; margin-bottom:20px;">🛡️</div>
                        <div style="font-size: 32px; font-weight:900; color:#22c55e;">SAFE SITE</div>
                        <div class="mono" style="margin-top:10px; font-size:14px;">\${DATA.hse.incidents}</div>
                    </div>
                    <div style="text-align:center; padding:40px; background:rgba(56, 189, 248, 0.1); border-radius:20px; border:1px solid #38bdf8;">
                        <div style="font-size: 80px; margin-bottom:20px;">📋</div>
                        <div style="font-size: 32px; font-weight:900; color:#38bdf8;">COMPLIANT</div>
                        <div class="mono" style="margin-top:10px; font-size:14px;">\${DATA.hse.inspections}</div>
                    </div>
                </div>
            \`;
            return;
        }

        // B. LISTS (Dynamic Population)
        let dataFn = [];
        let titleText = "";
        
        if(key === 'READINESS') { dataFn = DATA.readiness; titleText = "WORK PACKAGE READINESS LOG"; }
        if(key === 'PROCUREMENT') { dataFn = DATA.procurement; titleText = "PROCUREMENT MASTER TRACKER"; }
        if(key === 'COMMISSIONING') { dataFn = [DATA.commissioning]; titleText = "COMMISSIONING STATUS"; }
        
        // Special logic for EXECUTION to include Live Blockers
        if(key === 'EXECUTION') { 
            dataFn = getExecutionItems(); 
            titleText = "EXECUTION & PROGRESS"; 
        }

        title.innerText = titleText;
        stage.innerHTML = renderList(dataFn, key, 'DETAIL'); 
    }

    // Helper to merge PDF Main Activity + Live Blockers
    function getExecutionItems() {
        let items = DATA.mainActivity ? [DATA.mainActivity] : [];
        
        if (DATA.liveAlerts) {
            DATA.liveAlerts.forEach(alert => {
                // Avoid duplicates if the main activity is the one blocked
                const isAlreadyThere = items.find(item => 
                    (item.description && item.description.includes(alert.work_package_id)) ||
                    (item.wpId && item.wpId.includes(alert.work_package_id))
                );
                
                if (!isAlreadyThere) {
                    // Create a pseudo-item for the blocked WP so it appears in the list
                    items.push({
                        description: alert.work_package_id, 
                        status: "BLOCKED",
                        actualPercent: "STOPPED",
                        wpId: alert.work_package_id
                    });
                }
            });
        }
        return items;
    }

    // --- 3. AUTO-POPULATE ---
    document.addEventListener('DOMContentLoaded', () => {
        // Strategy
        document.getElementById('strategy-content').innerHTML = \`
            <div style="font-size: 13px; line-height: 1.5; color:#cbd5e1; padding:10px;">\${DATA.strategy.focus}</div>
        \`;

        // HSE (Sidebar)
        document.getElementById('hse-content').innerHTML = \`
             <div class="flex" style="flex-direction:column; gap:15px; padding:10px;">
                <div style="display:flex; align-items:center; gap:15px;">
                    <div style="font-size: 24px;">🛡️</div>
                    <div><div class="text-green" style="font-weight:bold;">SAFE</div></div>
                </div>
                <div style="display:flex; align-items:center; gap:15px;">
                    <div style="font-size: 24px;">📋</div>
                    <div><div class="text-blue" style="font-weight:bold;">INSPECTED</div></div>
                </div>
             </div>
        \`;

        // Lists
        document.getElementById('list-READINESS').innerHTML = renderList(DATA.readiness, 'READINESS', 'MINI');
        document.getElementById('list-PROCUREMENT').innerHTML = renderList(DATA.procurement, 'PROCUREMENT', 'MINI');
        document.getElementById('list-COMMISSIONING').innerHTML = renderList([DATA.commissioning], 'COMMISSIONING', 'MINI');
        
        // Execution (Merged)
        const execItems = getExecutionItems();
        document.getElementById('list-EXECUTION').innerHTML = renderList(execItems, 'EXECUTION', 'MINI');

        setTimeout(checkAlerts, 1000);
        selectSection('STRATEGY'); 
    });

    // --- 4. POPUP ---
    function checkAlerts() {
        if (DATA.liveAlerts && DATA.liveAlerts.length > 0) {
            const modal = document.getElementById('alert-modal');
            const content = document.getElementById('modal-content');
            const alert = DATA.liveAlerts[0];
            
            content.innerHTML = \`
                <div style="font-size:60px; margin-bottom:10px;">🚨</div>
                <h2 style="color:#ef4444; font-size:32px; margin:0 0 10px 0;">CRITICAL BLOCKER</h2>
                <div class="mono" style="font-size:20px; font-weight:bold; color:#fff; margin-bottom:20px;">\${alert.blocker_reason}</div>
                <div style="background:rgba(255,255,255,0.05); padding:20px; border-radius:8px; text-align:left; margin-bottom:20px;">
                    <div class="mono" style="font-size:11px; color:#94a3b8;">REPORTED BY \${alert.user_name}</div>
                    <div class="mono" style="color:#38bdf8;">WP: \${alert.work_package_id}</div>
                </div>
                <button onclick="document.getElementById('alert-modal').style.display='none'" 
                    style="background:#ef4444; border:none; padding:12px 30px; color:#fff; font-weight:bold; border-radius:4px; cursor:pointer;">ACKNOWLEDGE</button>
            \`;
            modal.style.display = 'flex';
        }
    }
</script>
`;