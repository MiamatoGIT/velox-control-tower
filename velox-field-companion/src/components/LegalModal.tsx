import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface LegalModalProps {
  onAccept: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ onAccept }) => {
  return (
    <Modal animationType="fade" visible={true} transparent={false}>
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            
            {/* HEADER */}
            <Text style={styles.headerTitle}>STARGATE FIELD ASSISTANT</Text>
            <Text style={styles.headerSubtitle}>(BETA PILOT)</Text>

            <View style={styles.divider} />

            {/* CONTENT BLOCKS */}
            <View style={styles.section}>
              <Text style={styles.pointTitle}>1. Data Privacy</Text>
              <Text style={styles.bodyText}>
                All recordings, images, and project data generated within this application are the exclusive property of Velox Electro Nordics AS and are strictly confidential.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.pointTitle}>2. System Origin</Text>
              <Text style={styles.bodyText}>
                The Source Code and AI Logic were developed by Rui Lopes and are running on independent private infrastructure to facilitate this Pilot.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.pointTitle}>3. Usage</Text>
              <Text style={styles.bodyText}>
                Licensed for use by the Kvandal Stargate Management Team for testing purposes only.
              </Text>
            </View>

          </ScrollView>

          {/* FOOTER BUTTON */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
              <Text style={styles.buttonText}>I UNDERSTAND & ENTER</Text>
            </TouchableOpacity>
          </View>

        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Deep Black
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100, // Space for button
  },
  headerTitle: {
    color: '#FFD700', // Safety Yellow
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'left',
    letterSpacing: 1,
  },
  headerSubtitle: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    opacity: 0.8,
  },
  divider: {
    height: 2,
    backgroundColor: '#333',
    marginBottom: 30,
  },
  section: {
    marginBottom: 30,
  },
  pointTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bodyText: {
    color: '#ccc',
    fontSize: 16,
    lineHeight: 24,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
    backgroundColor: '#121212',
  },
  acceptButton: {
    backgroundColor: '#FFD700', // Safety Yellow
    height: 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#000', // Black text on yellow button for contrast
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
});