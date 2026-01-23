export const js = `
<script>
    /**
     * VELOX MISSION CONTROL - CLIENT SCRIPT v4.5
     * Fix: Readiness/Work Package columns (IFC & Progress) now display correctly.
     */

    const CONFIG = {
        POLL_INTERVAL: 120000, 
        COLORS: {
            EXECUTION: '#38bdf8',
            READINESS: '#ef4444',
            PROCUREMENT: '#34d399',
            DEFAULT: '#334155',
            TEXT_SUB: '#94a3b8'
        }
    };

    const STATE = {
        data: window.DASHBOARD_DATA || {},
        activeSection: 'STRATEGY'
    };

    // --- API SERVICE ---
    const API = {
        async fetchLiveUpdates() {
            try {
                const res = await fetch('/api/live');
                const liveData = await res.json();
                STATE.data.liveAlerts = liveData.alerts;
                App.updateLiveViews();
            } catch (e) { console.error("Polling error", e); }
        },
        async acknowledge(id) {
            const user = prompt("Initials:", "ADMIN");
            if (!user) return;
            const alert = STATE.data.liveAlerts.find(a => a.id === id);
            if(alert) alert.acknowledged_by = user;
            UI.closeModal();
            await fetch('/api/ack', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ id, user })
            });
            API.fetchLiveUpdates();
        }
    };

    // --- LOGIC ---
    const Logic = {
        getExecutionItems() {
            let items = STATE.data.mainActivity ? [JSON.parse(JSON.stringify(STATE.data.mainActivity))] : [];
            const findItem = (wpId) => items.find(i => (i.description && i.description.includes(wpId)) || (i.wpId && i.wpId.includes(wpId)));

            if (STATE.data.liveAlerts) {
                STATE.data.liveAlerts.forEach(alert => {
                    const wpId = alert.work_package_id || "WP-GENERAL";
                    let item = findItem(wpId);
                    if (!item) {
                        item = { description: wpId, status: "BLOCKED", alerts: [] };
                        items.push(item);
                    }
                    if (!item.alerts) item.alerts = [];
                    item.alerts.push({
                        id: alert.id,
                        reason: alert.blocker_reason,
                        ackBy: alert.acknowledged_by,
                        user: alert.user_name
                    });
                    item.status = "BLOCKED";
                });
            }
            return items;
        },
        getDataForSection(key) {
            switch(key) {
                case 'READINESS': return STATE.data.readiness;
                case 'PROCUREMENT': return STATE.data.procurement;
                case 'COMMISSIONING': return [STATE.data.commissioning];
                case 'EXECUTION': return Logic.getExecutionItems();
                default: return [];
            }
        }
    };

    // --- UI RENDERER ---
    const UI = {
        getStyles(type, item) {
            let border = CONFIG.COLORS.DEFAULT;
            let text = CONFIG.COLORS.TEXT_SUB;
            if (type === 'PROCUREMENT') { border = CONFIG.COLORS.PROCUREMENT; text = border; }
            else if (type === 'READINESS') { border = CONFIG.COLORS.READINESS; text = border; }
            else if (type === 'EXECUTION') { border = CONFIG.COLORS.EXECUTION; text = border; }
            if (type === 'EXECUTION' && item.alerts && item.alerts.length > 0) border = CONFIG.COLORS.READINESS;
            return { border, text };
        },

        createAlertBadges(alerts) {
            if (!alerts || alerts.length === 0) return '';
            const badges = alerts.map(a => {
                const isAck = !!a.ackBy;
                const cssClass = isAck ? 'badge-ack has-tooltip' : 'mini-alert has-tooltip';
                const text = isAck ? \`✔ \${a.ackBy}\` : '⚠️ ISSUE';
                const tooltip = isAck ? \`data-tooltip="⛔ ISSUE: \${a.reason}\\n👮 ACK BY: \${a.ackBy}"\` : \`data-tooltip="⛔ ISSUE: \${a.reason}\\n⏳ WAITING FOR ACK"\`;
                return \`<span class="\${cssClass}" \${tooltip} style="margin-right:5px; cursor:help;">\${text}</span>\`;
            }).join('');
            return \`<div style="display:flex; flex-wrap:wrap; gap:4px; margin-top:6px;">\${badges}</div>\`;
        },

        renderList(items, type, viewMode) {
            if (!items || items.length === 0) return '<div class="mono" style="opacity:0.5; padding:20px;">No data available</div>';
            return items.map(item => {
                const style = UI.getStyles(type, item);
                const alertsHtml = UI.createAlertBadges(item.alerts);
                
                // --- 🛠️ DYNAMIC FIELD MAPPING ---
                let title = item.material || item.wpId || item.description || "Unknown";
                let subTitle = item.activityName || "";
                let centerText = item.expectedDate || item.siteArrival || "N/A";
                let rightText = item.status || "Pending";

                // SPECIFIC LOGIC FOR READINESS (WORK PACKAGES)
                if (type === 'READINESS') {
                    // PDF Data: { wpId, description, drawingsStatus, readinessStatus }
                    subTitle = item.description || "";             // e.g. "Earthing Mesh"
                    centerText = item.drawingsStatus || "N/A";     // e.g. "Ready to be sent..." (IFC)
                    rightText = item.readinessStatus || "0%";      // e.g. "80%" (Progress)
                } 
                // SPECIFIC LOGIC FOR EXECUTION
                else if (type === 'EXECUTION') {
                    rightText = item.actualPercent ? item.actualPercent + '%' : (item.status || "Pending");
                }

                // --- HTML GENERATION ---
                const content = \`
                    <div>
                        <div style="font-size:\${viewMode === 'DETAIL' ? '18px' : '11px'}; font-weight:bold; color:#fff; margin-bottom:5px;">\${title}</div>
                        <div class="mono" style="color:#94a3b8; font-size:\${viewMode === 'DETAIL' ? '12px' : '10px'};">\${subTitle}</div>
                        \${alertsHtml}
                    </div>\`;

                if (viewMode === 'MINI') {
                    return \`
                        <div class="list-item" style="border-left-color: \${style.border};">
                            <div style="display:flex; justify-content:space-between;">
                                \${content}
                                <span class="mono" style="color:\${style.text}; font-size:10px;">\${rightText}</span>
                            </div>
                        </div>\`;
                } else {
                    return \`
                        <div class="detail-item" style="border-left: 4px solid \${style.border}; background: rgba(0,0,0,0.2);">
                            \${content}
                            <div class="mono text-blue" style="font-size:12px; max-width: 40%;">\${centerText}</div>
                            <div style="font-weight:bold; color:\${style.text}; text-align:right;">\${rightText}</div>
                        </div>\`;
                }
            }).join('');
        },

        renderStrategy() {
            return \`
                <div style="padding: 40px; display:flex; flex-direction:column; justify-content:center; height:100%; position:relative;">
                    <div style="position:absolute; top:20px; right:20px; opacity:0.1; font-size:100px;">🎯</div>
                    <div class="mono" style="color:#38bdf8; margin-bottom:20px; letter-spacing:2px; font-weight:bold;">
                        CURRENT FOCUS GOAL
                    </div>
                    <div style="font-size: 36px; font-weight: 800; line-height: 1.4; color: #fff; text-shadow: 0 0 30px rgba(56, 189, 248, 0.2);">
                        "\${STATE.data.strategy.focus}"
                    </div>
                    <div style="margin-top:50px; border-top:1px solid rgba(255,255,255,0.1); padding-top:20px; display:flex; justify-content:space-between;">
                        <div>
                            <div class="mono" style="color:#64748b; font-size:10px;">PREPARED BY</div>
                            <div class="mono" style="color:#94a3b8; font-size:14px;">\${STATE.data.meta.preparedBy}</div>
                        </div>
                        <div style="text-align:right;">
                            <div class="mono" style="color:#64748b; font-size:10px;">REPORT DATE</div>
                            <div class="mono" style="color:#94a3b8; font-size:14px;">\${STATE.data.meta.date}</div>
                        </div>
                    </div>
                </div>\`;
        },

        renderHSE() {
            const h = STATE.data.hse;
            const kpis = [
                { icon: "⏰", label: "SITE HOURS", val: h.workingHours, color: "#fff" },
                { icon: "👷", label: "PEOPLE", val: h.peopleOnSite, color: "#38bdf8" },
                { icon: "🏥", label: "INCIDENTS", val: h.incidents, color: h.incidents > 0 ? "#ef4444" : "#34d399" },
                { icon: "🗣️", label: "TOOLBOXES", val: h.toolboxes, color: "#f59e0b" },
                { icon: "📝", label: "DRA's", val: h.dra, color: "#fff" },
                { icon: "👀", label: "OBSERVATIONS", val: h.observations, color: "#fff" },
                { icon: "🎓", label: "TRAINING", val: h.training, color: "#fff", width: "100%" }
            ];

            const gridHtml = kpis.map(k => \`
                <div style="background:rgba(255,255,255,0.05); padding:20px; border-radius:12px; border:1px solid rgba(255,255,255,0.05); \${k.width ? 'grid-column: 1 / -1;' : ''}">
                    <div style="font-size:24px; margin-bottom:10px;">\${k.icon}</div>
                    <div class="mono" style="color:#94a3b8; font-size:11px; margin-bottom:5px;">\${k.label}</div>
                    <div style="font-size:20px; font-weight:bold; color:\${k.color};">\${k.val}</div>
                </div>
            \`).join('');

            return \`<div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:15px; height:100%; align-content:center;">\${gridHtml}</div>\`;
        },

        renderCompanies() {
            const comps = STATE.data.externalCompanies || [];
            const warning = STATE.data.isExampleData 
                ? '<div class="mono" style="background:#f59e0b; color:#000; padding:5px 10px; font-size:10px; font-weight:bold; margin-bottom:15px; border-radius:4px; text-align:center;">⚠️ EXAMPLE DATA - WAITING FOR PDF SOURCE</div>'
                : '';

            const list = comps.map(c => \`
                <div class="list-item" style="border-left-color: #f59e0b; padding:15px;">
                    <div style="font-size:16px; font-weight:bold; color:#fff; margin-bottom:5px;">\${c.name}</div>
                    <div style="display:flex; justify-content:space-between;">
                        <span class="mono" style="color:#94a3b8; font-size:12px;">\${c.role}</span>
                        <span class="mono" style="color:#f59e0b; font-size:12px;">\${c.personnel} Pers</span>
                    </div>
                </div>
            \`).join('');

            return \`<div style="padding:20px;">\${warning}\${list}</div>\`;
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
        closeModal: () => document.getElementById('alert-modal').style.display = 'none'
    };

    // --- APP CONTROLLER ---
    const App = {
        init() {
            // Sidebar Mini-Previews
            document.getElementById('strategy-content').innerHTML = \`
                <div style="padding:10px;">
                    <div style="font-size:20px; margin-bottom:5px;">🎯</div>
                    <div style="color:#cbd5e1; font-size:11px; line-height:1.4;">\${STATE.data.strategy.focus}</div>
                </div>\`;
            
            document.getElementById('hse-content').innerHTML = \`
                <div class="flex" style="flex-direction:column; gap:10px; padding:10px;">
                    <div class="flex" style="align-items:center; gap:10px;">
                        <span style="font-size:16px;">🛡️</span>
                        <span style="font-weight:bold; color:#34d399; font-size:11px;">\${STATE.data.hse.incidents === 0 ? 'SAFE' : 'ALERT'}</span>
                    </div>
                    <div class="flex" style="align-items:center; gap:10px;">
                        <span style="font-size:16px;">👷</span>
                        <span style="color:#94a3b8; font-size:11px;">\${STATE.data.hse.peopleOnSite} On Site</span>
                    </div>
                </div>\`;

            document.getElementById('companies-content').innerHTML = \`
                <div style="padding:10px; display:flex; align-items:center; gap:10px;">
                    <span style="font-size:16px;">🏗️</span>
                    <span style="color:#f59e0b; font-size:11px; font-weight:bold;">\${STATE.data.externalCompanies ? STATE.data.externalCompanies.length : 0} CONTRACTORS</span>
                </div>\`;

            // Lists
            document.getElementById('list-READINESS').innerHTML = UI.renderList(STATE.data.readiness, 'READINESS', 'MINI');
            document.getElementById('list-PROCUREMENT').innerHTML = UI.renderList(STATE.data.procurement, 'PROCUREMENT', 'MINI');
            document.getElementById('list-COMMISSIONING').innerHTML = UI.renderList([STATE.data.commissioning], 'COMMISSIONING', 'MINI');
            document.getElementById('list-EXECUTION').innerHTML = UI.renderList(Logic.getExecutionItems(), 'EXECUTION', 'MINI');

            // Globals
            window.selectSection = App.selectSection;
            window.acknowledge = API.acknowledge;

            // Start
            App.selectSection('STRATEGY');
            API.fetchLiveUpdates();
            setInterval(API.fetchLiveUpdates, CONFIG.POLL_INTERVAL);
        },

        selectSection(key) {
            STATE.activeSection = key;
            document.querySelectorAll('.card').forEach(el => el.classList.remove('active'));
            const card = document.getElementById('card-' + key);
            if(card) card.classList.add('active');

            const stage = document.getElementById('main-stage-content');
            const title = document.getElementById('main-stage-title');

            if (key === 'STRATEGY') {
                title.innerText = "EXECUTIVE STRATEGY";
                stage.innerHTML = UI.renderStrategy();
            } else if (key === 'HSE') {
                title.innerText = "HSE STATUS & KPI";
                stage.innerHTML = UI.renderHSE();
            } else if (key === 'COMPANIES') {
                title.innerText = "EXTERNAL SITE PARTNERS";
                stage.innerHTML = UI.renderCompanies();
            } else {
                const data = Logic.getDataForSection(key);
                let titleText = key + " TRACKER";
                if(key === 'EXECUTION') titleText = "EXECUTION & PROGRESS";
                title.innerText = titleText;
                stage.innerHTML = UI.renderList(data, key, 'DETAIL');
            }
        },

        updateLiveViews() {
            const execItems = Logic.getExecutionItems();
            document.getElementById('list-EXECUTION').innerHTML = UI.renderList(execItems, 'EXECUTION', 'MINI');
            if (STATE.activeSection === 'EXECUTION') {
                document.getElementById('main-stage-content').innerHTML = UI.renderList(execItems, 'EXECUTION', 'DETAIL');
            }
            const panic = STATE.data.liveAlerts.find(a => !a.acknowledged_by);
            UI.showModal(panic);
        }
    };

    document.addEventListener('DOMContentLoaded', App.init);
</script>
`;