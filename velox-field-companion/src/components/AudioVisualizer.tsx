import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { VELOX_COLORS } from '../theme/colors';

interface AudioVisualizerProps {
  level: number; // Real volume level (0-100)
}

export const AudioVisualizer = ({ level }: AudioVisualizerProps) => {
  // 5 bars
  const bars = [1, 2, 3, 4, 5];
  const animations = useRef(bars.map(() => new Animated.Value(4))).current;

  useEffect(() => {
    // Animate bars based on the single volume level
    // We add some randomness so they don't all move identically
    Animated.parallel(
      animations.map((anim, index) => {
        // Calculate a height based on volume + random variance
        const randomVariance = Math.random() * 0.5 + 0.5; // 0.5 to 1.0
        const targetHeight = Math.max(4, (level * 1.5) * randomVariance);

        return Animated.timing(anim, {
          toValue: targetHeight,
          duration: 100, // Fast reaction
          useNativeDriver: false,
        });
      })
    ).start();
  }, [level]); // Run every time level changes

  return (
    <View style={styles.container}>
      {bars.map((_, index) => (
        <Animated.View
          key={index}
          style={[styles.bar, { height: animations[index] }]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60, // Taller container for loud noises
    gap: 6,
    marginBottom: 10,
  },
  bar: {
    width: 8,
    backgroundColor: VELOX_COLORS.primary,
    borderRadius: 99,
  },
});