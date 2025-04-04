
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '../screens/config';

export const fetchAuthenticatedUser = async () => {
  const token = await AsyncStorage.getItem('authToken');

  if (!token) return null;

  try {
    const response = await axios.get(`${BACKEND_URL}/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data; // returns user object
  } catch (apiError) {
    console.error('API request to /user failed');
    if (apiError.response) {
      console.error('Response data:', apiError.response.data);
      console.error('Response status:', apiError.response.status);
      console.error('Response headers:', apiError.response.headers);
    } else if (apiError.request) {
      console.error('No response received:', apiError.request);
    } else {
      console.error('Error message:', apiError.message);
    }
    return null;
  }
};
