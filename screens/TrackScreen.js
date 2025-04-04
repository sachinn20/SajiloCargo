import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BRAND_COLOR, BACKEND_URL } from './config';


const TrackScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Track Shipment Screen</Text>
    </View>
  );
};

export default TrackScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
  },
});
