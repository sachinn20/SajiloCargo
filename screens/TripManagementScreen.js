// === TripManagementScreen.js ===
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Alert,
  StyleSheet, ActivityIndicator, TextInput, ScrollView, Platform
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from '../utils/axiosInstance';
import { BRAND_COLOR } from './config';
import { useFocusEffect } from '@react-navigation/native';

const TripManagementScreen = ({ navigation }) => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [editFields, setEditFields] = useState({
    from_location: '', to_location: '', date: '',
    time: '', shipment_type: '', available_capacity: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/trips');
      setTrips(response.data);
    } catch (error) {
      Alert.alert('Error', 'Could not load trips.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTrips();
    }, [])
  );

  const deleteTrip = async (id) => {
    Alert.alert('Confirm', 'Are you sure you want to delete this trip?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            await axios.delete(`/trips/${id}`);
            fetchTrips();
          } catch (error) {
            Alert.alert('Error', 'Could not delete trip.');
          }
        },
      },
    ]);
  };

  const openEditModal = (trip) => {
    setEditingTrip(trip);
    setEditFields({
      from_location: trip.from_location,
      to_location: trip.to_location,
      date: trip.date || new Date().toISOString().split('T')[0],
      time: trip.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      shipment_type: trip.shipment_type,
      available_capacity: trip.available_capacity?.toString() || '',
    });
    setEditModalVisible(true);
  };

  const updateTrip = async () => {
    try {
      await axios.put(`/trips/${editingTrip.id}`, editFields);
      setEditModalVisible(false);
      setEditingTrip(null);
      fetchTrips();
    } catch (error) {
      Alert.alert('Error', 'Failed to update trip.');
    }
  };

  const getSafeTime = (timeString) => {
    try {
      if (!timeString || typeof timeString !== 'string') throw new Error('Invalid');

      const date = new Date('2000-01-01');
      const [timePart, modifier] = timeString.split(' ');
      let [hours, minutes] = timePart.split(':').map(Number);

      if (modifier) {
        if (modifier.toLowerCase() === 'pm' && hours < 12) hours += 12;
        if (modifier.toLowerCase() === 'am' && hours === 12) hours = 0;
      }

      if (isNaN(hours) || isNaN(minutes)) throw new Error('Invalid time numbers');

      date.setHours(hours);
      date.setMinutes(minutes);
      date.setSeconds(0);
      return date;
    } catch (e) {
      return new Date();
    }
  };

  const safeDate = editFields.date ? new Date(editFields.date) : new Date();
  const safeTime = getSafeTime(editFields.time);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={24} color={BRAND_COLOR} />
        </TouchableOpacity>
        <Text style={styles.title}>My Trips</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={BRAND_COLOR} />
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.tripCard}>
              <Text style={styles.tripTitle}>{item.from_location} → {item.to_location}</Text>
              <Text style={styles.tripDetails}>{item.date} at {item.time} | {item.shipment_type.toUpperCase()}</Text>
              <Text style={styles.tripDetails}>Capacity: {item.available_capacity} tons</Text>
              <Text style={styles.tripDetails}>Vehicle: {item.vehicle_name} ({item.vehicle_plate})</Text>
              <Text style={styles.tripDetails}>Owner: {item.owner_name}</Text>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => openEditModal(item)} style={{ marginRight: 10 }}>
                  <Ionicons name="create-outline" size={20} color={BRAND_COLOR} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteTrip(item.id)}>
                  <Ionicons name="trash-outline" size={20} color="red" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddTrip')}
      >
        <Ionicons name="add-circle-outline" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Add Trip</Text>
      </TouchableOpacity>

      {editModalVisible && (
        <SafeAreaView style={styles.modal} edges={['top', 'left', 'right']}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="arrow-back-outline" size={24} color={BRAND_COLOR} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { marginLeft: 10 }]}>Edit Trip</Text>
            </View>

            <Text style={styles.label}>From</Text>
            <TextInput style={styles.input} value={editFields.from_location} onChangeText={(text) => setEditFields({ ...editFields, from_location: text })} />

            <Text style={styles.label}>To</Text>
            <TextInput style={styles.input} value={editFields.to_location} onChangeText={(text) => setEditFields({ ...editFields, to_location: text })} />

            <Text style={styles.label}>Date</Text>
            <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
              <Text>{editFields.date}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={safeDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setEditFields({ ...editFields, date: selectedDate.toISOString().split('T')[0] });
                  }
                }}
              />
            )}

            <Text style={styles.label}>Time</Text>
            <TouchableOpacity style={styles.input} onPress={() => setShowTimePicker(true)}>
              <Text>{editFields.time}</Text>
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker
                value={safeTime}
                mode="time"
                display="default"
                is24Hour={true}
                onChange={(event, selectedTime) => {
                  setShowTimePicker(false);
                  if (selectedTime) {
                    const timeStr = selectedTime.toLocaleTimeString([], {
                      hour: '2-digit', minute: '2-digit', hour12: false
                    });
                    setEditFields({ ...editFields, time: timeStr });
                  }
                }}
              />
            )}

            <Text style={styles.label}>Shipment Type</Text>
            <TextInput style={styles.input} value={editFields.shipment_type} onChangeText={(text) => setEditFields({ ...editFields, shipment_type: text })} />

            <Text style={styles.label}>Available Capacity</Text>
            <TextInput style={styles.input} value={editFields.available_capacity} keyboardType="numeric" onChangeText={(text) => setEditFields({ ...editFields, available_capacity: text })} />

            <TouchableOpacity style={styles.button} onPress={updateTrip}>
              <Text style={styles.buttonText}>Update Trip</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      )}
    </SafeAreaView>
  );
};

export default TripManagementScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backButton: { marginRight: 12 },
  title: { fontSize: 22, fontWeight: 'bold' },
  tripCard: { backgroundColor: '#f6f6f6', borderRadius: 10, padding: 16, marginBottom: 12 },
  tripTitle: { fontSize: 16, fontWeight: 'bold' },
  tripDetails: { fontSize: 13, color: '#555', marginTop: 4 },
  actions: { flexDirection: 'row', marginTop: 10 },
  addButton: {
    position: 'absolute', right: 20, bottom: 30,
    backgroundColor: BRAND_COLOR,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderRadius: 30, elevation: 6,
  },
  addButtonText: { color: '#fff', marginLeft: 8, fontWeight: '600' },
  modal: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'white', padding: 20, zIndex: 999,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  label: { fontWeight: 'bold', marginBottom: 4, marginTop: 10 },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    padding: 12, marginBottom: 8, backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: BRAND_COLOR, padding: 14,
    borderRadius: 8, alignItems: 'center', marginTop: 20
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  picker: { marginBottom: 12 },
});
