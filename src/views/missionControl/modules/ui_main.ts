export const uiMainJS = `
    const UI_Main = {
        // 1. EXECUTION LISTS (Unchanged, keeps your detailed rows)
        renderList(items, type, viewMode) {
            if (!items || items.length === 0) return '<div class="mono small" style="opacity:0.4; padding:15px;">No Data</div>';
            
            return items.map(item => {
                let border = '#334155'; 
                let textCol = '#94a3b8';
                
                if (type === 'READINESS') { border = '#ef4444'; textCol = '#ef4444'; }
                if (type === 'PROCUREMENT') { border = '#34d399'; textCol = '#34d399'; }
                if (type === 'EXECUTION') { border = '#38bdf8'; textCol = '#38bdf8'; }
                if (type === 'COMMISSIONING') { border = '#f59e0b'; textCol = '#f59e0b'; }

                if (item.alerts && item.alerts.length > 0) border = '#ef4444';

                let title = item.material || item.wpId || item.description || "Item";
                let sub = item.activityName || "";
                let status = item.status || "";

                if(type === 'PROCUREMENT') status = item.expectedDate || item.siteArrival || item.status || "Pending";
                else if(type === 'READINESS') { sub = item.description || ""; status = item.readinessStatus || "0%"; }
                else if(type === 'EXECUTION') { sub = item.description || ""; status = item.actualPercent ? item.actualPercent + '%' : (item.status || "Pending"); }
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

                const alertsHtml = UI_Comp.createAlertBadges(item.alerts);

                if(viewMode === 'MINI') {
                    return '<div class="list-item" style="border-left-color: ' + border + ';">' +
                        '<div class="flex justify-between">' +
                            '<div style="overflow:hidden; padding-right:5px;">' +
                                '<div style="font-weight:bold; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' + title + '</div>' +
                                '<div class="mono small" style="color:#64748b;">' + sub + '</div>' +
                                alertsHtml +
                            '</div>' +
                            '<div class="mono small" style="color:' + textCol + '; font-weight:bold; white-space:nowrap;">' + status + '</div>' +
                        '</div>' +
                    '</div>';
                } else {
                    return '<div class="detail-item" style="border-left:4px solid ' + border + '; background:rgba(0,0,0,0.2); padding:20px; margin-bottom:10px;">' +
                        '<div>' +
                            '<div style="font-weight:bold; font-size:14px;">' + title + '</div>' +
                            '<div class="mono small">' + sub + '</div>' +
                            alertsHtml +
                        '</div>' +
                        '<div class="mono" style="color:' + textCol + '; text-align:right;">' + status + '</div>' +
                    '</div>';
                }
            }).join('');
        },

        // 2. STRATEGY MAIN STAGE (Restored Content)
        renderStrategy() { 
            const s = STATE.data.strategy || {};
            return '<div style="padding:40px; display:flex; flex-direction:column; justify-content:center; height:100%; position:relative;">' +
                '<div style="position:absolute; top:20px; right:20px; opacity:0.1; font-size:100px;">🎯</div>' +
                '<div class="mono" style="color:#38bdf8; margin-bottom:20px; letter-spacing:2px; font-weight:bold;">CURRENT FOCUS</div>' +
                '<div style="font-size: 32px; font-weight: 800; color: #fff; line-height:1.3;">"' + (s.focus || 'No Strategy Data') + '"</div>' +
                '<div style="margin-top:40px; border-top:1px solid rgba(255,255,255,0.1); padding-top:20px;">' +
                    '<div class="mono small" style="color:#64748b;">PREPARED BY</div>' +
                    '<div class="mono">' + (STATE.data.meta?.preparedBy || 'Unknown') + '</div>' +
                '</div>' +
            '</div>'; 
        },

        // 3. HSE MAIN STAGE (Restored Grid of 6 KPIs)
        renderHSE() {
            const h = STATE.data.hse || {};
            const kpis = [
                { icon: "⏰", label: "SITE HOURS", val: h.workingHours || "07:00 - 19:00", color: "#fff" },
                { icon: "👷", label: "MANPOWER", val: h.peopleOnSite || 0, color: "#38bdf8" },
                { icon: "🏥", label: "INCIDENTS", val: h.incidents || 0, color: h.incidents > 0 ? "#ef4444" : "#34d399" },
                { icon: "🗣️", label: "TOOLBOXES", val: h.toolboxes || 0, color: "#f59e0b" },
                { icon: "📝", label: "DRA's", val: h.dra || 0, color: "#fff" },
                { icon: "👀", label: "OBSERVATIONS", val: h.observations || 0, color: "#fff" }
            ];
            const html = kpis.map(k => 
                '<div style="background:rgba(255,255,255,0.05); padding:20px; border-radius:8px;">' +
                    '<div style="font-size:24px; margin-bottom:5px;">' + k.icon + '</div>' +
                    '<div class="mono small" style="color:#94a3b8;">' + k.label + '</div>' +
                    '<div style="font-size:22px; font-weight:bold; color:' + k.color + ';">' + k.val + '</div>' +
                '</div>'
            ).join('');
            return '<div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:15px; align-content:center; height:100%;">' + html + '</div>';
        },

        // 4. PARTNERS MAIN STAGE (Restored List)
        renderCompanies() {
            const comps = STATE.data.externalCompanies || [];
            if(comps.length === 0) return '<div class="mono" style="opacity:0.5; padding:20px;">No External Partners Listed</div>';
            
            const html = comps.map(c => 
                '<div class="list-item" style="border-left-color: #f59e0b; padding:20px; display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; background:rgba(245, 158, 11, 0.05);">' +
                    '<div>' +
                        '<div style="font-size:16px; font-weight:bold; color:#fff;">' + c.name + '</div>' +
                        '<div class="mono small" style="color:#94a3b8;">' + c.role + '</div>' +
                    '</div>' +
                    '<div class="mono" style="color:#f59e0b; font-weight:bold;">' + c.personnel + ' Pers</div>' +
                '</div>'
            ).join('');
            return '<div style="padding:20px; overflow-y:auto; height:100%;">' + html + '</div>';
        }
    };
`;