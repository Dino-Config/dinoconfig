import axios, { AxiosError, AxiosResponse } from 'axios';
import { tokenRenewalService } from './token-renewal.service';
import { environment } from '../../environments';

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

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes('/auth/refresh')) {
        console.log('Refresh token failed, redirecting to home...');
        window.location.href = environment.homeUrl;
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
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
          return axios(originalRequest);
        } else {
          processQueue(new Error('Token renewal failed'), null);
          window.location.href = environment.homeUrl;
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        window.location.href = environment.homeUrl;
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 401 && originalRequest._retry) {
      window.location.href = environment.homeUrl;
    }

    return Promise.reject(error);
  }
);

export default axios;
