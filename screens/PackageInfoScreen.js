import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BRAND_COLOR } from './config';

const PackageInfoScreen = ({ route, navigation }) => {
  const { booking } = route.params;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={BRAND_COLOR} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>View Package Info</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Package Information</Text>

          <Text style={styles.label}>Sender Details</Text>
          <Text style={styles.value}>{booking.from_location}{booking.user.name} ({booking.user.phone_number})</Text>

          <Text style={styles.label}>Receiver Details</Text>
          <Text style={styles.value}>{booking.to_location}{booking.receiver_name} ({booking.receiver_number})</Text>

          <Text style={styles.label}>Shipment Type</Text>
          <Text style={styles.value}>{booking.shipment_type}</Text>

          <Text style={styles.label}>Weight</Text>
          <Text style={styles.value}>{booking.weight} kg</Text>

          <Text style={styles.label}>Packages</Text>
          <Text style={styles.value}>{booking.no_of_packages}</Text>

          <Text style={styles.label}>Tracking No</Text>
          <Text style={[styles.value, { color: BRAND_COLOR }]}>{booking.tracking_no}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Charges</Text>

          <View style={styles.chargeRow}>
            <Text style={styles.chargeLabel}>Delivery Charges</Text>
            <Text style={styles.chargeAmount}>NPR {booking.amount}</Text>
          </View>

          <View style={styles.chargeRow}>
            <Text style={[styles.chargeLabel, { fontWeight: 'bold' }]}>Package Total</Text>
            <Text style={[styles.chargeAmount, { fontWeight: 'bold', color: BRAND_COLOR }]}>NPR {booking.amount}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.reportBtn}>
            <Text style={{ color: BRAND_COLOR, fontWeight: '600' }}>Report</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.successBtn}>
            <Text style={{ color: '#fff', fontWeight: '600' }}>Successful</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PackageInfoScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 12,
    color: '#222'
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: BRAND_COLOR,
    marginBottom: 8
  },
  label: {
    fontSize: 13,
    color: '#888',
    marginTop: 10
  },
  value: {
    fontSize: 14,
    color: '#333',
    marginTop: 2
  },
  chargeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8
  },
  chargeLabel: {
    fontSize: 14,
    color: '#555'
  },
  chargeAmount: {
    fontSize: 14,
    color: '#ff6600'
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30
  },
  reportBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: BRAND_COLOR,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10
  },
  successBtn: {
    flex: 1,
    backgroundColor: BRAND_COLOR,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  }
});
