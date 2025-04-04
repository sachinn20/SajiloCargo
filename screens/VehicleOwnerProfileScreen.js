// screens/VehicleOwnerProfileScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BRAND_COLOR } from './config';

const VehicleOwnerProfileScreen = ({ navigation }) => {
  const [name, setName] = useState('');

  useEffect(() => {
    const fetchName = async () => {
      const storedName = await AsyncStorage.getItem('userName');
      setName(storedName || 'Vehicle Owner');
    };
    fetchName();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.clear();
    Alert.alert('Logged out', 'You have been logged out.');
    navigation.replace('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Hi, {name} 👋</Text>
      <Text style={styles.subtitle}>Vehicle Owner Account</Text>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default VehicleOwnerProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: BRAND_COLOR,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 40,
  },
  logoutButton: {
    backgroundColor: '#ff3b30',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
