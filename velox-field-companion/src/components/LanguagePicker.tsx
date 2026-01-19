import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { VELOX_COLORS } from '../theme/colors';
import { LanguageCode } from '../utils/translations';

interface LanguagePickerProps {
  selected: LanguageCode;
  onSelect: (lang: LanguageCode) => void;
}

const LANGUAGES: { code: LanguageCode; flag: string; label: string }[] = [
  { code: 'EN', flag: '🇺🇸', label: 'English' },
  { code: 'PT', flag: '🇵🇹', label: 'Português' },
  { code: 'PL', flag: '🇵🇱', label: 'Polski' },
  { code: 'NO', flag: '🇳🇴', label: 'Norsk' },
  { code: 'NE', flag: '🇳🇵', label: 'नेपाली' }, // ✅ Added Nepal
];

export const LanguagePicker = ({ selected, onSelect }: LanguagePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const activeLang = LANGUAGES.find(l => l.code === selected) || LANGUAGES[0];

  const handleSelect = (code: LanguageCode) => {
    onSelect(code);
    setIsOpen(false);
  };

  return (
    // zIndex in the wrapper is crucial for iOS so the dropdown floats ABOVE the text below it
    <View style={[styles.wrapper, { zIndex: isOpen ? 1000 : 1 }]}>
      
      {/* LABEL: Always visible now, so the layout doesn't jump up/down */}
      <Text style={styles.label}>LANGUAGE / JĘZYK / IDIOMA</Text>

      <View style={styles.container}>
        {/* TRIGGER BUTTON */}
        <TouchableOpacity 
          style={[styles.triggerButton, isOpen && styles.triggerActive]} 
          onPress={() => setIsOpen(!isOpen)}
          activeOpacity={0.8}
        >
          <View style={styles.row}>
            <Text style={styles.mainFlag}>{activeLang.flag}</Text>
            <Text style={styles.mainText}>{activeLang.label}</Text>
          </View>
          <Text style={styles.chevron}>{isOpen ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {/* DROPDOWN LIST (Absolute Positioned) */}
        {isOpen && (
          <View style={styles.dropdownList}>
            {LANGUAGES.map((item) => (
              <TouchableOpacity
                key={item.code}
                style={[
                  styles.optionItem,
                  selected === item.code && styles.optionSelected
                ]}
                onPress={() => handleSelect(item.code)}
              >
                <Text style={styles.optionFlag}>{item.flag}</Text>
                <Text style={[
                  styles.optionText,
                  selected === item.code && styles.optionTextSelected
                ]}>
                  {item.label}
                </Text>
                {selected === item.code && <View style={styles.dot} />}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: 20,
    // No overflow: hidden here, or the dropdown gets cut off!
  },
  container: {
    position: 'relative', // Establish a new coordinate system
  },
  label: {
    color: VELOX_COLORS.textDim,
    fontSize: 10,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 1,
  },
  
  // TRIGGER
  triggerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    height: 60,
  },
  triggerActive: {
    borderColor: VELOX_COLORS.primary,
    backgroundColor: 'rgba(15, 23, 42, 1)',
    borderBottomLeftRadius: 0, // Visual connection to the list
    borderBottomRightRadius: 0,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  mainFlag: { fontSize: 24 },
  mainText: { color: '#fff', fontSize: 16, fontWeight: 'bold', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  chevron: { color: VELOX_COLORS.primary, fontSize: 18, fontWeight: 'bold' },

  // DROPDOWN LIST - THE FIX
  dropdownList: {
    position: 'absolute', // ✅ Floats over content
    top: 59, // Exact height of trigger button - 1px border overlap
    left: 0,
    right: 0,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: VELOX_COLORS.primary,
    borderTopWidth: 0, // Blend with trigger
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    padding: 5,
    
    // Shadow to separate from content below
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 20, // High elevation for Android
    zIndex: 2000,  // High zIndex for iOS
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    gap: 12,
  },
  optionSelected: { backgroundColor: 'rgba(0, 255, 157, 0.1)' },
  optionFlag: { fontSize: 20 },
  optionText: { color: '#94a3b8', fontSize: 16 },
  optionTextSelected: { color: '#fff', fontWeight: 'bold' },
  dot: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: VELOX_COLORS.primary, marginLeft: 'auto',
  }
});