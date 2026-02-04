export const logicJS = `
    /** DATA LOGIC */
    const Logic = {
        getExecutionItems() {
            let items = [];
            // Priority: New "Execution" Array from PDF
            if (STATE.data.execution && Array.isArray(STATE.data.execution)) {
                items = JSON.parse(JSON.stringify(STATE.data.execution));
            } else if (STATE.data.mainActivity) {
                items = [JSON.parse(JSON.stringify(STATE.data.mainActivity))];
            }

            // Merge Live Blockers
            if (STATE.data.liveAlerts) {
                STATE.data.liveAlerts.forEach(alert => {
                    const wpId = alert.work_package_id || "WP-GENERAL";
                    
                    // Match Blocker to existing row by WP ID
                    let item = items.find(i => 
                        (i.wpId && i.wpId.includes(wpId)) || 
                        (i.description && i.description.includes(wpId))
                    );

                    // If no match, create a standalone "Blocker Row"
                    if (!item) {
                        item = { 
                            wpId: wpId, 
                            description: "Live Site Report", 
                            status: "BLOCKED", 
                            alerts: [] 
                        };
                        items.push(item);
                    }

                    if (!item.alerts) item.alerts = [];
                    item.alerts.push({
                        id: alert.id,
                        reason: alert.blocker_reason,
                        ackBy: alert.acknowledged_by,
                        user: alert.user_name
                    });
                    
                    item.status = "BLOCKED";
                });
            }
            return items;
        },

        getDataForSection(key) {
            switch(key) {
                case 'READINESS': return STATE.data.readiness;
                case 'PROCUREMENT': return STATE.data.procurement;
                case 'COMMISSIONING': return STATE.data.commissioning || []; 
                case 'EXECUTION': return Logic.getExecutionItems();
                default: return [];
            }
        }
    };
`;