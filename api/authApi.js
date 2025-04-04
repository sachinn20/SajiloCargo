import axios from './axios';

export const registerUser = async (userData) => {
  try {
    const response = await axios.post('/register', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Registration failed' };
  }
};
