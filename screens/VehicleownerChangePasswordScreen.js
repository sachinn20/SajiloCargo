// customer/ChangePasswordScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from '../utils/axiosInstance';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BRAND_COLOR } from './config';

const VehicleownerChangePasswordScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  
  const [errors, setErrors] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
    general: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Clear specific error when user types in a field
  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '', general: '' }));
    
    // If changing new password, also clear confirm password error if they match
    if (field === 'new_password' && value === form.confirm_password) {
      setErrors(prev => ({ ...prev, confirm_password: '' }));
    }
    
    // If changing confirm password, check if it matches new password
    if (field === 'confirm_password' && value !== form.new_password && value.length > 0) {
      setErrors(prev => ({ ...prev, confirm_password: 'Passwords do not match.' }));
    } else if (field === 'confirm_password' && value === form.new_password) {
      setErrors(prev => ({ ...prev, confirm_password: '' }));
    }
    
    // If changing current password, clear the "incorrect password" error
    if (field === 'current_password') {
      setErrors(prev => ({ ...prev, current_password: '' }));
    }
    
    // If new password is same as current password, show error
    if (field === 'new_password' && value === form.current_password && value.length > 0) {
      setErrors(prev => ({ 
        ...prev, 
        new_password: 'New password must be different from current password.' 
      }));
    }
  };

  // Password strength calculation
  const calculatePasswordStrength = (password) => {
    if (!password) return { score: 0, label: '', color: '#ddd' };
    
    let score = 0;
    
    // Length check
    if (password.length >= 8) score += 1;
    
    // Uppercase check
    if (/[A-Z]/.test(password)) score += 1;
    
    // Number check
    if (/\d/.test(password)) score += 1;
    
    // Special character check
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    const strengthMap = {
      0: { label: 'Very Weak', color: '#ff4d4f' },
      1: { label: 'Weak', color: '#ff7a45' },
      2: { label: 'Fair', color: '#ffc53d' },
      3: { label: 'Good', color: '#73d13d' },
      4: { label: 'Strong', color: '#52c41a' }
    };
    
    return { 
      score, 
      ...strengthMap[score]
    };
  };

  const passwordStrength = calculatePasswordStrength(form.new_password);

  // Validate form before submission
  const validateForm = () => {
    let newErrors = {};
    let isValid = true;
    
    // Validate current password
    if (!form.current_password.trim()) {
      newErrors.current_password = 'Current password is required.';
      isValid = false;
    }
    
    // Validate new password
    if (!form.new_password.trim()) {
      newErrors.new_password = 'New password is required.';
      isValid = false;
    } else if (form.new_password.length < 8) {
      newErrors.new_password = 'Password must be at least 8 characters long.';
      isValid = false;
    } else {
      // Check for uppercase, number, and special character
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(form.new_password)) {
        newErrors.new_password = 'Password must include at least one uppercase letter, one number, and one special character.';
        isValid = false;
      }
    }
    
    // Check if new password is same as current password
    if (form.current_password && form.new_password && form.current_password === form.new_password) {
      newErrors.new_password = 'New password must be different from current password.';
      isValid = false;
    }
    
    // Validate confirm password
    if (!form.confirm_password.trim()) {
      newErrors.confirm_password = 'Please confirm your new password.';
      isValid = false;
    } else if (form.new_password !== form.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match.';
      isValid = false;
    }
    
    setErrors(prev => ({ ...prev, ...newErrors }));
    return isValid;
  };

  const handleSubmit = async () => {
    // Clear all errors first
    setErrors({
      current_password: '',
      new_password: '',
      confirm_password: '',
      general: ''
    });
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        setErrors(prev => ({ ...prev, general: 'Authentication token not found. Please login again.' }));
        setLoading(false);
        return;
      }
      
      const response = await axios.post('/profile/change-password', {
        current_password: form.current_password,
        new_password: form.new_password,
        new_password_confirmation: form.confirm_password,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Success case - show alert and navigate back
      Alert.alert(
        'Success',
        'Password changed successfully',
        [
          { 
            text: 'OK', 
            onPress: () => navigation.navigate("OwnerDashboard", { screen: "Profile" })

          }
        ]
      );
      
    } catch (err) {
      // Handle API errors
      if (err.response) {
        const { status, data } = err.response;
        
        // Handle incorrect current password
        if (status === 422 && data.errors?.current_password) {
          setErrors(prev => ({
            ...prev,
            current_password: 'Current password is incorrect.'
          }));
        } 
        // Handle other validation errors from API
        else if (status === 422 && data.errors) {
          const apiErrors = {};
          
          Object.keys(data.errors).forEach(key => {
            apiErrors[key] = Array.isArray(data.errors[key]) 
              ? data.errors[key][0] 
              : data.errors[key];
          });
          
          setErrors(prev => ({
            ...prev,
            ...apiErrors
          }));
        } 
        // Handle general error message
        else {
          setErrors(prev => ({
            ...prev,
            general: data.message || 'Failed to change password.'
          }));
        }
      } else {
        // Handle network or unexpected errors
        setErrors(prev => ({
          ...prev,
          general: 'Connection error. Please try again later.'
        }));
      }
    } finally {
      setLoading(false);
    }
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
          <Text style={styles.headerTitle}>Change Password</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView 
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* General Error Message */}
          {errors.general ? (
            <View style={styles.generalErrorContainer}>
              <Ionicons name="alert-circle" size={20} color="#ff4d4f" />
              <Text style={styles.generalErrorText}>{errors.general}</Text>
            </View>
          ) : null}
          
          <View style={styles.formContainer}>
            {/* Current Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Current Password</Text>
              <View style={[
                styles.inputContainer,
                errors.current_password ? styles.inputError : null
              ]}>
                <Ionicons name="lock-closed" size={20} color={errors.current_password ? "#ff4d4f" : "#666"} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={form.current_password}
                  onChangeText={(text) => handleChange('current_password', text)}
                  placeholder="Enter your current password"
                  placeholderTextColor="#aaa"
                  secureTextEntry={!showCurrentPassword}
                />
                <TouchableOpacity 
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={showCurrentPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color={errors.current_password ? "#ff4d4f" : "#666"} 
                  />
                </TouchableOpacity>
              </View>
              {errors.current_password ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={14} color="#ff4d4f" />
                  <Text style={styles.errorText}>{errors.current_password}</Text>
                </View>
              ) : null}
            </View>

            {/* New Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Password</Text>
              <View style={[
                styles.inputContainer,
                errors.new_password ? styles.inputError : null
              ]}>
                <Ionicons name="key" size={20} color={errors.new_password ? "#ff4d4f" : "#666"} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={form.new_password}
                  onChangeText={(text) => handleChange('new_password', text)}
                  placeholder="Enter your new password"
                  placeholderTextColor="#aaa"
                  secureTextEntry={!showNewPassword}
                />
                <TouchableOpacity 
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={showNewPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color={errors.new_password ? "#ff4d4f" : "#666"} 
                  />
                </TouchableOpacity>
              </View>
              
              {/* Password strength indicator */}
              {form.new_password ? (
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthBarContainer}>
                    {[1, 2, 3, 4].map((level) => (
                      <View 
                        key={level}
                        style={[
                          styles.strengthBar,
                          { 
                            backgroundColor: level <= passwordStrength.score 
                              ? passwordStrength.color 
                              : '#e0e0e0' 
                          }
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
                    {passwordStrength.label}
                  </Text>
                </View>
              ) : null}
              
              {errors.new_password ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={14} color="#ff4d4f" />
                  <Text style={styles.errorText}>{errors.new_password}</Text>
                </View>
              ) : (
                <Text style={styles.helperText}>
                  Password must be at least 8 characters with 1 uppercase letter, 1 number, and 1 special character.
                </Text>
              )}
            </View>

            {/* Confirm New Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm New Password</Text>
              <View style={[
                styles.inputContainer,
                errors.confirm_password ? styles.inputError : null
              ]}>
                <Ionicons name="key" size={20} color={errors.confirm_password ? "#ff4d4f" : "#666"} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={form.confirm_password}
                  onChangeText={(text) => handleChange('confirm_password', text)}
                  placeholder="Confirm your new password"
                  placeholderTextColor="#aaa"
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={showConfirmPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color={errors.confirm_password ? "#ff4d4f" : "#666"} 
                  />
                </TouchableOpacity>
              </View>
              {errors.confirm_password ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={14} color="#ff4d4f" />
                  <Text style={styles.errorText}>{errors.confirm_password}</Text>
                </View>
              ) : (
                form.confirm_password && form.new_password === form.confirm_password ? (
                  <View style={styles.matchContainer}>
                    <Ionicons name="checkmark-circle" size={14} color="#52c41a" />
                    <Text style={styles.matchText}>Passwords match</Text>
                  </View>
                ) : null
              )}
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            style={styles.changeButton} 
            onPress={handleSubmit} 
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Change Password</Text>
              </>
            )}
          </TouchableOpacity>
          
          {/* Cancel Button */}
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

export default VehicleownerChangePasswordScreen;

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
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
    fontWeight: 'bold',
    color: '#333',
  },
  container: {
    padding: 20,
    paddingBottom: 50,
  },
  
  // General Error
  generalErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff2f0',
    borderWidth: 1,
    borderColor: '#ffccc7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  generalErrorText: {
    color: '#ff4d4f',
    marginLeft: 8,
    flex: 1,
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
    height: 56,
  },
  inputError: {
    borderColor: '#ff4d4f',
    backgroundColor: '#fff2f0',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: '100%',
  },
  eyeIcon: {
    padding: 8,
  },
  
  // Error display
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginLeft: 4,
  },
  errorText: {
    color: '#ff4d4f',
    fontSize: 12,
    marginLeft: 4,
    flex: 1,
  },
  
  // Helper text
  helperText: {
    color: '#888',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  
  // Password match indicator
  matchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginLeft: 4,
  },
  matchText: {
    fontSize: 12,
    color: '#52c41a',
    marginLeft: 4,
  },
  
  // Password strength indicator
  strengthContainer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  strengthBarContainer: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 10,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    marginHorizontal: 2,
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '500',
  },
  
  // Buttons
  changeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BRAND_COLOR,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    height: 56,
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
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
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
});