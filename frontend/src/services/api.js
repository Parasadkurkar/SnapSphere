import axios from 'axios';


const API_URL = 'https://snapsphere-xiq0.onrender.com/api';

// Setup axios defaults
axios.defaults.baseURL = API_URL;

// Add token to requests if it exists
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// ==================== AUTH APIs ====================
export const register = (data) => axios.post('/auth/register', data);
export const login = (data) => axios.post('/auth/login', data);

// ==================== USER APIs ====================
export const getCurrentUser = () => axios.get('/users/current/user');
export const getUser = (userId) => axios.get(`/users/${userId}`);
export const getUserStats = (userId) => axios.get(`/users/${userId}/stats`);
export const followUser = (userId) => axios.post(`/users/${userId}/follow`);
export const updateProfile = async (data) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(
      'https://snapsphere-xiq0.onrender.comapi/users/update',
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response;
  } catch (error) {
    console.error('API Error updating profile:', error);
    throw error;
  }
};


// ==================== SEARCH API ====================
export const searchUsers = (query) => {
  return axios.get(`/users/search/query/${query}`);
};

// ==================== POST APIs ====================
export const getPosts = () => axios.get('/posts');
export const getUserPosts = (userId) => axios.get(`/posts/user/${userId}`);
export const getPost = (postId) => axios.get(`/posts/${postId}`);
export const createPost = (data) => axios.post('/posts', data);
export const likePost = (postId) => axios.post(`/posts/${postId}/like`);
export const unlikePost = (postId) => axios.post(`/posts/${postId}/unlike`);
export const addComment = (postId, text) => axios.post(`/posts/${postId}/comments`, { text });
export const deletePost = (postId) => axios.delete(`/posts/${postId}`);

// ==================== NOTIFICATION APIs ====================
export const getNotifications = () => axios.get('/notifications');
export const markNotificationAsRead = (notificationId) => 
  axios.put(`/notifications/${notificationId}/read`);
export const readAllNotifications = () => axios.put('/notifications/read-all');

// ==================== MESSAGE APIs ====================
export const getConversations = () => axios.get('/messages');
export const getConversation = (userId) => axios.get(`/messages/${userId}`);
export const sendMessage = (data) => axios.post('/messages', data);
export const deleteMessage = (messageId) => axios.delete(`/messages/${messageId}`);


// ==================== AUTH TOKEN HELPER ====================
export const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete axios.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

export default axios;
