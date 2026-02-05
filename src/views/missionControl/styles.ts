// --- MODULE 1: CORE LAYOUT & VARIABLES ---
const layoutCSS = `
    :root {
        /* 💎 RICH GLASS THEME */
        --glass-bg: rgba(10, 15, 30, 0.40); 
        --glass-border: rgba(255, 255, 255, 0.08);
        --glass-shine: linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%);
        --neon-blue: #38bdf8;
        --neon-green: #34d399;
        --neon-amber: #f59e0b;
        --neon-red: #ef4444;
        --blur-amt: 16px; 
    }

    body { 
        background-color: #020617;
        background-image: 
            radial-gradient(circle at 15% 50%, rgba(56, 189, 248, 0.12) 0%, transparent 25%),
            radial-gradient(circle at 85% 30%, rgba(245, 158, 11, 0.08) 0%, transparent 25%),
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
        background-size: 100% 100%, 100% 100%, 40px 40px, 40px 40px;
        color: #e2e8f0; 
        font-family: 'Inter', sans-serif; 
        margin: 0; 
        height: 100vh; 
        overflow: hidden;
    }

    /* MAIN GRID */
    .dashboard-container {
        display: grid;
        grid-template-columns: 320px 1fr; 
        grid-template-rows: 60px 1fr 280px;
        gap: 20px; 
        padding: 20px;
        padding-right: 70px; /* Space for Tabs */
        height: 100vh;
        box-sizing: border-box;
    }

    /* HEADER */
    .header { 
        grid-column: 1 / -1; 
        display: flex; justify-content: space-between; align-items: center; 
        padding: 0 15px;
        background: rgba(10, 15, 30, 0.3);
        backdrop-filter: blur(10px);
        border-bottom: 1px solid var(--glass-border);
        border-radius: 12px;
    }

    h1 { font-family: 'JetBrains Mono', monospace; font-size: 24px; letter-spacing: -1px; margin: 0; text-shadow: 0 0 15px rgba(56, 189, 248, 0.6); }
    .text-blue { color: var(--neon-blue); }
    
    /* UTILS */
    .mono { font-family: 'JetBrains Mono', monospace; }
    .small { font-size: 11px; }
    .flex { display: flex; }
    .flex-col { flex-direction: column; }
`;

// --- MODULE 2: UI COMPONENTS (Cards, Lists, Tabs) ---
const componentsCSS = `
    /* GLASS CARD */
    .card {
        background: var(--glass-bg);
        background-image: var(--glass-shine);
        backdrop-filter: blur(var(--blur-amt));
        -webkit-backdrop-filter: blur(var(--blur-amt));
        border: 1px solid var(--glass-border);
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(255,255,255,0.03);
        border-radius: 16px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        /* CRITICAL FIX: Ensures flex children (content) expand */
        min-height: 0; 
        height: 100%;
    }
    
    .card:hover {
        border-color: rgba(255,255,255,0.2);
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(255,255,255,0.02);
        transform: translateY(-2px);
    }
    
    .card.active {
        border-color: var(--neon-blue);
        box-shadow: 0 0 30px rgba(56, 189, 248, 0.15), inset 0 0 20px rgba(56, 189, 248, 0.05);
    }

    /* CARD HEADER & LISTS */
    .card-header { 
        padding: 15px 20px; font-family: 'JetBrains Mono'; font-size: 11px; 
        color: var(--neon-blue); letter-spacing: 1px; text-transform: uppercase;
        background: linear-gradient(90deg, rgba(56, 189, 248, 0.05), transparent);
        border-bottom: 1px solid rgba(255,255,255,0.05);
        flex-shrink: 0; /* Header never shrinks */
    }
    
    .card-list { 
        overflow-y: auto; 
        flex: 1; /* Takes all remaining space */
        padding: 15px; 
        /* Removed height:100% to let flex handle it */
    }

    .list-item {
        background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.03);
        border-left: 3px solid transparent; padding: 12px 15px; margin-bottom: 8px;
        border-radius: 6px; transition: all 0.2s;
    }
    .list-item:hover { 
        background: rgba(255,255,255,0.06); transform: translateX(4px); 
        border-color: rgba(255,255,255,0.1);
    }

    /* SCROLLBAR */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }

    /* POST-IT TABS */
    .index-tabs-container {
        position: fixed; right: 0; top: 50%; transform: translateY(-50%);
        display: flex; flex-direction: column; gap: 15px; z-index: 300; perspective: 1000px;
    }

    .glass-tab {
        width: 40px; height: 140px;
        background: rgba(255, 255, 255, 0.03);
        backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255,255,255,0.1); border-right: none; border-radius: 12px 0 0 12px;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        box-shadow: -5px 5px 15px rgba(0,0,0,0.3);
        writing-mode: vertical-rl; text-orientation: mixed;
        font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 11px; 
        letter-spacing: 2px; color: rgba(255,255,255,0.6);
    }

    .glass-tab:hover {
        transform: translateX(-10px); width: 50px; color: #fff;
        background: rgba(255, 255, 255, 0.08); box-shadow: -8px 8px 25px rgba(0,0,0,0.5);
    }
    
    .tab-budget { border-left: 3px solid var(--neon-green); text-shadow: 0 0 10px rgba(52, 211, 153, 0.4); }
    .tab-scope { border-left: 3px solid var(--neon-amber); text-shadow: 0 0 10px rgba(245, 158, 11, 0.4); }
    .tab-system { border-left: 3px solid var(--neon-blue); height: 100px; text-shadow: 0 0 10px rgba(56, 189, 248, 0.4); }
`;

// --- MODULE 3: MODALS & DRAWERS ---
const modalCSS = `
    /* POPUP MODAL OVERLAY */
    .modal-overlay {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(8px);
        z-index: 1000; display: none; align-items: center; justify-content: center;
    }
    .modal-overlay.active { display: flex; animation: fadeIn 0.3s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    /* DRAWER */
    .drawer {
        position: fixed; top: 20px; right: -600px; width: 550px; bottom: 20px;
        background: rgba(5, 8, 15, 0.85); backdrop-filter: blur(30px);
        border-left: 1px solid rgba(255,255,255,0.1); border-radius: 24px 0 0 24px;
        box-shadow: -30px 0 80px rgba(0,0,0,0.8); transition: right 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
        z-index: 200; display: flex; flex-direction: column;
    }
    .drawer.open { right: 0; border-left: 1px solid var(--neon-blue); }
    .drawer-content { padding: 40px; overflow-y: auto; height: 100%; }
`;

// --- EXPORT COMBINED CSS ---
export const css = `
<style>
    ${layoutCSS}
    ${componentsCSS}
    ${modalCSS}
</style>
`;