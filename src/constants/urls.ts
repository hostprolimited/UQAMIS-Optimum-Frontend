// API Base Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
export const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 30000;

export const Urls = {

// Authentication Endpoints
  LOGIN_URL: '/login',
  REFRESH_TOKEN_URL: '/auth/refresh-token',

  // onboard schools
   ONBOARD_SCHOOLS_URL: 'institutions/onboard',
   INSTITUTIONS_URL: '/institutions',
   INSTITUTION_DETAIL_URL: (id: number) => `/institutions/${id}`,

  // User Management Endpoints
  CREATE_USERS_URL: '/users/create',
  GET_USERS_URL: '/users',
  USER_DETAIL_URL: (id: number) => `/users/${id}`,
  UPDATE_USER_URL: (id: number) => `/users/${id}`,
  DELETE_USER_URL: (id: number) => `/users/${id}`,

  // Permissions Management Endpoints
  GET_PERMISSIONS_URL: '/permissions',
  CREATE_PERMISSION_URL: '/permissions/create',
  ASSIGN_PERMISSION_ROLE_URL: '/permissions/assign-to-role',
  ASSIGN_PERMISSION_USER_URL: '/permissions/assign-to-user',
  REMOVE_PERMISSION_URL: (id: number) => `/permissions/${id}/remove`, 
  UPDATE_PERMISSION_URL: (id: number) => `/permissions/${id}`,
  DELETE_PERMISSION_URL: (id: number) => `/permissions/${id}`,

  // roles management endpoints
  ROLES_URL: '/roles',
  CREATE_ROLE_URL: (id: number) => `/users/${id}/assign-role`,
  GET_USER_ROLES_URL: (id: number) => `/users/${id}/roles`,
  UPDATE_ROLE_URL: (id: number) => `/users/${id}/async-role`,
  DELETE_ROLE_URL: (id: number) => `/users/${id}/remove-role`,

}
