const API_URL = 'http://192.168.18.4:8000/api'; // update this

const apiRequest = async (endpoint, method = 'GET', body = null, token = null) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const options = {
    method,
    headers,
    ...(body && { body: JSON.stringify(body) }),
  };

  const response = await fetch(`${API_URL}/${endpoint}`, options);
  const data = await response.json();

  if (!response.ok) throw new Error(data.message || 'Something went wrong');
  return data;
};

export default apiRequest;
