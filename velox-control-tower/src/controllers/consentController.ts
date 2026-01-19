import { Request, Response } from 'express';
import { saveConsent } from '../db/database';

export const submitConsent = async (req: Request, res: Response): Promise<void> => {
    try {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || "Unknown IP";
        
        await saveConsent({
            deviceId: req.body.deviceId || "UNKNOWN_ID",
            deviceName: req.body.deviceName || "Unknown Device",
            deviceModel: req.body.deviceModel || "Generic Model",
            osVersion: req.body.osVersion || "Unknown OS",
            ip: ip.toString()
        });

        res.json({ status: 'success', message: 'Consent Recorded' });
    } catch (error) {
        console.error("❌ Consent Error:", error);
        res.status(500).json({ status: 'error' });
    }
};