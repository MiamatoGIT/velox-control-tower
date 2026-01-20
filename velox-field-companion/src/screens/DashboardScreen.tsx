import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { VELOX_COLORS } from '../theme/colors';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { CameraCapture } from '../components/CameraCapture';
import { Header } from '../components/Header';
import { uploadReport } from '../services/api';

interface DashboardProps {
    user: string;
    onLogout: () => void;
}

export const DashboardScreen = ({ user, onLogout }: DashboardProps) => {
    const { isRecording, toggleRecording, audioLevel, recordingUri, resetRecording } = useAudioRecorder();
    const [photoUri, setPhotoUri] = useState<string | null>(null);
    const [showCamera, setShowCamera] = useState(false);
    const [manualNotes, setManualNotes] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    
    // ✅ NEW STATE FOR DISPLAY NAME
    const [displayName, setDisplayName] = useState(user); 

    // ✅ FETCH FULL NAME ON LOAD
    useEffect(() => {
        SecureStore.getItemAsync('user_fullname').then(name => {
            if (name) setDisplayName(name);
        });
    }, []);

    const handleSubmit = async () => {
        if (!recordingUri && !manualNotes) {
            Alert.alert("Empty Report", "Please record a voice update or add notes.");
            return;
        }

        setIsUploading(true);
        try {
            // Get the Work Package ID from storage (or default to General)
            const wp = await SecureStore.getItemAsync('user_wp') || "WP-GENERAL";

            const payload = {
                taskStatus: "YES", 
                quantity: "0", 
                comments: manualNotes,
                lang: "en",
                workPackage: wp, // ✅ USES DATABASE ASSIGNMENT
                user: user // Keep username for database logic
            };

            await uploadReport(payload, recordingUri || undefined, photoUri || undefined);
            
            Alert.alert("✅ Report Sent", "Velox AI is analyzing your update.");
            
            resetRecording(); // This works now!
            setPhotoUri(null);
            setManualNotes("");

        } catch (error) {
            console.error(error);
            Alert.alert("Upload Failed", "Check your connection.");
        } finally {
            setIsUploading(false);
        }
    };

    if (showCamera) {
        return <CameraCapture onPhotoTaken={(uri) => { setPhotoUri(uri); setShowCamera(false); }} onClose={() => setShowCamera(false)} />;
    }

    return (
        <View style={styles.container}>
            <Header onLogout={onLogout} />
            
            <ScrollView contentContainerStyle={styles.scroll}>
                {/* ✅ GREETING USES DISPLAY NAME */}
                <Text style={styles.greeting}>HELLO, {displayName}</Text>
                <Text style={styles.instruction}>Record your daily progress.</Text>

                <View style={styles.card}>
                    <Text style={styles.label}>VOICE REPORT</Text>
                    <View style={styles.micContainer}>
                        <TouchableOpacity 
                            style={[styles.micButton, isRecording && styles.micActive]} 
                            onPress={toggleRecording}
                        >
                            <View style={[styles.micIcon, isRecording && styles.micIconActive]} />
                        </TouchableOpacity>
                        <Text style={styles.micStatus}>
                            {isRecording ? "RECORDING..." : (recordingUri ? "AUDIO CAPTURED" : "TAP TO RECORD")}
                        </Text>
                    </View>
                    {isRecording && (
                        <View style={{height: 4, backgroundColor: VELOX_COLORS.primary, width: `${Math.min(audioLevel * 100, 100)}%`, marginTop: 10}} />
                    )}
                </View>

                <View style={styles.card}>
                    <Text style={styles.label}>VISUAL EVIDENCE</Text>
                    <TouchableOpacity style={styles.photoButton} onPress={() => setShowCamera(true)}>
                        {photoUri ? (
                            <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                        ) : (
                            <View style={styles.cameraIcon} />
                        )}
                        <Text style={styles.photoText}>
                            {photoUri ? "CHANGE PHOTO" : "ADD SITE PHOTO"}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.card}>
                    <Text style={styles.label}>ADDITIONAL NOTES (OPTIONAL)</Text>
                    <TextInput 
                        style={styles.input} 
                        placeholder="Type details here..." 
                        placeholderTextColor="#64748b"
                        value={manualNotes}
                        onChangeText={setManualNotes}
                        multiline
                    />
                </View>

                <TouchableOpacity 
                    style={[styles.submitBtn, isUploading && styles.disabledBtn]} 
                    onPress={handleSubmit}
                    disabled={isUploading}
                >
                    {isUploading ? <ActivityIndicator color="#000" /> : <Text style={styles.submitText}>UPLOAD REPORT</Text>}
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { padding: 20, paddingBottom: 40 },
    greeting: { color: '#fff', fontSize: 24, fontWeight: '900', letterSpacing: 1 },
    instruction: { color: '#94a3b8', fontSize: 14, marginBottom: 30 },
    card: { backgroundColor: 'rgba(30, 41, 59, 0.5)', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#334155', marginBottom: 20 },
    label: { color: VELOX_COLORS.primary, fontSize: 10, fontWeight: 'bold', marginBottom: 15, letterSpacing: 1 },
    micContainer: { alignItems: 'center', gap: 10 },
    micButton: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#334155', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#475569' },
    micActive: { borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.2)' },
    micIcon: { width: 20, height: 30, backgroundColor: '#94a3b8', borderRadius: 10 },
    micIconActive: { backgroundColor: '#ef4444' },
    micStatus: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
    photoButton: { flexDirection: 'row', alignItems: 'center', gap: 15, padding: 10, backgroundColor: '#1e293b', borderRadius: 8 },
    photoPreview: { width: 50, height: 50, borderRadius: 4 },
    cameraIcon: { width: 50, height: 50, backgroundColor: '#475569', borderRadius: 4 },
    photoText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
    input: { color: '#fff', minHeight: 60, textAlignVertical: 'top' },
    submitBtn: { backgroundColor: VELOX_COLORS.primary, padding: 20, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    disabledBtn: { backgroundColor: '#475569' },
    submitText: { color: '#000', fontWeight: '900', fontSize: 16, letterSpacing: 1 }
});