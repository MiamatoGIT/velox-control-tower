export const appJS = `
    /** APP CONTROLLER - v6.9 FORCE RENDER FIX + DEMO MODE */
    const App = {
        init() {
            console.log("🚀 Initializing Stargate HUD (v6.9)...");

            // 1. RENDER STATIC MINI-BOXES
            if(document.getElementById('strategy-content'))
                document.getElementById('strategy-content').innerHTML = UI.renderStrategyMini(STATE.data.strategy);
            
            if(document.getElementById('hse-content'))
                document.getElementById('hse-content').innerHTML = UI.renderHSEMini(STATE.data.hse);
            
            if(document.getElementById('companies-content'))
                document.getElementById('companies-content').innerHTML = UI.renderCompaniesMini(STATE.data.externalCompanies);

            // 2. RENDER LISTS & DRAWERS
            UI.renderBudget();
            UI.renderWPs();

            // 3. BIND GLOBAL EVENTS
            window.toggleDrawer = UI.toggleDrawer;
            window.acknowledge = API.acknowledge;
            window.selectSection = App.selectSection;

            // 4. SET INITIAL VIEW
            App.selectSection('STRATEGY');

            // 5. START HEARTBEAT
            setInterval(API.fetchLiveUpdates, 5000);

            // 6. IMMEDIATE CHECK
            const initialData = STATE.data.alerts || STATE.data.liveLogs || [];
            
            if(initialData.length > 0) {
                App.updateLiveViews();
            } else {
                API.fetchLiveUpdates();
            }
        },

        selectSection(key) {
            STATE.activeSection = key;
            document.querySelectorAll('.card').forEach(el => el.classList.remove('active'));
            const card = document.getElementById('card-' + key);
            if(card) card.classList.add('active');

            const stage = document.getElementById('main-stage-content');
            const title = document.getElementById('main-stage-title');
            
            if(title) title.innerText = key + " DETAILS";

            if(key==='STRATEGY') stage.innerHTML = UI.renderStrategy();
            else if(key==='HSE') stage.innerHTML = UI.renderHSE();
            else if(key==='COMPANIES') stage.innerHTML = UI.renderCompanies();
            else stage.innerHTML = UI.renderList(Logic.getDataForSection(key), key, 'DETAIL');
        },

        updateLiveViews() {
            const logs = STATE.data.alerts || STATE.data.liveLogs || [];
            
            // --- 🚨 DEMO MODE LOGIC (PRESERVED) ---
            // Triggers popup for ANY unacknowledged log (Success or Blocked)
            const queue = logs.filter(log => {
                // const isBlocked = (log.status === 'BLOCKED'); // <--- 🛑 DISABLED FOR DEMO
                const isUnacknowledged = !log.acknowledged_by;
                const isNotJustClicked = (log.id !== STATE.lastAckId);
                
                return isUnacknowledged && isNotJustClicked;
            });
            
            if (queue.length > 0) {
                const latestItem = queue[queue.length - 1];
                console.log("⚠️ DEMO TRIGGER: Showing Modal for Log #" + latestItem.id);
                
                // Smart Navigation
                const wp = (latestItem.work_package_id || "").toLowerCase();
                const target = (wp.includes('411') || wp.includes('459')) ? 'READINESS' : 'EXECUTION';
                
                if (STATE.activeSection !== target) App.selectSection(target);

                if (typeof UI_Modal !== 'undefined' && UI_Modal.show) UI_Modal.show(latestItem);
            }

            // --- 🔄 RE-RENDER ALL LISTS (FORCE FIX) ---
            // We now re-render Procurement & Commissioning here too, ensuring they don't stay empty.
            
            const execItems = Logic.getExecutionItems();
            const readItems = Logic.getReadinessItems();
            const procItems = Logic.getDataForSection('PROCUREMENT');     // <--- ADDED
            const commItems = Logic.getDataForSection('COMMISSIONING');   // <--- ADDED

            const execList = document.getElementById('list-EXECUTION');
            if(execList) execList.innerHTML = UI.renderList(execItems, 'EXECUTION', 'MINI');

            const readList = document.getElementById('list-READINESS');
            if(readList) readList.innerHTML = UI.renderList(readItems, 'READINESS', 'MINI');

            // 👇 THESE TWO WERE MISSING FROM THE LOOP 👇
            const procList = document.getElementById('list-PROCUREMENT');
            if(procList) procList.innerHTML = UI.renderList(procItems, 'PROCUREMENT', 'MINI');

            const commList = document.getElementById('list-COMMISSIONING');
            if(commList) commList.innerHTML = UI.renderList(commItems, 'COMMISSIONING', 'MINI');
            
            // Re-render Detail View if active
            if (STATE.activeSection === 'EXECUTION') {
                document.getElementById('main-stage-content').innerHTML = UI.renderList(execItems, 'EXECUTION', 'DETAIL');
            }
            if (STATE.activeSection === 'READINESS') {
                document.getElementById('main-stage-content').innerHTML = UI.renderList(readItems, 'READINESS', 'DETAIL');
            }
        }
    };

    window.App = App;
    document.addEventListener('DOMContentLoaded', () => { App.init(); });
`;