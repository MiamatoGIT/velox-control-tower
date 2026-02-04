export const uiJS = `
    /** UI RENDERER - FULL MERGE */
    const UI = {
        toggleDrawer(id) {
            const drawer = document.getElementById('drawer-' + id);
            if (!drawer) return;
            const isOpen = drawer.classList.contains('open');
            document.querySelectorAll('.drawer').forEach(d => d.classList.remove('open'));
            if (!isOpen) drawer.classList.add('open');
        },

        // --- MINI RENDERERS (SIDEBARS) ---
        renderStrategyMini(strategy) {
            if(!strategy) return '<div class="mono small opacity-50">No Strategy</div>';
            return \`
                <div style="padding:15px;">
                    <div style="font-size:24px; margin-bottom:5px;">🎯</div>
                    <div class="mono small" style="color:#cbd5e1; line-height:1.4;">\${strategy.focus || "No Focus Set"}</div>
                </div>\`;
        },

        renderHSEMini(hse) {
            if(!hse) return '<div class="mono small opacity-50">No HSE Data</div>';
            const statusColor = hse.incidents > 0 ? '#ef4444' : '#34d399';
            return \`
                <div style="padding:15px;">
                    <div class="flex" style="align-items:center; gap:10px; margin-bottom:10px;">
                        <span style="font-size:18px;">🛡️</span>
                        <span style="font-weight:bold; color:\${statusColor}; font-size:12px;">\${hse.incidents === 0 ? 'SAFE' : 'INCIDENT'}</span>
                    </div>
                    <div class="mono small" style="color:#94a3b8;">\${hse.peopleOnSite || 0} People On Site</div>
                </div>\`;
        },

        renderCompaniesMini(companies) {
            const count = companies ? companies.length : 0;
            return \`
                <div style="padding:15px; display:flex; align-items:center; gap:10px;">
                    <span style="font-size:18px;">🏗️</span>
                    <div>
                        <div style="color:#f59e0b; font-weight:bold; font-size:14px;">\${count}</div>
                        <div class="mono small" style="color:#64748b;">Active Partners</div>
                    </div>
                </div>\`;
        },

        // --- MAIN STAGE RENDERERS ---
        renderStrategy() { 
            return \`<div style="padding:40px; display:flex; flex-direction:column; justify-content:center; height:100%; position:relative;">
                <div style="position:absolute; top:20px; right:20px; opacity:0.1; font-size:100px;">🎯</div>
                <div class="mono" style="color:#38bdf8; margin-bottom:20px; letter-spacing:2px; font-weight:bold;">CURRENT FOCUS</div>
                <div style="font-size: 32px; font-weight: 800; color: #fff; line-height:1.3;">"\${STATE.data.strategy?.focus || 'No Strategy Data'}"</div>
                <div style="margin-top:40px; border-top:1px solid rgba(255,255,255,0.1); padding-top:20px;">
                    <div class="mono small" style="color:#64748b;">PREPARED BY</div>
                    <div class="mono">\${STATE.data.meta?.preparedBy || 'Unknown'}</div>
                </div>
            </div>\`; 
        },

        renderHSE() {
            const h = STATE.data.hse || {};
            const kpis = [
                { icon: "⏰", label: "SITE HOURS", val: h.workingHours || 0, color: "#fff" },
                { icon: "👷", label: "MANPOWER", val: h.peopleOnSite || 0, color: "#38bdf8" },
                { icon: "🏥", label: "INCIDENTS", val: h.incidents || 0, color: h.incidents > 0 ? "#ef4444" : "#34d399" },
                { icon: "🗣️", label: "TOOLBOXES", val: h.toolboxes || 0, color: "#f59e0b" },
                { icon: "📝", label: "DRA's", val: h.dra || 0, color: "#fff" },
                { icon: "👀", label: "OBSERVATIONS", val: h.observations || 0, color: "#fff" }
            ];
            const html = kpis.map(k => \`
                <div style="background:rgba(255,255,255,0.05); padding:20px; border-radius:8px;">
                    <div style="font-size:24px; margin-bottom:5px;">\${k.icon}</div>
                    <div class="mono small" style="color:#94a3b8;">\${k.label}</div>
                    <div style="font-size:22px; font-weight:bold; color:\${k.color};">\${k.val}</div>
                </div>
            \`).join('');
            return \`<div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:15px; align-content:center; height:100%;">\${html}</div>\`;
        },

        renderCompanies() {
            const comps = STATE.data.externalCompanies || [];
            if(comps.length === 0) return '<div class="mono" style="opacity:0.5; padding:20px;">No External Partners Listed</div>';
            
            const html = comps.map(c => \`
                <div class="list-item" style="border-left-color: #f59e0b; padding:15px; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <div style="font-size:14px; font-weight:bold; color:#fff;">\${c.name}</div>
                        <div class="mono small" style="color:#94a3b8;">\${c.role}</div>
                    </div>
                    <div class="mono" style="color:#f59e0b; font-weight:bold;">\${c.personnel} Pers</div>
                </div>
            \`).join('');
            return \`<div style="padding:20px; overflow-y:auto; height:100%;">\${html}</div>\`;
        },

        // --- TOOLTIPS & ALERTS (RESTORED) ---
        createAlertBadges(alerts) {
            if (!alerts || alerts.length === 0) return '';
            const badges = alerts.map(a => {
                const isAck = !!a.ackBy;
                const cssClass = isAck ? 'badge-ack has-tooltip' : 'mini-alert has-tooltip';
                const text = isAck ? \`✔ \${a.ackBy}\` : '⚠️ ISSUE';
                
                const reasonSafe = (a.reason || "Unknown").replace(/"/g, "'");
                const ackSafe = (a.ackBy || "").replace(/"/g, "'");
                const tooltipText = isAck 
                    ? \`⛔ ISSUE: \${reasonSafe}\\n👮 ACK BY: \${ackSafe}\` 
                    : \`⛔ ISSUE: \${reasonSafe}\\n⏳ WAITING FOR ACK\`;

                return \`<span class="\${cssClass}" data-tooltip="\${tooltipText}">\${text}</span>\`;
            }).join('');
            return \`<div style="display:flex; flex-wrap:wrap; gap:4px; margin-top:6px;">\${badges}</div>\`;
        },

        renderList(items, type, viewMode) {
            if (!items || items.length === 0) return '<div class="mono small" style="opacity:0.4; padding:15px;">No Data</div>';
            
            return items.map(item => {
                let border = '#334155'; 
                let textCol = '#94a3b8';
                
                if (type === 'READINESS') { border = '#ef4444'; textCol = '#ef4444'; }
                if (type === 'PROCUREMENT') { border = '#34d399'; textCol = '#34d399'; }
                if (type === 'EXECUTION') { border = '#38bdf8'; textCol = '#38bdf8'; }
                if (type === 'COMMISSIONING') { border = '#f59e0b'; textCol = '#f59e0b'; }

                // Alert Override
                if (item.alerts && item.alerts.length > 0) border = '#ef4444';

                let title = item.material || item.wpId || item.description || "Item";
                let sub = item.activityName || "";
                let status = item.status || "";

                if(type === 'PROCUREMENT') {
                    status = item.expectedDate || item.siteArrival || item.status || "Pending";
                }
                else if(type === 'READINESS') {
                     sub = item.description || ""; 
                     status = item.readinessStatus || "0%"; 
                }
                else if(type === 'EXECUTION') {
                    sub = item.description || "";
                    status = item.actualPercent ? item.actualPercent + '%' : (item.status || "Pending");
                }
                else if(type === 'COMMISSIONING') {
                    title = item.description || item.system || "System";
                    const levels = [];
                    if(item.level1) levels.push("L1");
                    if(item.level2) levels.push("L2");
                    if(item.level3) levels.push("L3");
                    if(item.level4) levels.push("L4");
                    sub = levels.length ? levels.join(' -> ') : "Not Started";
                    status = item.level5 ? "L5 DONE" : "WIP";
                }

                const alertsHtml = UI.createAlertBadges(item.alerts);

                if(viewMode === 'MINI') {
                    return \`<div class="list-item" style="border-left-color: \${border};">
                        <div class="flex justify-between">
                            <div style="overflow:hidden; padding-right:5px;">
                                <div style="font-weight:bold; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">\${title}</div>
                                <div class="mono small" style="color:#64748b;">\${sub}</div>
                                \${alertsHtml}
                            </div>
                            <div class="mono small" style="color:\${textCol}; font-weight:bold; white-space:nowrap;">\${status}</div>
                        </div>
                    </div>\`;
                } else {
                    return \`<div class="detail-item" style="border-left:4px solid \${border}; background:rgba(0,0,0,0.2);">
                        <div>
                            <div style="font-weight:bold; font-size:14px;">\${title}</div>
                            <div class="mono small">\${sub}</div>
                            \${alertsHtml}
                        </div>
                        <div></div>
                        <div class="mono" style="color:\${textCol}; text-align:right;">\${status}</div>
                    </div>\`;
                }
            }).join('');
        },

        // --- DRAWERS & MODALS ---
        renderBudget() {
            const budget = STATE.data.budget || [];
            const container = document.getElementById('budget-list-container');
            if (!container) return;

            const listHtml = budget.map(item => {
                const totalQty = item.total_qty || 1;
                const totalMoney = item.total_budget || 0;
                const qtyInstall = item.qty_installed || 0;
                const pctInstall = Math.min((qtyInstall / totalQty) * 100, 100);
                const qtyStock = item.qty_stock || 0;
                const pctStock = Math.min((qtyStock / totalQty) * 100, 100 - pctInstall);
                const pctBudgeted = Math.max(0, 100 - pctInstall - pctStock);

                return \`<div class="budget-row">
                        <div class="flex justify-between" style="margin-bottom:5px;">
                            <div style="max-width: 65%;">
                                <div style="color:#fff; font-weight:bold; font-size:12px; letter-spacing:0.5px;">\${item.description}</div>
                                <div class="mono small text-blue">\${item.cost_code}</div>
                            </div>
                            <div class="text-right">
                                <div class="mono small" style="color:#94a3b8;">\${formatMoney(totalMoney)}</div>
                                <div style="font-size:10px; color:#fff;">\${Math.round(pctInstall)}% DONE</div>
                            </div>
                        </div>
                        <div class="progress-track" title="Green: Installed | Amber: Stock | Gray: Remaining">
                            <div class="prog-bar bar-installed" style="width: \${pctInstall}%;"></div>
                            <div class="prog-bar bar-stock" style="width: \${pctStock}%;"></div>
                            <div class="prog-bar bar-budgeted" style="width: \${pctBudgeted}%;"></div>
                        </div>
                        <div class="flex justify-between mono small" style="margin-top:4px; opacity:0.6;">
                            <span>\${qtyInstall} INST</span>
                            <span>\${qtyStock} STK</span>
                            <span>\${Math.round(totalQty - qtyInstall - qtyStock)} REM</span>
                        </div>
                    </div>\`;
            }).join('');
            container.innerHTML = budget.length ? listHtml : '<div class="mono" style="opacity:0.5; padding:20px;">No Budget Data Loaded</div>';
        },

        renderWPs() {
            const wps = STATE.data.wps || [];
            const container = document.getElementById('wp-list-container');
            if(!container) return;
            const html = wps.map(wp => \`
                <div class="list-item" style="border-left: 2px solid var(--neon-amber); padding:15px; background:rgba(245, 158, 11, 0.05);">
                    <div style="font-size:14px; font-weight:bold; color:#fff; margin-bottom:5px;">\${wp.wp_id}</div>
                    <div class="mono" style="color:#94a3b8; font-size:11px;">\${wp.description}</div>
                    <div style="margin-top:10px; display:flex; gap:10px;">
                        <span class="badge-ack" style="border-color:var(--neon-amber); color:var(--neon-amber);">ACTIVE</span>
                        <span class="mono small" style="color:#64748b;">\${wp.docs_path ? '📂 Docs Loaded' : ''}</span>
                    </div>
                </div>\`).join('');
            container.innerHTML = wps.length ? html : '<div class="mono" style="opacity:0.5;">No WPs loaded.</div>';
        },

        showModal(activeBlocker) {
            const modal = document.getElementById('alert-modal');
            if (activeBlocker) {
                document.getElementById('modal-content').innerHTML = \`
                    <div style="font-size:60px; margin-bottom:10px;">🚨</div>
                    <h2 style="color:#ef4444; font-size:32px; margin:0 0 10px 0;">CRITICAL BLOCKER</h2>
                    <div class="mono" style="font-size:20px; font-weight:bold; color:#fff; margin-bottom:20px;">\${activeBlocker.blocker_reason}</div>
                    <div style="background:rgba(255,255,255,0.05); padding:20px; border-radius:8px; text-align:left; margin-bottom:20px;">
                        <div class="mono" style="font-size:11px; color:#94a3b8;">REPORTED BY \${activeBlocker.user_name}</div>
                        <div class="mono" style="color:#38bdf8;">WP: \${activeBlocker.work_package_id}</div>
                    </div>
                    <button onclick="window.acknowledge(\${activeBlocker.id})" 
                        style="background:#ef4444; border:none; padding:12px 30px; color:#fff; font-weight:bold; border-radius:4px; cursor:pointer;">
                        ACKNOWLEDGE
                    </button>\`;
                modal.style.display = 'flex';
            } else { modal.style.display = 'none'; }
        },
        closeModal() { document.getElementById('alert-modal').style.display='none'; }
    };
`;