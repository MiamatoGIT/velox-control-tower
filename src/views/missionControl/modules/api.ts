export const apiJS = `
    /** API SERVICE */
    const API = {
        async fetchLiveUpdates() {
            try {
                const res = await fetch('/api/live');
                const liveData = await res.json();
                STATE.data.liveAlerts = liveData.alerts;
                App.updateLiveViews();
            } catch (e) { console.error("Polling error", e); }
        },
        
        async acknowledge(id) {
            const user = prompt("Initials:", "ADMIN");
            if (!user) return;
            
            // Optimistic Update
            const alert = STATE.data.liveAlerts.find(a => a.id === id);
            if(alert) alert.acknowledged_by = user;
            UI.closeModal();
            
            await fetch('/api/ack', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ id, user })
            });
            API.fetchLiveUpdates();
        }
    };
`;