const API_BASE = '/api';

function getAuthHeader() {
  const token = localStorage.getItem('boxfactory_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiRequest(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {})
  };

  // If body is FormData, delete Content-Type to let browser set boundary
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'خطای سرور' }));
    throw new Error(errorData.error || `خطا در ارتباط با سرور (${response.status})`);
  }

  return response.json();
}

export const api = {
  // Auth & Users
  login: (username, password) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  demoLogin: (role) => apiRequest(`/auth/demo-login/${role}`, { method: 'POST' }),
  getMe: () => apiRequest('/auth/me'),
  getUsers: () => apiRequest('/users'),
  createUser: (userData) => apiRequest('/users', { method: 'POST', body: JSON.stringify(userData) }),
  updateUser: (id, userData) => apiRequest(`/users/${id}`, { method: 'PUT', body: JSON.stringify(userData) }),
  deleteUser: (id) => apiRequest(`/users/${id}`, { method: 'DELETE' }),

  // Projects
  getProjects: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/projects${query ? `?${query}` : ''}`);
  },
  getProject: (id) => apiRequest(`/projects/${id}`),
  createProject: (data) => apiRequest('/projects', { method: 'POST', body: JSON.stringify(data) }),
  advanceStage: (id, stageData, comment) => apiRequest(`/projects/${id}/advance-stage`, { method: 'POST', body: JSON.stringify({ stageData, comment }) }),
  rejectStage: (id, targetStage, reason) => apiRequest(`/projects/${id}/reject-stage`, { method: 'POST', body: JSON.stringify({ targetStage, reason }) }),
  addComment: (id, message) => apiRequest(`/projects/${id}/comments`, { method: 'POST', body: JSON.stringify({ message }) }),
  addPurchaseOrder: (id, poData) => apiRequest(`/projects/${id}/purchase-orders`, { method: 'POST', body: JSON.stringify(poData) }),

  // Pricing & Materials
  calculatePrice: (specs) => apiRequest('/pricing-calculator', { method: 'POST', body: JSON.stringify(specs) }),
  getMaterials: () => apiRequest('/materials'),
  updateMaterialPrice: (id, data) => apiRequest(`/materials/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Migration & Bulk Import/Export
  parseMigrationFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest('/migration/parse-file', { method: 'POST', body: formData });
  },
  importCustomers: (items, overwrite = true) => apiRequest('/migration/import-customers', { method: 'POST', body: JSON.stringify({ items, overwrite }) }),
  importProjects: (items, overwrite = true) => apiRequest('/migration/import-projects', { method: 'POST', body: JSON.stringify({ items, overwrite }) }),
  importMaterials: (items, overwrite = true) => apiRequest('/migration/import-materials', { method: 'POST', body: JSON.stringify({ items, overwrite }) }),
  exportFullBackup: () => apiRequest('/migration/export-full'),
  restoreFullBackup: (backupData) => apiRequest('/migration/restore-full', { method: 'POST', body: JSON.stringify(backupData) }),
  clearDemoData: () => apiRequest('/migration/clear-demo-data', { method: 'POST' }),

  // Notifications & Alerts
  getNotifications: () => apiRequest('/notifications'),
  markNotificationRead: (id) => apiRequest(`/notifications/${id}/read`, { method: 'POST' }),
  markAllNotificationsRead: () => apiRequest('/notifications/read-all', { method: 'POST' }),
  getNotificationSettings: () => apiRequest('/settings/notifications'),
  updateNotificationSettings: (data) => apiRequest('/settings/notifications', { method: 'POST', body: JSON.stringify(data) }),
  testBaleNotification: (token, chatId) => apiRequest('/notifications/test-bale', { method: 'POST', body: JSON.stringify({ token, chatId }) }),

  // Customers & Analytics
  getCustomers: () => apiRequest('/customers'),
  createCustomer: (data) => apiRequest('/customers', { method: 'POST', body: JSON.stringify(data) }),
  getAnalytics: () => apiRequest('/analytics'),
  getSettings: () => apiRequest('/settings'),
  updateSettings: (data) => apiRequest('/settings', { method: 'PUT', body: JSON.stringify(data) }),

  // Upload
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest('/upload', { method: 'POST', body: formData });
  }
};
