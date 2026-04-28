import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Add JWT token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getProfile: () => API.get('/auth/profile'),
};

// Events
export const eventAPI = {
  getAll: (params) => API.get('/events', { params }),
  getById: (id) => API.get(`/events/${id}`),
  getCategories: () => API.get('/events/categories'),
  create: (data) => API.post('/events', data),
};

// Bookings
export const bookingAPI = {
  create: (data) => API.post('/bookings', data),
  getAll: () => API.get('/bookings'),
  getById: (id) => API.get(`/bookings/${id}`),
  cancel: (id) => API.delete(`/bookings/${id}`),
  getBookedSeats: (eventId) => API.get(`/bookings/seats/${eventId}`),
};

// Payments
export const paymentAPI = {
  process: (data) => API.post('/payments', data),
  getByBooking: (bookingId) => API.get(`/payments/${bookingId}`),
};

export default API;
