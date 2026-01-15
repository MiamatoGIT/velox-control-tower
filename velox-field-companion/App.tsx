import React, { useState, useEffect } from 'react';
import { StyleSheet, View, StatusBar, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard, Text, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';

// MODULES
import { VELOX_COLORS } from './src/theme/colors';
import { Header } from './src/components/Header';
import { InputCard } from './src/components/InputCard';
import { uploadReport } from './src/services/api';
import { useAudioRecorder } from './src/hooks/useAudioRecorder';
import { LanguagePicker } from './src/components/LanguagePicker';
import { TRANSLATIONS, LanguageCode } from './src/utils/translations';
// ✅ NEW MODULES
import { LoginScreen } from './src/components/LoginScreen';
import { CameraCapture } from './src/components/CameraCapture';

export default function App() {
  // ✅ STATE: Login & Work Package
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

  useEffect(() => { (async () => { await Audio.requestPermissionsAsync(); })(); }, []);

  // ✅ LOGOUT FUNCTION
  const handleLogout = () => { setCurrentUser(null); setCurrentWP(null); setStep(1); };

  const submitToControlTower = async () => {
    if (!qtyData && !commentData && !recordingUri) { Alert.alert(t.missing, "Data missing."); return; }

    try {
        Alert.alert("Syncing", "Uploading Evidence...");
        
        // ✅ Payload now includes Photo and User Info
        const payload = {
            taskStatus,
            quantity: qtyData,
            comments: commentData,
            lang: lang.toLowerCase(),
            workPackage: currentWP, // From Login
            user: currentUser       // From Login
        };

        await uploadReport(payload, recordingUri || undefined, photoUri || undefined); // ✅ Pass Photo
        
        Alert.alert("✅ Success", t.success);
        setStep(1); setQtyData(""); setCommentData(""); setTaskStatus(null); setPhotoUri(null);
    } catch (error) {
        Alert.alert("❌ Error", "Check Connection.");
    }
  };

  // 1️⃣ IF NOT LOGGED IN, SHOW LOGIN SCREEN
  if (!currentUser) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={[VELOX_COLORS.primaryDim, VELOX_COLORS.background]} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={styles.safeArea}>
          <LoginScreen onLogin={(wp, user) => { setCurrentWP(wp); setCurrentUser(user); }} />
        </SafeAreaView>
      </View>
    );
  }

  // 2️⃣ IF CAMERA IS OPEN
  if (showCamera) {
    return <CameraCapture onPhotoTaken={(uri) => { setPhotoUri(uri); setShowCamera(false); }} onClose={() => setShowCamera(false)} />;
  }

  // 3️⃣ MAIN WORKFLOW
  return (
    <SafeAreaProvider>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <StatusBar barStyle="light-content" />
          <LinearGradient colors={[VELOX_COLORS.primaryDim, VELOX_COLORS.background]} style={StyleSheet.absoluteFill} />
          <SafeAreaView style={styles.safeArea}>
            
            {/* ✅ CUSTOM HEADER SHOWING USER & WP */}
            <View style={styles.topBar}>
                <View>
                    <Text style={styles.topUser}>{currentUser}</Text>
                    <Text style={styles.topWp}>{currentWP}</Text>
                </View>
                <TouchableOpacity onPress={handleLogout}><Text style={styles.logout}>EXIT</Text></TouchableOpacity>
            </View>

            <Header step={step} />

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.content}>
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
                    
                    {/* ✅ PHOTO PREVIEW BUTTON */}
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
          </SafeAreaView>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: VELOX_COLORS.background },
  safeArea: { flex: 1 },
  content: { flex: 1 },
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