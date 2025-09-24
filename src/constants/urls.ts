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

   // Facilities Endpoints
   FACILITIES_URL: '/facilities',
   CREATE_FACILITY_URL: '/facilities/create',
   GET_FACILITY_URL: (id: number) => `/facilities/${id}`,
   UPDATE_FACILITY_URL: (id: number) => `/facilities/${id}`,
   DELETE_FACILITY_URL: (id: number) => `/facilities/${id}`,
  // Maintenance Endpoints
  CREATE_MAINTENANCE_REPORT_URL: '/maintenance/create',
  GET_MAINTENANCE_REPORT_URL: '/maintenance',
  GET_MAINTENANCE_REPORT_BY_ID_URL: (id: number) => `/maintenance/${id}`,
  UPDATE_MAINTENANCE_REPORT_URL: (id: number) => `/maintenance/${id}`,
  DELETE_MAINTENANCE_REPORT_URL: (id: number) => `/maintenance/${id}`,
  MAINTENANCE_ASSESSMENT: '/maintenance/create',
  // User Management Endpoints
  CREATE_USERS_URL: '/users/create',
  GET_USERS_URL: '/users',
  USER_DETAIL_URL: (id: number) => `/users/${id}`,
  UPDATE_USER_URL: (id: number) => `/users/${id}`,
  DELETE_USER_URL: (id: number) => `/users/${id}`,

  // Roles & permission  Management Endpoints
  GET_PERMISSIONS_URL: '/permissions',
  GET_USER_ROLE: (id: number) => `/users/${id}/role`,
  ASSIGN_USER_ROLE_URL: (id: number) => `/users/${id}/assign-role`,
  CREATE_PERMISSION_URL: '/permissions/create',
  ASSIGN_PERMISSION_ROLE_URL: '/permissions/assign-to-role',
  UPDATE_ROLE_URL: (id: number) => `/sync-role/${id}`,
  DELETE_ROLE_URL: (id: number) => `/remove-role/${id}`,
  

}
