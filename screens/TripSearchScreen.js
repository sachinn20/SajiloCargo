import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet,
  TouchableOpacity, ScrollView, Alert, Platform,
  KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import axios from '../utils/axiosInstance';
import { BRAND_COLOR } from './config';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const OpenStreetMapAutocomplete = ({ placeholder, onSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchLocations = async (text) => {
    setQuery(text);
    if (text.length < 3) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&countrycodes=np&q=${text}`
      );
      setResults(response.data);
    } catch (error) {
      console.log('Location search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <View style={styles.inputContainer}>
        <Ionicons name="location-outline" size={20} color="#777" style={styles.inputIcon} />
        <TextInput
          style={styles.autocompleteInput}
          placeholder={placeholder}
          value={query}
          onChangeText={searchLocations}
          placeholderTextColor="#888"
        />
        {loading && <ActivityIndicator size="small" color={BRAND_COLOR} style={{ marginRight: 10 }} />}
      </View>
      
      {results.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <ScrollView style={{ maxHeight: 150 }} keyboardShouldPersistTaps="handled">
            {results.map((item) => (
              <TouchableOpacity
                key={item.place_id}
                style={styles.suggestion}
                onPress={() => {
                  onSelect(item.display_name);
                  setQuery(item.display_name);
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

const TripSearchScreen = ({ navigation }) => {
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [date, setDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [shipmentType, setShipmentType] = useState('individual');

  const [dimensions, setDimensions] = useState('');
  const [weight, setWeight] = useState('');
  const [worth, setWorth] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('1000');
  const [noOfPackages, setNoOfPackages] = useState('1');
  const [receiverName, setReceiverName] = useState('');
  const [receiverNumber, setReceiverNumber] = useState('');

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleDateConfirm = (selectedDate) => {
    setDate(selectedDate);
    hideDatePicker();
  };

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
      console.log('Trips from backend:', response.data);
  
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
            <Text style={styles.title}>Send a Package</Text>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
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
              
              <Text style={styles.label}>Date</Text>
              <TouchableOpacity style={styles.dateTimeInput} onPress={showDatePicker}>
                <Ionicons name="calendar-outline" size={20} color={BRAND_COLOR} style={styles.inputIcon} />
                <Text style={styles.dateTimeText}>{date.toDateString()}</Text>
              </TouchableOpacity>

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
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Package Details</Text>
              
              <View style={styles.twoColumnContainer}>
                <View style={styles.halfColumn}>
                  <Text style={styles.label}>Dimensions (L × W × H)</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="cube-outline" size={20} color="#777" style={styles.inputIcon} />
                    <TextInput 
                      style={styles.columnInput} 
                      value={dimensions} 
                      onChangeText={setDimensions} 
                      placeholder="e.g. 30×20×15" 
                      placeholderTextColor="#888"
                    />
                  </View>
                </View>
                
                <View style={styles.halfColumn}>
                  <Text style={styles.label}>Weight (kg)</Text>
                  <View style={styles.inputContainer}>
                    <MaterialCommunityIcons name="weight" size={20} color="#777" style={styles.inputIcon} />
                    <TextInput 
                      style={styles.columnInput} 
                      value={weight} 
                      onChangeText={setWeight} 
                      keyboardType="numeric" 
                      placeholder="Enter weight"
                      placeholderTextColor="#888"
                    />
                    <View style={styles.unitBadge}>
                      <Text style={styles.unitText}>kg</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.twoColumnContainer}>
                <View style={styles.halfColumn}>
                  <Text style={styles.label}>Worth (NPR)</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="cash-outline" size={20} color="#777" style={styles.inputIcon} />
                    <TextInput 
                      style={styles.columnInput} 
                      value={worth} 
                      onChangeText={setWorth} 
                      keyboardType="numeric" 
                      placeholder="Enter value"
                      placeholderTextColor="#888"
                    />
                    <View style={styles.unitBadge}>
                      <Text style={styles.unitText}>NPR</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.halfColumn}>
                  <Text style={styles.label}>No. of Packages</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="layers-outline" size={20} color="#777" style={styles.inputIcon} />
                    <TextInput 
                      style={styles.columnInput} 
                      value={noOfPackages} 
                      onChangeText={setNoOfPackages} 
                      keyboardType="numeric" 
                      placeholder="Enter quantity"
                      placeholderTextColor="#888"
                    />
                  </View>
                </View>
              </View>

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
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Receiver Information</Text>
              
              <Text style={styles.label}>Receiver's Name</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#777" style={styles.inputIcon} />
                <TextInput 
                  style={styles.textInput} 
                  value={receiverName} 
                  onChangeText={setReceiverName} 
                  placeholder="Enter receiver's name"
                  placeholderTextColor="#888"
                />
              </View>

              <Text style={styles.label}>Receiver's Phone Number</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color="#777" style={styles.inputIcon} />
                <TextInput 
                  style={styles.textInput} 
                  value={receiverNumber} 
                  onChangeText={setReceiverNumber} 
                  keyboardType="phone-pad" 
                  placeholder="Enter receiver's phone"
                  placeholderTextColor="#888"
                />
              </View>

              <Text style={styles.label}>Package Description</Text>
              <View style={[styles.inputContainer, { height: 100, alignItems: 'flex-start', paddingTop: 12 }]}>
                <Ionicons name="create-outline" size={20} color="#777" style={[styles.inputIcon, { marginTop: 2 }]} />
                <TextInput
                  style={[styles.textInput, { height: 80, textAlignVertical: 'top' }]}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  placeholder="Describe your package contents"
                  placeholderTextColor="#888"
                />
              </View>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleSearch}>
              <Text style={styles.buttonText}>Search Available Trips</Text>
              <Ionicons name="search" size={20} color="#fff" style={styles.buttonIcon} />
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default TripSearchScreen;

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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 50,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  autocompleteInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    height: 46,
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
    flex: 1,
  },
  locationIcon: {
    marginRight: 8,
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
  dateTimeInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
  },
  dateTimeText: {
    fontSize: 15,
    color: '#333',
  },
  twoColumnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfColumn: {
    width: '48%',
  },
  columnInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  unitBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  unitText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
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
    height: 50,
  },
  typeIcon: {
    marginRight: 8,
  },
  typeText: { 
    fontSize: 14, 
    fontWeight: '600' 
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