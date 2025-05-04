// === TripManagementScreen.js ===
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Alert,
  StyleSheet, ActivityIndicator, TextInput, ScrollView,
  Modal, Dimensions, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
// import DateTimePicker from '@react-native-community/datetimepicker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

import axios from '../utils/axiosInstance';
import { BRAND_COLOR } from './config';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

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

const STATUS_ICONS = {
  pending: 'time-outline',
  scheduled: 'calendar-outline',
  loading: 'arrow-up-circle-outline',
  en_route: 'navigate-outline',
  delayed: 'alert-circle-outline',
  arrived: 'location-outline',
  unloading: 'arrow-down-circle-outline',
  completed: 'checkmark-circle-outline',
  cancelled: 'close-circle-outline'
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
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);

  const showDatePickerModal = () => setDatePickerVisibility(true);
  const hideDatePickerModal = () => setDatePickerVisibility(false);
  const handleDateConfirm = (selectedDate) => {
    setEditFields({ ...editFields, date: selectedDate.toISOString().split('T')[0] });
    hideDatePickerModal();
  };

  const showTimePickerModal = () => setTimePickerVisibility(true);
  const hideTimePickerModal = () => setTimePickerVisibility(false);
  const handleTimeConfirm = (selectedTime) => {
    const timeStr = selectedTime.toLocaleTimeString([], {
      hour: '2-digit', minute: '2-digit', hour12: false
    });
    setEditFields({ ...editFields, time: timeStr });
    hideTimePickerModal();
  };


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

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="map-marker-path" size={60} color="#ddd" />
      <Text style={styles.emptyTitle}>No Trips Found</Text>
      <Text style={styles.emptyText}>Add your first trip to get started</Text>
      <TouchableOpacity
        style={styles.emptyAddButton}
        onPress={() => navigation.navigate('AddTrip')}
      >
        <Text style={styles.emptyAddButtonText}>Add Trip</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back-outline" size={22} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>My Trips</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={fetchTrips}
        >
          <Ionicons name="refresh-outline" size={22} color="#333" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLOR} />
          <Text style={styles.loadingText}>Loading trips...</Text>
        </View>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyList}
          renderItem={({ item }) => (
            <View style={styles.tripCard}>
              <View style={styles.tripHeaderRow}>
                <View style={styles.locationContainer}>
                  <View style={styles.locationIconContainer}>
                    <Ionicons name="location" size={16} color={BRAND_COLOR} />
                  </View>
                  <Text style={styles.tripTitle}>{item.from_location}</Text>
                </View>
                
                <View style={styles.arrowContainer}>
                  <View style={styles.arrowLine} />
                  <Ionicons name="arrow-forward" size={16} color="#999" />
                  <View style={styles.arrowLine} />
                </View>
                
                <View style={styles.locationContainer}>
                  <View style={styles.locationIconContainer}>
                    <Ionicons name="location" size={16} color="#ff4757" />
                  </View>
                  <Text style={styles.tripTitle}>{item.to_location}</Text>
                </View>
              </View>
              
              <View style={styles.tripInfoContainer}>
                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <Ionicons name="calendar-outline" size={16} color="#666" style={styles.infoIcon} />
                    <Text style={styles.tripDetails}>{item.date}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Ionicons name="time-outline" size={16} color="#666" style={styles.infoIcon} />
                    <Text style={styles.tripDetails}>{item.time}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <MaterialCommunityIcons name="package-variant" size={16} color="#666" style={styles.infoIcon} />
                    <Text style={styles.tripDetails}>{item.shipment_type.toUpperCase()}</Text>
                  </View>
                </View>
                
                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <MaterialCommunityIcons name="weight" size={16} color="#666" style={styles.infoIcon} />
                    <Text style={styles.tripDetails}>{item.available_capacity} tons</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Ionicons name="car-outline" size={16} color="#666" style={styles.infoIcon} />
                    <Text style={styles.tripDetails}>{item.vehicle_plate}</Text>
                  </View>
                </View>
                
                {/* <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <Ionicons name="person-outline" size={16} color="#666" style={styles.infoIcon} />
                    <Text style={styles.tripDetails}>{item.owner_name}</Text>
                  </View>
                </View> */}
              </View>
              
              <View style={styles.cardFooter}>
                <TouchableOpacity 
                  onPress={() => {
                    if (item.status !== 'completed' && item.status !== 'cancelled') {
                      setSelectedTripForStatus(item);
                      setStatusModalVisible(true);
                    } else {
                      Alert.alert('Action Blocked', 'Trip status cannot be changed.');
                    }
                  }}
                  style={styles.statusButton}
                >
                  <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] || '#ccc' }]}>
                    <Ionicons name={STATUS_ICONS[item.status] || 'help-circle-outline'} size={14} color="#fff" style={styles.statusIcon} />
                    <Text style={styles.statusText}>{item.status}</Text>
                  </View>
                </TouchableOpacity>
                
                <View style={styles.actions}>
                  <TouchableOpacity 
                    onPress={() => {
                      if (item.status === 'completed') {
                        Alert.alert('Action Blocked', 'Completed trips cannot be edited.');
                      } else {
                        openEditModal(item);
                      }
                    }} 
                    style={styles.actionButton}
                  >
                    <Ionicons name="create-outline" size={18} color="#fff" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    onPress={() => deleteTrip(item.id)}
                    style={[styles.actionButton, styles.deleteButton]}
                  >
                    <Ionicons name="trash-outline" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      )}

      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => navigation.navigate('AddTrip')}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Edit Trip Modal */}
      <Modal
  visible={editModalVisible}
  animationType="slide"
  transparent={true}
  onRequestClose={() => setEditModalVisible(false)}
>
  <View style={styles.modalOverlay}>
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' }}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Edit Trip</Text>
          <TouchableOpacity onPress={() => setEditModalVisible(false)}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.modalScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formGroup}>
            <Text style={styles.label}>From</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="location-outline" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={editFields.from_location}
                onChangeText={(text) => setEditFields({ ...editFields, from_location: text })}
                placeholder="Origin location"
                placeholderTextColor="#aaa"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>To</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="location-outline" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={editFields.to_location}
                onChangeText={(text) => setEditFields({ ...editFields, to_location: text })}
                placeholder="Destination location"
                placeholderTextColor="#aaa"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity
              style={styles.inputContainer}
              onPress={showDatePickerModal}
            >
              <Ionicons name="calendar-outline" size={20} color="#999" style={styles.inputIcon} />
              <Text style={styles.dateTimeText}>{editFields.date || 'Select date'}</Text>
            </TouchableOpacity>
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              date={safeDate}
              onConfirm={handleDateConfirm}
              onCancel={hideDatePickerModal}
              display="inline"
              isDarkModeEnabled={false}
              themeVariant="light"
              accentColor={BRAND_COLOR}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Time</Text>
            <TouchableOpacity
              style={styles.inputContainer}
              onPress={showTimePickerModal}
            >
              <Ionicons name="time-outline" size={20} color="#999" style={styles.inputIcon} />
              <Text style={styles.dateTimeText}>{editFields.time || 'Select time'}</Text>
            </TouchableOpacity>
            <DateTimePickerModal
              isVisible={isTimePickerVisible}
              mode="time"
              date={safeTime}
              onConfirm={handleTimeConfirm}
              onCancel={hideTimePickerModal}
              display="spinner"
              isDarkModeEnabled={false}
              themeVariant="light"
              accentColor={BRAND_COLOR}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Shipment Type</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="package-variant" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={editFields.shipment_type}
                onChangeText={(text) => setEditFields({ ...editFields, shipment_type: text })}
                placeholder="Type of shipment"
                placeholderTextColor="#aaa"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Available Capacity (tons)</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="weight" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={editFields.available_capacity}
                keyboardType="numeric"
                onChangeText={(text) => setEditFields({ ...editFields, available_capacity: text })}
                placeholder="Available capacity in tons"
                placeholderTextColor="#aaa"
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setEditModalVisible(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.updateButton}
            onPress={updateTrip}
          >
            <Text style={styles.updateButtonText}>Update Trip</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  </View>
</Modal>
<Modal
  visible={editModalVisible}
  animationType="slide"
  transparent={true}
  onRequestClose={() => setEditModalVisible(false)}
>
  <View style={styles.modalOverlay}>
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.modalContainer}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>Edit Trip</Text>
        <TouchableOpacity onPress={() => setEditModalVisible(false)}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.modalScrollContent}
      >
        <View style={styles.formGroup}>
          <Text style={styles.label}>From</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="location-outline" size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={editFields.from_location}
              onChangeText={(text) => setEditFields({ ...editFields, from_location: text })}
              placeholder="Origin location"
              placeholderTextColor="#aaa"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>To</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="location-outline" size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={editFields.to_location}
              onChangeText={(text) => setEditFields({ ...editFields, to_location: text })}
              placeholder="Destination location"
              placeholderTextColor="#aaa"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity
            style={styles.inputContainer}
            onPress={showDatePickerModal}
          >
            <Ionicons name="calendar-outline" size={20} color="#999" style={styles.inputIcon} />
            <Text style={styles.dateTimeText}>{editFields.date || 'Select date'}</Text>
          </TouchableOpacity>
          {isTimePickerVisible && (
            <DateTimePickerModal
              isVisible={isTimePickerVisible}
              mode="time"
              date={safeTime}
              onConfirm={handleTimeConfirm}
              onCancel={hideTimePickerModal}
              display="spinner"
              isDarkModeEnabled={false}
              themeVariant="light"
              accentColor={BRAND_COLOR}
            />
          )}

        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Time</Text>
          <TouchableOpacity
            style={styles.inputContainer}
            onPress={showTimePickerModal}
          >
            <Ionicons name="time-outline" size={20} color="#999" style={styles.inputIcon} />
            <Text style={styles.dateTimeText}>{editFields.time || 'Select time'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Shipment Type</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="package-variant" size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={editFields.shipment_type}
              onChangeText={(text) => setEditFields({ ...editFields, shipment_type: text })}
              placeholder="Type of shipment"
              placeholderTextColor="#aaa"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Available Capacity (tons)</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="weight" size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={editFields.available_capacity}
              keyboardType="numeric"
              onChangeText={(text) => setEditFields({ ...editFields, available_capacity: text })}
              placeholder="Available capacity in tons"
              placeholderTextColor="#aaa"
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.modalFooter}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => setEditModalVisible(false)}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.updateButton}
          onPress={updateTrip}
        >
          <Text style={styles.updateButtonText}>Update Trip</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  </View>
</Modal>


      {/* Status Change Modal */}
      <Modal
        visible={statusModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setStatusModalVisible(false)}
      >
        <View style={styles.statusModalOverlay}>
          <View style={styles.statusModalContainer}>
            <View style={styles.statusModalHeader}>
              <Text style={styles.statusModalTitle}>Change Trip Status</Text>
              <TouchableOpacity onPress={() => setStatusModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView contentContainerStyle={styles.statusOptionsContainer}>
              {STATUS_OPTIONS.map((status) => (
                <TouchableOpacity 
                  key={status} 
                  onPress={() => updateTripStatus(selectedTripForStatus.id, status)} 
                  style={[
                    styles.statusOption,
                    selectedTripForStatus?.status === status && styles.selectedStatusOption
                  ]}
                >
                  <View style={[styles.statusBadgeLarge, { backgroundColor: STATUS_COLORS[status] }]}>
                    <Ionicons name={STATUS_ICONS[status] || 'help-circle-outline'} size={18} color="#fff" />
                  </View>
                  <Text style={[
                    styles.statusOptionText,
                    selectedTripForStatus?.status === status && styles.selectedStatusOptionText
                  ]}>
                    {status}
                  </Text>
                  {selectedTripForStatus?.status === status && (
                    <Ionicons name="checkmark" size={20} color={BRAND_COLOR} style={styles.selectedIcon} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa',
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#333',
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
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  tripCard: { 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  tripHeaderRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  arrowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  arrowLine: {
    height: 1,
    backgroundColor: '#ddd',
    width: 20,
  },
  tripTitle: { 
    fontSize: 15, 
    fontWeight: '600',
    color: '#333',
  },
  tripInfoContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  infoIcon: {
    marginRight: 6,
  },
  tripDetails: { 
    fontSize: 13, 
    color: '#666',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusButton: {
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusIcon: {
    marginRight: 6,
  },
  statusText: { 
    color: '#fff', 
    fontSize: 12, 
    fontWeight: '600',
    textTransform: 'capitalize' 
  },
  actions: { 
    flexDirection: 'row',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BRAND_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: '#ff4757',
  },
  addButton: {
    position: 'absolute', 
    right: 20, 
    bottom: 30,
    backgroundColor: BRAND_COLOR,
    width: 60,
    height: 60,
    borderRadius: 30, 
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyAddButton: {
    backgroundColor: BRAND_COLOR,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyAddButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: { 
    width: width * 0.9,
    maxHeight: '80%',
    backgroundColor: '#fff', 
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#333',
  },
  modalScrollContent: {
    padding: 20,
    // paddingBottom: 100,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: { 
    fontWeight: '500', 
    marginBottom: 8, 
    color: '#333',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1, 
    borderColor: '#e0e0e0', 
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  inputIcon: {
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 12,
    fontSize: 15,
    color: '#333',
  },
  dateTimeText: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 12,
    fontSize: 15,
    color: '#333',
  },
  modalFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    padding: 16,
    marginBottom: 16,
  },
  
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  updateButton: {
    flex: 2,
    backgroundColor: BRAND_COLOR,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateButtonText: { 
    color: '#fff', 
    fontWeight: '600', 
    fontSize: 16 
  },
  statusModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  statusModalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  statusModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  statusModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  statusOptionsContainer: {
    padding: 16,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedStatusOption: {
    backgroundColor: '#f0f7ff',
  },
  statusBadgeLarge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statusOptionText: {
    fontSize: 16,
    color: '#333',
    textTransform: 'capitalize',
    flex: 1,
  },
  selectedStatusOptionText: {
    fontWeight: '600',
    color: BRAND_COLOR,
  },
  selectedIcon: {
    marginLeft: 8,
  },
  closeStatusButton: {
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  closeStatusButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff4757',
  },
});

export default TripManagementScreen;