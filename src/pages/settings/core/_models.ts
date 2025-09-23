// User models for user management endpoints

export interface User {
  county: string;
  school: any;
  lastLogin: any;
  id: number;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role?: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  role?: string;
  status?: string;
}

export interface Role {
  id: number;
  name: string;
}

export interface Permission {
  id: number;
  name: string;
}