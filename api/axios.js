import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://192.168.18.4:8000/api', // Replace with your IP
  headers: {
    'Content-Type': 'application/json',
  },
});

export default instance;
