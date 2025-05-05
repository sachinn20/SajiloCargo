import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BRAND_COLOR } from './config';

const PackageInfoScreen = ({ route, navigation }) => {
  const { booking } = route.params;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color="#555" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Package Details</Text>
        <View style={styles.emptySpace} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.trackingCard}>
          <View style={styles.trackingHeader}>
            <View style={styles.trackingIconContainer}>
              <Ionicons name="barcode-outline" size={20} color="#fff" />
            </View>
            <View>
              <Text style={styles.trackingLabel}>Tracking Number</Text>
              <Text style={styles.trackingNumber}>{booking.tracking_no}</Text>
            </View>
          </View>
          
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(booking.status) }]} />
            <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
              {formatStatus(booking.status)}
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cube-outline" size={20} color="#555" />
            <Text style={styles.sectionTitle}>Package Information</Text>
          </View>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Shipment Type</Text>
              <Text style={styles.infoValue}>{booking.shipment_type}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Weight</Text>
              <Text style={styles.infoValue}>{booking.weight} kg</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Packages</Text>
              <Text style={styles.infoValue}>{booking.no_of_packages}</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="people-outline" size={20} color="#555" />
            <Text style={styles.sectionTitle}>Sender & Receiver</Text>
          </View>
          
          <View style={styles.contactsContainer}>
            <View style={styles.contactBox}>
              <View style={styles.contactHeader}>
                <View style={[styles.contactIcon, styles.senderIcon]}>
                  <Ionicons name="person-outline" size={16} color="#fff" />
                </View>
                <Text style={styles.contactType}>Sender</Text>
              </View>
              <Text style={styles.contactName}>{booking.user.name}</Text>
              <View style={styles.phoneContainer}>
                <Ionicons name="call-outline" size={14} color="#666" />
                <Text style={styles.phoneText}>{booking.user.phone_number}</Text>
              </View>
            </View>
            
            <View style={styles.contactDivider}>
              <View style={styles.dividerLine} />
              <View style={styles.dividerIcon}>
                <Ionicons name="arrow-forward" size={16} color="#888" />
              </View>
              <View style={styles.dividerLine} />
            </View>
            
            <View style={styles.contactBox}>
              <View style={styles.contactHeader}>
                <View style={[styles.contactIcon, styles.receiverIcon]}>
                  <Ionicons name="person-outline" size={16} color="#fff" />
                </View>
                <Text style={styles.contactType}>Receiver</Text>
              </View>
              <Text style={styles.contactName}>{booking.receiver_name}</Text>
              <View style={styles.phoneContainer}>
                <Ionicons name="call-outline" size={14} color="#666" />
                <Text style={styles.phoneText}>{booking.receiver_number}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="wallet-outline" size={20} color="#555" />
            <Text style={styles.sectionTitle}>Payment Details</Text>
          </View>
          
          <View style={styles.paymentContainer}>
            <View style={styles.paymentRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>NPR {booking.amount}</Text>
            </View>
          </View>
          
          <View style={styles.paymentStatusContainer}>
            {booking.is_paid ? (
              <View style={styles.paidBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#0f5132" />
                <Text style={styles.paidText}>Paid</Text>
              </View>
            ) : (
              <View style={styles.pendingBadge}>
                <Ionicons name="time-outline" size={16} color="#856404" />
                <Text style={styles.pendingText}>Payment Pending</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Helper functions
const getStatusColor = (status) => {
  switch(status?.toLowerCase()) {
    case 'pending': return '#f59e0b';
    case 'accepted': return '#3b82f6';
    case 'loading': return '#8b5cf6';
    case 'completed': return '#10b981';
    default: return '#6b7280';
  }
};

const formatStatus = (status) => {
  if (!status) return 'Unknown';
  
  // Capitalize first letter and format status
  const formatted = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  
  switch(formatted.toLowerCase()) {
    case 'pending': return 'Pending';
    case 'accepted': return 'Accepted';
    case 'loading': return 'In Transit';
    case 'completed': return 'Delivered';
    default: return formatted;
  }
};

export default PackageInfoScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1, 
    backgroundColor: '#f8f9fa'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  emptySpace: {
    width: 40,
  },
  container: {
    padding: 16,
    paddingBottom: 30,
  },
  trackingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  trackingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BRAND_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  trackingLabel: {
    fontSize: 12,
    color: '#666',
  },
  trackingNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: BRAND_COLOR,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginLeft: 8,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  infoItem: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  contactsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contactBox: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  senderIcon: {
    backgroundColor: '#3b82f6',
  },
  receiverIcon: {
    backgroundColor: '#10b981',
  },
  contactType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  contactName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 6,
  },
  contactDivider: {
    width: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#ddd',
    flex: 1,
  },
  dividerIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  paymentContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#555',
  },
  paymentValue: {
    fontSize: 14,
    color: '#555',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: BRAND_COLOR,
  },
  paymentStatusContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 81, 50, 0.1)',
  },
  paidText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f5132',
    marginLeft: 6,
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(133, 100, 4, 0.1)',
  },
  pendingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginLeft: 6,
  },
});