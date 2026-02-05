export const uiComponentsJS = `
    // 🚨 FORCE TOOLTIP CSS INJECTION (Ensures hovers work properly)
    const tooltipStyle = \`
        <style>
            .has-tooltip { position: relative; cursor: help; }
            .has-tooltip:hover::after {
                content: attr(data-tooltip);
                position: absolute;
                bottom: 140%; left: 50%; transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.95); color: #fff;
                padding: 6px 10px; border-radius: 4px;
                font-size: 11px; white-space: nowrap;
                border: 1px solid #ef4444;
                box-shadow: 0 5px 15px rgba(0,0,0,0.5);
                z-index: 999999; pointer-events: none;
            }
            .has-tooltip:hover::before {
                content: ''; position: absolute; bottom: 120%; left: 50%; transform: translateX(-50%);
                border-width: 5px; border-style: solid;
                border-color: #ef4444 transparent transparent transparent;
                z-index: 999999;
            }
        </style>
    \`;
    if (!document.getElementById('tooltip-css')) {
        const styleEl = document.createElement('div');
        styleEl.id = 'tooltip-css';
        styleEl.innerHTML = tooltipStyle;
        document.head.appendChild(styleEl);
    }

    const UI_Comp = {
        // 1. RECTANGULAR BLOCKER BOXES (Blinking Status Lights)
        createAlertBadges(alerts) {
            if (!alerts || alerts.length === 0) return '';
            return alerts.map(a => {
                const isAck = !!a.acknowledged_by || !!a.ackBy;
                const reason = a.blocker_reason || a.reason || "Field Issue";
                const tooltipText = "⛔ " + reason.replace(/"/g, "'");
                
                // BOX STYLE
                const style = isAck 
                    ? 'display:inline-flex; align-items:center; gap:4px; padding:2px 6px; border:1px solid #34d399; background:rgba(52, 211, 153, 0.1); color:#34d399; font-size:9px; font-weight:bold; letter-spacing:1px; border-radius:2px; margin-right:4px; cursor:help;' 
                    : 'display:inline-flex; align-items:center; gap:4px; padding:2px 6px; border:1px solid #ef4444; background:rgba(239, 68, 68, 0.15); color:#ef4444; font-size:9px; font-weight:bold; letter-spacing:1px; border-radius:2px; margin-right:4px; animation:blink 1.5s infinite; cursor:help; box-shadow: 0 0 5px rgba(239,68,68,0.2);';
                
                const icon = isAck ? '✔' : '⚠️';
                const label = isAck ? 'ACK' : 'ISSUE';
                
                return '<span class="has-tooltip" data-tooltip="' + tooltipText + '" style="' + style + '">' + icon + ' ' + label + '</span>';
            }).join('');
        },

        // 2. STRATEGY SIDEBAR (Rich Content)
        renderStrategyMini(strategy) {
            const focus = strategy?.focus || "No Strategy Set";
            return '<div style="padding:20px; height:100%; display:flex; flex-direction:column; justify-content:center;">' +
                   '<div style="font-size:28px; margin-bottom:8px; opacity:0.8;">🎯</div>' +
                   '<div class="mono" style="color:#38bdf8; font-weight:bold; font-size:9px; letter-spacing:1px; margin-bottom:6px; text-transform:uppercase;">Current Focus</div>' +
                   '<div class="mono small" style="color:#e2e8f0; font-size:11px; line-height:1.4;">' + focus + '</div>' +
                   '</div>';
        },

        // 3. HSE SIDEBAR (Rich Content)
        renderHSEMini(hse) {
            const safe = (hse?.incidents === 0);
            const statusColor = safe ? '#34d399' : '#ef4444';
            const statusText = safe ? 'SAFE' : 'INCIDENT';
            const people = hse?.peopleOnSite || 0;
            return '<div style="padding:20px; height:100%; display:flex; flex-direction:column; justify-content:center;">' +
                   '<div class="flex" style="align-items:center; gap:8px; margin-bottom:12px;">' +
                   '<span style="font-size:22px;">🛡️</span>' +
                   '<span style="font-weight:bold; color:' + statusColor + '; font-size:12px; letter-spacing:1px; border:1px solid ' + statusColor + '; padding:2px 6px; border-radius:4px;">' + statusText + '</span>' +
                   '</div>' +
                   '<div class="mono" style="color:#94a3b8; font-size:20px; font-weight:bold;">' + people + ' <span style="font-size:10px; color:#64748b; font-weight:normal;">ON SITE</span></div>' +
                   '</div>';
        },

        // 4. PARTNERS SIDEBAR (Rich Content)
        renderCompaniesMini(companies) {
            const count = companies ? companies.length : 0;
            return '<div style="padding:20px; height:100%; display:flex; align-items:center; gap:15px;">' +
                   '<div style="font-size:32px;">🏗️</div>' +
                   '<div>' +
                   '<div style="color:#f59e0b; font-weight:bold; font-size:28px; line-height:1;">' + count + '</div>' +
                   '<div class="mono small" style="color:#94a3b8; font-size:10px; letter-spacing:0.5px;">ACTIVE PARTNERS</div>' +
                   '</div>' +
                   '</div>';
        }
    };
`;