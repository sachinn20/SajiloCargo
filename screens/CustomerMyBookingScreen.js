import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Modal, Pressable, ScrollView, Alert,
  Animated, Easing
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from '../utils/axiosInstance';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { BRAND_COLOR } from '../screens/config';

const FILTERS = ['All', 'Pending', 'Accepted', 'Rejected'];

const CustomerMyBookingScreen = ({ navigation }) => {
  const [bookings, setBookings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const swipeableRefs = useRef({});

  const fetchBookings = async () => {
    const token = await AsyncStorage.getItem('authToken');
    try {
      const res = await axios.get('/my-bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(res.data.data);
    } catch (err) {
      Alert.alert('Error', 'Could not load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    applyFilter(activeFilter, bookings);
  }, [bookings, activeFilter]);

  useFocusEffect(
    useCallback(() => {
      Object.values(swipeableRefs.current).forEach(ref => {
        if (ref && typeof ref.close === 'function') ref.close();
      });
      fetchBookings();
    }, [])
  );

  const applyFilter = (status, source = bookings) => {
    if (status === 'All') setFiltered(source);
    else setFiltered(source.filter(b => b.status === status.toLowerCase()));
  };

  const handleCancel = async (bookingId) => {
    Alert.alert('Cancel Booking?', 'Are you sure?', [
      { text: 'No' },
      {
        text: 'Yes', onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('authToken');
            await axios.delete(`/bookings/${bookingId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            fetchBookings();
            setShowDetailModal(false);
            Alert.alert('Success', 'Booking cancelled');
          } catch {
            Alert.alert('Error', 'Failed to cancel');
          }
        }
      }
    ]);
  };

  const handleCopyTracking = (trackingNo) => {
    Clipboard.setStringAsync(trackingNo);
    Alert.alert('Copied', 'Tracking number copied to clipboard!');
  };
  

  const animateModal = () => {
    scaleAnim.setValue(0);
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
      easing: Easing.out(Easing.exp),
    }).start();
  };

  const openDetailModal = (booking) => {
    setSelectedBooking(booking);
    setShowDetailModal(true);
    animateModal();
  };

  const renderRightActions = (item) => {
    if (item.status !== 'pending') return null;
    return (
      <View style={styles.swipeActions}>
        <TouchableOpacity
          style={[styles.swipeBtn, { backgroundColor: '#ffa500' }]}
          onPress={() => navigation.navigate('EditBooking', { booking: item })}
        >
          <Icon name="create-outline" size={20} color="#fff" />
          <Text style={styles.swipeText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.swipeBtn, { backgroundColor: '#ff3b30' }]}
          onPress={() => handleCancel(item.id)}
        >
          <Icon name="trash-outline" size={20} color="#fff" />
          <Text style={styles.swipeText}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending': return '#f59e0b';
      case 'accepted': return '#10b981';
      case 'rejected': return '#ef4444';
      case 'cancelled': return '#6b7280';
      default: return BRAND_COLOR;
    }
  };

  const renderDetailRow = (label, value) => (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || '-'}</Text>
    </View>
  );

  const BookingModal = () => (
    <Modal visible={showDetailModal} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <Animated.View style={[styles.animatedBox, { transform: [{ scale: scaleAnim }] }]}>
          <ScrollView 
            style={styles.detailScrollBox}
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Booking Details</Text>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <Icon name="close-circle" size={24} color="#666" />
              </TouchableOpacity>
            </View>
  
            <View style={styles.section}>
              <View style={styles.trackingContainer}>
                <View style={styles.trackingBadge}>
                  <Icon name="barcode-outline" size={18} color="#fff" />
                </View>
                <View>
                  <Text style={styles.trackingLabel}>Tracking Number</Text>
                  <TouchableOpacity 
                    onPress={() => handleCopyTracking(selectedBooking?.tracking_no)} 
                    style={styles.trackingCopyContainer}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.trackingNumber}>{selectedBooking?.tracking_no}</Text>
                    <Icon name="copy-outline" size={18} color="#666" style={{ marginLeft: 8 }} />
                  </TouchableOpacity>

                </View>
              </View>
  
              <View style={styles.statusBadge}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(selectedBooking?.status) }]} />
                <Text style={[styles.statusText, { color: getStatusColor(selectedBooking?.status) }]}>
                  {selectedBooking?.status?.toUpperCase()}
                </Text>
              </View>
            </View>
  
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="map-outline" size={18} color={BRAND_COLOR} />
                <Text style={styles.sectionTitle}>Trip Information</Text>
              </View>
              <View style={styles.routeContainer}>
                <View style={styles.routePoint}>
                  <View style={styles.originDot} />
                  <Text style={styles.locationText}>{selectedBooking?.trip?.from_location}</Text>
                </View>
                <View style={styles.routeLine} />
                <View style={styles.routePoint}>
                  <View style={styles.destinationDot} />
                  <Text style={styles.locationText}>{selectedBooking?.trip?.to_location}</Text>
                </View>
              </View>
              <View style={styles.tripDetails}>
                <View style={styles.tripDetail}>
                  <Icon name="calendar-outline" size={16} color="#666" />
                  <Text style={styles.tripDetailText}>{selectedBooking?.trip?.date}</Text>
                </View>
                <View style={styles.tripDetail}>
                  <Icon name="time-outline" size={16} color="#666" />
                  <Text style={styles.tripDetailText}>{selectedBooking?.trip?.time}</Text>
                </View>
              </View>
            </View>
  
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="person-outline" size={18} color={BRAND_COLOR} />
                <Text style={styles.sectionTitle}>Receiver Information</Text>
              </View>
              <View style={styles.receiverCard}>
                <Text style={styles.receiverName}>{selectedBooking?.receiver_name}</Text>
                <View style={styles.receiverPhone}>
                  <Icon name="call-outline" size={16} color="#666" />
                  <Text style={styles.receiverPhoneText}>{selectedBooking?.receiver_number}</Text>
                </View>
              </View>
            </View>
  
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="cube-outline" size={18} color={BRAND_COLOR} />
                <Text style={styles.sectionTitle}>Package Information</Text>
              </View>
              <View style={styles.packageGrid}>
                <View style={styles.packageItem}>
                  <Text style={styles.packageLabel}>Type</Text>
                  <Text style={styles.packageValue}>{selectedBooking?.shipment_type}</Text>
                </View>
                <View style={styles.packageItem}>
                  <Text style={styles.packageLabel}>Weight</Text>
                  <Text style={styles.packageValue}>{selectedBooking?.weight} kg</Text>
                </View>
                <View style={styles.packageItem}>
                  <Text style={styles.packageLabel}>Packages</Text>
                  <Text style={styles.packageValue}>{selectedBooking?.no_of_packages}</Text>
                </View>
                <View style={styles.packageItem}>
                  <Text style={styles.packageLabel}>Amount</Text>
                  <Text style={styles.packageValue}>NPR {selectedBooking?.amount}</Text>
                </View>
              </View>
  
              {selectedBooking?.notes && (
                <View style={styles.notesContainer}>
                  <Text style={styles.notesLabel}>Notes:</Text>
                  <Text style={styles.notesText}>{selectedBooking?.notes}</Text>
                </View>
              )}
            </View>
          </ScrollView>
  
          {selectedBooking?.status === 'pending' && (
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => {
                  setShowDetailModal(false);
                  navigation.navigate('EditBooking', { booking: selectedBooking });
                }}
              >
                <Icon name="create-outline" size={18} color="#fff" />
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => handleCancel(selectedBooking.id)}
              >
                <Icon name="trash-outline" size={18} color="#fff" />
                <Text style={styles.actionButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
  

  const renderBookingCard = ({ item }) => {
    const statusColor = getStatusColor(item.status);
    
    return (
      <Swipeable
        ref={(ref) => {
          if (ref) swipeableRefs.current[item.id] = ref;
        }}
        renderRightActions={() => renderRightActions(item)}
      >
        <TouchableOpacity
          style={styles.card}
          onPress={() => openDetailModal(item)}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <View style={styles.routeBadge}>
              <Icon name="navigate-outline" size={14} color="#fff" />
            </View>
            <Text style={styles.title}>{item.trip?.from_location} ➔ {item.trip?.to_location}</Text>
          </View>
          
          <View style={styles.cardContent}>
            <View style={styles.cardInfo}>
              <View style={styles.infoItem}>
                <Icon name="barcode-outline" size={16} color="#666" />
                <Text style={styles.infoText}>{item.tracking_no}</Text>
              </View>
              <View style={styles.infoItem}>
                <Icon name="person-outline" size={16} color="#666" />
                <Text style={styles.infoText}>{item.receiver_name}</Text>
              </View>
            </View>
            
            <View style={styles.cardFooter}>
              <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
                <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                <Text style={[styles.statusText, { color: statusColor }]}>
                  {item.status?.toUpperCase()}
                </Text>
              </View>
              
              {item.is_paid ? (
                <View style={styles.paidBadge}>
                  <Icon name="checkmark-circle" size={14} color="#0f5132" />
                  <Text style={styles.paidText}>
                    {item.payment_mode === 'cash' ? 'COD' : 'Paid'}
                  </Text>
                </View>
              ) : (
                (item.status !== 'pending' && item.status !== 'rejected' && item.status !== 'cancelled') && (
                  <TouchableOpacity
                    style={styles.payNowButton}
                    onPress={() =>
                      navigation.navigate('PaymentOptions', { bookingId: item.id })
                    }
                  >
                    <Icon name="wallet-outline" size={14} color="#fff" />
                    <Text style={styles.payNowText}>Pay Now</Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterBtn, activeFilter === f && styles.filterActive]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[styles.filterText, activeFilter === f && styles.filterActiveText]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLOR} />
          <Text style={styles.loadingText}>Loading your bookings...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderBookingCard}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="calendar-outline" size={60} color="#ccc" />
              <Text style={styles.emptyText}>No bookings found</Text>
              <Text style={styles.emptySubtext}>
                {activeFilter !== 'All' 
                  ? `You don't have any ${activeFilter.toLowerCase()} bookings` 
                  : 'Start by creating a new booking'}
              </Text>
            </View>
          }
        />
      )}

      {showDetailModal && <BookingModal />}
    </SafeAreaView>
  );
};

export default CustomerMyBookingScreen;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa' 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 16, 
    paddingHorizontal: 16, 
    backgroundColor: '#fff', 
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: '700',
    color: '#222'
  },
  filterBar: { 
    backgroundColor: '#fff', 
    paddingVertical: 12, 
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterBtn: { 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    backgroundColor: '#f0f0f0', 
    borderRadius: 20, 
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  filterText: { 
    color: '#555', 
    fontSize: 14,
    fontWeight: '500',
  },
  filterActive: { 
    backgroundColor: `${BRAND_COLOR}15`,
    borderColor: BRAND_COLOR,
  },
  filterActiveText: {
    color: BRAND_COLOR,
    fontWeight: '600',
  },
  listContainer: { 
    padding: 16,
    paddingBottom: 24,
  },
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    marginBottom: 16, 
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  routeBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: BRAND_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  title: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#222',
    flex: 1,
  },
  cardContent: {
    padding: 16,
  },
  cardInfo: {
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#444',
    marginLeft: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  swipeActions: { 
    flexDirection: 'row', 
    height: '100%',
    alignItems: 'center',
  },
  swipeBtn: { 
    justifyContent: 'center', 
    alignItems: 'center', 
    width: 80,
    height: '90%',
    borderRadius: 12, 
    marginHorizontal: 4 
  },
  swipeText: { 
    color: '#fff', 
    fontWeight: '600', 
    fontSize: 12, 
    marginTop: 4 
  },
  modalOverlay: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0,0,0,0.6)' 
  },
  trackingCopyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  }
,  
  detailBox: { 
    width: '90%', 
    maxHeight: '85%', 
    backgroundColor: '#fff', 
    borderRadius: 20, 
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#222' 
  },
  section: { 
    marginBottom: 20,
    padding: 20,
    paddingTop: 0,
  },
  trackingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  trackingBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BRAND_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  trackingLabel: {
    fontSize: 12,
    color: '#666',
  },
  trackingNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#222',
    marginLeft: 8,
  },
  routeContainer: {
    marginBottom: 16,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  originDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4caf50',
    marginRight: 12,
  },
  destinationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#f44336',
    marginRight: 12,
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: '#ddd',
    marginLeft: 5,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  tripDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 12,
  },
  tripDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tripDetailText: {
    marginLeft: 6,
    color: '#555',
    fontSize: 14,
  },
  receiverCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
  },
  receiverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  receiverPhone: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  receiverPhoneText: {
    marginLeft: 8,
    color: '#555',
    fontSize: 14,
  },
  packageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  packageItem: {
    width: '50%',
    padding: 8,
  },
  packageLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  packageValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  notesContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 12,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
  },
  modalActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: 16,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#ffa500',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#ff3b30',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginLeft: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
  },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 12 
  },
  label: { 
    color: '#555', 
    fontWeight: '500' 
  },
  value: { 
    fontWeight: '600', 
    color: '#111', 
    maxWidth: '60%', 
    textAlign: 'right' 
  },
  payNowButton: { 
    backgroundColor: BRAND_COLOR, 
    paddingVertical: 6, 
    paddingHorizontal: 12, 
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  payNowText: { 
    color: '#fff', 
    fontSize: 12, 
    fontWeight: 'bold',
    marginLeft: 4,
  },
  paidBadge: { 
    backgroundColor: '#d1e7dd', 
    paddingVertical: 6, 
    paddingHorizontal: 12, 
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  paidText: { 
    color: '#0f5132', 
    fontSize: 12, 
    fontWeight: 'bold',
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
  },
  animatedBox: {
    width: '90%',
    maxHeight: '85%',
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  detailScrollBox: {
    flexGrow: 1,
  },
  
});