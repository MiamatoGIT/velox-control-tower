import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { VELOX_COLORS } from '../theme/colors';

interface HeaderProps {
  onLogout: () => void;
}

export const Header = ({ onLogout }: HeaderProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>VELOX FIELD COMPANION</Text>
      <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
        <Text style={styles.logoutText}>LOGOUT</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#1e293b',
    borderRadius: 8,
    marginBottom: 10,
  },
  title: {
    color: '#fff',
    fontWeight: '900',
    letterSpacing: 1,
  },
  logoutBtn: {
    padding: 8,
    backgroundColor: '#ef4444', // Red
    borderRadius: 4,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 10,
  }
});