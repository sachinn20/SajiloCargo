import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import axios from '../utils/axiosInstance';
import { BRAND_COLOR } from './config';

// OpenStreetMap Autocomplete Component (Limited to Nepal)
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
    } catch (error) {
      // Alert.alert('Error', 'Failed to fetch locations in Nepal');
    }
  };

  return (
    <View>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={query}
        onChangeText={searchLocations}
      />
      {results.length > 0 && (
        <ScrollView
          style={{ maxHeight: 150 }}
          keyboardShouldPersistTaps="handled"
        >
          {results.map((item) => (
            <TouchableOpacity
              key={item.place_id}
              style={styles.suggestion}
              onPress={() => {
                const city = item.display_name.split(',')[0].trim();
                onSelect(city);
                setQuery(city);
                setResults([]);
              }}
            >
              <Text>{item.display_name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [shipmentType, setShipmentType] = useState('individual');
  const [availableCapacity, setAvailableCapacity] = useState('');

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
        date: date.toISOString().split('T')[0], // YYYY-MM-DD format
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }), // 24-Hour format
        shipment_type: shipmentType,
        available_capacity: availableCapacity,
      });

      Alert.alert('Success', 'Trip added successfully', [
        {
          text: 'OK',
          onPress: () => {
            navigation.goBack('TripManagement', { refresh: true }); // Send refresh signal
          },
        },
      ]);

    } catch (error) {
      Alert.alert('Error', 'Failed to create trip.');
    }
};



  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Back Button */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back-outline" size={24} color={BRAND_COLOR} />
              </TouchableOpacity>
              <Text style={styles.title}>Create a New Trip</Text>
            </View>

            {/* Vehicle Selection */}
            <Text style={styles.label}>Select Vehicle</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {vehicles.map((vehicle) => (
                <TouchableOpacity
                  key={vehicle.id}
                  style={[
                    styles.vehicleButton,
                    selectedVehicle?.id === vehicle.id && styles.selectedButton,
                  ]}
                  onPress={() => setSelectedVehicle(vehicle)}
                >
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

            {/* From Location */}
            <Text style={styles.label}>From Location</Text>
            <OpenStreetMapAutocomplete placeholder="Enter departure location" onSelect={setFromLocation} />

            {/* To Location */}
            <Text style={styles.label}>To Location</Text>
            <OpenStreetMapAutocomplete placeholder="Enter destination" onSelect={setToLocation} />

            {/* Date Picker */}
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
              <Text>{date.toISOString().split('T')[0]}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  if (selectedDate) setDate(selectedDate);
                }}
              />
            )}

            {/* Time Picker */}
            <Text style={styles.label}>Time</Text>
            <TouchableOpacity style={styles.input} onPress={() => setShowTimePicker(true)}>
              <Text>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</Text>
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker
                value={time}
                mode="time"
                display="default"
                is24Hour={true} // ✅ Ensures 24-hour format
                onChange={(event, selectedTime) => {
                  if (selectedTime) setTime(selectedTime);
                }}
              />
            )}

            {/* Shipment Type */}
            <Text style={styles.label}>Shipment Type</Text>
            <View style={styles.typeContainer}>
              <TouchableOpacity
                style={[styles.typeButton, shipmentType === 'individual' && styles.selectedButton]}
                onPress={() => setShipmentType('individual')}
              >
                <Text style={[styles.typeText, shipmentType === 'individual' ? styles.selectedText : styles.unselectedText]}>
                  Individual
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, shipmentType === 'group' && styles.selectedButton]}
                onPress={() => setShipmentType('group')}
              >
                <Text style={[styles.typeText, shipmentType === 'group' ? styles.selectedText : styles.unselectedText]}>
                  Group
                </Text>
              </TouchableOpacity>
            </View>


            {/* Available Capacity */}
            <Text style={styles.label}>Available Capacity (Tons)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Enter available capacity"
              value={availableCapacity}
              onChangeText={setAvailableCapacity}
            />

            {/* Create Trip Button */}
            <TouchableOpacity style={styles.button} onPress={handleCreateTrip}>
              <Text style={styles.buttonText}>Create Trip</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default AddTripScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', padding: 20 },
    
    header: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      marginBottom: 20 
    },
    
    backButton: { 
      marginRight: 12 
    },
    
    title: { 
      fontSize: 22, 
      fontWeight: 'bold' 
    },
  
    label: { 
      fontSize: 16, 
      fontWeight: 'bold', 
      marginTop: 15, 
      marginBottom: 5 
    },
  
    input: { 
      borderWidth: 1, 
      borderColor: '#ccc', 
      padding: 12, 
      borderRadius: 8, 
      marginBottom: 12, 
      fontSize: 15, 
      backgroundColor: '#f9f9f9' 
    },
  
    suggestion: { 
      padding: 10, 
      borderBottomWidth: 1, 
      borderBottomColor: '#ddd' 
    },
  
    typeContainer: { 
      flexDirection: 'row', 
      marginBottom: 12 
    },
  
    typeButton: { 
      flex: 1, 
      padding: 12, 
      borderRadius: 8, 
      alignItems: 'center', 
      borderWidth: 1, 
      borderColor: '#ccc', 
      marginHorizontal: 4 
    },
  
    selectedButton: { 
      backgroundColor: BRAND_COLOR, 
      borderColor: BRAND_COLOR 
    },
  
    selectedText: { 
      color: '#fff', 
      fontWeight: 'bold' 
    },
  
    unselectedText: { 
      color: '#000' 
    },
  
    vehicleButton: { 
      paddingVertical: 10, 
      paddingHorizontal: 14, 
      borderRadius: 8, 
      alignItems: 'center', 
      borderWidth: 1, 
      borderColor: '#ccc', 
      marginRight: 10, 
      minWidth: 120, 
      backgroundColor: '#f6f6f6' 
    },
  
    vehicleText: { 
      fontSize: 14, 
      fontWeight: 'bold' 
    },
  
    vehicleSub: { 
      fontSize: 12, 
      color: '#555' 
    },
  
    button: { 
      backgroundColor: BRAND_COLOR, 
      padding: 14, 
      borderRadius: 8, 
      alignItems: 'center', 
      marginTop: 16 
    },
  
    buttonText: { 
      color: '#fff', 
      fontWeight: 'bold', 
      fontSize: 16 
    }
  });
  