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

        const address = await Location.reverseGeocodeAsync(loc.coords);
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

  const handleSearch = () => {
    if (!pickup || !dropoff || !weight || !receiverName || !receiverNumber) {
      return Alert.alert('Validation Error', 'Please fill in all required fields.');
    }

    if (receiverNumber.length !== 10 || !/^\d{10}$/.test(receiverNumber)) {
      return Alert.alert('Invalid Phone', 'Receiver number must be exactly 10 digits.');
    }

    if (!location) {
      return Alert.alert('Location Error', 'Could not detect your current location.');
    }

    navigation.navigate('InstantResults', {
        coords: location, // 👈 passed from GPS
        bookingDetails: {
          pickup,
          dropoff,
          weight,
          receiverName,
          receiverNumber,
          notes
        }
      });
      
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
                          placeholder="Auto-filled or editable"
                          placeholderTextColor="#888"
                        />
                      )}
                    </View>
                  </View>
                  
                  <View style={styles.inputWrapper}>
                    <Text style={styles.label}>Drop-off Address</Text>
                    <View style={styles.inputContainer}>
                      <Ionicons name="location-outline" size={20} color="#777" style={styles.inputIcon} />
                      <TextInput
                        style={styles.textInput}
                        value={dropoff}
                        onChangeText={setDropoff}
                        placeholder="Enter destination address"
                        placeholderTextColor="#888"
                      />
                    </View>
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
});