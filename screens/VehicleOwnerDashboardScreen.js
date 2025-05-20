import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Alert, RefreshControl, ActivityIndicator, ImageBackground
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BRAND_COLOR } from './config';
import axios from '../utils/axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const VehicleOwnerDashboardScreen = ({ navigation }) => {
  const [userName, setUserName] = useState('');
  const [loadingName, setLoadingName] = useState(true);
  const [bookingStats, setBookingStats] = useState({ ongoing: 0, completed: 0 });
  const [vehicleTotal, setVehicleTotal] = useState(0);
  const [tripCount, setTripCount] = useState({ scheduled: 0, completed: 0 });
  const [totalEarnings, setTotalEarnings] = useState(0);
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
      const [profileRes, bookingsRes, vehiclesRes, tripsRes, earningsRes] = await Promise.all([
      axios.get('/profile', { headers }),
      axios.get('/received-bookings', { headers }),
      axios.get('/vehicles', { headers }),
      axios.get('/trips', { headers }),
      axios.get('/earnings', { headers }), // 👈 new
    ]);

    setTotalEarnings(earningsRes.data.total || 0);


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
  }, [fetchNotifications]);

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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[BRAND_COLOR]} />}
      >
        <LinearGradient
          colors={[BRAND_COLOR, '#1a4d80']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerBox}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerTextContainer}>
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
              style={styles.notificationButton}
            >
              <Ionicons name="notifications-outline" size={24} color="#fff" />
              {notificationCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{notificationCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.statsContainer}>
          
          <View style={styles.grid}>
            <TouchableOpacity style={styles.card} activeOpacity={0.7}>
              <View style={[styles.iconContainer, { backgroundColor: '#e6f7ff' }]}>
                <Ionicons name="cash-outline" size={24} color={BRAND_COLOR} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Earnings</Text>
                <Text style={styles.cardValue}>NPR {totalEarnings.toLocaleString()}</Text>
                
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('VehicleManagement')}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#fff0e6' }]}>
                <Ionicons name="car-sport-outline" size={24} color="#ff8c42" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>My Vehicles</Text>
                <Text style={styles.cardValue}>{vehicleTotal}</Text>
                <Text style={styles.cardText}>vehicles</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('OwnerBookings')}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#f0e6ff' }]}>
                <Ionicons name="clipboard-outline" size={24} color="#8c42ff" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Bookings</Text>
                <Text style={styles.cardValue}>{bookingStats.ongoing}</Text>
                <Text style={styles.cardText}>ongoing</Text>
                <View style={styles.miniStat}>
                  <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
                  <Text style={styles.miniStatText}>{bookingStats.completed} completed</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('TripManagement')}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#e6fff0' }]}>
                <Ionicons name="map-outline" size={24} color="#42ff8c" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Trips</Text>
                <Text style={styles.cardValue}>{tripCount.scheduled}</Text>
                <Text style={styles.cardText}>ongoing</Text>
                <View style={styles.miniStat}>
                  <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
                  <Text style={styles.miniStatText}>{tripCount.completed} completed</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('AddVehicle')}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="add-circle-outline" size={24} color={BRAND_COLOR} />
            </View>
            <Text style={styles.actionText}>Add Vehicle</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('AddTrip')}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="calendar-outline" size={24} color={BRAND_COLOR} />
            </View>
            <Text style={styles.actionText}>Schedule Trip</Text>
          </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
              <View style={styles.actionIconContainer}>
                <Ionicons name="analytics-outline" size={24} color={BRAND_COLOR} />
              </View>
              <Text style={styles.actionText}>View Reports</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default VehicleOwnerDashboardScreen;

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#f8f9fa' 
  },
  container: { 
    padding: 0 
  },
  headerBox: {
    borderRadius: 24,
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    marginBottom: 20,
    marginHorizontal: 16, // ✅ Add margin on left and right
    elevation: 4,
  },
  
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerTextContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: '#e6f0ff',
    fontWeight: '500',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  subGreeting: {
    fontSize: 14,
    color: '#e0e0e0',
    marginTop: 8,
    lineHeight: 20,
  },
  notificationButton: {
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 10,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ff4757',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontWeight: '600',
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  cardText: {
    fontSize: 12,
    color: '#888',
  },
  miniStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  miniStatText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  quickActions: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    alignItems: 'center',
    width: '30%',
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});