// src/views/missionControl/modules/core.ts
export const coreJS = `
    /** CORE STATE - v6.1 ALERTS SYNC */
    const CONFIG = {
        POLL_INTERVAL: 5000, 
        COLORS: { EXECUTION: '#38bdf8', READINESS: '#ef4444', PROCUREMENT: '#34d399' }
    };

    const STATE = {
        // We now initialize 'alerts' because that is what the API sends
        data: window.DASHBOARD_DATA || { execution: [], procurement: [], alerts: [] },
        
        activeSection: 'STRATEGY',
        lastAckId: 0, 
        
        // Keep this for backward compatibility, but we will rely on 'alerts'
        liveLogs: []          
    };

    window.STATE = STATE;
`;