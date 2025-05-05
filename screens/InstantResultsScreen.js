import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, ActivityIndicator, Modal, Animated, Image,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from '../utils/axiosInstance';
import * as Clipboard from 'expo-clipboard';
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `/available-vehicles?lat=${coords.latitude}&lng=${coords.longitude}&weight=${bookingDetails.weight}`
      );
      setVehicles(res.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not fetch vehicles.');
    } finally {
      setIsLoading(false);
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
      <View style={styles.cardHeader}>
        <View style={styles.vehicleIconContainer}>
          {getVehicleIcon(item.type)}
        </View>
        <View style={styles.vehicleInfo}>
          <Text style={styles.vehicleName}>{item.type}</Text>
          <Text style={styles.vehiclePlate}>{item.plate}</Text>
        </View>
        <View style={styles.distanceContainer}>
          <Ionicons name="location" size={16} color={BRAND_COLOR} />
          <Text style={styles.distanceText}>{item.distance.toFixed(1)} km</Text>
        </View>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="weight" size={18} color="#666" />
          <Text style={styles.detailText}>Capacity: {item.capacity} kg</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={18} color="#666" />
          <Text style={styles.detailText}>Est. arrival: {getEstimatedArrival(item.distance)} min</Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.bookButton} 
        onPress={() => openConfirmationModal(item)}
        activeOpacity={0.8}
      >
        <Ionicons name="flash" size={18} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.bookText}>Book Instantly</Text>
      </TouchableOpacity>
    </View>
  );

  // Helper function to get estimated arrival time based on distance
  const getEstimatedArrival = (distance) => {
    // Assuming average speed of 30 km/h in city traffic
    const estimatedMinutes = Math.ceil((distance / 30) * 60);
    return estimatedMinutes;
  };

  // Helper function to get appropriate vehicle icon
  const getVehicleIcon = (type) => {
    const lowerType = type.toLowerCase();
    
    if (lowerType.includes('truck')) {
      return <MaterialCommunityIcons name="truck" size={24} color="#fff" />;
    } else if (lowerType.includes('bike') || lowerType.includes('motorcycle')) {
      return <MaterialCommunityIcons name="motorbike" size={24} color="#fff" />;
    } else if (lowerType.includes('van')) {
      return <MaterialCommunityIcons name="van-utility" size={24} color="#fff" />;
    } else {
      return <MaterialCommunityIcons name="car" size={24} color="#fff" />;
    }
  };

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
        <Text style={styles.title}>Nearby Vehicles</Text>
      </View>

      <View style={styles.summaryContainer}>
        <View style={styles.routeContainer}>
          <View style={styles.routeIconContainer}>
            <View style={styles.originDot} />
            <View style={styles.routeLine} />
            <View style={styles.destinationDot} />
          </View>
          
          <View style={styles.routeDetails}>
            <View style={styles.locationContainer}>
              <Text style={styles.locationLabel}>From</Text>
              <Text style={styles.locationText} numberOfLines={1}>{bookingDetails.pickup}</Text>
            </View>
            
            <View style={styles.locationContainer}>
              <Text style={styles.locationLabel}>To</Text>
              <Text style={styles.locationText} numberOfLines={1}>{bookingDetails.dropoff}</Text>
            </View>
          </View>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLOR} />
          <Text style={styles.loadingText}>Finding nearby vehicles...</Text>
        </View>
      ) : (
        <>
          {vehicles.length > 0 ? (
            <>
              <Text style={styles.resultsCount}>
                Found {vehicles.length} {vehicles.length === 1 ? 'vehicle' : 'vehicles'} near you
              </Text>
              <FlatList
                data={vehicles}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderVehicleCard}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
              />
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <Image 
                source={require('../assets/icon.png')} 
                style={styles.emptyImage} 
                resizeMode="contain"
              />
              <Text style={styles.emptyTitle}>No Vehicles Found</Text>
              <Text style={styles.emptyText}>
                We couldn't find any vehicles near your location. Please try again later or modify your search.
              </Text>
              <TouchableOpacity 
                style={styles.emptyButton}
                onPress={() => navigation.goBack()}
                activeOpacity={0.8}
              >
                <Text style={styles.emptyButtonText}>Go Back</Text>
              </TouchableOpacity>
            </View>
          )}
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
                <Ionicons name="car-outline" size={18} color={BRAND_COLOR} style={styles.sectionIcon} />
                <Text style={styles.sectionTitle}>Vehicle Details</Text>
              </View>
              {renderRow('Type', selectedVehicle?.type)}
              {renderRow('Plate Number', selectedVehicle?.plate)}
              {renderRow('Distance', `${selectedVehicle?.distance.toFixed(1)} km away`)}
              {renderRow('Capacity', `${selectedVehicle?.capacity} kg`)}
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="map-outline" size={18} color={BRAND_COLOR} style={styles.sectionIcon} />
                <Text style={styles.sectionTitle}>Trip Details</Text>
              </View>
              {renderRow('From', bookingDetails.pickup)}
              {renderRow('To', bookingDetails.dropoff)}
              {renderRow('Package Weight', `${bookingDetails.weight} kg`)}
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="person-outline" size={18} color={BRAND_COLOR} style={styles.sectionIcon} />
                <Text style={styles.sectionTitle}>Receiver Information</Text>
              </View>
              {renderRow('Name', bookingDetails.receiverName)}
              {renderRow('Phone', bookingDetails.receiverNumber)}
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
                disabled={loadingId === selectedVehicle?.id}
                activeOpacity={0.8}
              >
                {loadingId === selectedVehicle?.id ? (
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

      {/* Booking request Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark" size={40} color="#fff" />
            </View>
            <Text style={styles.successText}>Booking Request Sent!</Text>
            <Text style={styles.successSubText}>
              Your request has been sent successfully. We're waiting for the driver to respond shortly.
            </Text>

            <View style={styles.trackingContainer}>
              <Text style={styles.trackingLabel}>Tracking Number</Text>
              <View style={styles.copyRow}>
                <Text style={styles.trackingNumber}>
                  {bookingInfo?.tracking_number || bookingInfo?.tracking_no || 'Unavailable'}
                </Text>
                {bookingInfo?.tracking_number || bookingInfo?.tracking_no ? (
                  <TouchableOpacity
                    onPress={async () => {
                      const number = bookingInfo?.tracking_number || bookingInfo?.tracking_no;
                      await Clipboard.setStringAsync(number);
                      Alert.alert('Copied', 'Tracking number copied to clipboard');
                    }}
                    style={{ marginLeft: 8 }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="copy-outline" size={18} color={BRAND_COLOR} />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>


            <View style={styles.successDetailsBox}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="information-circle-outline" size={18} color={BRAND_COLOR} style={styles.sectionIcon} />
                <Text style={styles.sectionTitle}>Booking Summary</Text>
              </View>
              {renderRow('From', bookingInfo?.pickup || bookingDetails.pickup)}
              {renderRow('To', bookingInfo?.dropoff || bookingDetails.dropoff)}
              {renderRow('Weight', `${bookingInfo?.weight || bookingDetails.weight} kg`)}
              {renderRow('Receiver', bookingInfo?.receiver_name || bookingDetails.receiverName)}
              {renderRow('Phone', bookingInfo?.receiver_number || bookingDetails.receiverNumber)}
              {renderRow('Vehicle', `${selectedVehicle?.type} (${selectedVehicle?.plate})`)}
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

  function renderRow(label, value) {
    return (
      <View style={styles.compactRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.valueText}>{value}</Text>
      </View>
    );
  }
};

export default InstantResultsScreen;

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
  copyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  summaryContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  routeContainer: {
    flexDirection: 'row',
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
    alignItems: 'center',
    padding: 16,
  },
  vehicleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: BRAND_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  vehiclePlate: {
    fontSize: 13,
    color: '#666'
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  distanceText: {
    fontSize: 14,
    fontWeight: '600',
    color: BRAND_COLOR,
    marginLeft: 4
  },
  divider: {
    height: 1,
    backgroundColor: '#eaeaea',
    marginHorizontal: 16
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BRAND_COLOR,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginBottom: 16,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16
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
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
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
  successModal: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    width: '90%',
    maxHeight: '90%'
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
  successText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  successSubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20
  },
  trackingContainer: {
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#d0e8ff',
    alignItems: 'center',
    width: '100%'
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
  },
  successDetailsBox: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    width: '100%',
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eaeaea',
  },
});