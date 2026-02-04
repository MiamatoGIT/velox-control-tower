export interface DailyReportData {
    meta: {
        project: string;
        date: string;
        preparedBy: string;
    };
    strategy: {
        focus: string;
    };
    hse: {
        incidents: string;
        inspections: string;
    };
    // The "Main Activity" is now dynamic (whatever is clicked)
    // But we keep the "Default" main activity here
    mainActivity: {
        title: string; // e.g., "EXECUTION SUMMARY"
        description: string;
        targetPercent: number;
        actualPercent: number;
        status: string;
        blockers?: string;
    };
    procurement: Array<{
        material: string;
        expectedDate: string;
        status: string;
    }>;
    readiness: Array<{
        wpId: string;
        drawingsStatus: string;
        readinessStatus: string;
    }>;
    // ✅ NEW: Explicit Commissioning Section
    commissioning: {
        description: string;
        targetPercent: number;
        actualPercent: number;
        status: string;
    };
}