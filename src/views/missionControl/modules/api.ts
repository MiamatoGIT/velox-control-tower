export const apiJS = `
    /** API MODULE - v8.5 GLOBAL EXPOSURE */
    const API = {
        async fetchLiveUpdates() {
            try {
                const res = await fetch('/api/stats/live');
                const data = await res.json();
                STATE.data.liveAlerts = data.alerts || [];
                STATE.data.roadblocks = data.roadblocks || [];
                if (typeof App !== 'undefined') App.updateLiveViews();
            } catch (e) { console.error("Polling error:", e); }
        },

        async acknowledge(id) {
            const user = prompt("Enter initials to acknowledge:");
            if (!user) return;

            try {
                const res = await fetch('/api/logs/acknowledge', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, user })
                });
                
                if (res.ok) {
                    console.log("✅ Acknowledged:", id);
                    STATE.lastAckId = id;
                    if (typeof UI !== 'undefined' && UI.closeModal) UI.closeModal();
                    API.fetchLiveUpdates();
                }
            } catch (e) { console.error("Ack error:", e); }
        }
    };

    // 🚨 EXPOSE TO GLOBAL WINDOW
    window.API = API;
    window.acknowledge = API.acknowledge;
`;