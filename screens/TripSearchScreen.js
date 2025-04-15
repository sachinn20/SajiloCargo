import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet,
  TouchableOpacity, ScrollView, Alert, Platform,
  KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from '../utils/axiosInstance';
import { BRAND_COLOR } from './config';
import { Ionicons } from '@expo/vector-icons';

const TripSearchScreen = ({ navigation }) => {
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [shipmentType, setShipmentType] = useState('individual');

  const [dimensions, setDimensions] = useState('');
  const [weight, setWeight] = useState('');
  const [worth, setWorth] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('1000');
  const [noOfPackages, setNoOfPackages] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverNumber, setReceiverNumber] = useState('');

  const handleSearch = async () => {
    if (!fromLocation || !toLocation || !date || !shipmentType) {
      Alert.alert('Error', 'Please fill all required fields.');
      return;
    }
  
    const searchPayload = {
      from_location: fromLocation,
      to_location: toLocation,
      date: date.toISOString().split('T')[0],
      shipment_type: shipmentType,
    };
  
    // Add capacity filter only if weight is provided and valid
    if (weight && !isNaN(parseFloat(weight))) {
      searchPayload.capacity = parseFloat(weight);
    }
  
    try {
      const response = await axios.post('/trips/search', searchPayload);
  
      console.log('Trips from backend:', response.data); // Debug
  
      navigation.navigate('SearchResults', {
        trips: response.data,
        packageDetails: {
          dimensions,
          weight,
          worth,
          description,
          shipmentType,
          amount,
          noOfPackages,
          receiverName,
          receiverNumber
        }
      });
    } catch (err) {
      console.log('Trip search error:', err?.response?.data || err.message);
      Alert.alert('Error', 'No matching trips found or failed to search.');
    }
  };
  

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          
          {/* Fixed Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back-outline" size={24} color={BRAND_COLOR} />
            </TouchableOpacity>
            <Text style={styles.title}>Send a Package</Text>
          </View>

          {/* Scrollable Content */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            <Text style={styles.label}>From Location</Text>
            <TextInput style={styles.input} value={fromLocation} onChangeText={setFromLocation} placeholder="e.g. Kathmandu" />

            <Text style={styles.label}>To Location</Text>
            <TextInput style={styles.input} value={toLocation} onChangeText={setToLocation} placeholder="e.g. Pokhara" />

            <Text style={styles.label}>Date</Text>
            <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
              <Text>{date.toDateString()}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
                onChange={handleDateChange}
              />
            )}


            <Text style={styles.label}>Dimensions (L × W × H in cm)</Text>
            <TextInput style={styles.input} value={dimensions} onChangeText={setDimensions} placeholder="e.g. 30×20×15" />

            <Text style={styles.label}>Weight (kg)</Text>
            <TextInput style={styles.input} value={weight} onChangeText={setWeight} keyboardType="numeric" />

            <Text style={styles.label}>Worth (NPR)</Text>
            <TextInput style={styles.input} value={worth} onChangeText={setWorth} keyboardType="numeric" />


            <Text style={styles.label}>No. of Packages</Text>
            <TextInput
              style={styles.input}
              value={noOfPackages}
              onChangeText={setNoOfPackages}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Receiver's Name</Text>
            <TextInput
              style={styles.input}
              value={receiverName}
              onChangeText={setReceiverName}
            />

            <Text style={styles.label}>Receiver's Phone Number</Text>
            <TextInput
              style={styles.input}
              value={receiverNumber}
              onChangeText={setReceiverNumber}
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>Shipment Type</Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.typeButton, shipmentType === 'individual' && styles.selectedButton]}
                  onPress={() => setShipmentType('individual')}
                >
                  <Text style={shipmentType === 'individual' ? styles.selectedText : styles.unselectedText}>Individual</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.typeButton, shipmentType === 'group' && styles.selectedButton]}
                  onPress={() => setShipmentType('group')}
                >
                  <Text style={shipmentType === 'group' ? styles.selectedText : styles.unselectedText}>Group</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Package Description</Text>
                <TextInput
                  style={[styles.input, { height: 80 }]}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                />

            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <Text style={styles.searchText}>Search Trips</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default TripSearchScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    paddingTop: 8,
    backgroundColor: '#fff',
    zIndex: 10,
  },
  backButton: { marginRight: 12 },
  title: { fontSize: 22, fontWeight: 'bold' },
  label: { fontWeight: '600', marginBottom: 4, paddingHorizontal: 20 },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    padding: 12, marginBottom: 12, backgroundColor: '#f9f9f9', marginHorizontal: 20
  },
  buttonRow: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, paddingHorizontal: 20
  },
  typeButton: {
    flex: 0.48, padding: 12, borderRadius: 8,
    borderWidth: 1, borderColor: '#ccc', alignItems: 'center'
  },
  selectedButton: { backgroundColor: BRAND_COLOR, borderColor: BRAND_COLOR },
  selectedText: { color: '#fff', fontWeight: 'bold' },
  unselectedText: { color: '#000' },
  searchButton: {
    backgroundColor: BRAND_COLOR, padding: 14, borderRadius: 8,
    alignItems: 'center', marginTop: 10, marginHorizontal: 20
  },
  searchText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
