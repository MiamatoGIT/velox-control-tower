import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { VELOX_COLORS } from '../theme/colors';
import { WORK_PACKAGES } from '../data/allocations';

interface LoginScreenProps {
  onLogin: (wpId: string, userName: string) => void;
}

export const LoginScreen = ({ onLogin }: LoginScreenProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>VELOX</Text>
      <Text style={styles.subtitle}>IDENTITY VERIFICATION</Text>
      
      <ScrollView contentContainerStyle={styles.list}>
        {Object.entries(WORK_PACKAGES).map(([key, data]) => (
          <TouchableOpacity 
            key={key} 
            style={styles.card} 
            onPress={() => onLogin(data.id, data.user)}
          >
            <Text style={styles.user}>{data.user}</Text>
            <Text style={styles.wpLabel}>ASSIGNED PACKAGE:</Text>
            <Text style={styles.wpId}>{data.id}</Text>
            <Text style={styles.wpName}>{data.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  logo: { fontSize: 40, fontWeight: '900', color: '#fff', letterSpacing: 2 },
  subtitle: { color: VELOX_COLORS.primary, fontSize: 12, letterSpacing: 1, marginBottom: 40 },
  list: { width: '100%', alignItems: 'center', gap: 15 },
  card: { width: 300, backgroundColor: 'rgba(30, 41, 59, 0.6)', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#334155', marginBottom: 15 },
  user: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  wpLabel: { color: '#64748b', fontSize: 10, fontWeight: 'bold' },
  wpId: { color: VELOX_COLORS.primary, fontSize: 14, fontFamily: 'monospace', marginVertical: 2 },
  wpName: { color: '#94a3b8', fontSize: 14 }
});