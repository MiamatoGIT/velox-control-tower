export const coreJS = `
    /** CONFIG & STATE */
    const CONFIG = {
        POLL_INTERVAL: 120000, 
        COLORS: {
            EXECUTION: '#38bdf8', READINESS: '#ef4444', PROCUREMENT: '#34d399', DEFAULT: '#334155', TEXT_SUB: '#94a3b8'
        }
    };

    const STATE = {
        data: window.DASHBOARD_DATA || {},
        activeSection: 'STRATEGY'
    };

    /** UTILS */
    const formatMoney = (val) => {
        if (!val) return 'NOK 0';
        if (val >= 1000000) return \`NOK \${(val/1000000).toFixed(1)}M\`;
        if (val >= 1000) return \`NOK \${(val/1000).toFixed(0)}k\`;
        return \`NOK \${val.toFixed(0)}\`;
    };
`;