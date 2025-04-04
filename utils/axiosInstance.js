// utils/axiosInstance.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '../screens/config';

const axiosInstance = axios.create({
  baseURL: BACKEND_URL,
  timeout: 5000,
});

axiosInstance.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken'); // ✅ match 'authToken'
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
