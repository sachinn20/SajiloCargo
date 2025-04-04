import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BRAND_COLOR } from './config';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from '../utils/axiosInstance';

const CustomerDashboardScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [hasNewNotification, setHasNewNotification] = useState(false);

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.toLowerCase().includes('package')) {
      navigation.navigate('TripSearch');
    }
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get('/notifications');
        if (res.data.length > 0) {
          const latest = new Date(res.data[0].created_at);
          const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
          setHasNewNotification(latest > fiveMinAgo);
        }
      } catch (e) {
        console.log('Notification check failed', e);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={styles.container}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search services"
          placeholderTextColor="#aaa"
          value={searchQuery}
          onChangeText={handleSearch}
        />

        <View style={styles.greetingBox}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greetingText}>Hello Sachin</Text>
            <Text style={styles.greetingSubText}>
              We trust you are having a great time
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
            <View>
              <Ionicons name="notifications-outline" size={24} color="#fff" />
              {hasNewNotification && <View style={styles.redDot} />}
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Special for you</Text>
        <View style={styles.specialContainer}>
          <Image source={require('../assets/icon.png')} style={styles.banner} />
          <Image source={require('../assets/icon.png')} style={styles.banner} />
        </View>

        <Text style={styles.sectionTitle}>What would you like to do</Text>
        <View style={styles.gridContainer}>
          <TouchableOpacity style={styles.card}>
            <Ionicons name="headset" size={30} color={BRAND_COLOR} />
            <Text style={styles.cardTitle}>Customer Care</Text>
            <Text style={styles.cardText}>Our support team is 24/7 live</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('TripSearch')}>
            <Ionicons name="cube" size={30} color={BRAND_COLOR} />
            <Text style={styles.cardTitle}>Send a package</Text>
            <Text style={styles.cardText}>Prepare and book your package</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card}>
            <Ionicons name="wallet" size={30} color={BRAND_COLOR} />
            <Text style={styles.cardTitle}>Fund your wallet</Text>
            <Text style={styles.cardText}>Add funds via any method</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.card, { backgroundColor: BRAND_COLOR }]}>
            <Ionicons name="car" size={30} color="white" />
            <Text style={[styles.cardTitle, { color: 'white' }]}>Book a rider</Text>
            <Text style={[styles.cardText, { color: 'white' }]}>Find riders available near you</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

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
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  greetingText: { fontSize: 18, color: '#fff', fontWeight: 'bold' },
  greetingSubText: { color: '#e0e0e0', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
  specialContainer: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  banner: {
    height: 100,
    width: 160,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#f4f4f4',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  cardTitle: {
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 4,
    textAlign: 'center',
  },
  cardText: { textAlign: 'center', fontSize: 12, color: '#555' },
  redDot: {
    height: 10,
    width: 10,
    backgroundColor: 'red',
    borderRadius: 5,
    position: 'absolute',
    top: -4,
    right: -4,
  },
});

export default CustomerDashboardScreen;
