export const appJS = `
    /** APP CONTROLLER - v9.3 FULL LIVE RENDER */
    const App = {
        init() {
            console.log("🚀 STARTING STARGATE HUD v9.3");

            // 1. HYDRATE STATE FROM SERVER RENDER
            if (window.DASHBOARD_DATA) {
                // Safely merge server data into global state
                Object.assign(STATE.data, window.DASHBOARD_DATA);
                console.log("📦 STATE HYDRATED. Project:", STATE.data.meta?.project);
            }

            // 2. INITIAL RENDER (Draws the page immediately)
            App.renderAll();

            // 3. START POLLING (Checks for new PDF data every 4s)
            setInterval(API.fetchLiveUpdates, 4000);
            
            // 4. SET INITIAL VIEW
            App.selectSection('STRATEGY');
        },

        // --- HELPER TO RENDER EVERYTHING ---
        renderAll() {
            try {
                // A. Sidebar Boxes
                const stratEl = document.getElementById('strategy-content');
                if(stratEl && UI.renderStrategy) stratEl.innerHTML = UI.renderStrategy(STATE.data.strategy);

                const hseEl = document.getElementById('hse-content');
                if(hseEl && UI.renderHSE) hseEl.innerHTML = UI.renderHSE(STATE.data.hse);

                const compEl = document.getElementById('companies-content');
                if(compEl && UI.renderCompanies) compEl.innerHTML = UI.renderCompanies(STATE.data.externalCompanies);

                // B. Bottom Lists (The "Validating..." fix)
                const lists = ['READINESS', 'PROCUREMENT', 'EXECUTION', 'COMMISSIONING'];
                lists.forEach(type => {
                    const el = document.getElementById('list-' + type);
                    // Convert type to lowercase key (e.g. READINESS -> readiness)
                    const dataKey = type.toLowerCase(); 
                    const data = STATE.data[dataKey] || [];
                    
                    if(el && UI.renderList) {
                        el.innerHTML = UI.renderList(data, type, 'MINI');
                    }
                });

                // C. Drawers
                if (UI.renderRoadblocks) UI.renderRoadblocks(STATE.data.roadblocks);
                if (UI.renderBudget) UI.renderBudget(); // Budget is static usually
                if (UI.renderWPs) UI.renderWPs();

            } catch(e) {
                console.error("❌ RENDER CYCLE FAILED:", e);
            }
        },

        selectSection(key) {
            STATE.activeSection = key;
            
            // 1. Highlight Card
            document.querySelectorAll('.card').forEach(el => el.classList.remove('active'));
            const card = document.getElementById('card-' + key);
            if(card) card.classList.add('active');

            // 2. Update Main Stage Title
            const title = document.getElementById('main-stage-title');
            if(title) title.innerText = key + " DETAILS";

            // 3. Render Main Stage Content
            const stage = document.getElementById('main-stage-content');
            if (!stage || !UI.renderList) return;

            if(key === 'STRATEGY') {
                stage.innerHTML = UI.renderStrategy(STATE.data.strategy);
            } else if(key === 'HSE') {
                stage.innerHTML = UI.renderHSE(STATE.data.hse);
            } else if(key === 'COMPANIES') {
                stage.innerHTML = UI.renderCompanies(STATE.data.externalCompanies);
            } else {
                // For lists (Readiness, Procurement, etc.)
                // Convert key to data property (e.g. "READINESS" -> STATE.data.readiness)
                const dataKey = key.toLowerCase();
                const data = STATE.data[dataKey] || [];
                stage.innerHTML = UI.renderList(data, key, 'DETAIL');
            }
        },

        // --- CALLED BY API.TS WHEN NEW DATA ARRIVES ---
        updateLiveViews() {
            // 1. Popups (Alerts)
            const logs = STATE.data.liveAlerts || [];
            // Find an unacknowledged alert we haven't shown yet
            const activeLog = logs.find(log => !log.acknowledged_by && log.id !== STATE.lastAckId);
            
            if (activeLog && typeof UI.show === 'function') {
                UI.show(activeLog);
            }

            // 2. RE-RENDER EVERYTHING
            // This ensures that when the PDF is read, the boxes update instantly
            App.renderAll();
            
            // 3. Refresh the "Main Stage" if it's open
            if (STATE.activeSection) {
                App.selectSection(STATE.activeSection);
            }
        }
    };

    window.App = App;
    window.selectSection = App.selectSection;
    document.addEventListener('DOMContentLoaded', () => App.init());
`;