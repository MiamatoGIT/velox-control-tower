export const uiJS = `
    const UI = {
        toggleDrawer: (id) => UI_Core.toggleDrawer(id),
        closeModal: () => UI_Core.closeModal(),
        
        createAlertBadges: (alerts) => UI_Comp.createAlertBadges(alerts),
        
        renderList: (items, type, mode) => UI_Main.renderList(items, type, mode),
        renderStrategy: () => UI_Main.renderStrategy(),
        renderHSE: () => UI_Main.renderHSE(),
        renderCompanies: () => UI_Main.renderCompanies(),
        
        // POINT TO THE SPECIFIC RENDERERS
        renderStrategyMini: (s) => UI_Comp.renderStrategyMini(s),
        renderHSEMini: (h) => UI_Comp.renderHSEMini(h),
        renderCompaniesMini: (c) => UI_Comp.renderCompaniesMini(c),
        
        showModal: (blocker) => UI_Modal.show(blocker),
        renderBudget: () => UI_Drawer.renderBudget(),
        renderWPs: () => UI_Drawer.renderWPs()
    };
`;