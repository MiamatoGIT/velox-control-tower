export const css = `
<style>
    /* =========================================
       1. CORE THEME & VARIABLES (UNCHANGED)
       ========================================= */
    :root { 
        --bg-dark: #020617; 
        --card-bg: rgba(30, 41, 59, 0.6); 
        --glass-border: 1px solid rgba(255, 255, 255, 0.1);
        --accent-blue: #38bdf8; 
        --accent-red: #ef4444; 
        --accent-green: #34d399; 
        --accent-amber: #f59e0b;
    }
    
    * { box-sizing: border-box; }

    body { 
        background-color: var(--bg-dark); 
        color: #f8fafc; 
        font-family: 'Inter', sans-serif; 
        margin: 0; padding: 0;
        height: 100vh; width: 100vw;
        overflow: hidden; 
        display: flex; flex-direction: column;
    }

    /* GRID BACKGROUND */
    body::before {
        content: ""; position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
        background-size: 40px 40px; z-index: -1;
    }

    /* UTILS */
    .mono { font-family: 'JetBrains Mono', monospace; }
    .text-red { color: var(--accent-red); } 
    .text-green { color: var(--accent-green); }
    .text-blue { color: var(--accent-blue); }
    .flex { display: flex; }

    /* =========================================
       2. LAYOUT GRID (UNCHANGED)
       ========================================= */
    .dashboard-container {
        display: grid;
        grid-template-columns: 320px 1fr; /* Sidebar | Main Stage */
        grid-template-rows: auto 1fr 240px; /* Header | Main | Bottom Dock (Fixed) */
        gap: 20px; padding: 20px;
        height: 100%; width: 100%;
    }

    .header { grid-column: 1 / -1; display: flex; justify-content: space-between; border-bottom: var(--glass-border); padding-bottom: 10px; }
    
    .sidebar { display: flex; flex-direction: column; gap: 20px; overflow: hidden; }
    
    .main-stage {
        background: radial-gradient(circle at center, rgba(56, 189, 248, 0.05), transparent 70%);
        border: 1px solid var(--accent-blue);
        border-radius: 12px;
        position: relative;
        overflow: hidden;
        display: flex; flex-direction: column;
        padding: 20px;
    }

    .bottom-dock {
        grid-column: 1 / -1;
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 20px;
        height: 100%;
        overflow: hidden;
    }

    /* =========================================
       3. CARDS & LISTS (UNCHANGED)
       ========================================= */
    .card {
        background: var(--card-bg);
        border: var(--glass-border);
        border-radius: 8px;
        display: flex; flex-direction: column;
        height: 100%;
        position: relative;
        overflow: hidden;
        transition: all 0.2s ease;
        cursor: pointer;
    }
    
    .card:hover { border-color: rgba(255,255,255,0.3); }
    .card.active { border-color: var(--accent-green); box-shadow: 0 0 20px rgba(52, 211, 153, 0.15); }

    .card-header {
        padding: 10px 15px;
        background: rgba(0,0,0,0.3);
        border-bottom: 1px solid rgba(255,255,255,0.05);
        font-size: 11px; font-weight: 700; color: #94a3b8; 
        text-transform: uppercase; letter-spacing: 1px;
    }

    .card-list {
        flex: 1; 
        overflow-y: auto; 
        padding: 10px;
    }

    .list-item {
        background: rgba(0,0,0,0.2);
        border-left: 2px solid #334155;
        padding: 10px;
        margin-bottom: 8px;
        font-size: 11px;
        transition: background 0.2s;
    }
    .list-item:hover { background: rgba(255,255,255,0.05); }

    .detail-item {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr 100px;
        gap: 20px;
        padding: 20px;
        border-bottom: 1px solid rgba(255,255,255,0.05);
        align-items: center;
    }
    .detail-item:hover { background: rgba(255,255,255,0.02); }

    /* =========================================
       4. ALERTS & MODALS (UNCHANGED)
       ========================================= */
    .mini-alert {
        display: inline-block;
        background: rgba(239, 68, 68, 0.2);
        border: 1px solid var(--accent-red);
        color: var(--accent-red);
        font-size: 9px; font-weight: 800;
        padding: 2px 6px;
        border-radius: 4px;
        margin-left: 8px;
        animation: pulse-small 2s infinite;
    }

    .modal-overlay {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.85); backdrop-filter: blur(8px);
        z-index: 9999; display: none; justify-content: center; align-items: center;
    }
    .modal-box {
        background: #0f172a; border: 2px solid var(--accent-red);
        box-shadow: 0 0 50px rgba(239, 68, 68, 0.5);
        padding: 40px; border-radius: 16px; text-align: center; max-width: 500px;
        animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
    }

    /* =========================================
       5. 🆕 NEW ADDITIONS: TOOLTIPS & BADGES
       ========================================= */
    
    /* The container for the tooltip (the row itself) */
    .has-tooltip {
        position: relative;
        cursor: help;
    }
    
    /* The actual pop-up text */
    .has-tooltip:hover::after {
        content: attr(data-tooltip);
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        background: #0f172a;
        border: 1px solid var(--accent-blue);
        color: #fff;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 11px;
        font-family: 'JetBrains Mono', monospace;
        white-space: pre-wrap; /* Allows multi-line text */
        z-index: 1000;
        width: 240px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5);
        opacity: 0;
        animation: fadeIn 0.2s forwards;
        pointer-events: none; /* Let clicks pass through */
    }

    /* The 'ACKNOWLEDGED' green badge */
    .badge-ack {
        background: rgba(52, 211, 153, 0.1); 
        color: var(--accent-green); 
        border: 1px solid var(--accent-green);
        font-size: 9px; padding: 2px 4px; border-radius: 3px;
        font-weight: 700;
        letter-spacing: 0.5px;
    }

    /* =========================================
       6. ANIMATIONS & SCROLLBARS (UNCHANGED)
       ========================================= */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
    ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: var(--accent-blue); }

    @keyframes pulse-small { 0% { opacity: 0.7; } 50% { opacity: 1; } 100% { opacity: 0.7; } }
    @keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }
    @keyframes fadeIn { to { opacity: 1; } }
    
    /* 1. Lift the CONTAINER when hovered */
    .has-tooltip:hover {
        z-index: 1000;
        position: relative; /* Essential for z-index to work */
    }

    /* 2. Lift the TOOLTIP box even higher */
    .has-tooltip:hover::after {
        z-index: 2000;
    }

</style>
`;