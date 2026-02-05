export const apiJS = `
    /** API SERVICE - v6.5 GLOBAL DEBOUNCE */
    const API = {
        async fetchLiveUpdates() {
            // --- 🛑 GLOBAL SAFETY VALVE ---
            // We use 'window' to ensure this timer persists across module reloads
            const now = Date.now();
            const lastFetch = window.LAST_FETCH_TIME || 0;
            
            // If it's been less than 2 seconds since last fetch, STOP.
            if (now - lastFetch < 2000) {
                console.warn("⛔ API: Fetch blocked by Global Debounce (" + (now - lastFetch) + "ms)");
                return;
            }

            // Set the lock
            window.LAST_FETCH_TIME = now;

            try {
                // 1. Force fresh data
                const res = await fetch('/api/live?t=' + now);
                const json = await res.json();
                
                console.log("🛠️ API RECEIVED KEYS:", Object.keys(json));

                // 2. Map Data
                const incomingLogs = json.logs || json.alerts || [];
                const incomingAlerts = json.alerts || [];

                // 3. Update State
                STATE.data.liveLogs = incomingLogs;
                STATE.data.liveAlerts = incomingAlerts;

                console.log("🚀 STATE SYNCED | Logs found:", STATE.data.liveLogs.length);

                // 4. Update UI
                if (window.App && window.App.updateLiveViews) {
                    window.App.updateLiveViews();
                }
            } catch (e) { 
                console.error("📡 API: Fetch failed", e); 
            }
        },
        
        async acknowledge(id) {
            const user = prompt("Initials for Acknowledge:", "ADMIN");
            if (!user) return;
            
            STATE.lastAckId = id;
            
            // Close UI immediately
            if (typeof UI_Modal !== 'undefined' && UI_Modal.closeModal) UI_Modal.closeModal();
            else if (typeof UI !== 'undefined' && UI.closeModal) UI.closeModal();
            
            try {
                await fetch('/api/ack', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ id, user })
                });
                
                // Allow immediate refresh
                window.LAST_FETCH_TIME = 0;
                API.fetchLiveUpdates();
            } catch (err) {
                console.error("❌ API: Ack failed", err);
            }
        }
    };
`;