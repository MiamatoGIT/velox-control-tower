import React, { useState, useEffect } from 'react';
import { StyleSheet, View, StatusBar, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard, Text, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import * as Device from 'expo-device'; 
import * as Application from 'expo-application'; 
import axios from 'axios';

// MODULES
import { VELOX_COLORS } from './src/theme/colors';
import { Header } from './src/components/Header';
import { InputCard } from './src/components/InputCard';
import { uploadReport } from './src/services/api'; 
import { useAudioRecorder } from './src/hooks/useAudioRecorder';
import { LanguagePicker } from './src/components/LanguagePicker';
import { TRANSLATIONS, LanguageCode } from './src/utils/translations';
import { LoginScreen } from './src/components/LoginScreen';
import { CameraCapture } from './src/components/CameraCapture';
import { LegalModal } from './src/components/LegalModal';
import { Footer } from './src/components/Footer';

// ✅ CRITICAL FIX: Use your Real Cloud IP. Do NOT use localhost.
const API_URL = 'http://34.51.236.211:3000';

export default function App() {
  // ✅ STATE
  const [isLegalAccepted, setIsLegalAccepted] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentWP, setCurrentWP] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const [step, setStep] = useState(1);
  const [taskStatus, setTaskStatus] = useState<string | null>(null);
  const [lang, setLang] = useState<LanguageCode>('EN');
  const t = TRANSLATIONS[lang];

  const { isRecording, toggleRecording, audioLevel, recordingUri } = useAudioRecorder();
  const [qtyData, setQtyData] = useState<string>(""); 
  const [commentData, setCommentData] = useState<string>("");

  // ✅ NEW: Server Health Check on App Start
  useEffect(() => { 
    (async () => { 
        await Audio.requestPermissionsAsync(); 
        try {
            // Wake up the server / Check connection
            await axios.get(`${API_URL}/`);
            console.log("🟢 Server Online");
        } catch (e) {
            console.log("🔴 Server Connection Failed");
            // Optional: Alert the user if critical
            // Alert.alert("Connection Warning", "Could not reach Control Tower. Check internet.");
        }
    })(); 
  }, []);

  // ✅ handle Legal Acceptance with Device Fingerprinting
  const handleLegalAccept = async () => {
    try {
        // Alert.alert("Registering Device", "Securing connection to Control Tower...");
        
        let deviceId = "UNKNOWN_ID";
        if (Platform.OS === 'android') {
            deviceId = Application.androidId || "ANDROID_NO_ID";
        } else if (Platform.OS === 'ios') {
            deviceId = await Application.getIosIdForVendorAsync() || "IOS_NO_ID";
        }

        const payload = {
            deviceId: deviceId,
            deviceName: Device.deviceName || "Generic Device",
            deviceModel: Device.modelName || "Generic Model",
            osVersion: `${Device.osName} ${Device.osVersion}`
        };

        // Send to backend
        await axios.post(`${API_URL}/api/consent`, payload);
        
        // Only allow entry if server logged it (or fail open if you prefer)
        setIsLegalAccepted(true);

    } catch (error) {
        console.error("Consent Error", error);
        // Fail Open: Let them work even if server is offline
        setIsLegalAccepted(true); 
    }
  };

  // ✅ LOGOUT FUNCTION
  const handleLogout = () => { setCurrentUser(null); setCurrentWP(null); setStep(1); };

  const submitToControlTower = async () => {
    if (!qtyData && !commentData && !recordingUri) { Alert.alert(t.missing, "Data missing."); return; }

    try {
        Alert.alert("Syncing", "Uploading Evidence...");
        
        const payload = {
            taskStatus,
            quantity: qtyData,
            comments: commentData,
            lang: lang.toLowerCase(),
            workPackage: currentWP,
            user: currentUser
        };

        // Note: Make sure src/services/api.ts ALSO uses the correct URL
        // If it doesn't support passing a base URL, you might need to update that file too.
        await uploadReport(payload, recordingUri || undefined, photoUri || undefined);
        
        Alert.alert("✅ Success", t.success);
        setStep(1); setQtyData(""); setCommentData(""); setTaskStatus(null); setPhotoUri(null);
    } catch (error) {
        console.error(error);
        Alert.alert("❌ Error", "Check Connection.");
    }
  };

  // ============================================================
  // 🛑 RENDER LOGIC
  // ============================================================

  // 1️⃣ PRIORITY #1: LEGAL CHECK
  if (!isLegalAccepted) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="#121212" />
        <LegalModal onAccept={handleLegalAccept} />
      </SafeAreaProvider>
    );
  }

  // 2️⃣ PRIORITY #2: LOGIN SCREEN
  if (!currentUser) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={[VELOX_COLORS.primaryDim, VELOX_COLORS.background]} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={styles.safeArea}>
          <View style={{ flex: 1 }}>
            <LoginScreen onLogin={(wp, user) => { setCurrentWP(wp); setCurrentUser(user); }} />
          </View>
          <Footer />
        </SafeAreaView>
      </View>
    );
  }

  // 3️⃣ PRIORITY #3: CAMERA
  if (showCamera) {
    return <CameraCapture onPhotoTaken={(uri) => { setPhotoUri(uri); setShowCamera(false); }} onClose={() => setShowCamera(false)} />;
  }

  // 4️⃣ PRIORITY #4: MAIN DASHBOARD
  return (
    <SafeAreaProvider>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <StatusBar barStyle="light-content" />
          <LinearGradient colors={[VELOX_COLORS.primaryDim, VELOX_COLORS.background]} style={StyleSheet.absoluteFill} />
          <SafeAreaView style={styles.safeArea}>
            
            <View style={styles.topBar}>
                <View>
                    <Text style={styles.topUser}>{currentUser}</Text>
                    <Text style={styles.topWp}>{currentWP}</Text>
                </View>
                <TouchableOpacity onPress={handleLogout}><Text style={styles.logout}>EXIT</Text></TouchableOpacity>
            </View>

            <Header step={step} />

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
              <ScrollView contentContainerStyle={styles.scrollContent}>
                
                {step === 1 && (
                  <View style={styles.stepContainer}>
                    <LanguagePicker selected={lang} onSelect={setLang} />
                    <View style={styles.textCenter}>
                      <Text style={styles.title}>{t.taskTitle}</Text>
                    </View>
                    <TouchableOpacity style={styles.bigButtonYes} onPress={() => {setTaskStatus('YES'); setStep(2);}}><Text style={styles.btnTextYes}>{t.yes}</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.bigButtonNo} onPress={() => {setTaskStatus('NO'); setStep(2);}}><Text style={styles.btnTextNo}>{t.no}</Text></TouchableOpacity>
                  </View>
                )}

                {step === 2 && (
                  <InputCard title={t.qtyTitle} subtitle={t.qtySubtitle} placeholder={t.qtyPlaceholder} value={qtyData} onChangeText={setQtyData} isRecording={isRecording} onToggleRecord={toggleRecording} audioLevel={audioLevel} onNext={() => setStep(3)} nextLabel={t.next} />
                )}

                {step === 3 && (
                  <InputCard title={t.commentsTitle} subtitle={t.commentsSubtitle} placeholder={t.commentsPlaceholder} value={commentData} onChangeText={setCommentData} isRecording={isRecording} onToggleRecord={toggleRecording} audioLevel={audioLevel} onNext={() => setStep(4)} nextLabel={t.review} multiline={true} />
                )}

                {step === 4 && (
                  <View style={styles.stepContainer}>
                    <Text style={styles.title}>{t.review}</Text>
                    
                    <TouchableOpacity style={styles.photoButton} onPress={() => setShowCamera(true)}>
                        {photoUri ? <Image source={{ uri: photoUri }} style={styles.thumb} /> : <View style={styles.cameraIcon} />}
                        <Text style={styles.photoText}>{photoUri ? "CHANGE PHOTO" : "ADD SITE PHOTO"}</Text>
                    </TouchableOpacity>

                    <View style={styles.reviewBox}>
                        <Text style={styles.reviewValue}>User: {currentUser}</Text>
                        <Text style={styles.reviewValue}>Status: {taskStatus}</Text>
                        <Text style={styles.reviewValue}>Qty: {qtyData}</Text>
                    </View>
                    <TouchableOpacity style={[styles.navButton, {backgroundColor: VELOX_COLORS.primary}]} onPress={submitToControlTower}><Text style={[styles.navButtonText, {color: '#000'}]}>{t.upload}</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => setStep(1)} style={{marginTop: 20}}><Text style={{color: VELOX_COLORS.textDim, textAlign: 'center'}}>{t.cancel}</Text></TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            </KeyboardAvoidingView>

            <Footer />

          </SafeAreaView>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: VELOX_COLORS.background },
  safeArea: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 20, justifyContent: 'center' },
  stepContainer: { flex: 1, justifyContent: 'center', gap: 20, minHeight: 500 },
  textCenter: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 8, textAlign: 'center' },
  bigButtonYes: { backgroundColor: 'rgba(0, 255, 157, 0.1)', borderWidth: 1, borderColor: VELOX_COLORS.primary, height: 120, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  btnTextYes: { color: VELOX_COLORS.primary, fontSize: 40, fontWeight: '900', letterSpacing: 1 },
  bigButtonNo: { backgroundColor: 'rgba(15, 23, 42, 0.3)', borderWidth: 1, borderColor: '#334155', height: 80, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  btnTextNo: { color: '#64748b', fontSize: 24, fontWeight: 'bold' },
  navButton: { width: '100%', height: 60, backgroundColor: VELOX_COLORS.slateLight, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 20, borderWidth: 1, borderColor: '#334155' },
  navButtonText: { color: '#fff', fontFamily: 'monospace', fontSize: 16, fontWeight: 'bold' },
  reviewBox: { padding: 20, backgroundColor: 'rgba(30, 41, 59, 0.5)', borderRadius: 12, borderWidth: 1, borderColor: '#334155' },
  reviewValue: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#334155' },
  topUser: { color: '#fff', fontWeight: 'bold' },
  topWp: { color: VELOX_COLORS.primary, fontSize: 10, fontFamily: 'monospace' },
  logout: { color: '#ef4444', fontWeight: 'bold', fontSize: 12 },
  
  photoButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#334155', padding: 15, borderRadius: 12, marginBottom: 20, justifyContent: 'center', gap: 10 },
  photoText: { color: '#fff', fontWeight: 'bold' },
  cameraIcon: { width: 30, height: 30, backgroundColor: '#94a3b8', borderRadius: 4 },
  thumb: { width: 40, height: 40, borderRadius: 4 }
});