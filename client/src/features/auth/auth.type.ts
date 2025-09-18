// User interface
export interface User {
  id: number;
  name: string;
  email: string;
  profilePict: string;
  createdAt: string;
  updatedAt: string;
}

// Auth state interface
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}

// Auth response interface
export interface AuthResponse {
  status: string;
  data: {
    user: User;
    accessToken: string;
  };
}

// Request interfaces
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  profilePict: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface GoogleLoginRequest {
  code: string;
}

// User me response interface
export interface UserMeResponse {
  status: string;
  data: {
    user: User;
  };
}
