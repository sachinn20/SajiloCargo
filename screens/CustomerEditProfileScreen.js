// customer/CustomerEditProfileScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
  Platform,
  KeyboardAvoidingView,
  Modal
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import axios from '../utils/axiosInstance';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BRAND_COLOR } from '../screens/config';

const CustomerEditProfileScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    name: '',
    phone_number: '',
    email: '',
    role: '',
  });

  const [profileImage, setProfileImage] = useState(null);
  const [initialProfileImage, setInitialProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

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
        console.error('Error loading user:', err);
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
        const match = /\.(\w+)$/.exec(filename ?? '');
        const ext = match?.[1] ?? 'jpg';

        formData.append('profile_photo', {
          uri: profileImage,
          type: `image/${ext}`,
          name: filename,
        });
      }

      const response = await axios.post('/profile/update', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      Alert.alert('Success', response.data.message || 'Profile updated.');
      navigation.navigate('Dashboard', { screen: 'Profile' });
    } catch (err) {
      console.error('Update error:', err.response?.data || err);
      Alert.alert('Error', 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const navigateToChangePassword = () => {
    setMenuVisible(false);
    navigation.navigate('ChangePassword');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color="#555" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Personal Information</Text>
          <TouchableOpacity 
            style={styles.menuButton} 
            onPress={toggleMenu}
            activeOpacity={0.7}
          >
            <Ionicons name="ellipsis-vertical" size={22} color="#555" />
          </TouchableOpacity>
        </View>

        {/* Menu Modal */}
        <Modal
          transparent={true}
          visible={menuVisible}
          animationType="fade"
          onRequestClose={() => setMenuVisible(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setMenuVisible(false)}
          >
            <View style={styles.menuContainer}>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={navigateToChangePassword}
              >
                <Ionicons name="key-outline" size={20} color="#555" style={styles.menuIcon} />
                <Text style={styles.menuText}>Change Password</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        <ScrollView 
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.profilePicSection}>
            <TouchableOpacity 
              onPress={pickImage}
              style={styles.profilePicContainer}
              activeOpacity={0.9}
            >
              <Image
                source={
                  profileImage
                    ? { uri: profileImage }
                    : require('../assets/icon.png')
                }
                style={styles.profilePic}
              />
              <View style={styles.cameraIconContainer}>
                <Ionicons name="camera" size={18} color="#fff" />
              </View>
            </TouchableOpacity>
            <Text style={styles.changePhotoText}>Tap to change photo</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={form.name}
                  onChangeText={(text) => setForm({ ...form, name: text })}
                  placeholder="Enter your full name"
                  placeholderTextColor="#aaa"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={[styles.inputContainer, styles.readOnlyContainer]}>
                <Ionicons name="mail" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.readOnly]}
                  value={form.email}
                  editable={false}
                  placeholder="Your email address"
                  placeholderTextColor="#aaa"
                />
                <Ionicons name="lock-closed" size={16} color="#999" style={styles.lockIcon} />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="call" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  keyboardType="phone-pad"
                  value={form.phone_number}
                  onChangeText={(text) => setForm({ ...form, phone_number: text })}
                  placeholder="Enter your phone number"
                  placeholderTextColor="#aaa"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Role</Text>
              <View style={[styles.inputContainer, styles.readOnlyContainer]}>
                <Ionicons name="briefcase" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.readOnly]}
                  value={form.role.charAt(0).toUpperCase() + form.role.slice(1)}
                  editable={false}
                  placeholder="Your role"
                  placeholderTextColor="#aaa"
                />
                <Ionicons name="lock-closed" size={16} color="#999" style={styles.lockIcon} />
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={handleUpdate} 
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="save" size={20} color="#fff" style={styles.saveIcon} />
                <Text style={styles.saveText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CustomerEditProfileScreen;

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
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  container: {
    padding: 20,
    paddingBottom: 50,
  },
  
  // Profile Picture Section
  profilePicSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profilePicContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 60,
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
  profilePic: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#fff',
    backgroundColor: '#eee',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: BRAND_COLOR,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  changePhotoText: {
    marginTop: 12,
    fontSize: 14,
    color: BRAND_COLOR,
    fontWeight: '500',
  },
  
  // Form Container
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
  },
  readOnlyContainer: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
  },
  readOnly: {
    color: '#999',
  },
  lockIcon: {
    marginLeft: 10,
  },
  
  // Buttons
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BRAND_COLOR,
    paddingVertical: 16,
    borderRadius: 12,
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
  saveIcon: {
    marginRight: 8,
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  
  // Menu Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  menuContainer: {
    position: 'absolute',
    top: 70,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    width: 200,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  menuIcon: {
    marginRight: 12,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
});