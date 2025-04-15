import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Alert, RefreshControl, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BRAND_COLOR } from './config';
import axios from '../utils/axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const VehicleOwnerDashboardScreen = ({ navigation }) => {
  const [userName, setUserName] = useState('');
  const [loadingName, setLoadingName] = useState(true);
  const [bookingStats, setBookingStats] = useState({ ongoing: 0, completed: 0 });
  const [vehicleTotal, setVehicleTotal] = useState(0);
  const [tripCount, setTripCount] = useState({ scheduled: 0, completed: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const fetchStats = useCallback(async () => {
    const token = await AsyncStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [profileRes, bookingsRes, vehiclesRes, tripsRes] = await Promise.all([
        axios.get('/profile', { headers }),
        axios.get('/received-bookings', { headers }),
        axios.get('/vehicles', { headers }),
        axios.get('/trips', { headers }),
      ]);

      const user = profileRes.data.data;
      setUserName(user.name || 'Vehicle Owner');
      setLoadingName(false);

      const bookings = bookingsRes.data;
      const ongoing = bookings.filter(b =>
        ['pending', 'accepted', 'loading', 'en_route'].includes(b.status)
      ).length;
      const completed = bookings.filter(b =>
        ['delivered', 'completed'].includes(b.status)
      ).length;
      setBookingStats({ ongoing, completed });

      setVehicleTotal(vehiclesRes.data.length);

      const trips = tripsRes.data;
      const activeTrips = trips.filter(t =>
        ['pending', 'scheduled', 'loading', 'en_route'].includes(t.status)
      ).length;
      const doneTrips = trips.filter(t => t.status === 'completed').length;
      setTripCount({ scheduled: activeTrips, completed: doneTrips });

    } catch (err) {
      console.error('Dashboard stats error:', err);
      Alert.alert('Error', 'Could not load dashboard data.');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await axios.get('/notifications');
      setNotificationCount(res.data.unread_count || 0);
    } catch (e) {
      console.log('Notification check failed', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [fetchNotifications])
  );

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
    fetchNotifications();
  };

  const handleNotificationTap = async () => {
    try {
      await axios.post('/notifications/mark-all-read');
      setNotificationCount(0);
      navigation.navigate('Notifications');
    } catch (err) {
      console.log('Failed to mark notifications as read', err);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.headerBox}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>{getTimeBasedGreeting()} 👋</Text>
            {loadingName ? (
              <ActivityIndicator color="#fff" style={{ marginTop: 4 }} />
            ) : (
              <Text style={styles.name}>{userName}</Text>
            )}
            <Text style={styles.subGreeting}>
              Manage your bookings, trips, vehicles and earnings.
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleNotificationTap}
            style={styles.iconWrapper}
          >
            <Ionicons name="notifications-outline" size={24} color="#fff" />
            {notificationCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{notificationCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          {/* Cards */}
          <TouchableOpacity style={styles.card}>
            <Ionicons name="cash-outline" size={30} color={BRAND_COLOR} />
            <Text style={styles.cardTitle}>Earnings</Text>
            <Text style={styles.cardText}>NPR 48,300 this month</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('VehicleManagement')}
          >
            <Ionicons name="car-sport-outline" size={30} color={BRAND_COLOR} />
            <Text style={styles.cardTitle}>My Vehicles</Text>
            <Text style={styles.cardText}>You have {vehicleTotal} vehicles</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('OwnerBookings')}
          >
            <Ionicons name="clipboard-outline" size={30} color={BRAND_COLOR} />
            <Text style={styles.cardTitle}>Bookings</Text>
            <Text style={styles.cardText}>
              {bookingStats.ongoing} ongoing, {bookingStats.completed} completed
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('TripManagement')}
          >
            <Ionicons name="map-outline" size={30} color={BRAND_COLOR} />
            <Text style={styles.cardTitle}>Trips</Text>
            <Text style={styles.cardText}>
              {tripCount.scheduled} ongoing, {tripCount.completed} completed
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.card, { backgroundColor: BRAND_COLOR }]}>
            <Ionicons name="bar-chart-outline" size={30} color="#fff" />
            <Text style={[styles.cardTitle, { color: '#fff' }]}>Performance</Text>
            <Text style={[styles.cardText, { color: '#e0e0e0' }]}>98% completion rate</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default VehicleOwnerDashboardScreen;

const styles = StyleSheet.create({
  container: { padding: 20 },
  headerBox: {
    backgroundColor: BRAND_COLOR,
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    color: '#e6f0ff',
    fontWeight: '500',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 2,
  },
  subGreeting: {
    fontSize: 13,
    color: '#e0e0e0',
    marginTop: 6,
  },
  iconWrapper: {
    position: 'relative',
    padding: 6,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -4,
    backgroundColor: 'red',
    borderRadius: 10,
    minWidth: 16,
    paddingHorizontal: 4,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  card: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 1,
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  cardText: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
  },
});
