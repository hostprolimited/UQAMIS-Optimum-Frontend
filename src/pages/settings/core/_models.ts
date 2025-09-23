// User models for user management endpoints

export interface User {
  county: string;
  school: any;
  lastLogin: any;
  id: number;
  name: string;
  email: string;
  phone?: string;

  gender?: string;
  role?: string;
  status?: string;
  institution_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  gender?: string;
  institution_id?: number;
  county?: string;
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