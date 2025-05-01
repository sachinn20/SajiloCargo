// === TripManagementScreen.js ===
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Alert,
  StyleSheet, ActivityIndicator, TextInput, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from '../utils/axiosInstance';
import { BRAND_COLOR } from './config';
import { useFocusEffect } from '@react-navigation/native';

const STATUS_OPTIONS = [
  'pending', 'scheduled', 'loading', 'en_route',
  'delayed', 'arrived', 'unloading', 'completed', 'cancelled'
];

const STATUS_COLORS = {
  pending: '#888',
  scheduled: '#8080ff',
  loading: '#ff9900',
  en_route: '#1e90ff',
  delayed: '#ffcc00',
  arrived: '#6a5acd',
  unloading: '#9932cc',
  completed: '#4caf50',
  cancelled: '#f44336'
};

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
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedTripForStatus, setSelectedTripForStatus] = useState(null);

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

  const updateTripStatus = async (tripId, status) => {
    try {
      await axios.post('/trips/update-status', { trip_id: tripId, status });
      setStatusModalVisible(false);
      setSelectedTripForStatus(null);
      fetchTrips();
    } catch (error) {
      console.log("Trip status update error:", error.response?.data || error.message);
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const deleteTrip = async (id) => {
    Alert.alert('Confirm', 'Delete this trip?', [
      { text: 'Cancel' },
      {
        text: 'Delete', onPress: async () => {
          try {
            await axios.delete(`/trips/${id}`);
            fetchTrips();
          } catch {
            Alert.alert('Error', 'Delete failed.');
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
      date: trip.date,
      time: trip.time,
      shipment_type: trip.shipment_type,
      available_capacity: trip.available_capacity?.toString() || '',
    });
    setEditModalVisible(true);
  };

  const updateTrip = async () => {
    try {
      await axios.put(`/trips/${editingTrip.id}`, editFields);
      setEditModalVisible(false);
      fetchTrips();
    } catch {
      Alert.alert('Error', 'Update failed.');
    }
  };

  const getSafeTime = (timeString) => {
    const date = new Date();
    try {
      const [h, m] = timeString.split(':');
      date.setHours(Number(h), Number(m));
      return date;
    } catch {
      return date;
    }
  };

  const safeDate = editFields.date ? new Date(editFields.date) : new Date();
  const safeTime = getSafeTime(editFields.time);

  return (
    <SafeAreaView style={styles.container}>
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
              <View style={styles.tripHeaderRow}>
                <Text style={styles.tripTitle}>{item.from_location} → {item.to_location}</Text>
                <TouchableOpacity onPress={() => {
                  if (item.status !== 'completed' && item.status !== 'cancelled') {
                    setSelectedTripForStatus(item);
                    setStatusModalVisible(true);
                  } else {
                    Alert.alert('Action Blocked', 'Trip status cannot be changed.');
                  }
                }}>
                  <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] || '#ccc' }]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                    <Ionicons name="chevron-down" size={16} color="#fff" />
                  </View>
                </TouchableOpacity>
              </View>

              <Text style={styles.tripDetails}>{item.date} at {item.time} | {item.shipment_type.toUpperCase()}</Text>
              <Text style={styles.tripDetails}>Capacity: {item.available_capacity} tons</Text>
              <Text style={styles.tripDetails}>Vehicle: {item.vehicle_name} ({item.vehicle_plate})</Text>
              <Text style={styles.tripDetails}>Owner: {item.owner_name}</Text>

              <View style={styles.actions}>
                <TouchableOpacity onPress={() => {
                  if (item.status === 'completed') {
                    Alert.alert('Action Blocked', 'Completed trips cannot be edited.');
                    
                  } else {
                    openEditModal(item);
                  }
                }} style={{ marginRight: 10 }}>
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

      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddTrip')}>
        <Ionicons name="add-circle-outline" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Add Trip</Text>
      </TouchableOpacity>

      {editModalVisible && (
        <SafeAreaView style={styles.modal}>
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

      {statusModalVisible && selectedTripForStatus && (
        <SafeAreaView style={styles.statusModal}>
          <Text style={styles.modalTitle}>Change Trip Status</Text>
          {STATUS_OPTIONS.map((status) => (
            <TouchableOpacity key={status} onPress={() => updateTripStatus(selectedTripForStatus.id, status)} style={styles.statusOption}>
              <View style={[styles.statusBadgeSmall, { backgroundColor: STATUS_COLORS[status] }]}>
                <Text style={styles.statusTextSmall}>{status}</Text>
              </View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={() => setStatusModalVisible(false)}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </SafeAreaView>
      )}

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backButton: { marginRight: 12 },
  title: { fontSize: 22, fontWeight: 'bold' },
  tripCard: { backgroundColor: '#f6f6f6', borderRadius: 10, padding: 16, marginBottom: 12 },
  tripHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tripTitle: { fontSize: 16, fontWeight: 'bold', flex: 1 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  statusText: { color: '#fff', fontSize: 12, marginRight: 4, textTransform: 'capitalize' },
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
  statusModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 20,
    paddingBottom: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  statusOption: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'flex-start'
  },
  statusBadgeSmall: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  statusTextSmall: {
    color: '#fff',
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  cancelText: { textAlign: 'center', color: 'red', marginTop: 12, fontWeight: 'bold' },
});

export default TripManagementScreen;