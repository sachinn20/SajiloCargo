import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView,
  Alert, Switch, Platform, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
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
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back-outline" size={22} color="#333" />
            </TouchableOpacity>
            <Text style={styles.title}>Add Vehicle</Text>
            <View style={styles.headerRight} />
          </View>

          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formContainer}>
              <View style={styles.formHeader}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons name="truck-plus" size={28} color={BRAND_COLOR} />
                </View>
                <Text style={styles.formTitle}>Vehicle Details</Text>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Vehicle Type <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons name="truck-outline" size={20} color="#999" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={form.type}
                    onChangeText={(text) => handleChange('type', text)}
                    placeholder="e.g. Truck"
                    placeholderTextColor="#aaa"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Capacity (kg) <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons name="weight" size={20} color="#999" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={form.capacity}
                    onChangeText={(text) => handleChange('capacity', text)}
                    placeholder="e.g. 2000"
                    placeholderTextColor="#aaa"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Plate Number <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="card-outline" size={20} color="#999" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={form.plate}
                    onChangeText={(text) => handleChange('plate', text)}
                    placeholder="e.g. BA 2 PA 1234"
                    placeholderTextColor="#aaa"
                    autoCapitalize="characters"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  License Number <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="document-text-outline" size={20} color="#999" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={form.license}
                    onChangeText={(text) => handleChange('license', text)}
                    placeholder="Transport License ID"
                    placeholderTextColor="#aaa"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Insurance (optional)</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="shield-checkmark-outline" size={20} color="#999" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={form.insurance}
                    onChangeText={(text) => handleChange('insurance', text)}
                    placeholder="Insurance No."
                    placeholderTextColor="#aaa"
                  />
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.formGroup}>
                <View style={styles.switchRow}>
                  <View>
                    <Text style={styles.switchLabel}>Enable for Instant Booking</Text>
                    {isInstant && (
                      <Text style={styles.switchSubLabel}>
                        {location ? 'Location set successfully' : 'Setting up location...'}
                      </Text>
                    )}
                  </View>
                  <Switch 
                    value={isInstant} 
                    onValueChange={handleInstantToggle}
                    trackColor={{ false: '#e0e0e0', true: `${BRAND_COLOR}80` }}
                    thumbColor={isInstant ? BRAND_COLOR : '#f4f3f4'}
                    ios_backgroundColor="#e0e0e0"
                  />
                </View>
                
                {isInstant && (
                  <View style={styles.locationInfo}>
                    <Ionicons name="location-outline" size={18} color={location ? "#4CAF50" : "#FFA000"} />
                    <Text style={[styles.locationText, { color: location ? "#4CAF50" : "#FFA000" }]}>
                      {location ? 'Current location will be used for instant booking' : 'Getting your location...'}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.buttonContainer}>
                {/* <TouchableOpacity 
                  style={styles.cancelButton} 
                  onPress={() => navigation.goBack()}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity> */}
                
                <TouchableOpacity 
                  style={[styles.submitButton, loading && styles.disabledButton]} 
                  onPress={handleSubmit} 
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>Add Vehicle</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default AddVehicleScreen;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRight: {
    width: 40,
  },
  title: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#333',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  formContainer: {
    padding: 20,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: { 
    fontSize: 14,
    fontWeight: '500', 
    marginBottom: 8, 
    color: '#333',
    paddingLeft: 4,
  },
  required: {
    color: '#ff4757',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  inputIcon: {
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 12,
    fontSize: 15,
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 16,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  switchLabel: { 
    fontSize: 16, 
    fontWeight: '500',
    color: '#333' 
  },
  switchSubLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  locationText: {
    fontSize: 13,
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
  submitButton: {
    flex: 2,
    backgroundColor: BRAND_COLOR,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: { 
    color: '#fff', 
    fontWeight: '600', 
    fontSize: 16 
  },
});