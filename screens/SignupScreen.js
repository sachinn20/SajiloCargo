import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { BACKEND_URL, BRAND_COLOR } from './config'; // adjust path if needed

const SignupScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    name: '',
    phone_number: '', // ✅ Correct key
    email: '',
    password: '',
    password_confirmation: '',
    role: 'customer',
  });

  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [agreed, setAgreed] = useState(false);

  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const togglePasswordVisibility = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  const handleRoleSelect = (selectedRole) => {
    setForm({ ...form, role: selectedRole });
  };

  const handleSignup = async () => {
    if (!agreed) {
      return Alert.alert('Terms Required', 'Please agree to the terms and conditions');
    }

    try {
      const response = await axios.post(`${BACKEND_URL}/register`, form);
      console.log(response.data);
      Alert.alert('Success', 'Account created successfully!');
      navigation.navigate('Login');
    } catch (error) {
      console.log(error.response?.data || error.message);
      Alert.alert('Signup Failed', error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Create an account</Text>

      <TextInput
        placeholder="Full Name"
        value={form.name}
        onChangeText={(text) => handleChange('name', text)}
        style={styles.input}
      />

      <TextInput
        placeholder="Phone Number"
        keyboardType="phone-pad"
        value={form.phone_number}
        onChangeText={(text) => handleChange('phone_number', text)}
        style={styles.input}
      />

      <TextInput
        placeholder="Email Address"
        keyboardType="email-address"
        autoCapitalize="none"
        value={form.email}
        onChangeText={(text) => handleChange('email', text)}
        style={styles.input}
      />

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

      <TextInput
        placeholder="Confirm Password"
        secureTextEntry={secureTextEntry}
        value={form.password_confirmation}
        onChangeText={(text) => handleChange('password_confirmation', text)}
        style={styles.input}
      />

      <Text style={styles.roleLabel}>Choose Role</Text>
      <View style={styles.roleRow}>
        <TouchableOpacity
          style={[
            styles.roleButton,
            form.role === 'customer' && styles.roleButtonSelected,
          ]}
          onPress={() => handleRoleSelect('customer')}
        >
          <Text
            style={[
              styles.roleText,
              form.role === 'customer' && styles.roleTextSelected,
            ]}
          >
            Customer
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.roleButton,
            form.role === 'vehicle_owner' && styles.roleButtonSelected,
          ]}
          onPress={() => handleRoleSelect('vehicle_owner')}
        >
          <Text
            style={[
              styles.roleText,
              form.role === 'vehicle_owner' && styles.roleTextSelected,
            ]}
          >
            Vehicle Owner
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.checkboxRow}>
        <TouchableOpacity
          onPress={() => setAgreed(!agreed)}
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

      <TouchableOpacity style={styles.signupBtn} onPress={handleSignup}>
        <Text style={styles.signupText}>Sign Up</Text>
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
  passwordContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 14,
    alignItems: 'center',
    marginBottom: 16,
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
    marginBottom: 8,
    color: '#444',
  },
  roleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
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
    marginBottom: 24,
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

export default SignupScreen;
