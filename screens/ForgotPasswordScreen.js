import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, StyleSheet } from 'react-native';
import axiosInstance from './axiosInstance';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email.');
      return;
    }
    setLoading(true);
    try {
      const response = await axiosInstance.post('/forgot-password', { email });
      Alert.alert('Success', response.data.message);
      setEmail('');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Forgot Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.button} onPress={handleForgotPassword} disabled={loading}>
          {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>Send Reset Link</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  innerContainer: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
  input: { height: 50, borderColor: '#ccc', borderWidth: 1, borderRadius: 10, paddingHorizontal: 16, marginBottom: 24 },
  button: { backgroundColor: '#004aad', paddingVertical: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
