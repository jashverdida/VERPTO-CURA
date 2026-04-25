import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES } from '../constants/theme';

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Map View</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.slate50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.slate700,
  },
});
