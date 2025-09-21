export interface LoginUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'school_admin' | 'agent' | 'ministry_admin';
  institution_id?: number;
  county_code?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  user: LoginUser;
  token: string;
  message: string;
  dashboard: string;
}