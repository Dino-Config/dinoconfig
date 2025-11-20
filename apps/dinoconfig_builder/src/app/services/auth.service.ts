import axios from '../auth/axios-interceptor';
import { environment } from '../../environments';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  company: string;
}

export interface AuthResponse {
  access_token: string;
  id_token: string;
  expires_in: number;
  token_type: string;
}

class AuthService {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>(
      `${environment.apiUrl}/auth/login`,
      { email, password },
      { withCredentials: true }
    );
    return response.data;
  }

  async signup(userData: SignupRequest): Promise<AuthResponse> {
    // First signup
    await axios.post(`${environment.apiUrl}/auth/signup`, userData);
    
    // Then login
    const response = await axios.post<AuthResponse>(
      `${environment.apiUrl}/auth/login`,
      {
        email: userData.email,
        password: userData.password,
      },
      { withCredentials: true }
    );
    return response.data;
  }

  async forgotPassword(email: string): Promise<any> {
    const response = await axios.post(`${environment.apiUrl}/auth/forgot-password`, { email });
    return response.data;
  }
}

export const authService = new AuthService();

