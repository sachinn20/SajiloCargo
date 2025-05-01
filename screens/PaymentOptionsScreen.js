import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from '../utils/axiosInstance';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BRAND_COLOR } from '../screens/config'; // Path as per your project
import { Linking } from 'react-native';


const PaymentOptionsScreen = ({ route, navigation }) => {
  const { bookingId } = route.params;
  const [selected, setSelected] = useState('khalti');

  const handleProceedToPay = async () => {
    if (selected === 'cash') {
      try {
        const token = await AsyncStorage.getItem('authToken');
        await axios.post(`/bookings/${bookingId}/pay`, {
          payment_mode: 'cash'
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
  
        Alert.alert('Success', 'Payment marked as Cash on Delivery');
        navigation.goBack();
      } catch (error) {
        console.log(error.response?.data || error.message);
        Alert.alert('Error', 'Failed to mark as Cash on Delivery');
      }
    } else {
      try {
        const token = await AsyncStorage.getItem('authToken');
        const res = await axios.post('/khalti/initiate-in-app', {
          booking_id: bookingId
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
  
        const paymentUrl = res.data.payment_url;
        if (paymentUrl) {
          // Open the Khalti payment page directly
          Linking.openURL(paymentUrl);
        } else {
          Alert.alert('Error', 'Failed to retrieve Khalti payment URL.');
        }
      } catch (err) {
        console.error(err.response?.data || err.message);
        Alert.alert('Error', 'Could not start Khalti payment.');
      }
    }
  };
  
  

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choose payment method</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={[styles.optionCard, selected === 'khalti' && styles.activeCard]}
          onPress={() => setSelected('khalti')}
        >
          <View style={[styles.radioCircle, selected === 'khalti' && styles.radioActive]}>
            {selected === 'khalti' && <View style={styles.radioDot} />}
          </View>
          <View>
            <Text style={styles.optionText}>💳 Pay with Khalti</Text>
            <Text style={styles.subText}>Complete the payment using your e-wallet</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.optionCard, selected === 'cash' && styles.activeCard]}
          onPress={() => setSelected('cash')}
        >
          <View style={[styles.radioCircle, selected === 'cash' && styles.radioActive]}>
            {selected === 'cash' && <View style={styles.radioDot} />}
          </View>
          <View>
            <Text style={styles.optionText}>💵 Cash on Delivery</Text>
            <Text style={styles.subText}>Pay directly at the time of delivery</Text>
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.proceedButton} onPress={handleProceedToPay}>
        <Text style={styles.proceedText}>Proceed to pay</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default PaymentOptionsScreen;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  headerTitle: { fontSize: 16, fontWeight: '600' },
  optionsContainer: { padding: 20 },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 12,
  },
  activeCard: {
    backgroundColor: '#eef1ff', // light background
    borderColor: BRAND_COLOR,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioActive: {
    borderColor: BRAND_COLOR,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: BRAND_COLOR,
  },
  optionText: { fontSize: 16, fontWeight: '600', color: '#333' },
  subText: { fontSize: 12, color: '#777', marginTop: 4 },
  proceedButton: {
    backgroundColor: BRAND_COLOR,
    paddingVertical: 14,
    marginHorizontal: 20,
    borderRadius: 8,
    marginTop: 40,
  },
  proceedText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});
