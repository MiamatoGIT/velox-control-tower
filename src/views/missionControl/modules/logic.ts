// src/views/missionControl/modules/logic.ts
export const logicJS = `
    /** DATA LOGIC - v6.1 STRICT SYNC & SMART MATCH */
    const Logic = {
        getExecutionItems() {
            let items = [];
            if (STATE.data.execution && Array.isArray(STATE.data.execution)) {
                items = JSON.parse(JSON.stringify(STATE.data.execution));
            } else if (STATE.data.mainActivity) {
                items = [JSON.parse(JSON.stringify(STATE.data.mainActivity))];
            }

            // 🚨 USE ALERTS KEY
            const alerts = STATE.data.alerts || STATE.data.liveLogs || [];
            
            alerts.forEach(alert => {
                const wpId = alert.work_package_id || "WP-GENERAL";
                if (wpId.includes('411') || wpId.includes('459')) return;

                // --- 🧠 SMART FUZZY MATCHING (v6.1) ---
                // Helper to normalize strings: removes dots, spaces, case
                // "412.006" -> "412006"
                // "Earthing 412 006" -> "earthing412006"
                const clean = (str) => (str || "").toLowerCase().replace(/[^a-z0-9]/g, '');

                const reportKey = clean(wpId);

                const matchingItems = items.filter(i => {
                    const itemWP = clean(i.wpId);
                    const itemDesc = clean(i.description);
                    
                    // Match if the report ID is contained in the PDF ID or vice versa
                    return itemWP.includes(reportKey) || 
                           reportKey.includes(itemWP) ||
                           itemDesc.includes(reportKey);
                });

                if (matchingItems.length === 0) {
                    items.unshift({ 
                        wpId: wpId, 
                        description: "🚨 Unplanned Field Activity", 
                        status: "BLOCKED", 
                        isGhost: true,
                        alerts: [{
                            id: alert.id,
                            reason: alert.blocker_reason,
                            ackBy: alert.acknowledged_by,
                            user: alert.user_name
                        }] 
                    });
                } else {
                    matchingItems.forEach(item => {
                        if (!item.alerts) item.alerts = [];
                        if (!item.alerts.find(a => a.id === alert.id)) {
                            item.alerts.push({
                                id: alert.id,
                                reason: alert.blocker_reason,
                                ackBy: alert.acknowledged_by,
                                user: alert.user_name
                            });
                        }
                        if (alert.status === 'BLOCKED') item.status = "BLOCKED";
                    });
                }
            });
            
            return items;
        },

        getReadinessItems() {
            let items = (STATE.data.readiness || []).map(i => JSON.parse(JSON.stringify(i)));
            const alerts = STATE.data.alerts || STATE.data.liveLogs || [];

            alerts.forEach(alert => {
                const wpId = alert.work_package_id || "";
                
                if (wpId.includes('411') || wpId.includes('459')) {
                    const clean = (str) => (str || "").toLowerCase().replace(/[^a-z0-9]/g, '');
                    const reportKey = clean(wpId);

                    const matchingItems = items.filter(i => {
                        const itemWP = clean(i.wpId);
                        return itemWP.includes(reportKey) || reportKey.includes(itemWP);
                    });

                    matchingItems.forEach(item => {
                        if (!item.alerts) item.alerts = [];
                        if (!item.alerts.find(a => a.id === alert.id)) {
                            item.alerts.push({
                                id: alert.id,
                                reason: alert.blocker_reason,
                                ackBy: alert.acknowledged_by,
                                user: alert.user_name
                            });
                        }
                        item.status = "BLOCKED";
                    });
                }
            });
            return items;
        },

        getDataForSection(key) {
            switch(key) {
                case 'READINESS': return Logic.getReadinessItems(); 
                case 'PROCUREMENT': return STATE.data.procurement;
                case 'COMMISSIONING': return STATE.data.commissioning || []; 
                case 'EXECUTION': return Logic.getExecutionItems();
                default: return [];
            }
        }
    };
`;