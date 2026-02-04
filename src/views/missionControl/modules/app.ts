export const appJS = `
    /** APP CONTROLLER */
    const App = {
        init() {
            // 1. RENDER SIDEBAR MINI-BOXES
            document.getElementById('strategy-content').innerHTML = UI.renderStrategyMini(STATE.data.strategy);
            document.getElementById('hse-content').innerHTML = UI.renderHSEMini(STATE.data.hse);
            document.getElementById('companies-content').innerHTML = UI.renderCompaniesMini(STATE.data.externalCompanies);

            // 2. RENDER BOTTOM LISTS
            document.getElementById('list-READINESS').innerHTML = UI.renderList(STATE.data.readiness, 'READINESS', 'MINI');
            document.getElementById('list-PROCUREMENT').innerHTML = UI.renderList(STATE.data.procurement, 'PROCUREMENT', 'MINI');
            document.getElementById('list-EXECUTION').innerHTML = UI.renderList(Logic.getExecutionItems(), 'EXECUTION', 'MINI');
            
            // Fix Commissioning Handling
            const comms = STATE.data.commissioning || [];
            document.getElementById('list-COMMISSIONING').innerHTML = UI.renderList(comms, 'COMMISSIONING', 'MINI');

            // 3. RENDER DRAWERS
            UI.renderBudget();
            UI.renderWPs();

            // 4. BIND EVENTS
            window.toggleDrawer = UI.toggleDrawer;
            window.acknowledge = API.acknowledge;
            window.selectSection = (key) => {
                STATE.activeSection = key;
                document.querySelectorAll('.card').forEach(el => el.classList.remove('active'));
                const card = document.getElementById('card-' + key);
                if(card) card.classList.add('active');

                const stage = document.getElementById('main-stage-content');
                
                if(key==='STRATEGY') stage.innerHTML = UI.renderStrategy();
                else if(key==='HSE') stage.innerHTML = UI.renderHSE();
                else if(key==='COMPANIES') stage.innerHTML = UI.renderCompanies();
                else stage.innerHTML = UI.renderList(Logic.getDataForSection(key), key, 'DETAIL');
            };

            // 5. START POLLING
            App.selectSection('STRATEGY');
            API.fetchLiveUpdates();
            setInterval(API.fetchLiveUpdates, CONFIG.POLL_INTERVAL);
        },

        updateLiveViews() {
            const execItems = Logic.getExecutionItems();
            document.getElementById('list-EXECUTION').innerHTML = UI.renderList(execItems, 'EXECUTION', 'MINI');
            if (STATE.activeSection === 'EXECUTION') {
                document.getElementById('main-stage-content').innerHTML = UI.renderList(execItems, 'EXECUTION', 'DETAIL');
            }
        }
    };
    
    document.addEventListener('DOMContentLoaded', App.init);
`;