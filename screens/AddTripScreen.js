import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import DateTimePickerModal from 'react-native-modal-datetime-picker';
import axios from '../utils/axiosInstance';
import { BRAND_COLOR } from './config';

const OpenStreetMapAutocomplete = ({ placeholder, onSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const searchLocations = async (text) => {
    setQuery(text);
    if (text.length < 3) {
      setResults([]);
      return;
    }

    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&countrycodes=np&q=${text}`
      );
      setResults(response.data);
    } catch (error) {}
  };

  return (
    <View>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={query}
        onChangeText={searchLocations}
        placeholderTextColor="#888"
      />
      {results.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <ScrollView style={{ maxHeight: 150 }} keyboardShouldPersistTaps="handled">
            {results.map((item) => (
              <TouchableOpacity
                key={item.place_id}
                style={styles.suggestion}
                onPress={() => {
                  onSelect(item.display_name);     // keep full name
                  setQuery(item.display_name);     // show full name
                  setResults([]);
                }}
                
              >
                <Ionicons name="location-outline" size={16} color={BRAND_COLOR} style={styles.locationIcon} />
                <Text style={styles.suggestionText}>{item.display_name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const AddTripScreen = ({ navigation }) => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [shipmentType, setShipmentType] = useState('individual');
  const [availableCapacity, setAvailableCapacity] = useState('');

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleDateConfirm = (selectedDate) => {
    setDate(selectedDate);
    hideDatePicker();
  };

  const showTimePicker = () => setTimePickerVisibility(true);
  const hideTimePicker = () => setTimePickerVisibility(false);
  const handleTimeConfirm = (selectedTime) => {
    setTime(selectedTime);
    hideTimePicker();
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await axios.get('/vehicles');
      setVehicles(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load vehicles.');
    }
  };

  const handleCreateTrip = async () => {
    if (!selectedVehicle || !fromLocation || !toLocation || !availableCapacity) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    try {
      await axios.post('/trips', {
        vehicle_id: selectedVehicle.id,
        from_location: fromLocation,
        to_location: toLocation,
        date: date.toISOString().split('T')[0],
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        shipment_type: shipmentType,
        available_capacity: availableCapacity,
      });

      Alert.alert('Success', 'Trip added successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack('TripManagement', { refresh: true }),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create trip.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={{ flex: 1 }}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={BRAND_COLOR} />
              </TouchableOpacity>
              <Text style={styles.title}>Create a New Trip</Text>
            </View>
  
            {/* Form Content */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Vehicle Information</Text>
                
                <Text style={styles.label}>Select Vehicle</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.vehicleScroll}>
                  {vehicles.map((vehicle) => (
                    <TouchableOpacity
                      key={vehicle.id}
                      style={[
                        styles.vehicleButton,
                        selectedVehicle?.id === vehicle.id && styles.selectedButton,
                      ]}
                      onPress={() => setSelectedVehicle(vehicle)}
                    >
                      <Ionicons 
                        name={vehicle.type.toLowerCase().includes('truck') ? "bus-outline" : "car-outline"} 
                        size={24}  
                        color={selectedVehicle?.id === vehicle.id ? "#fff" : BRAND_COLOR} 
                        style={styles.vehicleIcon}
                      />
                      <Text
                        style={[
                          styles.vehicleText,
                          selectedVehicle?.id === vehicle.id ? styles.selectedText : styles.unselectedText,
                        ]}
                      >
                        {vehicle.type}
                      </Text>
                      <Text style={[styles.vehicleSub, selectedVehicle?.id === vehicle.id && { color: '#fff' }]}>
                        {vehicle.plate}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Route Details</Text>
                
                <View style={styles.routeContainer}>
                  <View style={styles.routeIconContainer}>
                    <View style={styles.originDot} />
                    <View style={styles.routeLine} />
                    <View style={styles.destinationDot} />
                  </View>
                  
                  <View style={styles.routeInputs}>
                    <View style={styles.inputWrapper}>
                      <Text style={styles.label}>From Location</Text>
                      <OpenStreetMapAutocomplete placeholder="Enter departure location" onSelect={setFromLocation} />
                    </View>
                    
                    <View style={styles.inputWrapper}>
                      <Text style={styles.label}>To Location</Text>
                      <OpenStreetMapAutocomplete placeholder="Enter destination" onSelect={setToLocation} />
                    </View>
                  </View>
                </View>
              </View>
              
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Schedule</Text>
                
                <View style={styles.dateTimeContainer}>
                  <View style={styles.dateTimeWrapper}>
                    <Text style={styles.label}>Date</Text>
                    <TouchableOpacity style={styles.dateTimeInput} onPress={showDatePicker}>
                      <Ionicons name="calendar-outline" size={20} color={BRAND_COLOR} style={styles.inputIcon} />
                      <Text style={styles.dateTimeText}>{date.toDateString()}</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.dateTimeWrapper}>
                    <Text style={styles.label}>Time</Text>
                    <TouchableOpacity style={styles.dateTimeInput} onPress={showTimePicker}>
                      <Ionicons name="time-outline" size={20} color={BRAND_COLOR} style={styles.inputIcon} />
                      <Text style={styles.dateTimeText}>
                        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
  
                <DateTimePickerModal
                  isVisible={isDatePickerVisible}
                  mode="date"
                  date={date}
                  onConfirm={handleDateConfirm}
                  onCancel={hideDatePicker}
                  display="inline"
                  isDarkModeEnabled={false}
                  themeVariant="light"
                  accentColor={BRAND_COLOR}
                  headerTextIOS="Select a Date"
                />

                <DateTimePickerModal
                  isVisible={isTimePickerVisible}
                  mode="time"
                  date={time}
                  onConfirm={handleTimeConfirm}
                  onCancel={hideTimePicker}
                  display="spinner"
                  isDarkModeEnabled={false}
                  themeVariant="light"
                  accentColor={BRAND_COLOR}
                  headerTextIOS="Select Time"
                />
              </View>
              
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Shipment Details</Text>
                
                <Text style={styles.label}>Shipment Type</Text>
                <View style={styles.typeContainer}>
                  <TouchableOpacity
                    style={[styles.typeButton, shipmentType === 'individual' && styles.selectedButton]}
                    onPress={() => setShipmentType('individual')}
                  >
                    <Ionicons 
                      name="person-outline" 
                      size={20} 
                      color={shipmentType === 'individual' ? "#fff" : BRAND_COLOR} 
                      style={styles.typeIcon}
                    />
                    <Text style={[styles.typeText, shipmentType === 'individual' ? styles.selectedText : styles.unselectedText]}>
                      Individual
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.typeButton, shipmentType === 'group' && styles.selectedButton]}
                    onPress={() => setShipmentType('group')}
                  >
                    <Ionicons 
                      name="people-outline" 
                      size={20} 
                      color={shipmentType === 'group' ? "#fff" : BRAND_COLOR} 
                      style={styles.typeIcon}
                    />
                    <Text style={[styles.typeText, shipmentType === 'group' ? styles.selectedText : styles.unselectedText]}>
                      Group
                    </Text>
                  </TouchableOpacity>
                </View>
  
                <Text style={styles.label}>Available Capacity (kg)</Text>
                <View style={styles.capacityInputContainer}>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder="Enter available capacity"
                    value={availableCapacity}
                    onChangeText={setAvailableCapacity}
                    placeholderTextColor="#888"
                  />
                  <View style={styles.capacityUnit}>
                    <Text style={styles.capacityUnitText}>Kg</Text>
                  </View>
                </View>
              </View>
  
              <TouchableOpacity style={styles.button} onPress={handleCreateTrip}>
                <Text style={styles.buttonText}>Create Trip</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.buttonIcon} />
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
  
export default AddTripScreen;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa', 
    padding: 0 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
    backgroundColor: '#fff'
  },
  backButton: { 
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 12 
  },
  title: { 
    fontSize: 20, 
    fontWeight: 'bold',
    color: '#333'
  },
  scrollContent: {
    paddingBottom: 40
  },
  formSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 8,
  },
  label: { 
    fontSize: 14, 
    fontWeight: '600', 
    marginBottom: 8,
    color: '#555'
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 15,
    backgroundColor: '#fff',
    color: '#333',
  },
  suggestionsContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginTop: -12,
    marginBottom: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  suggestion: { 
    padding: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center'
  },
  suggestionText: {
    color: '#333',
    fontSize: 14,
  },
  locationIcon: {
    marginRight: 8,
  },
  vehicleScroll: {
    marginBottom: 16,
  },
  vehicleButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 12,
    minWidth: 120,
    backgroundColor: '#fff',
  },
  vehicleIcon: {
    marginBottom: 6,
  },
  vehicleText: { 
    fontSize: 14, 
    fontWeight: 'bold',
    marginBottom: 4,
  },
  vehicleSub: { 
    fontSize: 12, 
    color: '#777' 
  },
  selectedButton: {
    backgroundColor: BRAND_COLOR,
    borderColor: BRAND_COLOR,
  },
  selectedText: { 
    color: '#fff', 
    fontWeight: 'bold' 
  },
  unselectedText: { 
    color: '#333' 
  },
  routeContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  routeIconContainer: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
    paddingTop: 32,
  },
  originDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: BRAND_COLOR,
    marginBottom: 4,
  },
  routeLine: {
    width: 2,
    height: 50,
    backgroundColor: BRAND_COLOR,
    marginVertical: 4,
  },
  destinationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ff6b6b',
    marginTop: 4,
  },
  routeInputs: {
    flex: 1,
  },
  inputWrapper: {
    marginBottom: 8,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateTimeWrapper: {
    width: '48%',
  },
  dateTimeInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTimeText: {
    fontSize: 14,
    color: '#333',
  },
  inputIcon: {
    marginRight: 8,
  },
  typeContainer: { 
    flexDirection: 'row', 
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  typeButton: {
    width: '48%',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  typeIcon: {
    marginRight: 8,
  },
  typeText: { 
    fontSize: 14, 
    fontWeight: '600' 
  },
  capacityInputContainer: {
    position: 'relative',
  },
  capacityUnit: {
    position: 'absolute',
    right: 12,
    top: 12,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  capacityUnitText: {
    fontSize: 12,
    color: '#666',
  },
  button: {
    backgroundColor: BRAND_COLOR,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 24,
    marginHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: BRAND_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16,
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
});