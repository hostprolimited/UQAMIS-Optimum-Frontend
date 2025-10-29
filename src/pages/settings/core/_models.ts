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
  institution?: {
    id: number;
    name: string;
    type: string;
    county: string;
    subcounty: string;
    ward: string;
    county_code: string;
    address: string;
    phone_number: string;
    latitude: any;
    longitude: any;
    email: string;
    status: string;
    boarding_type: string;
    total_students: number;
    total_teachers: string;
    gender_based: string;
    created_by: number;
    created_at: string;
    updated_at: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  gender?: string;
  institution_id?: number;
  county?: string;
  county_code?: string;
  phone?: string;
  password: string;
  role?: string;
  subcounty?: string;
  ward?: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  role?: string;
  status?: string;
  institution_id?: number;
  county?: string;
  subcounty?: string;
  ward?: string;
  gender?: string;
}

export interface Role {
  id: number;
  name: string;
  role_id?: number;
  role: string;
  guard_name?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Permission {
  id: number;
  name: string;
  guard_name?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePermissionInput {
  name: string;
}

export interface AssignPermissionRoleInput {
  permission_name: string;
  role_name: string;
  permission_id: number;
  role_id: number;
}

export interface AssignUserRoleInput {
  user_id: number;
  role_id: number;
  role_name: string;
}

export interface PendingTransfer {
  id: number;
  user_id: number;
  from_institution_id: number;
  to_institution_id: number;
  pending_transfer_id?: number;
  status: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
    role?: string;
  };
  from_institution?: {
    id: number;
    name: string;
  };
  to_institution?: {
    id: number;
    name: string;
  };
}