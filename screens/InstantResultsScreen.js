import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, ActivityIndicator, Modal, Animated,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from '../utils/axiosInstance';
import { BRAND_COLOR } from './config';


const InstantResultsScreen = ({ route, navigation }) => {
  const { coords, bookingDetails } = route.params;
  
  const [vehicles, setVehicles] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookingInfo, setBookingInfo] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await axios.get(
        `/available-vehicles?lat=${coords.latitude}&lng=${coords.longitude}&weight=${bookingDetails.weight}`
      );
      setVehicles(res.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not fetch vehicles.');
    }
  };

  const openConfirmationModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowModal(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const handleSendRequest = async () => {
    if (!selectedVehicle) return;

    setLoadingId(selectedVehicle.id);
    try {
      const res = await axios.post('/bookings/instant', {
        pickup: bookingDetails.pickup,
        dropoff: bookingDetails.dropoff,
        weight: bookingDetails.weight,
        vehicle_id: selectedVehicle.id,
        receiver_name: bookingDetails.receiverName,
        receiver_number: bookingDetails.receiverNumber,
        notes: bookingDetails.notes,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      setShowModal(false);
      setBookingInfo(res.data);
      setShowSuccessModal(true);
    } catch (error) {
      console.error(error.response?.data || error.message);
      Alert.alert('Error', 'Failed to send booking request.');
    } finally {
      setLoadingId(null);
    }
  };

  const renderVehicleCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.vehicleRow}>
          <MaterialCommunityIcons name="truck-outline" size={20} color="#666" style={{ marginRight: 8 }} />
          <Text style={styles.vehicleName}>{item.type} ({item.plate})</Text>
        </View>
        <Text style={styles.priceValue}>{item.distance.toFixed(2)} km away</Text>
      </View>

      <Text style={styles.capacity}>Capacity: {item.capacity} kg</Text>

      <TouchableOpacity style={styles.bookButton} onPress={() => openConfirmationModal(item)}>
        <Ionicons name="send" size={18} color="#fff" style={{ marginRight: 6 }} />
        <Text style={styles.bookText}>Book Now</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color={BRAND_COLOR} />
        </TouchableOpacity>
        <Text style={styles.title}>Nearby Vehicles</Text>
      </View>

      <FlatList
        data={vehicles}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderVehicleCard}
        ListEmptyComponent={<Text style={styles.emptyText}>No nearby vehicles available</Text>}
        contentContainerStyle={{ paddingBottom: 30 }}
      />

      {/* Booking Confirmation Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="none"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalBox, { opacity: fadeAnim }]}>
            <Text style={styles.modalTitle}>Confirm Your Booking</Text>

            <View style={styles.sectionCard}>
              {renderRow('Vehicle', `${selectedVehicle?.type} (${selectedVehicle?.plate})`)}
              {renderRow('From', bookingDetails.pickup)}
              {renderRow('To', bookingDetails.dropoff)}
              {renderRow('Weight', `${bookingDetails.weight} kg`)}
              {renderRow('Receiver', bookingDetails.receiverName)}
              {renderRow('Phone', bookingDetails.receiverNumber)}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.secondaryButton]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.primaryButtonLarge]}
                onPress={handleSendRequest}
                disabled={loadingId === selectedVehicle?.id}
              >
                {loadingId === selectedVehicle?.id ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Send Request</Text>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Booking request Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <Ionicons name="checkmark-circle" size={80} color="green" style={{ marginBottom: 12 }} />
            <Text style={styles.successText}>Booking Request Sent!</Text>
            <Text style={styles.successSubText}>Request sent! We’re waiting for the driver to respond.</Text>

            <View style={styles.successDetailsBox}>
              {renderRow('Tracking Number', bookingInfo?.tracking_number || bookingInfo?.tracking_no || 'Unavailable')}
              {renderRow('From', bookingInfo?.pickup || bookingDetails.pickup)}
              {renderRow('To', bookingInfo?.dropoff || bookingDetails.dropoff)}
              {renderRow('Weight', `${bookingInfo?.weight || bookingDetails.weight} kg`)}
              {renderRow('Receiver Name', bookingInfo?.receiver_name || bookingDetails.receiverName)}
              {renderRow('Receiver Phone', bookingInfo?.receiver_number || bookingDetails.receiverNumber)}
              {renderRow('Vehicle', `${selectedVehicle?.type} (${selectedVehicle?.plate})`)}
              {renderRow('Requested At', new Date().toLocaleString())}
            </View>

            <TouchableOpacity
              style={styles.successButton}
              onPress={() => {
                setShowSuccessModal(false);
                navigation.navigate('Dashboard');
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>Go to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );

  function renderRow(label, value) {
    return (
      <View style={styles.compactRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.valueLeft}>{value}</Text>
      </View>
    );
  }
};

export default InstantResultsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginLeft: 10, color: '#000' },
  card: {
    backgroundColor: '#f7f7f7', padding: 16, borderRadius: 16, marginBottom: 16, elevation: 2,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  vehicleRow: { flexDirection: 'row', alignItems: 'center', flexShrink: 1, flex: 1 },
  vehicleName: { fontSize: 16, fontWeight: 'bold', color: '#333', flexShrink: 1, flexWrap: 'wrap' },
  priceValue: { fontSize: 15, fontWeight: '600', color: '#111' },
  capacity: { fontSize: 13, color: '#444', fontWeight: '500', marginBottom: 6 },
  bookButton: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: BRAND_COLOR,
    padding: 10, borderRadius: 8, justifyContent: 'center'
  },
  bookText: { color: '#fff', fontWeight: '600' },
  emptyText: { textAlign: 'center', marginTop: 40, fontSize: 16, color: '#999' },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center'
  },
  modalBox: { width: '90%', backgroundColor: '#fff', padding: 18, borderRadius: 14 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 14, color: '#111' },
  sectionCard: {
    backgroundColor: '#f9f9f9', borderRadius: 10, padding: 10,
    marginBottom: 14, borderColor: '#eee', borderWidth: 1
  },
  compactRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  label: { fontSize: 13, color: '#666', width: 120 },
  valueLeft: { fontSize: 13, fontWeight: '500', color: '#222', flex: 1 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 },
  modalButton: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8, marginLeft: 10 },
  primaryButtonLarge: { backgroundColor: BRAND_COLOR },
  primaryButtonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  secondaryButton: { backgroundColor: '#eee' },
  secondaryButtonText: { color: '#333', fontWeight: '500' },

  successModal: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 14,
    alignItems: 'center',
    width: '90%',
  },
  successText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'green',
    marginBottom: 4,
  },
  successSubText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
  },
  successDetailsBox: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    width: '100%',
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee',
  },
  successButton: {
    backgroundColor: BRAND_COLOR,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 8,
  },
});
