// screens/ProfileScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, Modal, Pressable,
  StatusBar, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import axios from '../utils/axiosInstance';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BRAND_COLOR } from './config';
import { LinearGradient } from 'expo-linear-gradient';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchUserProfile();
    }, [])
  );

  const fetchUserProfile = async () => {
    const token = await AsyncStorage.getItem('authToken');
    try {
      const res = await axios.get('/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.data);
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.multiRemove(['authToken', 'userRole', 'userName']);
            Alert.alert('Logged out', 'You have been logged out successfully.');
            navigation.replace('Login');
          },
        },
      ],
      { cancelable: true }
    );
  };
  

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={BRAND_COLOR} />
      
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
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity 
          style={[styles.settingsButton, { opacity: 0, pointerEvents: 'none' }]} // Invisible but still there
          // onPress={() => Alert.alert('Coming soon', 'Settings will be available soon.')}
          activeOpacity={0.7}
        >
          <Ionicons name="settings-outline" size={22} color="" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* Profile Card */}
        <View style={styles.profileCardContainer}>
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <TouchableOpacity
                  onPress={() => user?.profile_photo_url && setPreviewVisible(true)}
                  activeOpacity={0.9}
                >
                  {user?.profile_photo_url ? (
                    <Image source={{ uri: user.profile_photo_url }} style={styles.avatar} />
                  ) : (
                    <View style={[styles.avatarPlaceholder, { backgroundColor: BRAND_COLOR }]}>
                      <Text style={styles.avatarInitial}>
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.profileInfo}>
                <Text style={styles.name}>{user?.name || 'User'}</Text>
                <View style={styles.phoneContainer}>
                  <Ionicons name="call" size={14} color="#666" />
                  <Text style={styles.phone}>{user?.phone_number || 'No phone number'}</Text>
                </View>
                <View style={styles.ratingContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name="star"
                      size={16}
                      color="#FFD700"
                      style={styles.starIcon}
                    />
                  ))}
                  <Text style={styles.ratingText}>5.0</Text>
                </View>
              </View>
            </View>

            <View style={styles.profileActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('CustomerEditProfile')}
                activeOpacity={0.8}
              >
                <Ionicons name="create-outline" size={18} color={BRAND_COLOR} />
                <Text style={styles.actionButtonText}>Edit Profile</Text>
              </TouchableOpacity>

              <View style={styles.actionDivider} />

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => Alert.alert('Coming soon', 'This feature will be available soon.')}
                activeOpacity={0.8}
              >
                <Ionicons name="share-social-outline" size={18} color={BRAND_COLOR} />
                <Text style={styles.actionButtonText}>Share Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Account Section */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>ACCOUNT</Text>
          <View style={styles.menuCard}>
            <MenuItem 
              icon="person" 
              label="Personal Information" 
              onPress={() => navigation.navigate('CustomerEditProfile')} 
              iconColor="#4CAF50"
            />
            <MenuItem 
              icon="list" 
              label="My Bookings" 
              onPress={() => navigation.navigate('MyBookings')} 
              iconColor="#2196F3"
            />
            <MenuItem 
              icon="document-text" 
              label="Statements & Reports" 
              onPress={() => Alert.alert('Coming soon', 'This feature will be available soon.')} 
              iconColor="#9C27B0"
              isNew
            />
          </View>
        </View>
        
        {/* Settings Section */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>APP INFORMATION</Text>
          <View style={styles.menuCard}>
            <MenuItem 
              icon="file-tray-full" 
              label="Terms and Conditions" 
              onPress={() => navigation.navigate('Terms')} 
              iconColor="#F44336"
            />
            <MenuItem 
              icon="shield" 
              label="Privacy Policy" 
              onPress={() => navigation.navigate('Privacy')} 
              iconColor="#009688"
            />
            <MenuItem 
              icon="information-circle" 
              label="About Us" 
              onPress={() => navigation.navigate('AboutUs')} 
              iconColor="#607D8B"
            />
          </View>
        </View>
        
        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out" size={20} color="#fff" style={styles.logoutIcon} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
        
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>

      {/* Fullscreen Preview */}
      <Modal visible={previewVisible} transparent animationType="fade">
        <Pressable 
          style={styles.previewContainer} 
          onPress={() => setPreviewVisible(false)}
        >
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setPreviewVisible(false)}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          
          <Image
            source={{ uri: user?.profile_photo_url }}
            style={styles.previewImage}
            resizeMode="contain"
          />
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

// Menu Item Component
const MenuItem = ({ icon, label, onPress, count, iconColor, isNew }) => (
  <TouchableOpacity 
    style={styles.menuItem} 
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.menuItemLeft}>
      <View style={[styles.menuIconContainer, { backgroundColor: `${iconColor}15` }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text style={styles.menuItemText}>{label}</Text>
      {isNew && <View style={styles.newBadge}><Text style={styles.newBadgeText}>NEW</Text></View>}
    </View>
    
    <View style={styles.menuItemRight}>
      {count > 0 && (
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{count}</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={18} color="#bbb" />
    </View>
  </TouchableOpacity>
);

export default ProfileScreen;

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#f8f9fa' 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa'
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14
  },
  
  // Header
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff', // CHANGED from LinearGradient to solid white
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  
  
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0', // CHANGED FROM semi-transparent white
    justifyContent: 'center',
    alignItems: 'center'
  },
  
  headerTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    alignItems: 'center'
  },
  container: { 
    paddingBottom: 40 
  },
  
  // Profile Card
  profileCardContainer: {
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 20,
  },
  
  profileCard: {
    backgroundColor: '#f0f8ff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: `${BRAND_COLOR}30`,
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
  
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: { 
    width: 90, 
    height: 90, 
    borderRadius: 45, 
    borderWidth: 3,
    borderColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  
  avatarInitial: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  
  profileInfo: {
    flex: 1,
  },
  name: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#222',
    marginBottom: 6,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  phone: { 
    fontSize: 14, 
    color: '#666',
    marginLeft: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    marginRight: 2,
  },
  ratingText: { 
    marginLeft: 4, 
    fontSize: 14, 
    fontWeight: 'bold',
    color: '#333',
  },
  
  // Profile Actions
  profileActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: BRAND_COLOR,
  },
  actionDivider: {
    width: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 10,
  },
  
  // Menu Sections
  menuSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
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
  
  // Menu Items
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countBadge: {
    backgroundColor: '#f0f0f0',
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  countText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
  },
  newBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  newBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
  
  // Logout Button
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BRAND_COLOR,
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  
  // Version Text
  versionText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    marginBottom: 20,
  },
  
  // Preview Modal
  previewContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  previewImage: { 
    width: '100%', 
    height: '80%' 
  },
});