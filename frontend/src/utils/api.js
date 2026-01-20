import axios from 'axios';

const API_URL = 'http://localhost:8080/api/v1';

export const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const authAPI = {
  register: (username, email, password) =>
    api.post('auth/register', { username, email, password }),
  login: (username, email, password) =>
    api.post('auth/login', { username, email, password }),
};

// Room endpoints
export const roomAPI = {
  createRoom: (roomName) =>
    api.post('room', { roomName }),
  getRooms: () =>
    api.get('room'),
};

// Message endpoints
export const messageAPI = {
  getRoomMessages: (roomId) =>
    api.get(`message/${roomId}`),
};
