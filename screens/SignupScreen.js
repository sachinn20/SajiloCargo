import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Animated,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { BACKEND_URL, BRAND_COLOR } from './config';

const SignupScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    name: '',
    phone_number: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'customer',
  });

  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: null });
  };

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const togglePasswordVisibility = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  const handleRoleSelect = (selectedRole) => {
    setForm({ ...form, role: selectedRole });
  };

  const validate = () => {
    let newErrors = {};

    if (!form.name) newErrors.name = 'Name is required';
    if (!form.email.includes('@gmail.com')) newErrors.email = 'Email must end with @gmail.com';
    if (!/^\d{10}$/.test(form.phone_number)) newErrors.phone_number = 'Phone must be exactly 10 digits';
    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(form.password)) {
      newErrors.password = 'Min 8 chars, 1 uppercase, 1 number & 1 symbol';
    }
    if (form.password !== form.password_confirmation)
      newErrors.password_confirmation = 'Passwords do not match';

    if (!agreed) newErrors.agreed = 'You must agree to terms';

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      triggerShake();
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/register`, form);
      Alert.alert('Success', 'Account created successfully!');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Signup Failed', error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView 
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerContainer}>
            <Text style={styles.header}>Create an account</Text>
            <Text style={styles.subheader}>Please fill in the details below to get started</Text>
          </View>

          <Animated.View style={[styles.formContainer, { transform: [{ translateX: shakeAnim }] }]}>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color="#777" style={styles.inputIcon} />
              <TextInput
                placeholder="Full Name"
                value={form.name}
                onChangeText={(text) => handleChange('name', text)}
                style={styles.input}
                placeholderTextColor="#999"
              />
            </View>
            {errors.name && <Text style={styles.error}>{errors.name}</Text>}

            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#777" style={styles.inputIcon} />
              <TextInput
                placeholder="Email Address"
                keyboardType="email-address"
                autoCapitalize="none"
                value={form.email}
                onChangeText={(text) => handleChange('email', text)}
                style={styles.input}
                placeholderTextColor="#999"
              />
            </View>
            {errors.email && <Text style={styles.error}>{errors.email}</Text>}

            <View style={styles.inputWrapper}>
              <Ionicons name="call-outline" size={20} color="#777" style={styles.inputIcon} />
              <TextInput
                placeholder="Phone Number"
                keyboardType="phone-pad"
                maxLength={10}
                value={form.phone_number}
                onChangeText={(text) => handleChange('phone_number', text.replace(/[^0-9]/g, ''))}
                style={styles.input}
                placeholderTextColor="#999"
              />
            </View>
            {errors.phone_number && <Text style={styles.error}>{errors.phone_number}</Text>}

            <View style={styles.passwordContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#777" style={styles.inputIcon} />
              <TextInput
                placeholder="Password"
                secureTextEntry={secureTextEntry}
                value={form.password}
                onChangeText={(text) => handleChange('password', text)}
                style={styles.passwordInput}
                placeholderTextColor="#999"
              />
              <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
                <Ionicons name={secureTextEntry ? 'eye-off-outline' : 'eye-outline'} size={20} color="#555" />
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.error}>{errors.password}</Text>}

            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#777" style={styles.inputIcon} />
              <TextInput
                placeholder="Confirm Password"
                secureTextEntry={secureTextEntry}
                value={form.password_confirmation}
                onChangeText={(text) => handleChange('password_confirmation', text)}
                style={styles.input}
                placeholderTextColor="#999"
              />
            </View>
            {errors.password_confirmation && (
              <Text style={styles.error}>{errors.password_confirmation}</Text>
            )}
          </Animated.View>

          <View style={styles.roleSection}>
            <Text style={styles.roleLabel}>Choose Role</Text>
            <View style={styles.roleRow}>
              <TouchableOpacity
                style={[styles.roleButton, form.role === 'customer' && styles.roleButtonSelected]}
                onPress={() => handleRoleSelect('customer')}
                activeOpacity={0.8}
              >
                <Ionicons 
                  name="person" 
                  size={20} 
                  color={form.role === 'customer' ? '#fff' : BRAND_COLOR} 
                  style={styles.roleIcon}
                />
                <Text style={[styles.roleText, form.role === 'customer' && styles.roleTextSelected]}>
                  Customer
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.roleButton, form.role === 'vehicle_owner' && styles.roleButtonSelected]}
                onPress={() => handleRoleSelect('vehicle_owner')}
                activeOpacity={0.8}
              >
                <Ionicons 
                  name="car" 
                  size={20} 
                  color={form.role === 'vehicle_owner' ? '#fff' : BRAND_COLOR} 
                  style={styles.roleIcon}
                />
                <Text
                  style={[styles.roleText, form.role === 'vehicle_owner' && styles.roleTextSelected]}
                >
                  Vehicle Owner
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.termsContainer}>
            <View style={styles.checkboxRow}>
              <TouchableOpacity
                onPress={() => {
                  setAgreed(!agreed);
                  setErrors({ ...errors, agreed: null });
                }}
                style={[styles.checkbox, agreed && styles.checkboxChecked]}
              >
                {agreed && <Ionicons name="checkmark" size={16} color="#fff" />}
              </TouchableOpacity>
              <Text style={styles.checkboxText}>
                By ticking this box, you agree to our{' '}
                <Text style={styles.link} onPress={() => navigation.navigate('Terms')}>
                  Terms and Conditions
                </Text>{' '}
                and{' '}
                <Text style={styles.link} onPress={() => navigation.navigate('Privacy')}>
                  Privacy Policy
                </Text>.
              </Text>

            </View>
            {errors.agreed && <Text style={styles.error}>{errors.agreed}</Text>}
          </View>

          <TouchableOpacity 
            style={[styles.signupBtn, loading && styles.signupBtnLoading]} 
            onPress={handleSignup} 
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.signupText}>Sign Up</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.signupIcon} />
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.bottomText}>
            Already have an account?{' '}
            <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
              Log In
            </Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    padding: 24,
    backgroundColor: '#fff',
    flexGrow: 1,
    justifyContent: 'center',
  },
  headerContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
    textAlign: 'center',
  },
  subheader: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
  },
  error: {
    color: '#ff6b6b',
    fontSize: 13,
    marginTop: -8,
    marginBottom: 16,
    marginLeft: 4,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    height: 56,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
  },
  eyeIcon: {
    padding: 8,
  },
  roleSection: {
    marginBottom: 24,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#444',
  },
  roleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: BRAND_COLOR,
    borderRadius: 12,
    marginHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleButtonSelected: {
    backgroundColor: BRAND_COLOR,
  },
  roleIcon: {
    marginRight: 8,
  },
  roleText: {
    color: BRAND_COLOR,
    fontWeight: '600',
    fontSize: 15,
  },
  roleTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  termsContainer: {
    marginBottom: 24,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: BRAND_COLOR,
    borderRadius: 6,
    marginRight: 12,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: BRAND_COLOR,
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  link: {
    color: BRAND_COLOR,
    fontWeight: '600',
  },
  signupBtn: {
    backgroundColor: BRAND_COLOR,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: BRAND_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  signupBtnLoading: {
    opacity: 0.8,
  },
  signupText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  signupIcon: {
    marginLeft: 8,
  },
  bottomText: {
    textAlign: 'center',
    fontSize: 15,
    color: '#555',
    marginBottom: 16,
  },
});