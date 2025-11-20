import axios, { AxiosError, AxiosResponse } from 'axios';
import { tokenRenewalService } from './token-renewal.service';
import { environment } from '../../environments';

axios.defaults.withCredentials = true;

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

// Response interceptor to handle 401 errors
axios.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Skip token refresh for public routes and auth endpoints
    const publicRoutes = ['/signin', '/signup', '/verify-email'];
    const isPublicRoute = publicRoutes.some(route => window.location.pathname.includes(route));
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') || 
                          originalRequest.url?.includes('/auth/signup') ||
                          originalRequest.url?.includes('/auth/validate');

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't try to refresh tokens on public routes or auth endpoints
      if (isPublicRoute || isAuthEndpoint) {
        return Promise.reject(error);
      }

      if (originalRequest.url?.includes('/auth/refresh')) {
        // Don't redirect on public routes
        if (!isPublicRoute) {
          window.location.href = environment.homeUrl;
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          if (originalRequest) {
            originalRequest.withCredentials = true;
          }
          return axios(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const renewed = await tokenRenewalService.forceRenewal();
        if (renewed) {
          processQueue(null, 'token renewed');
          if (originalRequest) {
            originalRequest.withCredentials = true;
          }
          return axios(originalRequest);
        } else {
          processQueue(new Error('Token renewal failed'), null);
          // Don't redirect on public routes
          if (!isPublicRoute) {
            window.location.href = environment.homeUrl;
          }
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Don't redirect on public routes
        if (!isPublicRoute) {
          window.location.href = environment.homeUrl;
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 401 && originalRequest._retry) {
      // Don't redirect on public routes
      if (!isPublicRoute) {
        window.location.href = environment.homeUrl;
      }
    }

    return Promise.reject(error);
  }
);

export default axios;
