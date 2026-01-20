import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { VELOX_COLORS } from '../theme/colors';
import { loginUser } from '../services/api';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen = ({ onLoginSuccess }: LoginScreenProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Required", "Please enter username and password");
      return;
    }

    setLoading(true);
    try {
      console.log(`🔐 Attempting login for: ${username}`);
      const data = await loginUser(username, password);
      console.log("✅ Login Successful", data.user.username);
      onLoginSuccess();
    } catch (error: any) {
      console.error("❌ Login Failed", error);
      Alert.alert("Login Failed", "Invalid credentials or server offline");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <Text style={styles.title}>VELOX</Text>
          <Text style={styles.subtitle}>FIELD COMPANION</Text>
          
          <View style={styles.form}>
            <Text style={styles.label}>OPERATOR ID</Text>
            <TextInput 
              style={styles.input} 
              value={username} 
              onChangeText={setUsername}
              autoCapitalize="none"
              placeholder="username" 
              placeholderTextColor="#64748b"
            />
            
            <Text style={styles.label}>ACCESS CODE</Text>
            <TextInput 
              style={styles.input} 
              value={password} 
              onChangeText={setPassword}
              secureTextEntry
              placeholder="password" 
              placeholderTextColor="#64748b"
            />

            <TouchableOpacity 
              style={styles.btn} 
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.btnText}>AUTHENTICATE</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  inner: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 40, fontWeight: '900', color: '#fff', textAlign: 'center', letterSpacing: 2 },
  subtitle: { fontSize: 14, color: VELOX_COLORS.primary, textAlign: 'center', marginBottom: 50, letterSpacing: 4, fontWeight: 'bold' },
  form: { backgroundColor: 'rgba(30, 41, 59, 0.5)', padding: 25, borderRadius: 16, borderWidth: 1, borderColor: '#334155' },
  label: { color: '#94a3b8', fontSize: 10, fontWeight: 'bold', marginBottom: 8, marginTop: 10 },
  input: { backgroundColor: '#1e293b', color: '#fff', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#475569', fontSize: 16 },
  btn: { backgroundColor: VELOX_COLORS.primary, padding: 18, borderRadius: 8, alignItems: 'center', marginTop: 30 },
  btnText: { color: '#000', fontWeight: '900', letterSpacing: 1 }
});