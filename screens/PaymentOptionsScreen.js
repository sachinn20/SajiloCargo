import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Animated, Image, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from '../utils/axiosInstance';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BRAND_COLOR } from '../screens/config';

// 🔁 Import Khalti logo image
import khaltiLogo from '../assets/khalti.png';

const PaymentOptionsScreen = ({ route, navigation }) => {
  const { bookingId } = route.params;
  const [selected, setSelected] = useState('khalti');
  const [isLoading, setIsLoading] = useState(false);
  const buttonScale = new Animated.Value(1);

  const handleProceedToPay = async () => {
    setIsLoading(true);
    if (selected === 'cash') {
      try {
        const token = await AsyncStorage.getItem('authToken');
        await axios.post(`/bookings/${bookingId}/pay`, { payment_mode: 'cash' }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Alert.alert('Success', 'Payment marked as Cash on Delivery');
        navigation.goBack();
      } catch (error) {
        console.log(error.response?.data || error.message);
        Alert.alert('Error', 'Failed to mark as Cash on Delivery');
      } finally {
        setIsLoading(false);
      }
    } else {
      try {
        const token = await AsyncStorage.getItem('authToken');
        const res = await axios.post('/khalti/initiate', { booking_id: bookingId }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const paymentUrl = res.data.payment_url;
        if (paymentUrl) {
          Linking.openURL(paymentUrl);
        } else {
          Alert.alert('Error', 'Failed to retrieve Khalti payment URL.');
        }
      } catch (err) {
        console.error(err.response?.data || err.message);
        Alert.alert('Error', 'Could not start Khalti payment.');
      } finally {
        setIsLoading(false);
      }
    }
    
    
  };

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choose payment method</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.optionsContainer}>
        <Text style={styles.sectionTitle}>Select a payment option</Text>

        {/* Khalti Option */}
        <TouchableOpacity
          style={[styles.optionCard, selected === 'khalti' && styles.activeCard, { marginBottom: 16 }]}
          onPress={() => setSelected('khalti')}
          activeOpacity={0.7}
        >
          <View style={[styles.radioCircle, selected === 'khalti' && styles.radioActive]}>
            {selected === 'khalti' && <View style={styles.radioDot} />}
          </View>
          <View style={styles.optionContent}>
            <View style={styles.optionIconContainer}>
              <Image source={khaltiLogo} style={{ width: 24, height: 24, resizeMode: 'contain' }} />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionText}>Pay with Khalti</Text>
              <Text style={styles.subText}>Complete the payment using Khalti</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Cash Option */}
        {/* <TouchableOpacity
          style={[styles.optionCard, selected === 'cash' && styles.activeCard]}
          onPress={() => setSelected('cash')}
          activeOpacity={0.7}
        >
          <View style={[styles.radioCircle, selected === 'cash' && styles.radioActive]}>
            {selected === 'cash' && <View style={styles.radioDot} />}
          </View>
          <View style={styles.optionContent}>
            <View style={styles.optionIconContainer}>
              <Text style={styles.optionIcon}>💵</Text>
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionText}>Cash on Delivery</Text>
              <Text style={styles.subText}>Pay directly at the time of delivery</Text>
            </View>
          </View>
        </TouchableOpacity> */}
      </View>

      <View style={styles.footer}>
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            style={styles.proceedButton}
            onPress={() => {
              animateButton();
              handleProceedToPay();
            }}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.proceedText}>
              {isLoading ? 'Processing...' : `Proceed with ${selected === 'khalti' ? 'Khalti' : 'Cash'}`}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.secureText}>
          <Ionicons name="lock-closed" size={14} color="#777" /> Secure payment processing
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default PaymentOptionsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderBottomWidth: 1, borderColor: '#eee', backgroundColor: '#fff',
  },
  backButton: { padding: 8, borderRadius: 20, backgroundColor: '#f5f5f5' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#222' },
  sectionTitle: { fontSize: 16, fontWeight: '500', marginBottom: 16, color: '#555' },
  optionsContainer: { padding: 24, flex: 1 },
  optionCard: {
    flexDirection: 'row', alignItems: 'center', padding: 20,
    borderRadius: 16, backgroundColor: '#f9f9f9', borderWidth: 1.5,
    borderColor: '#eee',
  },
  activeCard: {
    backgroundColor: '#eef1ff', borderColor: BRAND_COLOR,
    shadowColor: BRAND_COLOR, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 3,
  },
  radioCircle: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#ccc',
    alignItems: 'center', justifyContent: 'center', marginRight: 16,
  },
  radioActive: { borderColor: BRAND_COLOR },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: BRAND_COLOR },
  optionContent: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  optionIconContainer: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
    elevation: 1,
  },
  optionIcon: { fontSize: 20 },
  optionTextContainer: { flex: 1 },
  optionText: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 4 },
  subText: { fontSize: 13, color: '#777' },
  footer: {
    padding: 24, paddingBottom: 36, borderTopWidth: 1,
    borderTopColor: '#f0f0f0', backgroundColor: '#fff',
  },
  proceedButton: {
    backgroundColor: BRAND_COLOR, paddingVertical: 16, borderRadius: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
  },
  proceedText: {
    color: '#fff', fontWeight: 'bold', textAlign: 'center',
    fontSize: 16, marginRight: 8,
  },
  secureText: { textAlign: 'center', color: '#777', fontSize: 12, marginTop: 12 },
});
