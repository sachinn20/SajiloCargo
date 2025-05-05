import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
import { LinearGradient } from 'expo-linear-gradient';

const CustomerDashboardScreen = () => {
  const navigation = useNavigation();
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[BRAND_COLOR]} />}
        showsVerticalScrollIndicator={false}
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
                We trust you are having a great time
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

        {/* Promo Banners */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Special for you</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.specialContainer}
          >
            <View style={styles.promoCard}>
              <Image source={require('../assets/icon.png')} style={styles.banner} />
              <View style={styles.promoOverlay}>
                <Text style={styles.promoTitle}>Special Offer</Text>
                <Text style={styles.promoText}>Limited time discount on deliveries</Text>
              </View>
            </View>
            <View style={styles.promoCard}>
              <Image source={require('../assets/icon.png')} style={styles.banner} />
              <View style={styles.promoOverlay}>
                <Text style={styles.promoTitle}>New Service</Text>
                <Text style={styles.promoText}>Try our premium delivery options</Text>
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Action Grid */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>What would you like to do?</Text>
          <View style={styles.grid}>
            <TouchableOpacity style={styles.card} activeOpacity={0.7}>
              <View style={[styles.iconContainer, { backgroundColor: '#e6f7ff' }]}>
                <Ionicons name="headset" size={24} color={BRAND_COLOR} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Customer Care</Text>
                <Text style={styles.cardValue}>24/7</Text>
                <Text style={styles.cardText}>Support available</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.card} 
              onPress={() => navigation.navigate('TripSearch')}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#fff0e6' }]}>
                <Ionicons name="cube" size={24} color="#ff8c42" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Send a Package</Text>
                <Text style={styles.cardValue}>Book</Text>
                <Text style={styles.cardText}>Schedule delivery</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.card}
              onPress={() => navigation.navigate('InstantBooking')}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#f0e6ff' }]}>
                <Ionicons name="flash" size={24} color="#8c42ff" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Instant Booking</Text>
                <Text style={styles.cardValue}>Quick</Text>
                <Text style={styles.cardText}>Find nearby vehicles</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.card} 
              onPress={() => navigation.navigate('MyBookings')} 
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#e6fff0' }]}>
                <Ionicons name="time" size={24} color="#42ff8c" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Booking History</Text>
                <Text style={styles.cardValue}>View</Text>
                <Text style={styles.cardText}>Past deliveries</Text>
              </View>
            </TouchableOpacity>

          </View>
        </View>

        {/* <TouchableOpacity style={styles.performanceCard} activeOpacity={0.7}>
          <View style={[styles.performanceIconContainer, { backgroundColor: '#ffe6e6' }]}>
            <Ionicons name="star" size={24} color="#ff4757" />
          </View>
          <View style={styles.performanceCardContent}>
            <Text style={styles.cardTitle}>Your Rating</Text>
            <Text style={styles.performanceValue}>4.8/5.0</Text>
            <Text style={styles.cardText}>based on your interactions</Text>
            <View style={styles.performanceBar}>
              <View style={[styles.performanceBarFill, { width: '96%' }]} />
            </View>
          </View>
        </TouchableOpacity> */}

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('TripSearch')}
            >
              <View style={styles.actionIconContainer}>
                <Ionicons name="add-circle-outline" size={24} color={BRAND_COLOR} />
              </View>
              <Text style={styles.actionText}>New Booking</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('InstantBooking')}
            >
              <View style={styles.actionIconContainer}>
                <Ionicons name="flash-outline" size={24} color={BRAND_COLOR} />
              </View>
              <Text style={styles.actionText}>Instant Book</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
              <View style={styles.actionIconContainer}>
                <Ionicons name="help-circle-outline" size={24} color={BRAND_COLOR} />
              </View>
              <Text style={styles.actionText}>Help Center</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CustomerDashboardScreen;

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
    marginHorizontal: 16,
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
  specialContainer: {
    paddingRight: 20,
  },
  promoCard: {
    width: 280,
    height: 140,
    borderRadius: 16,
    marginRight: 16,
    overflow: 'hidden',
    position: 'relative',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  banner: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  promoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 12,
  },
  promoTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  promoText: {
    color: '#e0e0e0',
    fontSize: 12,
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