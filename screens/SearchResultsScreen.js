// ✅ FULL POLISHED SearchResultsScreen with Detailed Success Modal

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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from '../utils/axiosInstance';
import * as Clipboard from 'expo-clipboard';
import { BRAND_COLOR } from './config';

const SearchResultsScreen = ({ route, navigation }) => {
  const { trips, packageDetails } = route.params;
  const [loadingId, setLoadingId] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookingInfo, setBookingInfo] = useState(null);
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
      const res = await axios.post('/bookings', {
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

      setBookingInfo(res.data.booking);
      setShowModal(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error(error.response?.data || error.message);
      Alert.alert('Error', 'Failed to send booking request.');
    } finally {
      setLoadingId(null);
    }
  };

  const renderTripCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.vehicleRow}>
          <View style={styles.vehicleIconContainer}>
            <MaterialCommunityIcons
              name="truck-outline"
              size={20}
              color="#fff"
            />
          </View>
          <View>
            <Text style={styles.vehicleName}>
              {item.vehicle_name}
            </Text>
            <Text style={styles.vehiclePlate}>
              {item.vehicle_plate}
            </Text>
          </View>
        </View>
        <View style={styles.amountTag}>
          <Text style={styles.priceLabel}>Price</Text>
          <Text style={styles.priceValue}>NPR {packageDetails.amount}</Text>
        </View>
      </View>

      <View style={styles.routeContainer}>
        <View style={styles.routeIconContainer}>
          <View style={styles.originDot} />
          <View style={styles.routeLine} />
          <View style={styles.destinationDot} />
        </View>
        
        <View style={styles.routeDetails}>
          <View style={styles.locationContainer}>
            <Text style={styles.locationLabel}>From</Text>
            <Text style={styles.locationText} numberOfLines={1}>{item.from_location}</Text>
          </View>
          
          <View style={styles.locationContainer}>
            <Text style={styles.locationLabel}>To</Text>
            <Text style={styles.locationText} numberOfLines={1}>{item.to_location}</Text>
          </View>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.infoText}>{item.date}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.infoText}>{item.time}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <MaterialCommunityIcons name="weight" size={16} color="#666" />
          <Text style={styles.infoText}>{item.available_capacity} Kgs</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.bookButton}
        onPress={() => openConfirmationModal(item)}
        activeOpacity={0.8}
      >
        <Ionicons name="send" size={18} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.bookText}>Book Now</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={BRAND_COLOR} />
        </TouchableOpacity>
        <Text style={styles.title}>Available Trips</Text>
      </View>

      {trips.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Image 
            source={require('../assets/icon.png')} 
            style={styles.emptyImage} 
            resizeMode="contain"
          />
          <Text style={styles.emptyTitle}>No Trips Found</Text>
          <Text style={styles.emptyText}>
            We couldn't find any trips matching your search criteria. Please try different locations or dates.
          </Text>
          <TouchableOpacity 
            style={styles.emptyButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.emptyButtonText}>Modify Search</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={styles.resultsCount}>
            Found {trips.length} {trips.length === 1 ? 'trip' : 'trips'} matching your criteria
          </Text>
          <FlatList
            data={trips}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderTripCard}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}

      {/* Booking Confirmation Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="none"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalBox, { opacity: fadeAnim }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirm Your Booking</Text>
              <TouchableOpacity 
                onPress={() => setShowModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="map-outline" size={18} color={BRAND_COLOR} style={styles.sectionIcon} />
                <Text style={styles.sectionTitle}>Trip Details</Text>
              </View>
              {renderRow('Route', `${selectedTrip?.from_location} → ${selectedTrip?.to_location}`)}
              {renderRow('Departure Date', selectedTrip?.date)}
              {renderRow('Departure Time', selectedTrip?.time)}
              {renderRow('Vehicle', `${selectedTrip?.vehicle_name} (${selectedTrip?.vehicle_plate})`)}
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="cube-outline" size={18} color={BRAND_COLOR} style={styles.sectionIcon} />
                <Text style={styles.sectionTitle}>Package Details</Text>
              </View>
              {renderRow('Shipment Type', packageDetails.shipmentType)}
              {renderRow('Weight', `${packageDetails.weight} kg`)}
              {renderRow('Dimensions', packageDetails.dimensions)}
              {renderRow('Packages Count', packageDetails.noOfPackages)}
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="person-outline" size={18} color={BRAND_COLOR} style={styles.sectionIcon} />
                <Text style={styles.sectionTitle}>Receiver Information</Text>
              </View>
              {renderRow('Name', packageDetails.receiverName)}
              {renderRow('Phone', packageDetails.receiverNumber)}
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="cash-outline" size={18} color={BRAND_COLOR} style={styles.sectionIcon} />
                <Text style={styles.sectionTitle}>Payment</Text>
              </View>
              {renderRow('Amount', `NPR ${packageDetails.amount}`, true)}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.secondaryButton]}
                onPress={() => setShowModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.primaryButtonLarge]}
                onPress={handleSendRequest}
                disabled={loadingId === selectedTrip?.id}
                activeOpacity={0.8}
              >
                {loadingId === selectedTrip?.id ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Text style={styles.primaryButtonText}>Send Request</Text>
                    <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 8 }} />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Detailed Success Confirmation Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
          <View style={styles.successIconWrapper}>
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark" size={40} color="#fff" />
            </View>
          </View>

            <Text style={styles.modalTitle}>Booking Request Sent!</Text>
            <Text style={styles.modalSubtitle}>
              Your request has been sent. We're waiting for the driver to respond shortly.
            </Text>
            
            <View style={styles.trackingContainer}>
              <Text style={styles.trackingLabel}>Tracking Number</Text>
              <TouchableOpacity
                onPress={async () => {
                  if (bookingInfo?.tracking_no) {
                    await Clipboard.setStringAsync(bookingInfo.tracking_no);
                    Alert.alert('Copied', 'Tracking number copied to clipboard');
                  }
                }}
                activeOpacity={0.8}
                style={styles.copyRow}
              >
                <Text style={styles.trackingNumber}>
                  {bookingInfo?.tracking_no || 'Unavailable'}
                </Text>
                <Ionicons name="copy-outline" size={18} color={BRAND_COLOR} style={{ marginLeft: 8 }} />
              </TouchableOpacity>

            </View>

            
            <View style={styles.sectionCard}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="information-circle-outline" size={18} color={BRAND_COLOR} style={styles.sectionIcon} />
                <Text style={styles.sectionTitle}>Booking Summary</Text>
              </View>
              {renderRow('Route', `${selectedTrip?.from_location} → ${selectedTrip?.to_location}`)}
              {renderRow('Receiver', packageDetails.receiverName)}
              {renderRow('Contact', packageDetails.receiverNumber)}
              {renderRow('Shipment Type', packageDetails.shipmentType)}
              {renderRow('Weight', `${packageDetails.weight} kg`)}
              {renderRow('Dimensions', packageDetails.dimensions)}
              {renderRow('Packages', packageDetails.noOfPackages)}
              {renderRow('Requested At', new Date().toLocaleString())}
            </View>
            
            <TouchableOpacity
              style={styles.primaryButtonLarge}
              onPress={() => {
                setShowSuccessModal(false);
                navigation.navigate('Dashboard');
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Go to Home</Text>
              <Ionicons name="home" size={18} color="#fff" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );

  function renderRow(label, value, highlight = false) {
    return (
      <View style={styles.compactRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.valueText, highlight && styles.highlightedValue]}>{value}</Text>
      </View>
    );
  }
};

export default SearchResultsScreen;

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
    fontSize: 20, 
    fontWeight: 'bold',
    color: '#333'
  },
  successIconWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  copyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },  
  resultsCount: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#eaeaea',
    overflow: 'hidden'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#f9f9f9'
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  vehicleIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BRAND_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2
  },
  vehiclePlate: {
    fontSize: 12,
    color: '#666'
  },
  amountTag: {
    alignItems: 'flex-end'
  },
  priceLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2
  },
  priceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BRAND_COLOR
  },
  routeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  routeIconContainer: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
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
    height: 30,
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
  routeDetails: {
    flex: 1,
  },
  locationContainer: {
    marginBottom: 12
  },
  locationLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2
  },
  locationText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333'
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BRAND_COLOR,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 8,
    shadowColor: BRAND_COLOR,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2
  },
  bookText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40
  },
  emptyImage: {
    width: 100,
    height: 100,
    marginBottom: 20,
    opacity: 0.6
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20
  },
  emptyButton: {
    backgroundColor: BRAND_COLOR,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '600'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalBox: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    maxHeight: '90%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center'
  },
  
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center'
  },
  sectionCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eaeaea'
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  sectionIcon: {
    marginRight: 8
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  compactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  label: {
    fontSize: 14,
    color: '#666'
  },
  valueText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'right',
    flex: 1,
    marginLeft: 8
  },
  highlightedValue: {
    fontWeight: 'bold',
    color: BRAND_COLOR,
    fontSize: 16
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  primaryButtonLarge: {
    backgroundColor: BRAND_COLOR,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: BRAND_COLOR,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    marginTop: 8
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0'
  },
  secondaryButtonText: {
    color: '#666',
    fontWeight: '500'
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4
  },
  trackingContainer: {
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#d0e8ff',
    alignItems: 'center'
  },
  trackingLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4
  },
  trackingNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BRAND_COLOR,
    letterSpacing: 1
  }
});