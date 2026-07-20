import axios from 'axios';
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';
let accessToken = null;
export const setAccessToken = token => {
  accessToken = token;
};
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  // send HttpOnly refresh cookie
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: attach Bearer token
api.interceptors.request.use(config => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Response interceptor: auto-refresh on 401
let isRefreshing = false;
let failQueue = [];
const processQueue = (error, token) => {
  failQueue.forEach(p => error ? p.reject(error) : p.resolve(token));
  failQueue = [];
};

api.interceptors.response.use(res => res, async error => {
  const original = error.config;
  // A 401 from the refresh/login/register endpoints themselves is an expected
  // "not logged in" outcome, not an "access token expired" outcome — trying to
  // refresh in response to a failed refresh causes an infinite request loop.
  const isAuthEndpoint = /\/auth\/(refresh|login|register)$/.test(original?.url || '');
  if (error.response?.status === 401 && !isAuthEndpoint && !original._retry) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failQueue.push({
          resolve,
          reject
        });
      }).then(token => {
        original.headers.Authorization = `Bearer ${token}`;
        original._retry = true;
        return api(original);
      });
    }
    original._retry = true;
    isRefreshing = true;
    try {
      const res = await axios.post(`${BASE_URL}/auth/refresh`, {}, {
        withCredentials: true
      });
      const newToken = res.data.accessToken;
      setAccessToken(newToken);
      processQueue(null, newToken);
      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch (err) {
      processQueue(err, null);
      setAccessToken(null);
      // Avoid a hard-reload loop: only force-navigate if we're not already on
      // a public/auth page (a silent refresh check on page load is expected
      // to fail here for logged-out visitors — that's not an error to redirect on).
      const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/'];
      if (!publicPaths.includes(window.location.pathname)) {
        window.location.href = '/login';
      }
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
  return Promise.reject(error);
});
export default api;