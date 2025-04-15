// TrackScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import axios from '../utils/axiosInstance';
import { BRAND_COLOR } from './config';
import { Ionicons } from '@expo/vector-icons';

const STATUS_FLOW = [
  { key: 'courier_requested', label: 'Courier requested' },
  { key: 'ready_for_delivery', label: 'Package ready for delivery' },
  { key: 'in_transit', label: 'Package in transit' },
  { key: 'delivered', label: 'Package delivered' },
];

const TrackScreen = () => {
  const [trackingNo, setTrackingNo] = useState('');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      setTrackingNo('');
      setBooking(null);
    }, [])
  );

  const handleTrack = async () => {
    if (!trackingNo.trim()) return Alert.alert('Enter a tracking number');

    try {
      setLoading(true);
      const res = await axios.get(`/track/${trackingNo}`);
      setBooking(res.data);
    } catch (err) {
      Alert.alert('Not found', 'No booking found with this tracking number.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIndex = (status) => {
    switch (status) {
      case 'pending': return 0;
      case 'accepted': return 1;
      case 'loading': return 2;
      case 'completed': return 3;
      default: return 0;
    }
  };

  const statusIndex = booking ? getStatusIndex(booking.status) : -1;

  const renderTimeline = () => (
    <View style={{ marginVertical: 20 }}>
      {STATUS_FLOW.map((step, index) => {
        const isCompleted = index <= statusIndex;
        const time = isCompleted ? new Date().toLocaleString() : null;
        return (
          <View key={step.key} style={styles.timelineRow}>
            <Ionicons
              name={isCompleted ? 'checkbox' : 'square-outline'}
              size={20}
              color={isCompleted ? BRAND_COLOR : '#ccc'}
              style={{ marginRight: 8 }}
            />
            <View>
              <Text style={[styles.timelineText, isCompleted && { color: BRAND_COLOR }]}>
                {step.label}
              </Text>
              {isCompleted && (
                <Text style={styles.timeText}>{time}</Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );

  const renderSuccess = () => (
    <View style={styles.successBox}>
      <Ionicons name="checkmark-circle" size={80} color="green" style={{ marginBottom: 20 }} />
      <Text style={styles.successText}>Delivery Successful</Text>
      <Text style={styles.successSub}>Your item has been delivered successfully</Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Track Your Package</Text>

        <TextInput
          placeholder="Enter Tracking Number"
          value={trackingNo}
          onChangeText={setTrackingNo}
          style={styles.input}
        />

        <TouchableOpacity style={styles.button} onPress={handleTrack}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Track</Text>
          )}
        </TouchableOpacity>

        {booking && (
          <View style={styles.detailsBox}>
            <Text style={styles.label}>Tracking Number</Text>
            <Text style={styles.trackingText}>{booking.tracking_no}</Text>

            <Text style={styles.label}>Package Status</Text>
            {statusIndex === 3 ? renderSuccess() : renderTimeline()}

            <TouchableOpacity
              style={styles.infoBtn}
              onPress={() => navigation.navigate('PackageInfoScreen', { booking })}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>View Package Info</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default TrackScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
    backgroundColor: '#fff'
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#111',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
    marginBottom: 12,
  },
  button: {
    backgroundColor: BRAND_COLOR,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  detailsBox: {
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    padding: 16,
  },
  label: {
    fontSize: 13,
    color: '#555',
    marginBottom: 4,
  },
  trackingText: {
    color: BRAND_COLOR,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  timelineText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#444',
  },
  timeText: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  successBox: {
    alignItems: 'center',
    marginVertical: 20,
  },
  successText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'green',
    marginBottom: 6,
  },
  successSub: {
    color: '#444',
    fontSize: 14,
  },
  infoBtn: {
    backgroundColor: BRAND_COLOR,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
});