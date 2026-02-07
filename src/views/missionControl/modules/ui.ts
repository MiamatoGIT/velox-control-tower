export const uiJS = `
    /** UI BRIDGE - v9.0 RECOVERY */
    (function() {
        // Create Global UI Namespace
        window.UI = window.UI || {};

        // 1. Link Components (Fixes "UI_Comp is not defined")
        if (typeof window.UI_Components !== 'undefined') {
            window.UI.renderStrategy = window.UI_Components.renderStrategyMini;
            window.UI.renderHSE = window.UI_Components.renderHSEMini;
            window.UI.renderCompanies = window.UI_Components.renderCompaniesMini;
            window.UI.renderList = window.UI_Components.renderList;
        }

        // 2. Link Drawers (Fixes "UI.renderRoadblocks is not a function")
        if (typeof UI_Drawer !== 'undefined') {
            window.UI.renderBudget = UI_Drawer.renderBudget;
            window.UI.renderWPs = UI_Drawer.renderWPs;
            window.UI.renderRoadblocks = UI_Drawer.renderRoadblocks;
        }

        // 3. Link Modals
        if (typeof UI_Modal !== 'undefined') {
            window.UI.show = UI_Modal.show;
        }
        
        console.log("✅ VELOX UI BRIDGE: Connected.");
    })();
`;