export const uiDrawersJS = `
    // 1. SHARED HOLOGRAM STYLES (The Scalable Part)
    // Applies to ALL drawers (Budget, WP, etc.) automatically.
    const holoStyles = \`
        /* Target BOTH drawers with the same holographic look */
        #drawer-budget.drawer.open, 
        #drawer-wp.drawer.open {
            top: 20px !important;
            height: calc(100vh - 40px) !important;
            right: 20px !important;
            width: 700px !important; /* WIDER as requested */
            border-radius: 24px !important;
            
            /* 🔮 TRUE GLASS TRANSPARENCY */
            /* Low opacity (0.25) to let the dashboard show through */
            background: rgba(5, 8, 15, 0.25) !important; 
            
            /* Heavy Blur to make text readable over the background */
            backdrop-filter: blur(50px) saturate(200%) !important;
            -webkit-backdrop-filter: blur(50px) saturate(200%) !important;
            
            /* Neon Borders & Depth */
            border: 1px solid rgba(255, 255, 255, 0.08) !important;
            box-shadow: 
                0 40px 80px rgba(0,0,0,0.9),       /* Deep Shadow */
                0 0 0 1px rgba(255, 255, 255, 0.05) inset; /* Inner Bevel */
            
            z-index: 99999;
            transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
        }

        /* 🚨 KILL THE DUPLICATE TITLES (Global Override) */
        body .drawer::before, body .drawer::after { 
            display: none !important; 
            content: none !important; 
            opacity: 0 !important;
        }

        /* Shared Handle Styling */
        .drawer-handle {
            position: absolute; left: -40px; top: 15%;
            width: 40px; height: 140px;
            border-radius: 12px 0 0 12px;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer;
            writing-mode: vertical-rl; text-orientation: mixed;
            font-family: 'JetBrains Mono', monospace; font-weight: 800; font-size: 11px; letter-spacing: 3px;
            color: #000; 
            box-shadow: -10px 0 30px rgba(0,0,0,0.5);
            transition: transform 0.2s;
            backdrop-filter: blur(10px);
        }
        .drawer-handle:hover { transform: translateX(-5px); }

        /* Scrollbar Polish */
        .drawer-content::-webkit-scrollbar { width: 4px; }
        .drawer-content::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
        .drawer-content::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 2px; }
        .drawer-content::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.4); }
    \`;

    // Inject Styles Once
    if (!document.getElementById('holo-drawer-css-v2')) {
        const style = document.createElement('style');
        style.id = 'holo-drawer-css-v2';
        style.textContent = holoStyles;
        document.head.appendChild(style);
    }

    // 2. SCALABLE DRAWER BUILDER (The Logic)
    // Helper function to setup ANY drawer structure properly
    const setupHoloDrawer = (id, handleText, color) => {
        const drawer = document.getElementById('drawer-' + id);
        if (!drawer) return null;

        // Ensure Handle Exists (Don't wipe if it's there, just update)
        let handle = drawer.querySelector('.drawer-handle');
        if (!handle) {
            handle = document.createElement('div');
            handle.className = 'drawer-handle';
            handle.onclick = () => window.toggleDrawer(id);
            drawer.appendChild(handle);
        }
        
        // Update Handle Visuals
        handle.innerText = handleText;
        handle.style.background = color;
        handle.style.boxShadow = '0 0 20px ' + color + '66'; // Add glow with opacity

        // Ensure Content Container Exists
        let container = document.getElementById(id + '-list-container');
        if (!container) {
            container = document.createElement('div');
            container.id = id + '-list-container';
            container.className = 'drawer-content';
            drawer.appendChild(container);
        }
        
        // Apply Specific Border Color to the Drawer itself for extra flair
        drawer.style.borderColor = color + '44'; // 44 = low opacity hex
        
        return container;
    };

    // 3. MAIN RENDERER
    const UI_Drawer = {
        renderBudget() {
            // Use the Helper -> ID: 'budget', Label: 'BUDGET', Color: Green
            const container = setupHoloDrawer('budget', 'MASTER BUDGET', '#34d399');
            if (!container) return;

            const budget = STATE.data.budget || [];
            
            // Header
            const headerHtml = 
            '<div style="margin-bottom:30px; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:25px;">' +
                '<div style="color:#34d399; font-weight:900; letter-spacing:1px; margin-bottom:25px; font-size:22px; text-shadow:0 0 30px rgba(52,211,153,0.4); display:flex; align-items:center; gap:15px;">' +
                    '<span style="font-size:28px;">💰</span> MASTER BUDGET CONSUMPTION' +
                '</div>' +
                '<div class="flex" style="gap:20px;">' +
                    '<div style="background:rgba(52,211,153,0.05); padding:25px; border-radius:16px; flex:1; border:1px solid rgba(52,211,153,0.2); position:relative; overflow:hidden;">' +
                        '<div style="position:absolute; top:-20px; right:-20px; width:100px; height:100px; background:radial-gradient(circle, rgba(52,211,153,0.2), transparent 70%); border-radius:50%;"></div>' +
                        '<div class="mono small" style="color:#34d399; margin-bottom:8px; letter-spacing:1px;">TOTAL BUDGET</div>' +
                        '<div style="font-size:32px; font-weight:900; color:#fff; text-shadow:0 0 20px rgba(52,211,153,0.3);">NOK 234M</div>' + 
                    '</div>' +
                    '<div style="background:rgba(239,68,68,0.05); padding:25px; border-radius:16px; flex:1; border:1px solid rgba(239,68,68,0.2); position:relative; overflow:hidden;">' +
                         '<div style="position:absolute; top:-20px; right:-20px; width:100px; height:100px; background:radial-gradient(circle, rgba(239,68,68,0.2), transparent 70%); border-radius:50%;"></div>' +
                        '<div class="mono small" style="color:#ef4444; margin-bottom:8px; letter-spacing:1px;">SPENT (EST)</div>' +
                        '<div style="font-size:32px; font-weight:900; color:#fff; text-shadow:0 0 20px rgba(239,68,68,0.3);">NOK 42M</div>' +
                    '</div>' +
                '</div>' +
            '</div>';

            // List
            const listHtml = budget.map((item) => {
                const totalQty = item.total_qty || 1;
                const qtyInstall = item.qty_installed || 0;
                const pctInstall = Math.min((qtyInstall / totalQty) * 100, 100);
                const pctStock = Math.min(((item.qty_stock || 0) / totalQty) * 100, 100 - pctInstall);
                
                return '<div class="budget-row" style="margin-bottom:15px; padding:18px; background:rgba(255,255,255,0.015); border-radius:12px; border:1px solid rgba(255,255,255,0.03); transition: background 0.2s;">' +
                        '<div class="flex justify-between" style="margin-bottom:12px;">' +
                            '<div style="max-width: 70%;">' +
                                '<div style="color:#f1f5f9; font-weight:700; font-size:13px; letter-spacing:0.3px;">' + item.description + '</div>' +
                                '<div class="mono small" style="color:#64748b; font-size:10px; margin-top:4px;">' + (item.cost_code || 'N/A') + '</div>' +
                            '</div>' +
                            '<div class="text-right">' +
                                '<div class="mono small" style="color:#94a3b8;">' + (item.total_budget ? (item.total_budget/1000000).toFixed(1) + 'M' : '0') + '</div>' +
                                '<div style="font-size:11px; color:#34d399; font-weight:bold; margin-top:4px;">' + Math.round(pctInstall) + '% DONE</div>' +
                            '</div>' +
                        '</div>' +
                        '<div class="progress-track" style="background:rgba(255,255,255,0.05); height:6px; border-radius:3px; overflow:hidden;">' +
                            '<div class="prog-bar" style="width:' + pctInstall + '%; background:#34d399; box-shadow:0 0 10px rgba(52,211,153,0.5);"></div>' +
                            '<div class="prog-bar" style="width:' + pctStock + '%; background:#f59e0b;"></div>' +
                        '</div>' +
                    '</div>';
            }).join('');

            container.innerHTML = headerHtml + listHtml;
        },

        renderWPs() {
            // Use the Helper -> ID: 'wp', Label: 'WP SCOPE', Color: Amber
            const container = setupHoloDrawer('wp', 'WP SCOPE', '#f59e0b');
            if (!container) return;
            
            const wps = STATE.data.wps || [];
            
            // Header for WP (To match the Budget style)
             const headerHtml = 
            '<div style="margin-bottom:30px; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:25px;">' +
                '<div style="color:#f59e0b; font-weight:900; letter-spacing:1px; margin-bottom:10px; font-size:22px; text-shadow:0 0 30px rgba(245, 158, 11, 0.4); display:flex; align-items:center; gap:15px;">' +
                    '<span style="font-size:28px;">📂</span> WORK PACKAGES' +
                '</div>' +
                 '<div class="mono small" style="color:#cbd5e1;">Active Scopes and Deliverables</div>' +
            '</div>';

            const listHtml = wps.map((wp) => 
                '<div class="list-item" style="border-left: 3px solid var(--neon-amber); padding:20px; background:linear-gradient(90deg, rgba(245, 158, 11, 0.05), transparent); margin-bottom:10px; border-radius:0 8px 8px 0;">' +
                    '<div style="font-size:15px; font-weight:bold; color:#fff; margin-bottom:5px; text-shadow:0 0 10px rgba(255,255,255,0.2);">' + wp.wp_id + '</div>' +
                    '<div class="mono" style="color:#94a3b8; font-size:12px;">' + wp.description + '</div>' +
                '</div>'
            ).join('');
            
            container.innerHTML = headerHtml + (listHtml || '<div class="mono" style="opacity:0.5;">No WPs loaded.</div>');
        }
    };
`;