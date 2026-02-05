export const uiModalsJS = `
    const UI_Modal = {
        /**
         * SHOW THE BLOCKER POPUP
         */
        show(blocker) {
            try {
                const modal = document.getElementById('alert-modal');
                const content = document.getElementById('modal-content');
                if (!blocker || !modal || !content) {
                    console.error("❌ UI_Modal: Missing DOM elements");
                    return;
                }

                console.log("🔔 UI_Modal: Displaying Alert for", blocker.work_package_id);

                content.innerHTML = \`<div class="blocker-alert-content" style="border: 2px solid #ff4444; padding: 30px; background: #000; text-align: left;">
                    <h2 style="color:#ff4444; margin-top:0;">🛑 CRITICAL BLOCKER: \${blocker.work_package_id}</h2>
                    <div style="background:rgba(255,68,68,0.1); padding:15px; margin:15px 0; border-left:4px solid #ff4444;">
                        <p style="color:#fff; font-size:18px; margin:0;">"\${blocker.blocker_reason}"</p>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:flex-end;">
                        <div class="mono small" style="color:#64748b;">REP: \${blocker.user_name}</div>
                        <button onclick="window.acknowledge(\${blocker.id})" style="background:#ff4444; color:#fff; border:none; padding:10px 20px; cursor:pointer; font-weight:bold; border-radius:4px;">ACKNOWLEDGE</button>
                    </div>
                </div>\`;

                modal.classList.add('active');
            } catch (e) {
                console.error("❌ UI_Modal Crash:", e);
            }
        },

        /**
         * CLOSE THE POPUP (Missing Function Added)
         */
        closeModal() {
            const modal = document.getElementById('alert-modal');
            if (modal) {
                modal.classList.remove('active');
                // Optional: Clear content after delay
                setTimeout(() => { 
                    const content = document.getElementById('modal-content');
                    if(content) content.innerHTML = ''; 
                }, 300);
            }
        }
    };
`;