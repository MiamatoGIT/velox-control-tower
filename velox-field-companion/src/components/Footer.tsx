import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const Footer = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Stargate Assistant v1.2 | Data © Velox Electro Nordics | System developed & hosted by Rui Lopes
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)', // Subtle separator
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent', // Keeps the gradient background visible
  },
  text: {
    color: '#94a3b8', // Slate gray (readable but unobtrusive)
    fontSize: 10,
    fontFamily: 'monospace', // Technical look
    opacity: 0.6,
    textAlign: 'center',
  },
});