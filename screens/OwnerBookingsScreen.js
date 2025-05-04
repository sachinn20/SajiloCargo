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
      const res = await axios.get('/received-bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      // Sort latest first
      const sortedData = res.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setBookings(sortedData);
      applyFilter(sortedData, filter);
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

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#f59e0b';
      case 'accepted': return '#10b981';
      case 'rejected': return '#ef4444';
      default: return BRAND_COLOR;
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      
      // onPress={() => setSelectedBooking(item)}
      activeOpacity={0.7}
    >
      {/* Vehicle Name at Top */}
      <View style={styles.vehicleHeader}>
        <Ionicons name="car" size={18} color={BRAND_COLOR} />
        <Text style={styles.vehicleHeaderText}>{item.trip.vehicle_name}</Text>
        <View style={[
          styles.statusBadge, 
          {backgroundColor: getStatusColor(item.status) + '20', borderColor: getStatusColor(item.status)}
        ]}>
          <Text style={[styles.statusBadgeText, {color: getStatusColor(item.status)}]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>
      
      <View style={styles.divider} />
      
      {/* Route with Improved Arrow */}
      <View style={styles.routeContainer}>
        <View style={styles.locationBlock}>
          <Text style={styles.locationLabel}>From</Text>
          <Text style={styles.locationText}>{item.trip.from_location}</Text>
        </View>
        
        <View style={styles.arrowContainer}>
          <Ionicons name="arrow-forward" size={20} color={BRAND_COLOR} />
        </View>
        
        <View style={styles.locationBlock}>
          <Text style={styles.locationLabel}>To</Text>
          <Text style={styles.locationText}>{item.trip.to_location}</Text>
        </View>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="card-outline" size={16} color="#666" style={styles.infoIcon} />
            <Text style={styles.infoText}>{item.trip.vehicle_plate}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="cash-outline" size={16} color="#666" style={styles.infoIcon} />
            <Text style={styles.infoText}>NPR {item.amount}</Text>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="person-outline" size={16} color="#666" style={styles.infoIcon} />
            <Text style={styles.infoText}>{item.user.name}</Text>
          </View>
          <TouchableOpacity 
            style={styles.viewDetailsButton}
            onPress={() => setSelectedBooking(item)} // <-- add this line
            activeOpacity={0.7}
          >
            <Text style={styles.viewDetailsText}>View Details</Text>
            <Ionicons name="chevron-forward" size={16} color={BRAND_COLOR} />
          </TouchableOpacity>

        </View>
      </View>
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
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Booking Details</Text>
            <TouchableOpacity 
              style={styles.closeIconButton} 
              onPress={() => setSelectedBooking(null)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.routeSection}>
              <View style={styles.routeVisual}>
                <View style={styles.routeDot} />
                <View style={styles.routeDashedLine} />
                <View style={[styles.routeDot, { backgroundColor: '#ef4444' }]} />
              </View>
              <View style={styles.routeDetails}>
                <View style={styles.routePoint}>
                  <Text style={styles.routePointLabel}>From</Text>
                  <Text style={styles.routePointValue}>{selectedBooking?.trip.from_location}</Text>
                </View>
                <View style={styles.routePoint}>
                  <Text style={styles.routePointLabel}>To</Text>
                  <Text style={styles.routePointValue}>{selectedBooking?.trip.to_location}</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Vehicle Information</Text>
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Ionicons name="car" size={18} color={BRAND_COLOR} style={styles.detailIcon} />
                  <View>
                    <Text style={styles.detailLabel}>Vehicle</Text>
                    <Text style={styles.detailValue}>{selectedBooking?.trip.vehicle_name}</Text>
                  </View>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="card" size={18} color={BRAND_COLOR} style={styles.detailIcon} />
                  <View>
                    <Text style={styles.detailLabel}>Plate Number</Text>
                    <Text style={styles.detailValue}>{selectedBooking?.trip.vehicle_plate}</Text>
                  </View>
                </View>
              </View>
            </View>
            
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Shipment Details</Text>
              <View style={styles.detailGrid}>
                <View style={styles.gridItem}>
                  <Ionicons name="cube-outline" size={18} color={BRAND_COLOR} style={styles.detailIcon} />
                  <View>
                    <Text style={styles.detailLabel}>Type</Text>
                    <Text style={styles.detailValue}>{selectedBooking?.shipment_type}</Text>
                  </View>
                </View>
                <View style={styles.gridItem}>
                  <Ionicons name="scale-outline" size={18} color={BRAND_COLOR} style={styles.detailIcon} />
                  <View>
                    <Text style={styles.detailLabel}>Weight</Text>
                    <Text style={styles.detailValue}>{selectedBooking?.weight} kg</Text>
                  </View>
                </View>
                <View style={styles.gridItem}>
                  <Ionicons name="resize-outline" size={18} color={BRAND_COLOR} style={styles.detailIcon} />
                  <View>
                    <Text style={styles.detailLabel}>Dimensions</Text>
                    <Text style={styles.detailValue}>{selectedBooking?.dimension}</Text>
                  </View>
                </View>
                <View style={styles.gridItem}>
                  <Ionicons name="albums-outline" size={18} color={BRAND_COLOR} style={styles.detailIcon} />
                  <View>
                    <Text style={styles.detailLabel}>Packages</Text>
                    <Text style={styles.detailValue}>{selectedBooking?.no_of_packages}</Text>
                  </View>
                </View>
              </View>
            </View>
            
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Contact Information</Text>
              <View style={styles.contactCard}>
                <View style={styles.contactHeader}>
                  <Ionicons name="person" size={18} color="#fff" />
                  <Text style={styles.contactTitle}>Sender</Text>
                </View>
                <View style={styles.contactBody}>
                  <Text style={styles.contactName}>{selectedBooking?.user.name}</Text>
                  <View style={styles.contactPhone}>
                    <Ionicons name="call-outline" size={14} color="#666" />
                    <Text style={styles.contactPhoneText}>{selectedBooking?.user.phone_number}</Text>
                  </View>
                </View>
              </View>
              
              <View style={[styles.contactCard, { marginTop: 12 }]}>
                <View style={[styles.contactHeader, { backgroundColor: '#ef4444' }]}>
                  <Ionicons name="person-add" size={18} color="#fff" />
                  <Text style={styles.contactTitle}>Receiver</Text>
                </View>
                <View style={styles.contactBody}>
                  <Text style={styles.contactName}>{selectedBooking?.receiver_name}</Text>
                  <View style={styles.contactPhone}>
                    <Ionicons name="call-outline" size={14} color="#666" />
                    <Text style={styles.contactPhoneText}>{selectedBooking?.receiver_number}</Text>
                  </View>
                </View>
              </View>
            </View>
            
            <View style={styles.detailSection}>
              <View style={styles.paymentRow}>
                <View>
                  <Text style={styles.paymentLabel}>Amount</Text>
                  <Text style={styles.paymentAmount}>NPR {selectedBooking?.amount}</Text>
                </View>
                <View style={[
                  styles.statusBadgeLarge, 
                  { 
                    backgroundColor: getStatusColor(selectedBooking?.status) + '20', 
                    borderColor: getStatusColor(selectedBooking?.status) 
                  }
                ]}>
                  <Text style={[
                    styles.statusBadgeTextLarge, 
                    { color: getStatusColor(selectedBooking?.status) }
                  ]}>
                    {selectedBooking?.status?.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>

            {selectedBooking?.status === 'pending' && (
              <View style={styles.actionSection}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.acceptButton]}
                  onPress={() => updateBookingStatus(selectedBooking.id, 'accepted')}
                  disabled={processingId === selectedBooking.id}
                >
                  {processingId === selectedBooking.id ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={18} color="#fff" style={styles.actionIcon} />
                      <Text style={styles.actionButtonText}>Accept Booking</Text>
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => updateBookingStatus(selectedBooking.id, 'rejected')}
                  disabled={processingId === selectedBooking.id}
                >
                  {processingId === selectedBooking.id ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="close-circle" size={18} color="#fff" style={styles.actionIcon} />
                      <Text style={styles.actionButtonText}>Reject Booking</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
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
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color='#333' />
        </TouchableOpacity>
        <Text style={styles.headerText}>Booking Requests</Text>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {['all', 'pending', 'accepted', 'rejected'].map((status) => (
            <Pressable
              key={status}
              style={[styles.filterBtn, filter === status && styles.filterBtnActive]}
              onPress={() => handleFilterChange(status)}
            >
              {status === 'pending' && (
                <Ionicons name="time-outline" size={16} color={filter === status ? "#fff" : "#666"} style={styles.filterIcon} />
              )}
              {status === 'accepted' && (
                <Ionicons name="checkmark-circle-outline" size={16} color={filter === status ? "#fff" : "#666"} style={styles.filterIcon} />
              )}
              {status === 'rejected' && (
                <Ionicons name="close-circle-outline" size={16} color={filter === status ? "#fff" : "#666"} style={styles.filterIcon} />
              )}
              {status === 'all' && (
                <Ionicons name="list-outline" size={16} color={filter === status ? "#fff" : "#666"} style={styles.filterIcon} />
              )}
              <Text style={[styles.filterText, filter === status && styles.filterTextActive]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLOR} />
          <Text style={styles.loadingText}>Loading bookings...</Text>
        </View>
      ) : filteredBookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>No bookings found</Text>
          <Text style={styles.emptySubtext}>
            {filter !== 'all' 
              ? `You don't have any ${filter} bookings` 
              : 'You have not received any booking requests yet'}
          </Text>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={onRefresh}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh" size={16} color="#fff" style={styles.refreshIcon} />
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={[BRAND_COLOR]} 
              tintColor={BRAND_COLOR}
            />
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      {renderDetailModal()}
    </SafeAreaView>
  );
};

export default OwnerBookingsScreen;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa'
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', // center items horizontally
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff', // changed from BRAND_COLOR
    position: 'relative' // to allow absolute back button
  },
  
  backBtn: { 
    position: 'absolute',
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center'
  },
  
  headerText: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#333' // changed from white to dark text
  },
  
  
  filterContainer: {
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  filterRow: { 
    paddingHorizontal: 16,
    paddingBottom: 4
  },
  filterBtn: { 
    paddingVertical: 8, 
    paddingHorizontal: 16, 
    borderRadius: 20, 
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center'
  },
  filterBtnActive: { 
    backgroundColor: BRAND_COLOR 
  },
  filterIcon: {
    marginRight: 6
  },
  filterText: { 
    fontSize: 13, 
    color: '#555',
    fontWeight: '500'
  },
  filterTextActive: { 
    color: '#fff', 
    fontWeight: 'bold' 
  },
  
  listContainer: {
    padding: 16,
    paddingBottom: 50
  },
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden'
  },
  
  // New vehicle header styles
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  vehicleHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginLeft: 8
  },
  
  // Improved route container
  routeContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  locationBlock: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4
  },
  locationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  arrowContainer: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  divider: {
    height: 1,
    backgroundColor: '#eee'
  },
  cardBody: {
    padding: 16
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  infoIcon: {
    marginRight: 6
  },
  infoText: {
    fontSize: 13,
    color: '#555'
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16
  },
  viewDetailsText: {
    fontSize: 12,
    color: BRAND_COLOR,
    fontWeight: '600',
    marginRight: 4
  },
  
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: 'bold'
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  emptyText: { 
    fontSize: 18, 
    fontWeight: 'bold',
    color: '#555',
    marginTop: 16
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BRAND_COLOR,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20
  },
  refreshIcon: {
    marginRight: 6
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14
  },
  
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'flex-end', 
    alignItems: 'center' 
  },
  modalBox: { 
    width: '100%', 
    backgroundColor: '#fff', 
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20, 
    paddingBottom: 30,
    maxHeight: '90%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  modalTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#333' 
  },
  closeIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center'
  },
  
  routeSection: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#f9f9f9'
  },
  routeVisual: {
    width: 24,
    alignItems: 'center',
    marginRight: 16
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: BRAND_COLOR
  },
  routeDashedLine: {
    width: 2,
    height: 40,
    backgroundColor: '#ddd',
    marginVertical: 4
  },
  routeDetails: {
    flex: 1
  },
  routePoint: {
    marginBottom: 16
  },
  routePointLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2
  },
  routePointValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  
  detailSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1
  },
  detailIcon: {
    marginRight: 8,
    marginTop: 2
  },
  detailLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500'
  },
  
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8
  },
  gridItem: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
    flexDirection: 'row'
  },
  
  contactCard: {
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee'
  },
  contactHeader: {
    backgroundColor: BRAND_COLOR,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center'
  },
  contactTitle: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8
  },
  contactBody: {
    padding: 12
  },
  contactName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4
  },
  contactPhone: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  contactPhoneText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4
  },
  
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  paymentLabel: {
    fontSize: 14,
    color: '#666'
  },
  paymentAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  statusBadgeLarge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  statusBadgeTextLarge: {
    fontSize: 12,
    fontWeight: 'bold'
  },
  
  actionSection: {
    padding: 16
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12
  },
  acceptButton: {
    backgroundColor: '#10b981'
  },
  rejectButton: {
    backgroundColor: '#ef4444'
  },
  actionIcon: {
    marginRight: 8
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  }
});