import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView,
  Alert, Switch, Platform, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from '../utils/axiosInstance';
import { BRAND_COLOR } from './config';

const AddVehicleScreen = () => {
  const navigation = useNavigation();

  const [form, setForm] = useState({
    type: '',
    capacity: '',
    plate: '',
    license: '',
    insurance: '',
  });

  const [isInstant, setIsInstant] = useState(false);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleInstantToggle = async (value) => {
    setIsInstant(value);

    if (value) {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Location Required', 'Please allow location access to enable Instant Booking.');
          setIsInstant(false);
          return;
        }

        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc.coords);
        console.log('📍 Location set for instant:', loc.coords);
      } catch (error) {
        console.log(error);
        Alert.alert('Error', 'Failed to fetch location');
        setIsInstant(false);
      }
    } else {
      setLocation(null);
    }
  };

  const handleSubmit = async () => {
    const { type, capacity, plate, license } = form;

    if (!type || !capacity || !plate || !license) {
      return Alert.alert('Validation', 'Please fill in all required fields.');
    }

    if (isInstant && !location) {
      return Alert.alert('Location Missing', 'Instant booking requires your current location.');
    }

    try {
      setLoading(true);

      const payload = {
        ...form,
        is_instant: isInstant,
        latitude: isInstant ? location.latitude : null,
        longitude: isInstant ? location.longitude : null,
      };

      await axios.post('/vehicles', payload);

      Alert.alert('Success', 'Vehicle added successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error(error);
      const msg = error?.response?.data?.message || 'Something went wrong.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back-outline" size={24} color={BRAND_COLOR} />
              </TouchableOpacity>
              <Text style={styles.title}>Add Vehicle</Text>
            </View>

            {/* Form Fields */}
            <Text style={styles.label}>Vehicle Type</Text>
            <TextInput
              style={styles.input}
              value={form.type}
              onChangeText={(text) => handleChange('type', text)}
              placeholder="e.g. Truck"
            />

            <Text style={styles.label}>Capacity (kg)</Text>
            <TextInput
              style={styles.input}
              value={form.capacity}
              onChangeText={(text) => handleChange('capacity', text)}
              placeholder="e.g. 2000"
              keyboardType="numeric"
            />

            <Text style={styles.label}>Plate Number</Text>
            <TextInput
              style={styles.input}
              value={form.plate}
              onChangeText={(text) => handleChange('plate', text)}
              placeholder="e.g. BA 2 PA 1234"
            />

            <Text style={styles.label}>License Number</Text>
            <TextInput
              style={styles.input}
              value={form.license}
              onChangeText={(text) => handleChange('license', text)}
              placeholder="Transport License ID"
            />

            <Text style={styles.label}>Insurance (optional)</Text>
            <TextInput
              style={styles.input}
              value={form.insurance}
              onChangeText={(text) => handleChange('insurance', text)}
              placeholder="Insurance No."
            />

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Enable for Instant Booking</Text>
              <Switch value={isInstant} onValueChange={handleInstantToggle} />
            </View>

            {/* Submit Button */}
            <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
              <Text style={styles.buttonText}>
                {loading ? 'Adding...' : 'Submit'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default AddVehicleScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 10,
  },
  backButton: { marginRight: 12 },
  title: { fontSize: 22, fontWeight: 'bold', color: BRAND_COLOR },
  label: { fontWeight: '600', marginBottom: 4, paddingHorizontal: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    marginHorizontal: 20,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 25,
  },
  switchLabel: { fontSize: 16, color: '#333' },
  button: {
    backgroundColor: BRAND_COLOR,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 10,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
