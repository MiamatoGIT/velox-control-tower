// 1. THEME & UTILS (The "Look")
const themeCSS = `
    :root { 
        --bg-dark: #020617; 
        --card-bg: rgba(30, 41, 59, 0.6); 
        --glass-panel: rgba(15, 23, 42, 0.85);
        --glass-border: 1px solid rgba(56, 189, 248, 0.2);
        
        /* NEON PALETTE */
        --neon-blue: #38bdf8; 
        --neon-green: #34d399; 
        --neon-amber: #f59e0b;
        --neon-red: #ef4444; 
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
    
    /* SCIFI GRID BACKGROUND */
    body::before {
        content: ""; position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
        background-size: 40px 40px; z-index: -1;
    }
    
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }

    .mono { font-family: 'JetBrains Mono', monospace; }
    .text-blue { color: var(--neon-blue); text-shadow: 0 0 10px rgba(56, 189, 248, 0.5); }
    .flex { display: flex; }
    .justify-between { justify-content: space-between; }
    .small { font-size: 10px; opacity: 0.8; }
`;

// 2. LAYOUT GRID (The "Structure")
const layoutCSS = `
    .dashboard-container {
        display: grid;
        grid-template-columns: 320px 1fr;
        grid-template-rows: auto 1fr 240px;
        gap: 20px; padding: 20px;
        height: 100%; width: 100%;
    }
    .header { grid-column: 1 / -1; display: flex; justify-content: space-between; border-bottom: var(--glass-border); padding-bottom: 10px; }
    .sidebar { display: flex; flex-direction: column; gap: 20px; overflow: hidden; }
    .bottom-dock { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; height: 100%; overflow: hidden; }
    
    .main-stage {
        background: radial-gradient(circle at center, rgba(56, 189, 248, 0.05), transparent 70%);
        border: var(--glass-border);
        box-shadow: inset 0 0 50px rgba(0,0,0,0.5);
        border-radius: 12px;
        position: relative; overflow: hidden;
        display: flex; flex-direction: column; padding: 20px;
    }
`;

// 3. COMPONENTS (Cards, Lists, Badges, TOOLTIPS)
const componentsCSS = `
    /* GLASS CARDS */
    .card {
        background: var(--card-bg);
        backdrop-filter: blur(10px);
        border: var(--glass-border);
        border-radius: 8px;
        display: flex; flex-direction: column;
        height: 100%; position: relative; overflow: hidden; 
        transition: all 0.2s ease; cursor: pointer;
    }
    .card:hover { border-color: rgba(255,255,255,0.4); box-shadow: 0 0 15px rgba(56, 189, 248, 0.2); }
    .card.active { border-color: var(--neon-green); box-shadow: 0 0 20px rgba(52, 211, 153, 0.3); }

    .card-header { padding: 10px 15px; background: rgba(0,0,0,0.3); border-bottom: var(--glass-border); font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
    .card-list { flex: 1; overflow-y: auto; padding: 10px; }

    /* 🎨 COLOR CODED BOXES (ID TARGETING) */
    #card-READINESS { border-top: 2px solid var(--neon-red); }
    #card-READINESS .card-header { color: var(--neon-red); }
    
    #card-PROCUREMENT { border-top: 2px solid var(--neon-green); }
    #card-PROCUREMENT .card-header { color: var(--neon-green); }
    
    #card-EXECUTION { border-top: 2px solid var(--neon-blue); }
    #card-EXECUTION .card-header { color: var(--neon-blue); }
    
    #card-COMMISSIONING { border-top: 2px solid var(--neon-amber); }
    #card-COMMISSIONING .card-header { color: var(--neon-amber); }

    #card-HSE { border-left: 2px solid var(--neon-green); }
    #card-COMPANIES { border-left: 2px solid var(--neon-amber); }

    /* LIST ITEMS - RESTORED STYLE */
    .list-item { 
        background: rgba(0, 0, 0, 0.3); /* Darker background for contrast */
        border-left: 3px solid #334155; /* Thicker border */
        padding: 12px;                  /* More breathing room */
        margin-bottom: 8px; 
        font-size: 11px; 
        transition: background 0.2s, transform 0.1s;
        border-radius: 0 4px 4px 0;    /* Soft corners on right */
    }
    .list-item:hover { 
        background: rgba(255,255,255,0.08); 
        transform: translateX(2px);    /* Interactive feel */
    }

    .detail-item { display: grid; grid-template-columns: 2fr 1fr 1fr 100px; gap: 20px; padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); align-items: center; }

    /* TOOLTIPS & BADGES */
    .badge-ack { background: rgba(52, 211, 153, 0.1); color: var(--neon-green); border: 1px solid var(--neon-green); font-size: 9px; padding: 2px 4px; border-radius: 3px; font-weight:700;}
    .mini-alert { background: rgba(239, 68, 68, 0.2); border: 1px solid var(--neon-red); color: var(--neon-red); font-size: 9px; padding: 2px 6px; border-radius: 4px; margin-left: 8px; animation: pulse 2s infinite; }
    
    .has-tooltip { position: relative; cursor: help; }
    .has-tooltip:hover::after {
        content: attr(data-tooltip);
        position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%);
        background: #0f172a; border: 1px solid var(--neon-blue);
        color: #fff; padding: 8px 12px; border-radius: 6px;
        font-size: 11px; font-family: 'JetBrains Mono', monospace; white-space: pre-wrap;
        z-index: 2000; width: 240px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5); pointer-events: none;
    }

    .modal-overlay { position: fixed; inset:0; background: rgba(0,0,0,0.85); z-index: 9999; display: none; justify-content: center; align-items: center; }
    .modal-box { background: #0f172a; border: 2px solid var(--neon-red); padding: 40px; border-radius: 16px; text-align: center; max-width: 500px; }
    @keyframes pulse { 0% { opacity: 0.7; } 50% { opacity: 1; } 100% { opacity: 0.7; } }
`;

// 4. DRAWERS (The Sci-Fi HUD Logic)
const drawersCSS = `
    .drawer {
        position: fixed; top: 0; right: -650px;
        width: 650px; height: 100vh;
        background: var(--glass-panel);
        backdrop-filter: blur(25px);
        border-left: 1px solid var(--neon-blue);
        box-shadow: -10px 0 100px rgba(0,0,0,0.9);
        transition: right 0.4s cubic-bezier(0.19, 1, 0.22, 1);
        z-index: 9999; display: flex; flex-direction: column;
    }
    .drawer.open { right: 0; }
    
    .drawer::before {
        content: " "; position: absolute; inset: 0;
        background: repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(56, 189, 248, 0.05) 20px);
        pointer-events: none; z-index: -1;
    }

    .drawer-handle {
        position: absolute; left: -40px; top: 20%;
        width: 40px; height: 120px;
        border-radius: 8px 0 0 8px;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer;
        writing-mode: vertical-rl; text-orientation: mixed;
        font-family: 'JetBrains Mono', monospace; font-weight: bold; font-size: 12px; letter-spacing: 2px;
        color: #000; box-shadow: -5px 0 15px rgba(0,0,0,0.5);
        transition: transform 0.2s;
    }
    .drawer-handle:hover { transform: translateX(-5px); }

    .drawer-content { padding: 40px; height: 100%; overflow-y: auto; }
    .budget-row { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 15px; margin-bottom: 12px; border-radius: 6px; }

    /* STACKED BARS */
    .progress-track { width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; display: flex; overflow: hidden; margin-top: 10px; }
    .prog-bar { height: 100%; transition: width 0.6s ease-in-out; }
    .bar-installed { background: var(--neon-green); box-shadow: 0 0 10px var(--neon-green); }
    .bar-stock { background: var(--neon-amber); box-shadow: 0 0 10px var(--neon-amber); }
    .bar-budgeted { background: rgba(255,255,255,0.2); }
`;

export const css = `
<style>
    ${themeCSS}
    ${layoutCSS}
    ${componentsCSS}
    ${drawersCSS}
</style>
`;