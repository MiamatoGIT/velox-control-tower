import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { VELOX_COLORS } from '../theme/colors';

interface HeaderProps {
  step: number;
}

export const Header = ({ step }: HeaderProps) => {
  return (
    <View style={styles.header}>
      <View style={styles.statusRow}>
        <View style={styles.connDot} />
        <Text style={styles.connText}>CONNECTED</Text>
      </View>
      <View style={styles.packageBox}>
        <Text style={styles.packageLabel}>ACTIVE WORK PACKAGE</Text>
        <Text style={styles.packageId}>KSB1-CTS-B1-XX-DR-E-60201</Text>
      </View>
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${step * 25}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: { padding: 20, paddingTop: 10, backgroundColor: 'rgba(15, 23, 42, 0.6)' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  connDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: VELOX_COLORS.primary, marginRight: 8 },
  connText: { color: VELOX_COLORS.primary, fontSize: 12, letterSpacing: 2, fontWeight: 'bold' },
  packageBox: { backgroundColor: 'rgba(30, 41, 59, 0.5)', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#334155' },
  packageLabel: { color: '#64748b', fontSize: 10, fontWeight: 'bold', marginBottom: 4 },
  packageId: { color: '#fff', fontFamily: 'monospace', fontWeight: 'bold' },
  progressBarBg: { height: 4, backgroundColor: '#1e293b', marginTop: 20, borderRadius: 2 },
  progressBarFill: { height: '100%', backgroundColor: VELOX_COLORS.primary, borderRadius: 2 },
});