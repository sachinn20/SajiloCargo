// screens/ProfileScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, Modal, Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import axios from '../utils/axiosInstance';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BRAND_COLOR } from './config';

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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f7f7f7' }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>Account & Settings</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.profileSection}>
          <TouchableOpacity onPress={() => setPreviewVisible(true)}>
            {user?.profile_photo_url ? (
              <Image source={{ uri: user.profile_photo_url }} style={styles.avatar} />
            ) : (
              <Ionicons name="person-circle" size={60} color="#ccc" />
            )}
          </TouchableOpacity>
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.name}>{user?.name || ''}</Text>
            <Text style={styles.phone}>{user?.phone_number || ''}</Text>
            <View style={styles.ratingBox}>
              <Ionicons name="star" size={14} color="#fff" />
              <Text style={styles.ratingText}>5.0</Text>
            </View>
          </View>
        </View>

        <Section title="ACCOUNT">
          <MenuItem icon="person-outline" label="Edit Profile" onPress={() => navigation.navigate('CustomerEditProfile')} />
          <MenuItem icon="list-outline" label="My Bookings" onPress={() => navigation.navigate('MyBookings')} />
          <MenuItem icon="document-text-outline" label="Statements & Reports" onPress={() => Alert.alert('Coming soon')} />
        </Section>

        <Section title="SETTINGS">
          <MenuItem icon="notifications-outline" label="Notification Settings" onPress={() => Alert.alert('Coming soon')} />
          <MenuItem icon="card-outline" label="Card & Bank Settings" onPress={() => Alert.alert('Coming soon')} />
          <MenuItem icon="information-circle-outline" label="About Us" onPress={() => navigation.navigate('AboutUs')} />
          <MenuItem icon="log-out-outline" label="Log Out" color="#ff3b30" onPress={handleLogout} />
        </Section>
      </ScrollView>

      {/* Fullscreen Preview */}
      <Modal visible={previewVisible} transparent animationType="fade">
        <Pressable style={styles.previewContainer} onPress={() => setPreviewVisible(false)}>
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

const Section = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.card}>{children}</View>
  </View>
);

const MenuItem = ({ icon, label, onPress, color = '#333' }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.iconLabel}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={[styles.menuText, { color }]}>{label}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color="#aaa" />
  </TouchableOpacity>
);

export default ProfileScreen;

const styles = StyleSheet.create({
  container: { paddingBottom: 30 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  title: { fontSize: 20, fontWeight: '600' },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    marginHorizontal: 20,
  },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#ddd' },
  name: { fontSize: 18, fontWeight: '600', color: '#222' },
  phone: { fontSize: 14, color: '#666' },
  ratingBox: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BRAND_COLOR,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  ratingText: { marginLeft: 4, fontSize: 13, color: '#fff' },
  section: { marginBottom: 24, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#999', marginBottom: 8 },
  card: { backgroundColor: '#fff', borderRadius: 12, paddingVertical: 4, elevation: 1 },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconLabel: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  menuText: { fontSize: 16 },
  previewContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: { width: '100%', height: '100%' },
});
