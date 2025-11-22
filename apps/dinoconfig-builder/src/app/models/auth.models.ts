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

