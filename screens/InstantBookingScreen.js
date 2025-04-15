import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView,
  Alert, Platform, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
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

  // 📍 Get location + autofill pickup
  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Location access is required to use this feature.');
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
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>

          {/* Fixed Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back-outline" size={24} color={BRAND_COLOR} />
            </TouchableOpacity>
            <Text style={styles.title}>Instant Booking</Text>
          </View>

          {/* Scrollable Form */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            <Text style={styles.label}>Pickup Address</Text>
            <TextInput
              style={styles.input}
              value={pickup}
              onChangeText={setPickup}
              placeholder="Auto-filled or editable"
            />

            <Text style={styles.label}>Drop-off Address</Text>
            <TextInput
              style={styles.input}
              value={dropoff}
              onChangeText={setDropoff}
              placeholder="e.g. Pokhara"
            />

            <Text style={styles.label}>Weight (kg)</Text>
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={setWeight}
              placeholder="e.g. 25"
              keyboardType="numeric"
            />

            <Text style={styles.label}>Receiver Name</Text>
            <TextInput
              style={styles.input}
              value={receiverName}
              onChangeText={setReceiverName}
              placeholder="e.g. Ramesh Shrestha"
            />

            <Text style={styles.label}>Receiver Number</Text>
            <TextInput
              style={styles.input}
              value={receiverNumber}
              onChangeText={setReceiverNumber}
              placeholder="e.g. 9800000000"
              keyboardType="phone-pad"
              maxLength={10}
            />

            <Text style={styles.label}>Notes (optional)</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Extra notes if any"
              multiline
            />

            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <Text style={styles.searchText}>Find Nearby Vehicles</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default InstantBookingScreen;

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
  searchButton: {
    backgroundColor: BRAND_COLOR, padding: 14, borderRadius: 8,
    alignItems: 'center', marginTop: 10, marginHorizontal: 20
  },
  searchText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
