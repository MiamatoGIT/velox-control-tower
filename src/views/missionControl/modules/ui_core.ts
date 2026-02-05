export const uiCoreJS = `
    const UI_Core = {
        toggleDrawer(id) {
            const drawer = document.getElementById('drawer-' + id);
            if (!drawer) return;
            
            // 1. Check if it's currently open
            const isOpen = drawer.classList.contains('open');
            
            // 2. Force close ALL drawers first
            document.querySelectorAll('.drawer').forEach(d => d.classList.remove('open'));
            
            // 3. Only open this one if it wasn't already open (Toggle effect)
            if (!isOpen) {
                drawer.classList.add('open');
            }
        },
        closeModal() {
            const modal = document.getElementById('alert-modal');
            if (modal) modal.classList.remove('active');
        }
    };
`;