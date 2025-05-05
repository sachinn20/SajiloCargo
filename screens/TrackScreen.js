// TrackScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator, Image
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
    <View style={styles.timelineContainer}>
      <View style={styles.timelineLine} />
      {STATUS_FLOW.map((step, index) => {
        const isCompleted = index <= statusIndex;
        const isActive = index === statusIndex;
        const time = isCompleted ? new Date().toLocaleString() : null;
        
        return (
          <View key={step.key} style={styles.timelineRow}>
            <View style={styles.timelineIconContainer}>
              <View 
                style={[
                  styles.timelineIcon, 
                  isCompleted ? styles.completedIcon : styles.pendingIcon,
                  isActive && styles.activeIcon
                ]}
              >
                {isCompleted ? (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                ) : (
                  <View style={styles.pendingDot} />
                )}
              </View>
            </View>
            
            <View style={styles.timelineContent}>
              <Text 
                style={[
                  styles.timelineText, 
                  isCompleted ? styles.completedText : styles.pendingText,
                  isActive && styles.activeText
                ]}
              >
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
      <View style={styles.successIconContainer}>
        <Ionicons name="checkmark" size={40} color="#fff" />
      </View>
      <Text style={styles.successText}>Delivery Successful</Text>
      <Text style={styles.successSub}>Your item has been delivered successfully</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Track Your Package</Text>
          <Text style={styles.subHeader}>Enter your tracking number to get delivery updates</Text>
        </View>

        <View style={styles.trackingCard}>
          <View style={styles.inputContainer}>
            <Ionicons name="search-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              placeholder="Enter Tracking Number"
              value={trackingNo}
              onChangeText={setTrackingNo}
              style={styles.input}
              placeholderTextColor="#999"
              autoCapitalize="characters"
            />
            {trackingNo.length > 0 && (
              <TouchableOpacity onPress={() => setTrackingNo('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={18} color="#999" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity 
            style={styles.button} 
            onPress={handleTrack}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="locate-outline" size={18} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Track Package</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {!booking && !loading && (
          <View style={styles.illustrationContainer}>
            <View style={styles.illustrationIconContainer}>
              <Ionicons name="cube-outline" size={60} color={BRAND_COLOR} />
            </View>
            <Text style={styles.illustrationText}>Enter a tracking number to see delivery status</Text>
          </View>
        )}

        {booking && (
          <View style={styles.detailsBox}>
            <View style={styles.trackingHeader}>
              <View>
                <Text style={styles.label}>Tracking Number</Text>
                <Text style={styles.trackingText}>{booking.tracking_no}</Text>
              </View>
              <View style={[
                styles.statusBadge, 
                statusIndex === 3 ? styles.deliveredBadge : styles.inProgressBadge
              ]}>
                <Text style={[
                  styles.statusBadgeText,
                  statusIndex === 3 ? styles.deliveredBadgeText : styles.inProgressBadgeText
                ]}>
                  {statusIndex === 3 ? 'Delivered' : 'In Progress'}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Package Status</Text>
            {statusIndex === 3 ? renderSuccess() : renderTimeline()}

            <TouchableOpacity
              style={styles.infoBtn}
              onPress={() => navigation.navigate('PackageInfoScreen', { booking })}
              activeOpacity={0.8}
            >
              <Ionicons name="information-circle-outline" size={18} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.infoBtnText}>View Package Details</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default TrackScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1, 
    backgroundColor: '#f8f9fa'
  },
  container: {
    padding: 20,
    flexGrow: 1,
  },
  headerContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#222',
  },
  subHeader: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  trackingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 15,
    color: '#333',
  },
  clearButton: {
    padding: 8,
  },
  button: {
    backgroundColor: BRAND_COLOR,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    flex: 1,
  },
  illustrationIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  illustrationText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 15,
    lineHeight: 22,
  },
  detailsBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  trackingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  trackingText: {
    color: BRAND_COLOR,
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  inProgressBadge: {
    backgroundColor: 'rgba(255, 165, 0, 0.15)',
  },
  deliveredBadge: {
    backgroundColor: 'rgba(0, 128, 0, 0.15)',
  },
  statusBadgeText: {
    fontWeight: '600',
    fontSize: 12,
  },
  inProgressBadgeText: {
    color: '#ff8c00',
  },
  deliveredBadgeText: {
    color: 'green',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  timelineContainer: {
    position: 'relative',
    marginVertical: 16,
    paddingLeft: 12,
  },
  timelineLine: {
    position: 'absolute',
    left: 16,
    top: 20,
    bottom: 20,
    width: 2,
    backgroundColor: '#e0e0e0',
    zIndex: 1,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 24,
    position: 'relative',
    zIndex: 2,
  },
  timelineIconContainer: {
    width: 34,
    alignItems: 'center',
    marginRight: 12,
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedIcon: {
    backgroundColor: BRAND_COLOR,
  },
  pendingIcon: {
    backgroundColor: '#e0e0e0',
  },
  activeIcon: {
    borderWidth: 2,
    borderColor: BRAND_COLOR,
  },
  pendingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#999',
  },
  timelineContent: {
    flex: 1,
  },
  timelineText: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  completedText: {
    color: '#333',
  },
  pendingText: {
    color: '#999',
  },
  activeText: {
    color: BRAND_COLOR,
    fontWeight: '700',
  },
  timeText: {
    fontSize: 12,
    color: '#888',
  },
  successBox: {
    alignItems: 'center',
    marginVertical: 24,
    backgroundColor: 'rgba(0, 128, 0, 0.08)',
    padding: 24,
    borderRadius: 16,
  },
  successIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'green',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'green',
    marginBottom: 8,
  },
  successSub: {
    color: '#444',
    fontSize: 14,
    textAlign: 'center',
  },
  infoBtn: {
    backgroundColor: BRAND_COLOR,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  infoBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});