import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from '../utils/axiosInstance';
import { BRAND_COLOR } from './config';

const SearchResultsScreen = ({ route, navigation }) => {
  const { trips, packageDetails } = route.params;
  const [loadingId, setLoadingId] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const openConfirmationModal = (trip) => {
    setSelectedTrip(trip);
    setShowModal(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const handleSendRequest = async () => {
    if (!selectedTrip) return;

    setLoadingId(selectedTrip.id);
    try {
      await axios.post('/bookings', {
        trip_id: selectedTrip.id,
        shipment_type: packageDetails.shipmentType,
        weight: packageDetails.weight,
        dimension: packageDetails.dimensions,
        notes: packageDetails.description || '',
        amount: packageDetails.amount,
        no_of_packages: packageDetails.noOfPackages,
        receiver_name: packageDetails.receiverName,
        receiver_number: packageDetails.receiverNumber,
      });

      setShowModal(false);
      Alert.alert('Success', 'Booking request sent successfully!');
      navigation.navigate('Dashboard');
    } catch (error) {
      console.error(error.response?.data || error.message);
      Alert.alert('Error', 'Failed to send booking request.');
    } finally {
      setLoadingId(null);
    }
  };

  const renderTripCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.vehicleRow}>
          <MaterialCommunityIcons
            name="truck-outline"
            size={20}
            color="#666"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.vehicleName}>
            {item.vehicle_name} ({item.vehicle_plate})
          </Text>
        </View>
        <View style={styles.amountTag}>
          <Text style={styles.priceLabel}></Text>
          <Text style={styles.priceValue}>NPR {packageDetails.amount}</Text>
        </View>
      </View>

      <Text style={styles.route}>
        {item.from_location} → {item.to_location}
      </Text>

      <View style={styles.bottomRow}>
        <Text style={styles.capacity}>
          Capacity: {item.available_capacity} tons
        </Text>
        <Text style={styles.departure}>{item.time}</Text>
      </View>

      <TouchableOpacity
        style={styles.bookButton}
        onPress={() => openConfirmationModal(item)}
      >
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
        <Text style={styles.title}>Available Trips</Text>
      </View>

      {trips.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="sad-outline" size={48} color="#888" />
          <Text style={styles.emptyText}>No trips found</Text>
        </View>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTripCard}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      )}

      <Modal
        visible={showModal}
        transparent
        animationType="none"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalBox, { opacity: fadeAnim }]}>
            <Text style={styles.modalTitle}>Confirm Your Details</Text>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Booking Info</Text>
              {renderRow('Route', `${selectedTrip?.from_location} → ${selectedTrip?.to_location}`)}
              {renderRow('Departure', `${selectedTrip?.date} at ${selectedTrip?.time}`)}
              {renderRow('Type', packageDetails.shipmentType)}
              {renderRow('Weight', `${packageDetails.weight} kg`)}
              {renderRow('Size', packageDetails.dimensions)}
              {renderRow('Packages', packageDetails.noOfPackages)}
              {renderRow('Receiver', packageDetails.receiverName)}
              {renderRow('Phone', packageDetails.receiverNumber)}
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Payment</Text>
              {renderRow('Amount', `NPR ${packageDetails.amount}`, true)}
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
                disabled={loadingId === selectedTrip?.id}
              >
                {loadingId === selectedTrip?.id ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Send Request</Text>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );

  function renderRow(label, value, highlight = false) {
    return (
      <View style={styles.compactRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.valueLeft, highlight && { fontWeight: 'bold' }]}>{value}</Text>
      </View>
    );
  }
};

export default SearchResultsScreen;

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
  amountTag: { alignItems: 'flex-end' },
  priceLabel: { fontSize: 12, color: '#555' },
  priceValue: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  route: { fontSize: 15, fontWeight: '500', color: '#222', marginVertical: 8 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  capacity: { fontSize: 13, color: '#444', fontWeight: '500' },
  departure: { fontSize: 13, color: '#000', fontWeight: '600' },
  bookButton: { marginTop: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: BRAND_COLOR, padding: 10, borderRadius: 8, justifyContent: 'center' },
  bookText: { color: '#fff', fontWeight: '600' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyText: { fontSize: 16, color: '#999', marginTop: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { width: '90%', backgroundColor: '#fff', padding: 18, borderRadius: 14 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 14, color: '#111' },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#444', marginBottom: 8 },
  sectionCard: { backgroundColor: '#f9f9f9', borderRadius: 10, padding: 10, marginBottom: 14, borderColor: '#eee', borderWidth: 1 },
  compactRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  label: { fontSize: 13, color: '#666', width: 100 },
  valueLeft: { fontSize: 13, fontWeight: '500', color: '#222', flex: 1 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 },
  modalButton: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8, marginLeft: 10 },
  primaryButton: { backgroundColor: BRAND_COLOR },
  primaryButtonLarge: { backgroundColor: BRAND_COLOR, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  secondaryButton: { backgroundColor: '#eee' },
  primaryButtonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  secondaryButtonText: { color: '#333', fontWeight: '500' },
});