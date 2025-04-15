import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, Alert,
  ActivityIndicator, ScrollView, Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import axios from '../utils/axiosInstance';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BRAND_COLOR } from './config';

const VehicleOwnerEditProfileScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    name: '',
    phone_number: '',
    email: '',
    role: '',
  });

  const [profileImage, setProfileImage] = useState(null);
  const [initialProfileImage, setInitialProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const token = await AsyncStorage.getItem('authToken');
      try {
        const res = await axios.get('/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = res.data.data;
        setForm({
          name: user.name,
          phone_number: user.phone_number || '',
          email: user.email,
          role: user.role,
        });
        setProfileImage(user.profile_photo_url || null);
        setInitialProfileImage(user.profile_photo_url || null);
      } catch (err) {
        console.error('Error loading profile:', err);
      }
    };
    loadProfile();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: false,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setProfileImage(uri);
    }
  };

  const handleUpdate = async () => {
    if (!form.name || !form.phone_number) {
      Alert.alert('Validation', 'Full name and phone number are required.');
      return;
    }

    setLoading(true);
    const token = await AsyncStorage.getItem('authToken');

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('phone_number', form.phone_number);

      if (profileImage && profileImage !== initialProfileImage && !profileImage.startsWith('http')) {
        const filename = profileImage.split('/').pop();
        const ext = filename?.split('.').pop() || 'jpg';
        formData.append('profile_photo', {
          uri: profileImage,
          name: filename,
          type: `image/${ext}`,
        });
      }

      const response = await axios.post('/profile/update', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      Alert.alert('Success', response.data.message || 'Profile updated.');
      navigation.goBack();
    } catch (err) {
      console.error('Update error:', err.response?.data || err);
      Alert.alert('Error', 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <Ionicons name="ellipsis-vertical" size={20} color="#000" />
        </View>

        <View style={styles.profilePicContainer}>
          <TouchableOpacity onPress={pickImage}>
            <Image
              source={
                profileImage
                  ? { uri: profileImage }
                  : require('../assets/icon.png')
              }
              style={styles.profilePic}
            />
            <View style={styles.cameraIcon}>
              <Ionicons name="camera" size={18} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={form.name}
            onChangeText={(text) => setForm({ ...form, name: text })}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, styles.readOnly]}
            value={form.email}
            editable={false}
          />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            keyboardType="phone-pad"
            value={form.phone_number}
            onChangeText={(text) => setForm({ ...form, phone_number: text })}
          />

          <Text style={styles.label}>Role</Text>
          <TextInput
            style={[styles.input, styles.readOnly]}
            value={form.role}
            editable={false}
          />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Save</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default VehicleOwnerEditProfileScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  profilePicContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ddd',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: BRAND_COLOR,
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 5,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#888',
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  readOnly: {
    backgroundColor: '#eee',
    color: '#999',
  },
  saveBtn: {
    backgroundColor: BRAND_COLOR,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
