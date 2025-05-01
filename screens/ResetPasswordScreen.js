import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, StyleSheet } from 'react-native';
import axiosInstance from './axiosInstance';

const ResetPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email || !token || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const response = await axiosInstance.post('/reset-password', {
        email,
        token,
        password,
        password_confirmation: confirmPassword,
      });
      Alert.alert('Success', response.data.message);
      setEmail('');
      setToken('');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Reset Password</Text>
        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Reset Token" value={token} onChangeText={setToken} autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="New Password" value={password} onChangeText={setPassword} secureTextEntry />
        <TextInput style={styles.input} placeholder="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
        <TouchableOpacity style={styles.button} onPress={handleResetPassword} disabled={loading}>
          {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>Reset Password</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ResetPasswordScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  innerContainer: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
  input: { height: 50, borderColor: '#ccc', borderWidth: 1, borderRadius: 10, paddingHorizontal: 16, marginBottom: 20 },
  button: { backgroundColor: '#004aad', paddingVertical: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
