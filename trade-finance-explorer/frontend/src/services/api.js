import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

// 1. Create a global Axios instance for standard JSON requests
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Add an interceptor to automatically attach the JWT Token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- AUTHENTICATION ---

export const loginUser = async (email, password) => {
  // We use native 'fetch' here to strictly control headers for OAuth2 form data
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);

  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error("Login failed: " + response.statusText);
  }

  return response.json();
};

export const registerUser = async (userData) => {
  const response = await api.post('/register', userData);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/users/me');
  return response.data;
};

// --- DOCUMENT MANAGEMENT ---

export const uploadDocument = async (formData) => {
  // We set Content-Type to undefined so the browser sets the correct Boundary for files
  const response = await api.post('/documents/upload', formData, {
    headers: { 'Content-Type': undefined }
  });
  return response.data;
};

export const getDocuments = async () => {
  const response = await api.get('/documents');
  return response.data;
};

export const getDocumentById = async (id) => {
  const response = await api.get(`/documents/${id}`);
  return response.data;
};

// --- LEDGER / BLOCKCHAIN ---

export const getLedger = async (docId) => {
  const response = await api.get(`/documents/${docId}/ledger`);
  return response.data;
};

export const addLedgerEntry = async (docId, action, metadata = {}) => {
  const response = await api.post(`/documents/${docId}/ledger`, {
    action: action,
    metadata_info: metadata
  });
  return response.data;
};

// --- TRANSACTIONS ---

export const createTransaction = async (data) => {
  const response = await api.post('/transactions', data);
  return response.data;
};

export const getTransactions = async () => {
  const response = await api.get('/transactions');
  return response.data;
};

export const updateTransactionStatus = async (id, status) => {
  const response = await api.put(`/transactions/${id}`, { status });
  return response.data;
};

// --- RISK & ANALYTICS ---

export const assessRisk = async (tradeId) => {
  const response = await api.post(`/risk/assess/${tradeId}`);
  return response.data;
};

export const getDashboardStats = async () => {
  const response = await api.get('/analytics/dashboard-stats');
  return response.data;
};

export const downloadTradeReport = async () => {
  const response = await api.get('/reports/export/transactions', {
    responseType: 'blob',
  });
  
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'trade_compliance_report.csv');
  document.body.appendChild(link);
  link.click();
  link.remove();
};

// --- ADMIN FUNCTIONS ---

export const getAllDocumentsAdmin = async () => {
  const response = await api.get('/admin/documents');
  return response.data;
};

export const deleteDocumentAdmin = async (id) => {
  const response = await api.delete(`/admin/documents/${id}`);
  return response.data;
};
// Get all users for admin
export const getAllUsersAdmin = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

// --- ADMIN USER MANAGEMENT ---

export const createUserAdmin = async (userData) => {
  const response = await api.post('/admin/users', userData);
  return response.data;
};

export const deleteUserAdmin = async (userId) => {
  const response = await api.delete(`/admin/users/${userId}`);
  return response.data;
};


// --- ADMIN AUDIT LOGS ---

export const getAuditLogs = async () => {
  const response = await api.get('/admin/audit-logs');
  return response.data;
};


export default api;