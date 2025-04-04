// screens/SplashScreen.js
import React, { useEffect } from 'react';
import axios from 'axios';
import { View, Text, Image, StyleSheet, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchAuthenticatedUser } from '../utils/auth';
const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        const seen = await AsyncStorage.getItem('onboardingSeen');
        let user = await fetchAuthenticatedUser();
      
      
        setTimeout(() => {
          if (!seen) {
            // First time user – show onboarding
            navigation.replace('Onboarding');
          
          } else if (token && user) {
            if (user.user.role == 'customer') {
              navigation.replace('Dashboard');
            } else if (user.user.role== 'vehicle_owner') {
              navigation.replace('OwnerDashboard');
            } else {
         
              navigation.replace('Login'); // fallback if role is unknown
            }
          } else {
            // Not authenticated but seen onboarding – go to login
            navigation.replace('Login');
          }
        }, 2000);
      } catch (error) {
        console.error('Error checking auth/onboarding status:', error);
        navigation.replace('Login'); // fallback in case of error
      }
    };
    

    checkAuth();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
      <Image source={require('../assets/sajilo-logo.png')} style={styles.logo} />
      <Text style={styles.title}>Sajilo Cargo</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  logo: {
    width: 240,
    height: 240,
    resizeMode: 'contain',
    marginBottom: 15,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#004aad',
    marginBottom: 4,
  },
});

export default SplashScreen;
