import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView,
  Alert, Platform, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BRAND_COLOR } from './config';
import axios from '../utils/axiosInstance';

// OpenStreetMap Autocomplete Component (only for dropoff)
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

// Helper functions for coordinates and distance calculation
const getCoordinates = async (placeName) => {
  try {
    const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${placeName}`);
    if (res.data.length > 0) {
      return {
        lat: parseFloat(res.data[0].lat),
        lon: parseFloat(res.data[0].lon),
      };
    }
    return null;
  } catch (err) {
    console.log('Coordinate fetch error:', err);
    return null;
  }
};

const haversineDistance = (coord1, coord2) => {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLon = toRad(coord2.lon - coord1.lon);

  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(coord1.lat)) * Math.cos(toRad(coord2.lat)) *
    Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const InstantBookingScreen = () => {
  const navigation = useNavigation();

  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [weight, setWeight] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverNumber, setReceiverNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [price, setPrice] = useState('');
  const [distance, setDistance] = useState(null);
  const [pickupCoords, setPickupCoords] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash'); // Default to cash

  const [pricePerKm, setPricePerKm] = useState(null);
  const [pricePerKg, setPricePerKg] = useState(null);

  // 📍 Get location + autofill pickup
  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Location access is required to use this feature.');
          setIsLoading(false);
          return;
        }

        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc.coords);
        
        // Store pickup coordinates for distance calculation
        setPickupCoords({
          lat: loc.coords.latitude,
          lon: loc.coords.longitude
        });

        const address = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude
        });
        
        if (address.length > 0) {
          const addr = address[0];
          const formatted = `${addr.name || ''}, ${addr.street || ''}, ${addr.city || addr.region || ''}`;
          setPickup(formatted);
        }
      } catch (err) {
        console.error(err);
        Alert.alert('Error', 'Unable to fetch your current location.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);


  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const res = await axios.get('/pricing'); // ✅ Same API endpoint
        setPricePerKm(parseFloat(res.data.price_per_km));
        setPricePerKg(parseFloat(res.data.price_per_kg));
      } catch (err) {
        console.log('Error fetching pricing:', err?.response?.data || err.message);
      }
    };

    fetchPricing();
  }, []);


  // Calculate price when weight and dropoff change
  useEffect(() => {
    const calculatePrice = async () => {
      if (!pickup || !dropoff || !weight || !pickupCoords) return;
      
      try {
        const dropoffCoords = await getCoordinates(dropoff);
        
        if (!dropoffCoords) return;
        
        const calculatedDistance = haversineDistance(pickupCoords, dropoffCoords);
        setDistance(calculatedDistance);
        
        const parsedWeight = parseFloat(weight);
        const baseRatePerKm = pricePerKm || 0; // 👈 Use fetched value
        const weightRate = pricePerKg || 0;  
        const calculatedPrice = Math.round(baseRatePerKm * calculatedDistance + weightRate * parsedWeight);
        setPrice(String(calculatedPrice));
      } catch (err) {
        console.log('Error calculating price:', err);
      }
    };
    
    calculatePrice();
  }, [pickup, dropoff, weight, pickupCoords]);

  const handleSearch = async () => {
    if (!pickup || !dropoff || !weight || !receiverName || !receiverNumber) {
      return Alert.alert('Validation Error', 'Please fill in all required fields.');
    }

    if (receiverNumber.length !== 10 || !/^\d{10}$/.test(receiverNumber)) {
      return Alert.alert('Invalid Phone', 'Receiver number must be exactly 10 digits.');
    }

    if (!pickupCoords) {
      return Alert.alert('Error', 'Could not detect your current location.');
    }

    try {
      // Get coordinates for dropoff location
      const dropoffCoords = await getCoordinates(dropoff);

      if (!dropoffCoords) {
        return Alert.alert('Error', 'Unable to calculate distance for the given destination.');
      }

      // Calculate distance
      const calculatedDistance = haversineDistance(pickupCoords, dropoffCoords);
      setDistance(calculatedDistance);

      // Calculate price based on distance and weight
      const parsedWeight = parseFloat(weight);
      const baseRatePerKm = pricePerKm || 0; // 👈 Use fetched value
      const weightRate = pricePerKg || 0;  
      const calculatedPrice = Math.round(baseRatePerKm * calculatedDistance + weightRate * parsedWeight);
      setPrice(String(calculatedPrice));

      navigation.navigate('InstantResults', {
        coords: location,
        bookingDetails: {
          pickup,
          dropoff,
          weight,
          receiverName,
          receiverNumber,
          notes,
          distance: calculatedDistance,
          amount: parseFloat(price), // ✅ use existing price state
          paymentMethod
        }
      });

    } catch (err) {
      console.log('Error calculating distance/price:', err);
      Alert.alert('Error', 'Failed to calculate distance and price.');
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
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color={BRAND_COLOR} />
            </TouchableOpacity>

            <Text style={styles.title}>Instant Booking</Text>

            {/* Invisible placeholder to center title */}
            <View style={{ width: 40 }} />
          </View>


          {/* Scrollable Content */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="flash" size={18} color={BRAND_COLOR} style={{ marginRight: 6 }} />
                Quick Delivery
              </Text>
              <Text style={styles.sectionDescription}>
                Find nearby vehicles for immediate pickup and delivery of your package.
              </Text>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Location Details</Text>
              
              <View style={styles.routeContainer}>
                <View style={styles.routeIconContainer}>
                  <View style={styles.originDot} />
                  <View style={styles.routeLine} />
                  <View style={styles.destinationDot} />
                </View>
                
                <View style={styles.routeInputs}>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.label}>Pickup Address</Text>
                    <View style={styles.inputContainer}>
                      <Ionicons name="location" size={20} color="#777" style={styles.inputIcon} />
                      {isLoading ? (
                        <View style={styles.loadingContainer}>
                          <ActivityIndicator size="small" color={BRAND_COLOR} />
                          <Text style={styles.loadingText}>Getting your location...</Text>
                        </View>
                      ) : (
                        <TextInput
                          style={styles.textInput}
                          value={pickup}
                          onChangeText={setPickup}
                          placeholder="Auto-filled with your location"
                          placeholderTextColor="#888"
                        />
                      )}
                    </View>
                  </View>
                  
                  <View style={styles.inputWrapper}>
                    <Text style={styles.label}>Drop-off Address</Text>
                    <OpenStreetMapAutocomplete 
                      placeholder="Enter destination address" 
                      onSelect={setDropoff} 
                    />
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Package Details</Text>
              
              <Text style={styles.label}>Weight (kg)</Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="weight" size={20} color="#777" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="Enter package weight"
                  placeholderTextColor="#888"
                  keyboardType="numeric"
                />
                <View style={styles.unitBadge}>
                  <Text style={styles.unitText}>kg</Text>
                </View>
              </View>

              <Text style={styles.label}>Notes (optional)</Text>
              <View style={[styles.inputContainer, { height: 100, alignItems: 'flex-start', paddingTop: 12 }]}>
                <Ionicons name="create-outline" size={20} color="#777" style={[styles.inputIcon, { marginTop: 2 }]} />
                <TextInput
                  style={[styles.textInput, { height: 80, textAlignVertical: 'top' }]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Special handling instructions or package details"
                  placeholderTextColor="#888"
                  multiline
                />
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Receiver Information</Text>
              
              <Text style={styles.label}>Receiver Name</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#777" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={receiverName}
                  onChangeText={setReceiverName}
                  placeholder="Enter receiver's full name"
                  placeholderTextColor="#888"
                />
              </View>

              <Text style={styles.label}>Receiver Number</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color="#777" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={receiverNumber}
                  onChangeText={setReceiverNumber}
                  placeholder="10-digit phone number"
                  placeholderTextColor="#888"
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
            </View>

            {/* Payment Method Section */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="wallet-outline" size={18} color={BRAND_COLOR} style={{ marginRight: 6 }} />
                Payment Method
              </Text>
              
              <View style={styles.paymentOptions}>
                <TouchableOpacity 
                  style={[
                    styles.paymentOption, 
                    paymentMethod === 'cash' && styles.selectedPaymentOption
                  ]}
                  onPress={() => setPaymentMethod('cash')}
                  activeOpacity={0.7}
                >
                  <View style={styles.paymentIconContainer}>
                    <Ionicons 
                      name="cash-outline" 
                      size={24} 
                      color={paymentMethod === 'cash' ? '#fff' : '#666'} 
                    />
                  </View>
                  <View style={styles.paymentTextContainer}>
                    <Text style={[
                      styles.paymentTitle,
                      paymentMethod === 'cash' && styles.selectedPaymentText
                    ]}>
                      Cash on Delivery
                    </Text>
                    <Text style={styles.paymentDescription}>
                      Pay with cash when your package is delivered
                    </Text>
                  </View>
                  <View style={styles.radioContainer}>
                    <View style={[
                      styles.radioOuter,
                      paymentMethod === 'cash' && styles.radioOuterSelected
                    ]}>
                      {paymentMethod === 'cash' && <View style={styles.radioInner} />}
                    </View>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[
                    styles.paymentOption, 
                    paymentMethod === 'khalti' && styles.selectedPaymentOption
                  ]}
                  onPress={() => setPaymentMethod('khalti')}
                  activeOpacity={0.7}
                >
                  <View style={styles.paymentIconContainer}>
                    <Ionicons 
                      name="phone-portrait-outline" 
                      size={24} 
                      color={paymentMethod === 'khalti' ? '#fff' : '#666'} 
                    />
                  </View>
                  <View style={styles.paymentTextContainer}>
                    <Text style={[
                      styles.paymentTitle,
                      paymentMethod === 'khalti' && styles.selectedPaymentText
                    ]}>
                      Pay with Khalti
                    </Text>
                    <Text style={styles.paymentDescription}>
                      Pay securely via Khalti after booking is accepted
                    </Text>
                  </View>
                  <View style={styles.radioContainer}>
                    <View style={[
                      styles.radioOuter,
                      paymentMethod === 'khalti' && styles.radioOuterSelected
                    ]}>
                      {paymentMethod === 'khalti' && <View style={styles.radioInner} />}
                    </View>
                  </View>
                </TouchableOpacity>
              </View>

              {paymentMethod === 'khalti' && (
                <View style={styles.paymentInfoBox}>
                  <Ionicons name="information-circle" size={18} color={BRAND_COLOR} style={{ marginRight: 8 }} />
                  <Text style={styles.paymentInfoText}>
                    You'll be able to make the payment via Khalti after your booking is accepted by a vehicle owner.
                  </Text>
                </View>
              )}
            </View>

            {/* Price and Distance Display */}
            {(price || distance) && (
              <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>Estimated Price:</Text>
                <Text style={styles.priceValue}>
                  {price ? `NPR ${price}` : 'Will be calculated'}
                </Text>
                {distance && (
                  <Text style={styles.distanceText}>
                    Distance: {distance.toFixed(2)} km
                  </Text>
                )}
              </View>
            )}

            <TouchableOpacity 
              style={styles.button} 
              onPress={handleSearch}
              activeOpacity={0.8}
            >
              <Ionicons name="search" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Find Nearby Vehicles</Text>
            </TouchableOpacity>

            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={20} color="#666" style={{ marginRight: 8 }} />
              <Text style={styles.infoText}>
                Instant booking connects you with drivers in your area for immediate pickup. Pricing may vary based on distance and availability.
              </Text>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default InstantBookingScreen;

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
    flex: 1,
    fontSize: 20, 
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
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
    marginBottom: 8,
    color: '#333',
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
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
  loadingContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
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
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 4,
  },
  infoBox: {
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 20,
    flexDirection: 'row',
    borderLeftWidth: 3,
    borderLeftColor: BRAND_COLOR,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
    lineHeight: 18,
  },
  // Payment method styles
  paymentOptions: {
    marginTop: 8,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  selectedPaymentOption: {
    borderColor: BRAND_COLOR,
    backgroundColor: `${BRAND_COLOR}10`, // 10% opacity of brand color
  },
  paymentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentTextContainer: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  selectedPaymentText: {
    color: BRAND_COLOR,
  },
  paymentDescription: {
    fontSize: 12,
    color: '#777',
  },
  radioContainer: {
    width: 24,
    alignItems: 'center',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: BRAND_COLOR,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: BRAND_COLOR,
  },
  paymentInfoBox: {
    backgroundColor: `${BRAND_COLOR}10`,
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
    flexDirection: 'row',
    borderLeftWidth: 3,
    borderLeftColor: BRAND_COLOR,
  },
  paymentInfoText: {
    fontSize: 13,
    color: '#555',
    flex: 1,
    lineHeight: 18,
  },
  // Autocomplete styles
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
  // Price display styles
  priceContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: BRAND_COLOR,
  },
  distanceText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
});