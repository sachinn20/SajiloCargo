import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert,
  ActivityIndicator, Platform, KeyboardAvoidingView
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
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color="#555" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Booking</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView 
          contentContainerStyle={styles.formContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.bookingInfoCard}>
            <View style={styles.routeContainer}>
              <View style={styles.locationContainer}>
                <View style={styles.locationDot} />
                <View style={styles.locationTextContainer}>
                  <Text style={styles.locationLabel}>From</Text>
                  <Text style={styles.locationText}>{booking.trip?.from_location}</Text>
                </View>
              </View>
              
              <View style={styles.routeLine} />
              
              <View style={styles.locationContainer}>
                <View style={[styles.locationDot, styles.destinationDot]} />
                <View style={styles.locationTextContainer}>
                  <Text style={styles.locationLabel}>To</Text>
                  <Text style={styles.locationText}>{booking.trip?.to_location}</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.trackingContainer}>
              <View style={styles.trackingBadge}>
                <Ionicons name="barcode-outline" size={16} color="#fff" />
              </View>
              <View>
                <Text style={styles.trackingLabel}>Tracking Number</Text>
                <Text style={styles.trackingNumber}>{booking.tracking_no}</Text>
              </View>
            </View>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formSectionTitle}>Receiver Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Receiver Name</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput 
                  value={receiverName} 
                  onChangeText={setReceiverName} 
                  style={styles.input}
                  placeholder="Enter receiver's full name"
                  placeholderTextColor="#aaa"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Receiver Phone</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  value={receiverNumber}
                  onChangeText={setReceiverNumber}
                  keyboardType="numeric"
                  maxLength={10}
                  style={styles.input}
                  placeholder="10-digit phone number"
                  placeholderTextColor="#aaa"
                />
              </View>
            </View>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formSectionTitle}>Package Details</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Shipment Type</Text>
              <View style={[styles.inputContainer, styles.readOnlyContainer]}>
                <Ionicons name="cube-outline" size={20} color="#999" style={styles.inputIcon} />
                <Text style={styles.readOnlyText}>{booking.shipment_type}</Text>
                <Ionicons name="lock-closed" size={16} color="#999" style={styles.lockIcon} />
              </View>
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Weight (kg)</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="scale-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput 
                    value={weight} 
                    onChangeText={setWeight} 
                    keyboardType="numeric" 
                    style={styles.input}
                    placeholder="Weight in kg"
                    placeholderTextColor="#aaa"
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Number of Packages</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="archive-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput 
                    value={packages} 
                    onChangeText={setPackages} 
                    keyboardType="numeric" 
                    style={styles.input}
                    placeholder="Quantity"
                    placeholderTextColor="#aaa"
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notes</Text>
              <View style={[styles.inputContainer, styles.textAreaContainer]}>
                <Ionicons name="create-outline" size={20} color="#666" style={[styles.inputIcon, { marginTop: 10 }]} />
                <TextInput 
                  value={notes} 
                  onChangeText={setNotes} 
                  multiline 
                  numberOfLines={4}
                  style={[styles.input, styles.textArea]}
                  placeholder="Additional instructions or notes"
                  placeholderTextColor="#aaa"
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.submitButton} 
            onPress={handleSubmit} 
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" style={styles.submitIcon} />
                <Text style={styles.submitText}>Update Booking</Text>
              </>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CustomerBookingEditScreen;

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#f8f9fa' 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: 'bold',
    color: '#333',
  },
  formContainer: { 
    padding: 16,
    paddingBottom: 40,
  },
  bookingInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  routeContainer: {
    marginBottom: 20,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    marginRight: 12,
  },
  destinationDot: {
    backgroundColor: '#F44336',
  },
  locationTextContainer: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  locationText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: '#ddd',
    marginLeft: 5,
    marginBottom: 8,
  },
  trackingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  trackingBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BRAND_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  trackingLabel: {
    fontSize: 12,
    color: '#666',
  },
  trackingNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: BRAND_COLOR,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  formSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: { 
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
  },
  readOnlyContainer: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
  },
  readOnlyText: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#999',
  },
  lockIcon: {
    marginLeft: 10,
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textAreaContainer: {
    alignItems: 'flex-start',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 10,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BRAND_COLOR,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: BRAND_COLOR,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  submitIcon: {
    marginRight: 8,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
});