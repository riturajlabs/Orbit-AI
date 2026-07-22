import axios from 'axios';



const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});



let authToken = null;

export const setAuthToken = (token) => {
  authToken = token || null;

  if (authToken) {
    api.defaults.headers.common.Authorization = `Bearer ${authToken}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export const loadStoredAuthToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const storedToken = window.localStorage.getItem('ai-chatbot-token');

  if (storedToken) {
    setAuthToken(storedToken);
  }

  return storedToken;
};

export const clearAuthToken = () => {
  authToken = null;
  delete api.defaults.headers.common.Authorization;

  if (typeof window !== 'undefined') {
    window.localStorage.removeItem('ai-chatbot-token');
    window.localStorage.removeItem('ai-chatbot-user');
  }
};

api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }

  return config;
});

export const parseApiError = (error) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.response?.data?.error || error.message || 'Something went wrong';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong';
};

export const authApi = {
  login: (payload) => api.post('/auth/login', payload),
  register: (payload) => api.post('/auth/register', payload),
  logout: () => api.post('/auth/logout'),
};



export const chatApi = {
  getChats: () => api.get('/chats'),
  createChat: (payload) => api.post('/chats', payload),
  getChat: (chatId) => api.get(`/chats/${chatId}`),
  getChatMessages: (chatId) => api.get(`/chats/${chatId}/messages`),

  deleteChat: (chatId) => api.delete(`/chats/${chatId}`),

  renameChat: (chatId, title) =>
    api.patch(`/chats/${chatId}/rename`, {
      title,
    }),

  sendMessage: (payload) => api.post('/chats/message', payload),
  healthCheck: () => api.get('/health'),
};

export default api;
