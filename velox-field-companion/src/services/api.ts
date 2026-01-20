import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// ⚠️ YOUR SERVER IP
const API_URL = "http://34.51.236.211:3000"; 

// 1. Create a "Smart" Client
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'multipart/form-data',
    },
});

// 2. Interceptor: Attach Token automatically
api.interceptors.request.use(async (config) => {
    try {
        const token = await SecureStore.getItemAsync('user_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (error) {
        console.error("Error loading token", error);
    }
    return config;
});

// 3. Login Function (UPDATED)
export const loginUser = async (username: string, password: string) => {
    // Uses raw axios to avoid circular dependency issues during login
    const response = await axios.post(`${API_URL}/auth/login`, { username, password });
    if (response.data.token) {
        await SecureStore.setItemAsync('user_token', response.data.token);
        await SecureStore.setItemAsync('user_name', response.data.user.username);
        
        // ✅ NEW: Save Full Name for Dashboard Greeting
        if (response.data.user.fullName) {
             await SecureStore.setItemAsync('user_fullname', response.data.user.fullName);
        }
        
        // Save Work Package assignment if it exists
        if (response.data.user.assignedWP) {
             await SecureStore.setItemAsync('user_wp', response.data.user.assignedWP); 
        }
    }
    return response.data;
};

// 4. Logout Function
export const logoutUser = async () => {
    await SecureStore.deleteItemAsync('user_token');
    await SecureStore.deleteItemAsync('user_name');
    await SecureStore.deleteItemAsync('user_fullname'); // Clear full name too
    await SecureStore.deleteItemAsync('user_wp');
};

// 5. Upload Function
export const uploadReport = async (data: any, audioUri?: string, photoUri?: string) => {
    try {
        const formData = new FormData();
        
        formData.append('taskStatus', data.taskStatus);
        formData.append('manualQty', data.quantity);
        formData.append('manualComments', data.comments);
        formData.append('lang', data.lang);
        formData.append('workPackage', data.workPackage);
        formData.append('user', data.user);

        if (audioUri) {
            const fileType = audioUri.split('.').pop();
            formData.append('audio', {
                uri: Platform.OS === 'android' ? audioUri : audioUri.replace('file://', ''),
                name: `audio.${fileType}`,
                type: `audio/${fileType}`
            } as any);
        }

        if (photoUri) {
            const filename = photoUri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename || '');
            const type = match ? `image/${match[1]}` : `image/jpeg`;

            formData.append('photo', {
                uri: photoUri, 
                name: filename || 'evidence.jpg',
                type: type
            } as any);
        }

        // Use 'api' instance to ensure Token is attached
        const response = await api.post('/submit', formData);
        return response.data;
    } catch (error) { throw error; }
};

export default api;