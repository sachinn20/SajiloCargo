// screens/AddVehicleScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.type || !form.capacity || !form.plate || !form.license) {
      return Alert.alert('Validation', 'Please fill in all required fields.');
    }

    try {
      setLoading(true);
      const response = await axios.post('/vehicles', form);
      Alert.alert('Success', 'Vehicle added successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.log(error);
      const message = error?.response?.data?.message || 'Failed to add vehicle';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color={BRAND_COLOR} />
        </TouchableOpacity>

        <Text style={styles.title}>Add Vehicle</Text>

        <TextInput
          style={styles.input}
          placeholder="Vehicle Type (e.g. Truck)"
          value={form.type}
          onChangeText={(text) => handleChange('type', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Capacity (e.g. 10 KG)"
          value={form.capacity}
          onChangeText={(text) => handleChange('capacity', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Plate Number"
          value={form.plate}
          onChangeText={(text) => handleChange('plate', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="License Number"
          value={form.license}
          onChangeText={(text) => handleChange('license', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Insurance Number (optional)"
          value={form.insurance}
          onChangeText={(text) => handleChange('insurance', text)}
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Adding...' : 'Submit'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddVehicleScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: BRAND_COLOR,
    marginVertical: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  button: {
    backgroundColor: BRAND_COLOR,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
