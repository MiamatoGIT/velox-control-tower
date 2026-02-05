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
    ${coreJS}
    ${apiJS}
    ${logicJS}
    ${uiComponentsJS} // Defines UI_Comp
    ${uiMainJS}       // Defines UI_Main
    ${uiModalsJS}     // Defines UI_Modal
    ${uiDrawersJS}    // Defines UI_Drawer
    ${uiCoreJS}       // Defines UI_Core (🚨 MUST BE HERE)
    ${uiJS}           // Defines UI (The Bridge)
    ${appJS}          // Defines App (Uses UI)
</script>
`;