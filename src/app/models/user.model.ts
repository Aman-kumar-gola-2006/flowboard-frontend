export interface User {
  id: number;
  email: string;
  username: string;
  fullName: string;
  avatarUrl?: string;
  role: 'MEMBER' | 'ADMIN';
  isPro: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface LoginRequest {
  emailOrUsername: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  isPro: boolean;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  username: string;
  password: string;
}

export interface MessageResponse {
  message: string;
  success: boolean;
}
