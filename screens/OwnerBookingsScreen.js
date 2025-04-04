import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Pressable,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from '../utils/axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { BRAND_COLOR } from './config';
import { useNavigation } from '@react-navigation/native';

const OwnerBookingsScreen = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const navigation = useNavigation();

  const fetchBookings = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get('/my-bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(res.data);
      applyFilter(res.data, filter);
    } catch (err) {
      Alert.alert('Error', 'Failed to load bookings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilter = (bookingsList, status) => {
    let filtered = bookingsList;
    if (status !== 'all') filtered = filtered.filter(b => b.status === status);
    setFilteredBookings(filtered);
  };

  const handleFilterChange = (status) => {
    setFilter(status);
    applyFilter(bookings, status);
  };

  const updateBookingStatus = async (id, status) => {
    try {
      setProcessingId(id);
      const token = await AsyncStorage.getItem('token');
      await axios.put(`/bookings/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Success', `Booking ${status}`);
      setSelectedBooking(null);
      fetchBookings();
    } catch (err) {
      Alert.alert('Error', 'Could not update booking status');
    } finally {
      setProcessingId(null);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBookings();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => setSelectedBooking(item)}>
      <Text style={styles.tripInfo}>{item.trip.from_location} → {item.trip.to_location}</Text>
      <Text style={styles.vehicleText}>{item.trip.vehicle_name}</Text>
      <Text style={styles.plateText}>Plate: {item.trip.vehicle_plate}</Text>
      <Text style={styles.statusText}>Status: <Text style={{ color: BRAND_COLOR }}>{item.status.toUpperCase()}</Text></Text>
      <Text style={styles.customerName}>Customer: {item.user.name}</Text>
      <Text style={styles.amountText}>Amount: NPR {item.amount}</Text>
    </TouchableOpacity>
  );

  const renderDetailModal = () => (
    <Modal
      visible={!!selectedBooking}
      transparent
      animationType="slide"
      onRequestClose={() => setSelectedBooking(null)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <ScrollView>
            <Text style={styles.modalTitle}>Booking Details</Text>

            <Text style={styles.modalLabel}>Route</Text>
            <Text style={styles.modalValue}>{selectedBooking?.trip.from_location} → {selectedBooking?.trip.to_location}</Text>

            <Text style={styles.modalLabel}>Vehicle</Text>
            <Text style={styles.modalValue}>{selectedBooking?.trip.vehicle_name} ({selectedBooking?.trip.vehicle_plate})</Text>

            <Text style={styles.modalLabel}>Shipment Type</Text>
            <Text style={styles.modalValue}>{selectedBooking?.shipment_type}</Text>

            <Text style={styles.modalLabel}>Weight</Text>
            <Text style={styles.modalValue}>{selectedBooking?.weight} kg</Text>

            <Text style={styles.modalLabel}>Dimensions</Text>
            <Text style={styles.modalValue}>{selectedBooking?.dimension}</Text>

            <Text style={styles.modalLabel}>Packages</Text>
            <Text style={styles.modalValue}>{selectedBooking?.no_of_packages}</Text>

            <Text style={styles.modalLabel}>Receiver</Text>
            <Text style={styles.modalValue}>{selectedBooking?.receiver_name} ({selectedBooking?.receiver_number})</Text>

            <Text style={styles.modalLabel}>Amount</Text>
            <Text style={styles.modalValue}>NPR {selectedBooking?.amount}</Text>

            <Text style={styles.modalLabel}>Status</Text>
            <Text style={[styles.modalValue, { color: BRAND_COLOR }]}>{selectedBooking?.status.toUpperCase()}</Text>

            {selectedBooking?.status === 'pending' && (
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: 'green' }]}
                  onPress={() => updateBookingStatus(selectedBooking.id, 'accepted')}
                  disabled={processingId === selectedBooking.id}
                >
                  <Text style={styles.modalButtonText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: 'red' }]}
                  onPress={() => updateBookingStatus(selectedBooking.id, 'rejected')}
                  disabled={processingId === selectedBooking.id}
                >
                  <Text style={styles.modalButtonText}>Reject</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedBooking(null)}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back-outline" size={24} color={BRAND_COLOR} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Booking Requests</Text>
      </View>

      <View style={styles.filterRow}>
        {['all', 'pending', 'accepted', 'rejected'].map((status) => (
          <Pressable
            key={status}
            style={[styles.filterBtn, filter === status && styles.filterBtnActive]}
            onPress={() => handleFilterChange(status)}
          >
            <Text style={[styles.filterText, filter === status && styles.filterTextActive]}>
              {status.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={BRAND_COLOR} style={{ marginTop: 30 }} />
      ) : filteredBookings.length === 0 ? (
        <Text style={styles.emptyText}>No bookings found.</Text>
      ) : (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ paddingBottom: 50 }}
        />
      )}

      {renderDetailModal()}
    </SafeAreaView>
  );
};

export default OwnerBookingsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 16 },
  header: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16 },
  backBtn: { marginRight: 12 },
  headerText: { fontSize: 20, fontWeight: 'bold', color: '#222' },
  card: { backgroundColor: '#f2f2f2', borderRadius: 10, padding: 14, marginVertical: 8 },
  tripInfo: { fontWeight: 'bold', fontSize: 15, marginBottom: 2, color: '#333' },
  vehicleText: { fontSize: 13, color: '#555' },
  plateText: { fontSize: 12, color: '#777', marginBottom: 2 },
  customerName: { color: '#555' },
  amountText: { fontSize: 13, color: '#444', marginBottom: 2 },
  statusText: { fontSize: 13, color: '#444', marginBottom: 2 },
  emptyText: { textAlign: 'center', marginTop: 40, fontSize: 16, color: '#888' },

  filterRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 },
  filterBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, backgroundColor: '#eee' },
  filterBtnActive: { backgroundColor: BRAND_COLOR },
  filterText: { fontSize: 13, color: '#444' },
  filterTextActive: { color: '#fff', fontWeight: 'bold' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { width: '90%', backgroundColor: '#fff', padding: 20, borderRadius: 12, maxHeight: '85%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#111' },
  modalLabel: { fontSize: 13, color: '#555', marginTop: 8 },
  modalValue: { fontSize: 14, fontWeight: '500', color: '#222' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  modalButton: { flex: 0.48, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  modalButtonText: { color: '#fff', fontWeight: '600' },
  closeBtn: { marginTop: 20, backgroundColor: '#ccc', padding: 10, borderRadius: 8, alignItems: 'center' },
  closeBtnText: { color: '#333', fontWeight: '500' },
});
