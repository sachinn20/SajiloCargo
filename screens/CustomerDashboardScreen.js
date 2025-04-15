import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from '../utils/axiosInstance';
import { BRAND_COLOR } from './config';

const CustomerDashboardScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [userName, setUserName] = useState('');
  const [loadingName, setLoadingName] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const fetchUserName = async () => {
    const name = await AsyncStorage.getItem('userName');
    setUserName(name || 'Customer');
    setLoadingName(false);
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/notifications');
      setNotificationCount(res.data.unread_count || 0);
    } catch (e) {
      console.log('Notification check failed', e);
    }
  };

  const handleNotificationTap = async () => {
    try {
      await axios.post('/notifications/mark-all-read');
 // 🔁 match route exactly
      setNotificationCount(0);
      navigation.navigate('Notifications');
    } catch (error) {
      console.log('Failed to mark notifications as read', error);
    }
  };
  

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserName();
    fetchNotifications().finally(() => setRefreshing(false));
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [])
  );

  useEffect(() => {
    fetchUserName();
    fetchNotifications();
  }, []);

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.toLowerCase().includes('package')) {
      navigation.navigate('TripSearch');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Search Box */}
        <TextInput
          style={styles.searchInput}
          placeholder="Search services"
          placeholderTextColor="#aaa"
          value={searchQuery}
          onChangeText={handleSearch}
        />

        {/* Greeting Box */}
        <View style={styles.greetingBox}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greetingText}>{getTimeBasedGreeting()} 👋</Text>
            {loadingName ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.nameText}>{userName}</Text>
            )}
            <Text style={styles.greetingSubText}>We trust you are having a great time</Text>
          </View>
          <TouchableOpacity onPress={handleNotificationTap}>
            <View style={styles.iconWrapper}>
              <Ionicons name="notifications-outline" size={24} color="#fff" />
              {notificationCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{notificationCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Promo Banners */}
        <Text style={styles.sectionTitle}>Special for you</Text>
        <View style={styles.specialContainer}>
          <Image source={require('../assets/icon.png')} style={styles.banner} />
          <Image source={require('../assets/icon.png')} style={styles.banner} />
        </View>

        {/* Action Grid */}
        <Text style={styles.sectionTitle}>What would you like to do?</Text>
        <View style={styles.gridContainer}>
          <TouchableOpacity style={styles.card}>
            <Ionicons name="headset" size={30} color={BRAND_COLOR} />
            <Text style={styles.cardTitle}>Customer Care</Text>
            <Text style={styles.cardText}>Support is available 24/7</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('TripSearch')}>
            <Ionicons name="cube" size={30} color={BRAND_COLOR} />
            <Text style={styles.cardTitle}>Send a Package</Text>
            <Text style={styles.cardText}>Schedule and book your package</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card}>
            <Ionicons name="wallet" size={30} color={BRAND_COLOR} />
            <Text style={styles.cardTitle}>Fund Wallet</Text>
            <Text style={styles.cardText}>Add funds anytime</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, { backgroundColor: BRAND_COLOR }]}
            onPress={() => navigation.navigate('InstantBooking')}
          >
            <Ionicons name="flash" size={30} color="#fff" />
            <Text style={[styles.cardTitle, { color: '#fff' }]}>Instant Booking</Text>
            <Text style={[styles.cardText, { color: '#eee' }]}>Find nearby vehicles</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CustomerDashboardScreen;

const styles = StyleSheet.create({
  container: { padding: 20 },
  searchInput: {
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  greetingBox: {
    backgroundColor: BRAND_COLOR,
    borderRadius: 16,
    paddingVertical: 22,
    paddingHorizontal: 20,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  greetingText: {
    fontSize: 14,
    color: '#e6f0ff',
    fontWeight: '500',
  },
  nameText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 2,
  },
  greetingSubText: {
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  specialContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  banner: {
    height: 100,
    width: 160,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    elevation: 1,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 4,
    textAlign: 'center',
  },
  cardText: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
  },
});
