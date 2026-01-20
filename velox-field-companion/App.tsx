import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Audio } from 'expo-av';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

// COMPONENTS
import { VELOX_COLORS } from './src/theme/colors';
import { AppNavigator } from './src/navigation/AppNavigator';
import { LegalModal } from './src/components/LegalModal';
import { logoutUser } from './src/services/api';

// ⚠️ YOUR SERVER IP
const API_URL = 'http://34.51.236.211:3000';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLegalAccepted, setIsLegalAccepted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  // 1. STARTUP CHECK
  useEffect(() => {
    (async () => {
      try {
        await Audio.requestPermissionsAsync();

        // Check for saved login
        const token = await SecureStore.getItemAsync('user_token');
        const user = await SecureStore.getItemAsync('user_name');
        
        if (token && user) {
          console.log("🔄 Auto-login:", user);
          setCurrentUser(user);
          setIsAuthenticated(true);
        }
      } catch (e) {
        console.error("Startup check failed", e);
      } finally {
        // ALWAYS finish loading, even if error
        setIsLoading(false);
      }

      // Wake up server in background
      try { axios.get(`${API_URL}/`).catch(() => {}); } catch(e) {}
    })();
  }, []);

  // 2. HANDLERS
  const handleLegalAccept = () => {
    setIsLegalAccepted(true);
  };

  const handleLoginSuccess = async () => {
    const user = await SecureStore.getItemAsync('user_name');
    setCurrentUser(user || "User");
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Confirm exit?", [
      { text: "Cancel", style: "cancel" },
      { text: "Exit", style: "destructive", onPress: async () => {
        await logoutUser();
        setIsAuthenticated(false);
        setCurrentUser(null);
      }}
    ]);
  };

  // 3. RENDER
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={VELOX_COLORS.primary} />
      </View>
    );
  }

  if (!isLegalAccepted) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <LegalModal onAccept={handleLegalAccept} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient colors={[VELOX_COLORS.primaryDim, VELOX_COLORS.background]} style={StyleSheet.absoluteFill} />
        
        <SafeAreaView style={styles.safeArea}>
          <AppNavigator 
            isAuthenticated={isAuthenticated} 
            currentUser={currentUser}
            onLoginSuccess={handleLoginSuccess}
            onLogout={handleLogout}
          />
        </SafeAreaView>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  safeArea: { flex: 1 },
  center: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' }
});