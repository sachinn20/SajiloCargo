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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Create an account</Text>

      <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
        <TextInput
          placeholder="Full Name"
          value={form.name}
          onChangeText={(text) => handleChange('name', text)}
          style={styles.input}
        />
        {errors.name && <Text style={styles.error}>{errors.name}</Text>}

        <TextInput
          placeholder="Email Address"
          keyboardType="email-address"
          autoCapitalize="none"
          value={form.email}
          onChangeText={(text) => handleChange('email', text)}
          style={styles.input}
        />
        {errors.email && <Text style={styles.error}>{errors.email}</Text>}

        <TextInput
          placeholder="Phone Number"
          keyboardType="phone-pad"
          maxLength={10}
          value={form.phone_number}
          onChangeText={(text) => handleChange('phone_number', text.replace(/[^0-9]/g, ''))}
          style={styles.input}
        />
        {errors.phone_number && <Text style={styles.error}>{errors.phone_number}</Text>}

        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Password"
            secureTextEntry={secureTextEntry}
            value={form.password}
            onChangeText={(text) => handleChange('password', text)}
            style={styles.passwordInput}
          />
          <TouchableOpacity onPress={togglePasswordVisibility}>
            <Ionicons name={secureTextEntry ? 'eye-off' : 'eye'} size={20} color="#555" />
          </TouchableOpacity>
        </View>
        {errors.password && <Text style={styles.error}>{errors.password}</Text>}

        <TextInput
          placeholder="Confirm Password"
          secureTextEntry={secureTextEntry}
          value={form.password_confirmation}
          onChangeText={(text) => handleChange('password_confirmation', text)}
          style={styles.input}
        />
        {errors.password_confirmation && (
          <Text style={styles.error}>{errors.password_confirmation}</Text>
        )}
      </Animated.View>

      <Text style={styles.roleLabel}>Choose Role</Text>
      <View style={styles.roleRow}>
        <TouchableOpacity
          style={[styles.roleButton, form.role === 'customer' && styles.roleButtonSelected]}
          onPress={() => handleRoleSelect('customer')}
        >
          <Text style={[styles.roleText, form.role === 'customer' && styles.roleTextSelected]}>
            Customer
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleButton, form.role === 'vehicle_owner' && styles.roleButtonSelected]}
          onPress={() => handleRoleSelect('vehicle_owner')}
        >
          <Text
            style={[styles.roleText, form.role === 'vehicle_owner' && styles.roleTextSelected]}
          >
            Vehicle Owner
          </Text>
        </TouchableOpacity>
      </View>

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
          <Text style={styles.link}>Terms and conditions</Text> and{' '}
          <Text style={styles.link}>privacy policy</Text>
        </Text>
      </View>
      {errors.agreed && <Text style={styles.error}>{errors.agreed}</Text>}

      <TouchableOpacity style={styles.signupBtn} onPress={handleSignup} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.signupText}>Sign Up</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.bottomText}>
        Already have an account?{' '}
        <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
          Sign in
        </Text>
      </Text>
    </ScrollView>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 6,
    marginBottom: 16,
    fontSize: 15,
    backgroundColor: '#fff',
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
  passwordContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 14,
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
    color: '#444',
  },
  roleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: BRAND_COLOR,
    borderRadius: 6,
    marginRight: 10,
    alignItems: 'center',
  },
  roleButtonSelected: {
    backgroundColor: BRAND_COLOR,
  },
  roleText: {
    color: BRAND_COLOR,
    fontWeight: '500',
  },
  roleTextSelected: {
    color: '#fff',
    fontWeight: '500',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: BRAND_COLOR,
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: BRAND_COLOR,
  },
  checkboxText: {
    flex: 1,
    fontSize: 13,
    color: '#444',
  },
  link: {
    color: BRAND_COLOR,
    fontWeight: '600',
  },
  signupBtn: {
    backgroundColor: BRAND_COLOR,
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 16,
  },
  signupText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  bottomText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#555',
  },
});
