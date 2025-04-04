import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BRAND_COLOR } from './config';
import axios from '../utils/axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';

const VehicleOwnerDashboardScreen = ({ navigation }) => {
  const [bookingStats, setBookingStats] = useState({ ongoing: 0, completed: 0 });
  const [vehicleCount, setVehicleCount] = useState({ active: 0, inactive: 0 });
  const [tripCount, setTripCount] = useState({ scheduled: 0, completed: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const token = await AsyncStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      try {
        // Bookings
        const bookingsRes = await axios.get('/my-bookings', { headers });
        const bookings = bookingsRes.data;
        const ongoing = bookings.filter(b => b.status === 'accepted').length;
        const completed = bookings.filter(b => b.status === 'delivered').length;
        setBookingStats({ ongoing, completed });

        // Vehicles
        const vehiclesRes = await axios.get('/vehicles', { headers });
        const vehicles = vehiclesRes.data;
        const active = vehicles.filter(v => v.status === 'active').length;
        const inactive = vehicles.filter(v => v.status !== 'active').length;
        setVehicleCount({ active, inactive });

        // Trips
        const tripsRes = await axios.get('/trips', { headers });
        const trips = tripsRes.data;
        const scheduled = trips.filter(t => t.status !== 'completed').length;
        const finished = trips.filter(t => t.status === 'completed').length;
        setTripCount({ scheduled, completed: finished });
      } catch (err) {
        console.error('Failed to load stats:', err);
      }
    };

    fetchStats();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerBox}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>Welcome Back!</Text>
            <Text style={styles.subGreeting}>Manage your rides and earnings below</Text>
          </View>
          <Ionicons name="notifications-outline" size={24} color="#fff" />
        </View>

        <View style={styles.grid}>
          <TouchableOpacity style={styles.card}>
            <Ionicons name="cash-outline" size={30} color={BRAND_COLOR} />
            <Text style={styles.cardTitle}>Earnings</Text>
            <Text style={styles.cardText}>₹ 48,300 this month</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('VehicleManagement')}
          >
            <Ionicons name="car-sport-outline" size={30} color={BRAND_COLOR} />
            <Text style={styles.cardTitle}>My Vehicles</Text>
            <Text style={styles.cardText}>
              {vehicleCount.active} active, {vehicleCount.inactive} inactive
            </Text>
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
              {tripCount.scheduled} scheduled, {tripCount.completed} completed
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
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  subGreeting: { fontSize: 13, color: '#e0e0e0', marginTop: 4 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  card: {
    width: '48%',
    backgroundColor: '#f6f6f6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  cardTitle: { fontWeight: 'bold', fontSize: 15, marginTop: 8, marginBottom: 4 },
  cardText: { fontSize: 12, color: '#555', textAlign: 'center' },
});
