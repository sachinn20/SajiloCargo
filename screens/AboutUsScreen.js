import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { BRAND_COLOR } from './config';

const AboutUsScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Us</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Branding logo */}
        <Image source={require('../assets/sajilo-logo.png')} style={styles.logo} />


        <Text style={styles.heroTitle}>SajiloCargo</Text>
        <Text style={styles.heroSubtitle}>Your Trusted Partner in Smart Cargo Transport</Text>

        <Text style={styles.sectionTitle}>Who We Are</Text>
        <Text style={styles.text}>
          At SajiloCargo, we are redefining how cargo transportation works across Nepal. We connect customers and vehicle owners using a modern, mobile-based platform to make goods delivery fast, easy, and reliable.
        </Text>

        <Text style={styles.sectionTitle}>🚚 What We Do</Text>
        <Text style={styles.text}>
          From individual packages to large group shipments, SajiloCargo enables end-to-end booking, real-time tracking, and secure delivery management — all through a user-friendly mobile app.
        </Text>

        <Text style={styles.sectionTitle}>🔧 Key Features</Text>
        <View style={styles.bulletSection}>
          <Text style={styles.bullet}>• Search & book available trips</Text>
          <Text style={styles.bullet}>• Instant and scheduled booking options</Text>
          <Text style={styles.bullet}>• Track shipments in real-time</Text>
          <Text style={styles.bullet}>• Manage your profile and documents</Text>
          <Text style={styles.bullet}>• Trip & vehicle management for owners</Text>
          <Text style={styles.bullet}>• Smart notifications and updates</Text>
        </View>

        <Text style={styles.sectionTitle}>🎯 Our Vision</Text>
        <Text style={styles.text}>
          To become Nepal’s most trusted and accessible cargo booking service — empowering individuals and businesses across the country.
        </Text>

        <Text style={styles.sectionTitle}>🤝 Why SajiloCargo?</Text>
        <View style={styles.bulletSection}>
          <Text style={styles.bullet}>✔️ Easy to use interface</Text>
          <Text style={styles.bullet}>✔️ Transparent pricing</Text>
          <Text style={styles.bullet}>✔️ Trusted network of drivers & owners</Text>
          <Text style={styles.bullet}>✔️ Delivery across both urban & rural Nepal</Text>
          <Text style={styles.bullet}>✔️ Localized support & scalable features</Text>
        </View>

        <Text style={styles.sectionTitle}>📞 Contact Us</Text>
        <Text style={styles.text}>Email: support@sajilocargo.com</Text>
        <Text style={styles.text}>Phone: +977-98XXXXXXXX</Text>
        <Text style={styles.text}>Website: www.sajilocargo.com</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AboutUsScreen;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    resizeMode: 'contain',
    marginBottom: 16,
    borderRadius: 20,
  },
  banner: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 24,
    resizeMode: 'cover',
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: BRAND_COLOR,
    textAlign: 'center',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  text: {
    fontSize: 14.5,
    color: '#555',
    lineHeight: 22,
    marginBottom: 12,
  },
  bulletSection: {
    marginBottom: 12,
    paddingLeft: 8,
  },
  bullet: {
    fontSize: 14.5,
    color: '#555',
    lineHeight: 22,
    marginBottom: 6,
  },
});
