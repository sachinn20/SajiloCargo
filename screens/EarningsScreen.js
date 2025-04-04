// screens/EarningsScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const EarningsScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>Earnings Overview</Text>
    </SafeAreaView>
  );
};

export default EarningsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  text: { fontSize: 20, fontWeight: 'bold' },
});
