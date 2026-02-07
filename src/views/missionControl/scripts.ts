import { coreJS } from './modules/core.js';
import { apiJS } from './modules/api.js';
import { logicJS } from './modules/logic.js';
import { uiComponentsJS } from './modules/ui_components.js';
import { uiMainJS } from './modules/ui_main.js';
import { uiModalsJS } from './modules/ui_modals.js';
import { uiDrawersJS } from './modules/ui_drawers.js';
import { uiCoreJS } from './modules/ui_core.js'; 
import { uiJS } from './modules/ui.js';       
import { appJS } from './modules/app.js';

export const js = `
<script>
    /**
     * VELOX STARGATE - GLOBAL UI BRIDGE
     * Ensures all modules merge into a single UI namespace 
     * without "already declared" errors.
     */
    window.UI = window.UI || {};

    // 1. Core Data & State
    ${coreJS}
    
    // 2. Data Services
    ${apiJS}
    ${logicJS}
    
    // 3. UI Modules (Internal definitions)
    ${uiComponentsJS} // Defines UI_Components logic
    ${uiMainJS}       // Defines UI_Main logic
    ${uiModalsJS}     // Defines UI_Modal logic
    ${uiDrawersJS}    // Defines UI_Drawer logic
    ${uiCoreJS}       // Defines UI_Core (Drawer toggles)
    
    // 4. The Bridge (Merges everything into window.UI)
    ${uiJS}           
    
    // 5. Application Entry Point
    ${appJS}          
</script>
`;