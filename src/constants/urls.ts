// API Base Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
export const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 30000;

export const Urls = {

// Authentication Endpoints
  LOGIN_URL: '/login',
  REFRESH_TOKEN_URL: '/auth/refresh-token',

  // onboard schools
   ONBOARD_SCHOOLS_URL: 'institutions/onboard',
   INSTITUTIONS_URL: '/institutions/list',
   INSTITUTION_DETAIL_URL: (id: number) => `/institutions/${id}`,

    // Institutions metrics Endpoints
   INSTITUTIONS_METRICS_URL: '/institutions/metrics/list',
   CREATE_INSTITUTION_METRICS_URL: '/institutions/metrics/create',
   UPDATE_INSTITUTION_METRICS_URL: (id: number) => `/institutions/metrics/update`,
   DELETE_INSTITUTION_METRICS_URL: (id: number) => `/institutions/metrics/${id}`,
   UPDATE_ASSESSMENT_URL: (id: number) => `/institutions/metrics/assessment/${id}`,
   DELETE_ASSESSMENT_URL: (id: number) => `/institutions/metrics/assessment/${id}`,

   // Facilities Endpoints
   FACILITIES_URL: '/facilities/list',
   CREATE_FACILITY_URL: '/facilities/create',
   GET_FACILITY_URL: (id: number) => `/facilities/${id}`,
   UPDATE_FACILITY_URL: (id: number) => `/facilities/${id}`,
   DELETE_FACILITY_URL: (id: number) => `/facilities/${id}`,


  // Maintenance Endpoints
  CREATE_MAINTENANCE_REPORT_URL: '/maintenance/create',
  GET_MAINTENANCE_REPORT_URL: '/maintenance/list',
  GET_MAINTENANCE_REPORT_BY_ID_URL: (id: number) => `/maintenance/${id}`,
  UPDATE_MAINTENANCE_REPORT_URL: (id: number) => `/maintenance/${id}`,
  DELETE_MAINTENANCE_REPORT_URL: (id: number) => `/maintenance/${id}`,
  MAINTENANCE_ASSESSMENT: '/maintenance/create',
  AGENT_REVIEW_MAINTENANCE_ASSESSMENT: (id: number) => `/maintenance/review/${id}`,

  //safety Endpoints
  CREATE_SAFETY_REPORT_URL: '/safety/create',
  GET_SAFETY_REPORT_URL: '/safety/list',
  GET_SAFETY_REPORT_BY_ID_URL: (id: number) => `/safety/${id}`,
  UPDATE_SAFETY_REPORT_URL: (id: number) => `/safety/${id}`,
  DELETE_SAFETY_REPORT_URL: (id: number) => `/safety/${id}`,
  AGENT_REVIEW_SAFETY_ASSESSMENT: (id: number) => `/safety/review/${id}`,

  // Termly Dates Endpoints
  CREATE_TERM_DATES_URL: '/settings/term-dates/create',
  GET_TERM_DATES_URL: '/settings/term-dates/list',
  GET_TERM_DATES_BY_ID_URL: (id: number) => `/settings/term-dates/${id}`,
  UPDATE_TERM_DATES_URL: (id: number) => `/settings/term-dates/${id}`,
  DELETE_TERM_DATES_URL: (id: number) => `/settings/term-dates/${id}`,

  // School Entities Endpoints
  CREATE_SCHOOL_ENTITIES_URL: '/facilities/entities/create',
  GET_SCHOOL_ENTITIES_URL: '/facilities/entities/list',
  GET_SCHOOL_ENTITY_BY_ID_URL: (id: number) => `/facilities/entities/${id}`,
  UPDATE_SCHOOL_ENTITY_URL: (id: number) => `/facilities/entities/${id}`,
  DELETE_SCHOOL_ENTITY_URL: (id: number) => `/facilities/entities/${id}`,

  // User Management Endpoints
  CREATE_USERS_URL: '/users/create',
  GET_USERS_URL: '/users/list',
  USER_DETAIL_URL: (id: number) => `/users/${id}`,
  UPDATE_USER_URL: (id: number) => `/users/${id}`,
  DELETE_USER_URL: (id: number) => `/users/${id}`,

  // Permission Management Endpoints
  GET_PERMISSIONS_URL: '/permissions/list',
  CREATE_PERMISSION_URL: '/permissions/create',
  ASSIGN_PERMISSION_ROLE_URL: '/permissions/assign-to-role',
  UPDATE_PERMISSION_URL: (id: number) => `/permissions/${id}`,
  DELETE_PERMISSION_URL: (id: number) => `/permissions/${id}`,

  
  // Roles Management Endpoints
  GET_ROLES_URL: '/roles/list',
  CREATE_ROLE_URL: 'roles/create',
  GET_USER_ROLE: (id: number) => `/users/role/${id}`,
  ASSIGN_USER_ROLE_URL: (id: number) => `/users/assign-role/${id}`,
  UPDATE_ROLE_URL: (id: number) => `/update-role/${id}`,
  DELETE_ROLE_URL: (id: number) => `/remove-role/${id}`,
  

  // Dashboard Endpoints
  DASHBOARD_URL: '/dashboard/overview',

}
