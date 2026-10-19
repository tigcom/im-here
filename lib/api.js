/**
 * IM-HERE Unified Backend API Client
 * Kết nối với Spring Boot Backend (Java 21 + PostgreSQL 16)
 */

// Keep browser requests same-origin by default; Next.js proxies /api/* to Spring Boot.
// Set NEXT_PUBLIC_API_URL only when the API must be called directly from the browser.
const rawApiUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');
const API_BASE_URL = rawApiUrl
  ? (rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`)
  : '/api';

class ApiClient {
  constructor() {
    this.token = null;
    this.cache = new Map();
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('imhere_jwt_token');
    }
  }

  setToken(token) {
    this.token = token;
    this.clearCache();
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('imhere_jwt_token', token);
      } else {
        localStorage.removeItem('imhere_jwt_token');
      }
    }
  }

  clearCache() {
    this.cache.clear();
  }

  getToken() {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('imhere_jwt_token');
    }
    return this.token;
  }

  async request(endpoint, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    const isGet = method === 'GET';
    const cacheKey = `${method}:${endpoint}:${this.getToken() || 'anon'}`;

    // 1. In-memory TTL Cache (10s) cho GET requests để loại bỏ hoàn toàn round-trip lặp lại
    if (isGet && !options.skipCache) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < 10000) {
        return cached.data;
      }
    }

    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = this.getToken();
    const isPublicAuth = endpoint.includes('/auth/login') || endpoint.includes('/auth/register');
    if (token && !isPublicAuth) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // 2. Abort timeout tránh request treo lâu quá 6s
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || 6000);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg = data?.message || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMsg);
      }

      // Lưu cache nếu là GET request
      if (isGet) {
        this.cache.set(cacheKey, { timestamp: Date.now(), data });
      } else {
        // Nếu là POST/PUT/DELETE, xoá cache để đảm bảo dữ liệu mới nhất
        this.clearCache();
      }

      return data;
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        console.warn(`API Timeout [${endpoint}] sau 6000ms`);
      } else {
        console.error(`API Error [${endpoint}]:`, err);
      }
      throw err;
    }
  }

  // ── Authentication ──
  auth = {
    login: async (email, password) => {
      const res = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (res?.data?.token) {
        this.setToken(res.data.token);
      }
      return res?.data;
    },

    register: async (payload) => {
      const res = await this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res?.data?.token) {
        this.setToken(res.data.token);
      }
      return res?.data;
    },

    me: async () => {
      const res = await this.request('/auth/me');
      return res?.data;
    },

    logout: () => {
      this.setToken(null);
    },
  };

  // ── Tasks & Geo Matching ──
  tasks = {
    getAll: async (status = null) => {
      const query = status ? `?status=${status}` : '';
      const res = await this.request(`/tasks${query}`);
      return res?.data || [];
    },

    getNearby: async (lat, lng, radiusKm = 10) => {
      const res = await this.request(`/tasks/nearby?lat=${lat}&lng=${lng}&radiusKm=${radiusKm}`);
      return res?.data || [];
    },

    getById: async (id, lat = null, lng = null) => {
      let query = '';
      if (lat !== null && lng !== null) {
        query = `?lat=${lat}&lng=${lng}`;
      }
      const res = await this.request(`/tasks/${id}${query}`);
      return res?.data;
    },

    create: async (taskData) => {
      const res = await this.request('/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });
      return res?.data;
    },

    accept: async (taskId) => {
      const res = await this.request(`/tasks/${taskId}/accept`, {
        method: 'POST',
      });
      return res?.data;
    },

    cancel: async (taskId) => {
      const res = await this.request(`/tasks/${taskId}/cancel`, {
        method: 'POST',
      });
      return res?.data;
    },

    getMyCreated: async () => {
      const res = await this.request('/tasks/my-created');
      return res?.data || [];
    },

    getMyAssigned: async () => {
      const res = await this.request('/tasks/my-assigned');
      return res?.data || [];
    },
    checkIn: async (taskId, lat, lng) => {
      const res = await this.request(`/tasks/${taskId}/check-in?latitude=${lat}&longitude=${lng}`, {
        method: 'POST',
      });
      return res?.data;
    },
  };

  // ── Wallet & Payment ──
  wallet = {
    getMyWallet: async () => {
      const res = await this.request('/wallet/my-wallet');
      return res?.data;
    },

    getTransactions: async () => {
      const res = await this.request('/wallet/transactions');
      return res?.data || [];
    },

    deposit: async (amount, description = 'Nạp tiền vào ví') => {
      const res = await this.request('/wallet/deposit', {
        method: 'POST',
        body: JSON.stringify({ amount, description }),
      });
      return res?.data;
    },

    withdraw: async (payload, bankInfo = {}) => {
      let body;
      if (typeof payload === 'object' && payload !== null && 'amount' in payload) {
        body = payload;
      } else {
        const amount = payload;
        const info = bankInfo || {};
        body = {
          amount,
          bankName: info.bankName || '',
          accountNumber: info.accountNumber || '',
          accountHolder: info.accountHolder || '',
        };
      }
      const res = await this.request('/wallet/withdraw', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      return res?.data;
    },
  };

  // ── Realtime Chat ──
  chat = {
    sendMessage: async (taskId, content) => {
      const res = await this.request(`/tasks/${taskId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
      return res?.data;
    },
    getMessages: async (taskId) => {
      const res = await this.request(`/tasks/${taskId}/messages`, { skipCache: true });
      return res?.data || [];
    },
  };

  // ── Two-way Reviews ──
  reviews = {
    create: async (taskId, payload) => {
      const res = await this.request(`/reviews/tasks/${taskId}`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return res?.data;
    },
    getByTask: async (taskId) => {
      const res = await this.request(`/reviews/tasks/${taskId}`);
      return res?.data || [];
    },
  };

  // ── Notifications ──
  notifications = {
    getAll: async () => {
      const res = await this.request('/notifications', { skipCache: true });
      return res?.data || [];
    },
    markAllRead: async () => {
      const res = await this.request('/notifications/read-all', { method: 'POST' });
      return res?.data;
    },
    markRead: async (notificationId) => {
      const res = await this.request(`/notifications/${notificationId}/read`, { method: 'PATCH' });
      return res?.data;
    },
  };

  // ── User Profile & Reputation ──
  users = {
    getMyProfile: async () => {
      const res = await this.request('/users/profile/me');
      return res?.data;
    },
    updateProfile: async (data) => {
      const res = await this.request('/users/profile/me', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return res?.data;
    },
    getProfile: async (id) => {
      const res = await this.request(`/users/profile/${id}`);
      return res?.data;
    },
    submitKyc: async (payload) => {
      const { frontUrl, backUrl, faceUrl, idCardNumber } = payload;
      const query = `frontUrl=${encodeURIComponent(frontUrl || '')}&backUrl=${encodeURIComponent(backUrl || '')}&faceUrl=${encodeURIComponent(faceUrl || '')}&idCardNumber=${encodeURIComponent(idCardNumber || '')}`;
      const res = await this.request(`/users/kyc/submit?${query}`, { method: 'POST' });
      return res?.data;
    },
  };

  // ── Evidence & QA Review ──
  evidence = {
    submit: async (taskId, data) => {
      const res = await this.request(`/tasks/${taskId}/submit`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return res?.data;
    },

    getByTaskId: async (taskId) => {
      const res = await this.request(`/tasks/${taskId}/evidences`);
      return res?.data || [];
    },

    review: async (evidenceId, reviewData) => {
      const res = await this.request(`/evidences/${evidenceId}/review`, {
        method: 'POST',
        body: JSON.stringify(reviewData),
      });
      return res?.data;
    },

    getPending: async () => {
      const res = await this.request('/evidences/pending');
      return res?.data || [];
    },
  };

  // ── File Upload ──
  // ── Secure File & Media Upload ──
  upload = {
    file: async (file, options = {}) => {
      const formData = new FormData();
      formData.append('file', file);
      if (options.purpose) {
        formData.append('purpose', options.purpose);
      }
      if (options.taskId) {
        formData.append('taskId', options.taskId);
      }
      const url = `${API_BASE_URL}/upload`;
      const headers = {};
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.message || 'Lỗi tải tệp lên');
      }
      const fileData = data?.data;
      if (fileData && fileData.url) {
        fileData.fullUrl = this.getFileUrl(fileData.url);
      }
      return fileData;
    },
  };

  media = {
    getSignedUrl: async (mediaId) => {
      const res = await this.request(`/media/${mediaId}/signed-url`, { skipCache: true });
      return res?.data?.url;
    },
  };

  getFileUrl(path) {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') || path.startsWith('blob:')) {
      return path;
    }
    const base = API_BASE_URL.replace(/\/api$/, '');
    if (path.startsWith('/')) {
      return `${base}${path}`;
    }
    return `${base}/${path}`;
  }

  // ── Admin & System Stats ──
  admin = {
    getStats: async () => {
      const res = await this.request('/admin/stats');
      return res?.data;
    },

    getUsers: async () => {
      const res = await this.request('/admin/users');
      return res?.data || [];
    },

    updateUserStatus: async (userId, status) => {
      const res = await this.request(`/admin/users/${userId}/status?status=${status}`, {
        method: 'PATCH',
      });
      return res?.data;
    },

    reviewKyc: async (userId, status, reason = '') => {
      const query = reason ? `&rejectionReason=${encodeURIComponent(reason)}` : '';
      const res = await this.request(`/admin/users/${userId}/kyc/review?status=${status}${query}`, {
        method: 'POST',
      });
      return res?.data;
    },

    getPendingWithdrawals: async () => {
      const res = await this.request('/admin/withdrawals/pending');
      return res?.data || [];
    },

    reviewWithdrawal: async (transactionId, approved, note = '') => {
      const query = `approved=${approved}${note ? `&note=${encodeURIComponent(note)}` : ''}`;
      const res = await this.request(`/admin/withdrawals/${transactionId}/review?${query}`, { method: 'POST' });
      return res?.data;
    },
  };
}

export const api = new ApiClient();
export default api;
