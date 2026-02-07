export const uiModalsJS = `
    /** UI MODAL - v8.5 STRING ID FIX */
    const UI_Modal = {
        show(data) {
            console.log("🔔 UI_Modal: Displaying Alert for " + data.id);
            const modal = document.getElementById('alert-modal');
            const content = document.getElementById('modal-content');
            if (!modal || !content) return;

            // 🔐 QUOTE FIX: Ensure the ID is passed as a string literal
            const safeId = typeof data.id === 'string' ? "\\'" + data.id + "\\'" : data.id;

            content.innerHTML = \`
                <div style="padding:30px; border:2px solid #ef4444; background:rgba(10,0,0,0.95); border-radius:12px; text-align:center; box-shadow: 0 0 50px rgba(239, 68, 68, 0.3);">
                    <div style="font-size:40px; margin-bottom:15px;">🛑</div>
                    <h2 class="mono" style="color:#ef4444; margin:0; font-size:20px; letter-spacing:2px;">CRITICAL BLOCKER: \${data.work_package_id || 'SYSTEM'}</h2>
                    
                    <div style="background:rgba(239,68,68,0.1); border-left:4px solid #ef4444; padding:20px; margin:20px 0; font-family:'Inter'; font-size:16px; color:#fff; text-align:left;">
                        "\${data.blocker_reason || data.description || 'No reason provided.'}"
                    </div>

                    <div style="display:flex; justify-content:space-between; align-items:center;">
                         <span class="mono small" style="color:#38bdf8;">REP: \${data.user_name || 'SYSTEM'}</span>
                         <button onclick="window.acknowledge(\${safeId})" 
                            style="background:#ef4444; color:#fff; border:none; padding:12px 30px; border-radius:6px; 
                                   font-weight:bold; cursor:pointer; font-family:'JetBrains Mono'; letter-spacing:1px; transition: transform 0.1s;">
                            ACKNOWLEDGE
                         </button>
                    </div>
                </div>
            \`;

            modal.classList.add('active');
        }
    };

    window.UI_Modal = UI_Modal;
`;