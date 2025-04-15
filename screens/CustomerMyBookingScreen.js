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

  const renderDetailRow = (label, value) => (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || '-'}</Text>
    </View>
  );

  const BookingModal = () => (
    <Modal visible={showDetailModal} transparent animationType="fade">
      <Pressable style={styles.modalOverlay} onPress={() => setShowDetailModal(false)}>
        <Animated.View style={[styles.detailBox, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.modalTitle}>📦 Booking Details</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              {renderDetailRow('Tracking No', selectedBooking?.tracking_no)}
              {renderDetailRow('Status', selectedBooking?.status)}
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Trip Info</Text>
              {renderDetailRow('Route', `${selectedBooking?.trip?.from_location} → ${selectedBooking?.trip?.to_location}`)}
              {renderDetailRow('Date', selectedBooking?.trip?.date)}
              {renderDetailRow('Time', selectedBooking?.trip?.time)}
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Receiver Info</Text>
              {renderDetailRow('Receiver', selectedBooking?.receiver_name)}
              {renderDetailRow('Phone', selectedBooking?.receiver_number)}
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Package Info</Text>
              {renderDetailRow('Shipment Type', selectedBooking?.shipment_type)}
              {renderDetailRow('Weight', selectedBooking?.weight + ' kg')}
              {renderDetailRow('Packages', selectedBooking?.no_of_packages)}
              {renderDetailRow('Amount', 'NPR ' + selectedBooking?.amount)}
              {renderDetailRow('Notes', selectedBooking?.notes)}
            </View>
          </ScrollView>
        </Animated.View>
      </Pressable>
    </Modal>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterBtn, activeFilter === f && styles.filterActive]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[
                styles.filterText,
                activeFilter === f && { color: '#fff', fontWeight: 'bold' }
              ]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={BRAND_COLOR} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Swipeable
              ref={(ref) => {
                if (ref) swipeableRefs.current[item.id] = ref;
              }}
              renderRightActions={() => renderRightActions(item)}
            >
              <TouchableOpacity
                style={styles.card}
                onPress={() => openDetailModal(item)}
              >
                <Text style={styles.title}>{item.trip?.from_location} ➔ {item.trip?.to_location}</Text>
                <Text style={styles.sub}>Tracking No: {item.tracking_no}</Text>
                <Text style={styles.sub}>Receiver: {item.receiver_name}</Text>
                <Text style={styles.status}>Status: {item.status}</Text>
              </TouchableOpacity>
            </Swipeable>
          )}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 80, color: '#666' }}>
              No bookings found.
            </Text>
          }
        />
      )}

      {showDetailModal && <BookingModal />}
    </SafeAreaView>
  );
};

export default CustomerMyBookingScreen;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, backgroundColor: '#fff', elevation: 2,
  },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  filterBar: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  filterBtn: {
    paddingHorizontal: 14, paddingVertical: 6, backgroundColor: '#eee',
    borderRadius: 20, marginRight: 10,
  },
  filterText: { color: '#333', fontSize: 14 },
  filterActive: { backgroundColor: BRAND_COLOR },
  card: {
    backgroundColor: '#f9f9f9', padding: 16, borderRadius: 12,
    marginBottom: 16, elevation: 1,
  },
  title: { fontSize: 16, fontWeight: '600', color: '#222' },
  sub: { fontSize: 14, color: '#555', marginTop: 4 },
  status: {
    marginTop: 6, fontSize: 14, fontWeight: '500',
    color: BRAND_COLOR, textTransform: 'capitalize'
  },
  swipeActions: {
    flexDirection: 'row', height: '90%', marginVertical: 5
  },
  swipeBtn: {
    justifyContent: 'center', alignItems: 'center',
    width: 75, borderRadius: 8, marginHorizontal: 4,
  },
  swipeText: {
    color: '#fff', fontWeight: '600', fontSize: 12, marginTop: 2
  },
  modalOverlay: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  detailBox: {
    width: '90%', maxHeight: '85%', backgroundColor: '#fff', borderRadius: 12,
    padding: 20, elevation: 5,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#111' },
  section: { marginBottom: 18 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 8, color: '#333' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  label: { color: '#555', fontWeight: '500' },
  value: { fontWeight: '600', color: '#111', maxWidth: '60%', textAlign: 'right' },
});
