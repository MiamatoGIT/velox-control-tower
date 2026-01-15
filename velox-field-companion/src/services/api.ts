import axios from 'axios';
import { Platform } from 'react-native'; // ✅ Import Platform

// ⚠️ KEEP YOUR IP ADDRESS HERE
const API_URL = 'http://192.168.1.128:3000'; 

export const uploadReport = async (data: any, audioUri?: string, photoUri?: string) => {
    try {
        console.log("📤 PREPARING UPLOAD...");
        const formData = new FormData();
        
        // Append Text Data
        formData.append('taskStatus', data.taskStatus);
        formData.append('manualQty', data.quantity);
        formData.append('manualComments', data.comments);
        formData.append('lang', data.lang);
        formData.append('workPackage', data.workPackage);
        formData.append('user', data.user);

        // Append Audio
        if (audioUri) {
            const fileType = audioUri.split('.').pop();
            formData.append('audio', {
                uri: Platform.OS === 'android' ? audioUri : audioUri.replace('file://', ''),
                name: `audio.${fileType}`,
                type: `audio/${fileType}`
            } as any);
        }

        // ✅ FIXED PHOTO LOGIC
        if (photoUri) {
            console.log("📸 ATTACHING PHOTO:", photoUri);
            const filename = photoUri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename || '');
            const type = match ? `image/${match[1]}` : `image/jpeg`;

            formData.append('photo', {
                uri: photoUri, // Expo Camera URIs are usually correct now, but this keeps it safe
                name: filename || 'evidence.jpg',
                type: type
            } as any);
        } else {
            console.log("⚠️ NO PHOTO DETECTED IN STATE");
        }

        const response = await axios.post(`${API_URL}/submit`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    } catch (error) { throw error; }
};