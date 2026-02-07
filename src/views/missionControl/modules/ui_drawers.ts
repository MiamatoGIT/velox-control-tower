export const uiDrawersJS = `
    /**
     * UI MODULE: DRAWERS & SLIDE-OVERS v7.9
     * Fixes: Visible Handle (Post-it), Fallback for missing data
     */

    const holoStyles = \`
        /* Target ALL drawers */
        #drawer-budget.drawer.open, 
        #drawer-wp.drawer.open,
        #drawer-roadblocks.drawer.open {
            top: 20px !important;
            height: calc(100vh - 40px) !important;
            right: 20px !important;
            width: 90vw !important; 
            max-width: 1400px !important;
            border-radius: 24px !important;
            background: rgba(5, 8, 15, 0.95) !important; /* Slightly darker for readability */
            backdrop-filter: blur(50px) saturate(200%) !important;
            -webkit-backdrop-filter: blur(50px) saturate(200%) !important;
            border: 1px solid rgba(255, 255, 255, 0.08) !important;
            box-shadow: 0 40px 80px rgba(0,0,0,0.9);
            
            /* 🚨 CRITICAL FIX: Overflow visible allows handle to stick out */
            overflow: visible !important; 
            z-index: 99999 !important;
            transition: right 0.4s cubic-bezier(0.19, 1, 0.22, 1);
            display: flex;
            flex-direction: column;
        }

        /* KILL DUPLICATES */
        body .drawer::before, body .drawer::after { display: none !important; content: none !important; }

        /* SHARED HANDLE STYLING (The "Post-it") */
        .drawer-handle {
            position: absolute; 
            left: -50px; /* Sticks out 50px to the left */
            top: 15%;
            width: 50px; 
            height: 140px;
            border-radius: 12px 0 0 12px;
            border: 1px solid rgba(255,255,255,0.2);
            border-right: none;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer;
            writing-mode: vertical-rl; text-orientation: mixed;
            font-family: 'JetBrains Mono', monospace; font-weight: 800; font-size: 12px; letter-spacing: 3px;
            color: #fff; 
            text-shadow: 0 2px 4px rgba(0,0,0,0.5);
            box-shadow: -10px 0 30px rgba(0,0,0,0.5);
            background: #222; /* Default fallback */
            z-index: 100000;
        }
        .drawer-handle:hover { left: -60px; width: 60px; transition: all 0.2s ease; }

        /* SPLIT LAYOUT */
        .rb-split-container {
            display: grid; grid-template-columns: 1fr 1fr; gap: 30px;
            height: 100%; overflow: hidden; padding-top: 10px;
        }
        .rb-column {
            display: flex; flex-direction: column;
            background: rgba(0,0,0,0.2); border-radius: 16px;
            border: 1px solid rgba(255,255,255,0.05); overflow: hidden; height: 100%;
        }
        .rb-header {
            padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.05);
            font-family: 'JetBrains Mono'; font-weight: 700; display: flex; justify-content: space-between;
        }
        .rb-scroll-area { flex: 1; overflow-y: auto; padding: 10px; }
        .rb-table { width: 100%; border-collapse: collapse; font-size: 12px; }
        .rb-table th { text-align: left; padding: 12px; color: rgba(255,255,255,0.4); font-family: 'JetBrains Mono'; font-size: 10px; }
        .rb-table td { padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.03); vertical-align: top; color: #eee; }
        
        .badge { padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase; }
        .badge.CRITICAL { background: rgba(239, 68, 68, 0.2); color: var(--neon-red); border: 1px solid var(--neon-red); }
        .badge.HIGH { background: rgba(245, 158, 11, 0.2); color: var(--neon-amber); border: 1px solid var(--neon-amber); }
        .badge.MEDIUM { background: rgba(56, 189, 248, 0.2); color: var(--neon-blue); border: 1px solid var(--neon-blue); }
    \`;

    if (!document.getElementById('holo-drawer-css-v7')) {
        const style = document.createElement('style');
        style.id = 'holo-drawer-css-v7';
        style.textContent = holoStyles;
        document.head.appendChild(style);
    }

    // BUILDER
    const setupHoloDrawer = (id, handleText, color) => {
        const drawer = document.getElementById('drawer-' + id);
        if (!drawer) return null;

        // Ensure Handle
        let handle = drawer.querySelector('.drawer-handle');
        if (!handle) {
            handle = document.createElement('div');
            handle.className = 'drawer-handle';
            handle.setAttribute('onclick', "window.toggleDrawer('" + id + "')");
            drawer.appendChild(handle);
        }
        
        // Force style updates
        handle.innerText = handleText;
        handle.style.background = color;
        handle.style.boxShadow = '0 0 20px ' + color + '66';

        // Ensure Container
        let container = document.getElementById(id + '-list-container');
        if (!container) {
            container = document.createElement('div');
            container.id = id + '-list-container';
            container.className = 'drawer-content';
            container.style.padding = '40px';
            container.style.height = '100%';
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            drawer.appendChild(container);
        }
        
        drawer.style.borderColor = color + '44';
        return container;
    };

    const UI_Drawer = {
        renderAll(data) {
             this.renderBudget();
             this.renderWPs();
             this.renderRoadblocks(data.roadblocks || []);
        },

        renderBudget() {
            const container = setupHoloDrawer('budget', 'MASTER BUDGET', '#34d399');
            if (!container) return;
            const budget = STATE.data.budget || [];
            container.innerHTML = \`<div style="padding:20px; color:#fff;">Budget Items: \${budget.length}</div>\`; 
        },

        renderWPs() {
            const container = setupHoloDrawer('wp', 'WP SCOPE', '#f59e0b');
            if (!container) return;
            const wps = STATE.data.wps || [];
            container.innerHTML = \`<div style="padding:20px; color:#fff;">WP Items: \${wps.length}</div>\`;
        },

        // 🚧 ROADBLOCKS
        renderRoadblocks(items) {
            // DEBUG: Print what we are trying to render
            console.log("Drawers: Rendering " + (items ? items.length : 0) + " roadblocks");

            const container = setupHoloDrawer('roadblocks', 'STOPPERS', '#ef4444');
            if (!container) return;

            // Safe Filters (Case Insensitive)
            const safeItems = items || [];
            const fieldItems = safeItems.filter(i => (i.type || '').toUpperCase() === 'FIELD');
            const officeItems = safeItems.filter(i => (i.type || '').toUpperCase() === 'OFFICE');
            
            // Catch anything else (e.g. type is null)
            const otherItems = safeItems.filter(i => {
                const t = (i.type || '').toUpperCase();
                return t !== 'FIELD' && t !== 'OFFICE';
            });

            // If "Others" exist, treat them as FIELD for safety
            if (otherItems.length > 0) fieldItems.push(...otherItems);

            const renderRow = (item) => \`
                <tr>
                    <td>
                        <div style="color:#fff; font-weight:600; margin-bottom:4px;">\${item.description || 'No Description'}</div>
                        <div class="mono small" style="color:var(--neon-blue); opacity:0.7;">\${item.action_required || 'No Action'}</div>
                    </td>
                    <td><span class="badge \${(item.priority || 'MEDIUM').toUpperCase()}">\${item.priority || 'MEDIUM'}</span></td>
                    <td style="color:#ccc;">\${item.owner || '-'}</td>
                    <td class="mono" style="opacity:0.5;">\${item.due_date || '-'}</td>
                </tr>
            \`;

            container.innerHTML = \`
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <div>
                        <h2 class="mono" style="color:var(--neon-red); margin:0; font-size:24px; text-shadow:0 0 30px rgba(239, 68, 68, 0.4);">🚧 STOPPERS</h2>
                        <span class="small mono" style="opacity:0.6;">SINGLE SOURCE OF TRUTH</span>
                    </div>
                </div>

                <div class="rb-split-container">
                    <div class="rb-column" style="border-top: 3px solid var(--neon-red);">
                        <div class="rb-header" style="color:var(--neon-red);">
                            <span>🏢 OFFICE / DESIGN</span>
                            <span class="badge" style="background:rgba(255,255,255,0.1); color:#fff;">\${officeItems.length}</span>
                        </div>
                        <div class="rb-scroll-area">
                            <table class="rb-table">
                                <thead><tr><th>ISSUE / ACTION</th><th>PRIORITY</th><th>OWNER</th><th>DUE</th></tr></thead>
                                <tbody>
                                    \${officeItems.length ? officeItems.map(renderRow).join('') : '<tr><td colspan="4" style="text-align:center; padding:40px; opacity:0.3;">NO OFFICE BLOCKERS</td></tr>'}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="rb-column" style="border-top: 3px solid var(--neon-amber);">
                        <div class="rb-header" style="color:var(--neon-amber);">
                            <span>🏗️ FIELD / SITE</span>
                            <span class="badge" style="background:rgba(255,255,255,0.1); color:#fff;">\${fieldItems.length}</span>
                        </div>
                        <div class="rb-scroll-area">
                            <table class="rb-table">
                                <thead><tr><th>ISSUE / ACTION</th><th>PRIORITY</th><th>OWNER</th><th>DUE</th></tr></thead>
                                <tbody>
                                    \${fieldItems.length ? fieldItems.map(renderRow).join('') : '<tr><td colspan="4" style="text-align:center; padding:40px; opacity:0.3;">NO FIELD BLOCKERS</td></tr>'}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            \`;
        }
    };
`;