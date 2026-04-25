import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { COLORS } from '../constants/theme';

export default function ResponderCommsScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.text}>Comms (Radio/Text) Placeholder</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: COLORS.white,
    fontSize: 18,
  },
});
