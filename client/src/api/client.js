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
    if (response.status === 403 && (errorData.error === 'LICENSE_LOCKED' || errorData.code === 'LICENSE_LOCKED')) {
      window.dispatchEvent(new CustomEvent('license_locked', { detail: errorData }));
    }
    const err = new Error(errorData.error || errorData.message || `خطا در ارتباط با سرور (${response.status})`);
    err.status = response.status;
    err.data = errorData;
    throw err;
  }

  return response.json();
}

export const api = {
  // AI Packaging Assistant
  aiParsePrompt: (prompt) => apiRequest('/ai/parse-prompt', { method: 'POST', body: JSON.stringify({ prompt }) }),
  aiOptimizeNesting: (data) => apiRequest('/ai/optimize-nesting', { method: 'POST', body: JSON.stringify(data) }),
  aiPreflightAudit: (specs) => apiRequest('/ai/preflight-audit', { method: 'POST', body: JSON.stringify(specs) }),
  aiGetKnowledgeBase: () => apiRequest('/ai/knowledge-base'),

  // Parametric Dieline & Montage
  generateDieline: (data) => apiRequest('/dieline/generate', { method: 'POST', body: JSON.stringify(data) }),
  generateDielineMontage: (data) => apiRequest('/dieline/montage', { method: 'POST', body: JSON.stringify(data) }),

  // Production Orders (دستور تولید ۳ رنگ)
  getProductionOrders: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/production-orders${query ? `?${query}` : ''}`);
  },
  createProductionOrder: (data) => apiRequest('/production-orders', { method: 'POST', body: JSON.stringify(data) }),
  updateProductionOrderStatusColor: (id, data) => apiRequest(`/production-orders/${id}/status-color`, { method: 'PUT', body: JSON.stringify(data) }),
  updateProductionOrder: (id, data) => apiRequest(`/production-orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Warehouse Receipts (انبار ۶ گانه)
  getWarehouseReceipts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/warehouse-receipts${query ? `?${query}` : ''}`);
  },
  createWarehouseReceipt: (data) => apiRequest('/warehouse-receipts', { method: 'POST', body: JSON.stringify(data) }),
  updateWarehouseStatusColor: (id, data) => apiRequest(`/warehouse-receipts/${id}/status-color`, { method: 'PUT', body: JSON.stringify(data) }),

  // Digital Print Orders (چاپ دیجیتال)
  getDigitalOrders: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/digital-orders${query ? `?${query}` : ''}`);
  },
  createDigitalOrder: (data) => apiRequest('/digital-orders', { method: 'POST', body: JSON.stringify(data) }),
  updateDigitalOrderStatusColor: (id, data) => apiRequest(`/digital-orders/${id}/status-color`, { method: 'PUT', body: JSON.stringify(data) }),

  // Toll Service Orders (خدمات کارمزدی)
  getServiceOrders: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/service-orders${query ? `?${query}` : ''}`);
  },
  createServiceOrder: (data) => apiRequest('/service-orders', { method: 'POST', body: JSON.stringify(data) }),
  updateServiceOrderStatusColor: (id, data) => apiRequest(`/service-orders/${id}/status-color`, { method: 'PUT', body: JSON.stringify(data) }),

  // Marketing Leads (بخش بازاریاب و استعلامات)
  getMarketingLeads: () => apiRequest('/marketing/leads'),
  createMarketingLead: (data) => apiRequest('/marketing/leads', { method: 'POST', body: JSON.stringify(data) }),
  estimateMarketingLead: (id, data) => apiRequest(`/marketing/leads/${id}/estimate`, { method: 'PUT', body: JSON.stringify(data) }),
  updateMarketingLeadStatus: (id, data) => apiRequest(`/marketing/leads/${id}/status`, { method: 'PUT', body: JSON.stringify(typeof data === 'string' ? { status: data } : data) }),
  addMarketingLeadFollowup: (id, data) => apiRequest(`/marketing/leads/${id}/followup`, { method: 'POST', body: JSON.stringify(data) }),
  convertMarketingLeadToProject: (id) => apiRequest(`/marketing/leads/${id}/convert-to-project`, { method: 'POST' }),
  getMarketerTargetStats: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiRequest(`/marketing/target-stats${q ? `?${q}` : ''}`);
  },
  updateMarketerTarget: (userId, data) => apiRequest(`/marketing/targets/${userId}`, { method: 'PUT', body: JSON.stringify(data) }),

  // License Management
  getLicenseStatus: () => apiRequest('/license/status'),
  activateLicense: (licenseKey) => apiRequest('/license/activate', { method: 'POST', body: JSON.stringify({ licenseKey }) }),
  deactivateLicense: () => apiRequest('/license/deactivate', { method: 'POST' }),
  generateLicense: (data) => apiRequest('/license/generate', { method: 'POST', body: JSON.stringify(data) }),

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
  testCustomerSms: (data) => apiRequest('/notifications/test-sms', { method: 'POST', body: JSON.stringify(data) }),

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
