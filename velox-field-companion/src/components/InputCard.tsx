import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { VELOX_COLORS } from '../theme/colors';
import { AudioVisualizer } from './AudioVisualizer';

interface InputCardProps {
  title: string;
  subtitle: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  isRecording: boolean;
  onToggleRecord: () => void;
  onNext: () => void;
  nextLabel: string;
  audioLevel: number; // ✅ NEW PROP
  multiline?: boolean;
}

export const InputCard = ({ 
  title, subtitle, value, onChangeText, placeholder, 
  isRecording, onToggleRecord, onNext, nextLabel, audioLevel, multiline 
}: InputCardProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      {/* TEXT INPUT - MAIN ENTRY */}
      <TextInput 
        style={[styles.inputField, multiline && styles.textArea]}
        placeholder={placeholder}
        placeholderTextColor={VELOX_COLORS.textDim}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
      />

      {/* REAL VISUALIZER */}
      <View style={{ opacity: isRecording ? 1 : 0, height: 60 }}>
         <AudioVisualizer level={audioLevel} />
      </View>

      {/* MIC BUTTON */}
      <TouchableOpacity 
        onPress={onToggleRecord} 
        style={[styles.micButton, isRecording && styles.micActive]}
      >
        <View style={[styles.micIcon, isRecording && { backgroundColor: VELOX_COLORS.danger }]} />
      </TouchableOpacity>
      
      <Text style={styles.micLabel}>
        {isRecording ? "RECORDING EVIDENCE..." : "TAP TO RECORD AUDIO"}
      </Text>

      {/* ✅ INSTRUCTION FOR TRANSCRIPTION */}
      <Text style={styles.hintText}>
        For text, use the Microphone key 🎙️ on your keyboard.
      </Text>

      <TouchableOpacity style={styles.navButton} onPress={onNext}>
        <Text style={styles.navButtonText}>{nextLabel}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: VELOX_COLORS.textDim, textAlign: 'center', marginBottom: 20 },
  inputField: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderWidth: 1,
    borderColor: VELOX_COLORS.primary,
    borderRadius: 12,
    padding: 15,
    fontSize: 20,
    color: '#fff',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    textAlign: 'center',
    marginBottom: 5,
    width: '100%',
    minHeight: 60,
  },
  textArea: { height: 120, paddingTop: 15 },
  micButton: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: VELOX_COLORS.primary, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', marginBottom: 8 },
  micActive: { borderColor: VELOX_COLORS.danger, shadowColor: VELOX_COLORS.danger, shadowOpacity: 0.6, shadowRadius: 10, elevation: 10 },
  micIcon: { width: 24, height: 24, backgroundColor: '#fff', borderRadius: 4 },
  micLabel: { color: VELOX_COLORS.textDim, fontSize: 10, letterSpacing: 1, marginBottom: 5 },
  hintText: { color: VELOX_COLORS.primary, fontSize: 11, marginBottom: 25, fontWeight: 'bold' },
  navButton: { width: '100%', height: 60, backgroundColor: VELOX_COLORS.slateLight, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  navButtonText: { color: '#fff', fontFamily: 'monospace', fontSize: 16, fontWeight: 'bold' },
});