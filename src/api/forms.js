import axios from "axios";
const API_BASE = import.meta.env.VITE_API_BASE_URL ;

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Authentication failed. Please login again.');
      // Optionally redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const adminFormsAPI = {
  getAll: () => apiClient.get('/admin/forms'),
  create: (data) => apiClient.post('/admin/forms', data),
  update: (id, data) => apiClient.put(`/admin/forms/${id}`, data),
  delete: (id) => apiClient.delete(`/admin/forms/${id}`),
};

export const formSubmissionsAPI = {
  getAll: () => apiClient.get('/admin/form-submissions'),
  getById: (id) => apiClient.get(`/admin/form-submissions/${id}`),
  updateStatus: (id, status) => apiClient.put(`/admin/form-submissions/${id}/status`, { status }),
  updateNotes: (id, notes) => apiClient.put(`/admin/form-submissions/${id}/notes`, { admin_notes: notes }),
  sendWhatsApp: (id) => apiClient.post(`/admin/form-submissions/${id}/send-whatsapp`),
};
