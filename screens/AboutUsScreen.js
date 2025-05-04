import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  Image, 
  Linking, 
  TouchableOpacity,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BRAND_COLOR } from './config';
import { LinearGradient } from 'expo-linear-gradient';

const AboutUsScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={[BRAND_COLOR, '#0056b3']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Us</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Image source={require('../assets/sajilo-logo.png')} style={styles.logo} />
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroTitle}>SajiloCargo</Text>
            <Text style={styles.heroSubtitle}>Your Trusted Partner in Smart Cargo Transport</Text>
          </View>
        </View>
        
        {/* Mission Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="flag" size={22} color={BRAND_COLOR} />
            <Text style={styles.cardTitle}>Who We Are</Text>
          </View>
          <Text style={styles.text}>
            At SajiloCargo, we are redefining how cargo transportation works across Nepal. We connect customers and vehicle owners using a modern, mobile-based platform to make goods delivery fast, easy, and reliable.
          </Text>
        </View>
        
        {/* What We Do Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="cube" size={22} color={BRAND_COLOR} />
            <Text style={styles.cardTitle}>What We Do</Text>
          </View>
          <Text style={styles.text}>
            From individual packages to large group shipments, SajiloCargo enables end-to-end booking, real-time tracking, and secure delivery management — all through a user-friendly mobile app.
          </Text>
        </View>
        
        {/* Features Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="construct" size={22} color={BRAND_COLOR} />
            <Text style={styles.cardTitle}>Key Features</Text>
          </View>
          <View style={styles.featureGrid}>
            <FeatureItem icon="search" text="Search & book available trips" />
            <FeatureItem icon="calendar" text="Instant and scheduled booking options" />
            <FeatureItem icon="location" text="Track shipments in real-time" />
            <FeatureItem icon="person" text="Manage your profile and documents" />
            <FeatureItem icon="car" text="Trip & vehicle management for owners" />
            <FeatureItem icon="notifications" text="Smart notifications and updates" />
          </View>
        </View>
        
        {/* Vision Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="eye" size={22} color={BRAND_COLOR} />
            <Text style={styles.cardTitle}>Our Vision</Text>
          </View>
          <Text style={styles.text}>
            To become Nepal's most trusted and accessible cargo booking service — empowering individuals and businesses across the country.
          </Text>
        </View>
        
        {/* Why Choose Us Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="thumbs-up" size={22} color={BRAND_COLOR} />
            <Text style={styles.cardTitle}>Why SajiloCargo?</Text>
          </View>
          <View style={styles.bulletSection}>
            <BulletItem text="Easy to use interface" />
            <BulletItem text="Transparent pricing" />
            <BulletItem text="Trusted network of drivers & owners" />
            <BulletItem text="Delivery across both urban & rural Nepal" />
            <BulletItem text="Localized support & scalable features" />
          </View>
        </View>
        
        {/* Contact Card */}
        <View style={styles.contactCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="call" size={22} color="#fff" />
            <Text style={[styles.cardTitle, { color: '#fff' }]}>Contact Us</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => Linking.openURL('mailto:support@sajilocargo.com')}
            activeOpacity={0.7}
          >
            <Ionicons name="mail" size={20} color="#fff" style={styles.contactIcon} />
            <Text style={styles.contactText}>support@sajilocargo.com</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => Linking.openURL('tel:+97798XXXXXXXX')}
            activeOpacity={0.7}
          >
            <Ionicons name="call" size={20} color="#fff" style={styles.contactIcon} />
            <Text style={styles.contactText}>+977-98XXXXXXXX</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => Linking.openURL('https://www.sajilocargo.com')}
            activeOpacity={0.7}
          >
            <Ionicons name="globe" size={20} color="#fff" style={styles.contactIcon} />
            <Text style={styles.contactText}>www.sajilocargo.com</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 SajiloCargo. All rights reserved.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Feature Item Component
const FeatureItem = ({ icon, text }) => (
  <View style={styles.featureItem}>
    <View style={styles.featureIconContainer}>
      <Ionicons name={icon} size={18} color={BRAND_COLOR} />
    </View>
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

// Bullet Item Component
const BulletItem = ({ text }) => (
  <View style={styles.bulletItem}>
    <View style={styles.bulletPoint}>
      <Ionicons name="checkmark" size={14} color="#fff" />
    </View>
    <Text style={styles.bulletText}>{text}</Text>
  </View>
);

export default AboutUsScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff', // plain white background
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333', // dark text
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  
  // Hero Section
  heroSection: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    borderRadius: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  heroTextContainer: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: BRAND_COLOR,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
    lineHeight: 22,
    maxWidth: '80%',
  },
  
  // Cards
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  text: {
    fontSize: 15,
    color: '#555',
    lineHeight: 24,
  },
  
  // Features
  featureGrid: {
    marginTop: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  featureIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${BRAND_COLOR}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureText: {
    fontSize: 15,
    color: '#444',
    flex: 1,
  },
  
  // Bullets
  bulletSection: {
    marginTop: 8,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bulletPoint: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: BRAND_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bulletText: {
    fontSize: 15,
    color: '#444',
    flex: 1,
  },
  
  // Contact Card
  contactCard: {
    backgroundColor: BRAND_COLOR,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: BRAND_COLOR,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  contactIcon: {
    marginRight: 12,
  },
  contactText: {
    fontSize: 15,
    color: '#fff',
  },
  
  // Footer
  footer: {
    alignItems: 'center',
    marginTop: 10,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});