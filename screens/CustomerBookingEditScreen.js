import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from '../utils/axiosInstance';
import { BRAND_COLOR } from './config';

const CustomerBookingEditScreen = ({ route, navigation }) => {
  const { booking } = route.params;

  const [receiverName, setReceiverName] = useState(booking.receiver_name || '');
  const [receiverNumber, setReceiverNumber] = useState(booking.receiver_number || '');
  const [weight, setWeight] = useState(String(booking.weight || ''));
  const [packages, setPackages] = useState(String(booking.no_of_packages || ''));
  const [notes, setNotes] = useState(booking.notes || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (receiverNumber.length !== 10) {
      return Alert.alert('Error', 'Receiver phone must be 10 digits.');
    }
    if (isNaN(weight) || Number(weight) <= 0) {
      return Alert.alert('Error', 'Enter a valid weight.');
    }
    if (isNaN(packages) || Number(packages) <= 0) {
      return Alert.alert('Error', 'Enter valid number of packages.');
    }

    setLoading(true);
    const token = await AsyncStorage.getItem('authToken');
    try {
      await axios.put(`/bookings/${booking.id}`, {
        receiver_name: receiverName,
        receiver_number: receiverNumber,
        shipment_type: booking.shipment_type, // keep it same
        weight,
        no_of_packages: packages,
        notes,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Alert.alert('Success', 'Booking updated successfully.');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Could not update booking.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Booking</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        <Text style={styles.label}>Receiver Name</Text>
        <TextInput value={receiverName} onChangeText={setReceiverName} style={styles.input} />

        <Text style={styles.label}>Receiver Phone</Text>
        <TextInput
          value={receiverNumber}
          onChangeText={setReceiverNumber}
          keyboardType="numeric"
          maxLength={10}
          style={styles.input}
        />

        <Text style={styles.label}>Shipment Type (read-only)</Text>
        <View style={styles.readOnlyBox}>
          <Text style={styles.readOnlyText}>{booking.shipment_type}</Text>
        </View>

        <Text style={styles.label}>Weight (kg)</Text>
        <TextInput value={weight} onChangeText={setWeight} keyboardType="numeric" style={styles.input} />

        <Text style={styles.label}>Number of Packages</Text>
        <TextInput value={packages} onChangeText={setPackages} keyboardType="numeric" style={styles.input} />

        <Text style={styles.label}>Notes</Text>
        <TextInput value={notes} onChangeText={setNotes} multiline style={[styles.input, { height: 80 }]} />

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.submitText}>{loading ? 'Saving...' : 'Update Booking'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CustomerBookingEditScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 16, elevation: 2,
  },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  form: { padding: 16 },
  label: { fontWeight: '600', marginTop: 16, marginBottom: 6, color: '#444' },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    padding: 10, fontSize: 16, backgroundColor: '#fafafa'
  },
  readOnlyBox: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    padding: 10, backgroundColor: '#f0f0f0'
  },
  readOnlyText: {
    color: '#555', fontSize: 15, fontWeight: '500'
  },
  submitBtn: {
    marginTop: 24, backgroundColor: BRAND_COLOR, padding: 14,
    borderRadius: 10, alignItems: 'center'
  },
  submitText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
