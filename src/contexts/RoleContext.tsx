import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = string;

export interface User {
  county_id?: any;
  id: string;
  name: string;
  email: string;
  institution_name?: string;
  phone?: string;
  role: UserRole;
  permissions?: string[];
  institution_id?: number;
  county_code?: string;
  county_name?: string;
  school?: string;
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
    location: string;
    email: string;
    status: string;
    boarding_type: string;
    total_students: number | null;
    total_teachers: number | null;
    gender_based: string | null;
    created_by: number;
    created_at: string;
    updated_at: string;
  } | null;
}

interface RoleContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  hasAccess: (page: string) => boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const useRole = () => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};

interface RoleProviderProps {
  children: ReactNode;
}

export const RoleProvider: React.FC<RoleProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const setCurrentUser = (user: User | null) => {
    setCurrentUserState(user);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  };

  // Grouped permissions - pages that require any of the listed permissions
  const groupedPermissions: Record<string, string[]> = {
    'reports': [
      'view_maintenance_report',
      'view_safety_report',
      'update_maintenance_report',
      'update_safety_report',
      'view_school_reports',
      'view_county_reports'
    ],
    'overview': ['view_school_dashboard', 'view_county_dashboard', 'view_subcounty_dashboard', 'view_ward_dashboard', 'view_national_dashboard'],
    'user_management': ['view_users', 'create_user', 'update_user', 'delete_user', 'update_user_status', 'transfer_user', 'manage_users'],
    'facilities': ['view_facilities', 'create_facilities', 'update_facilities', 'delete_facilities'],
    'incidents': ['view_incidents', 'report_incidents', 'update_incidents', 'delete_incidents', 'investigate_incidents'],
    'assessment': ['create_assessment', 'view_assessments', 'create_maintenance_report', 'create_safety_report'],
    'review': ['maintenance_review', 'safety_review'],
    'institutions': ['view_institutions', 'onboard_institution', 'view_institution', 'update_institution', 'view_subcounty_schools', 'view_ward_schools'],
    'permissions': ['view_permissions', 'create_role', 'view_roles', 'update_role', 'assign_permission_to_role', 'assign_permission_to_user', 'remove_permission_from_user', 'remove_permission_from_role'],
    'metrics': ['view_institution_metrics', 'create_institution_metrics', 'update_institution_metrics', 'delete_institution_metrics', 'view_school_metrics'],
    'facility_entities': ['view_facility_entities', 'create_facility_entities', 'update_facility_entities', 'delete_facility_entities'],
    'term_dates': ['view_term_dates', 'create_term_dates', 'update_term_dates', 'delete_term_dates'],
    'safety_reports': ['view_safety_report', 'update_safety_report', 'edit_own_safety_report', 'delete_own_safety_report'],
    'maintenance_reports': ['view_maintenance_report', 'update_maintenance_report', 'update_own_maintenance_report', 'delete_own_maintenance_report'],
  };

  // Individual page permissions for backward compatibility
  const pagePermissions: Record<string, string> = {
    'onboard': 'onboard_institution',
    'system_safety': 'view_system_safety',
    'entities': 'view_institution',
    'backup': 'manage_backup',
    'school_form': 'view_school_metrics',
    'institutions_assessment': 'view_assessments',
    'detailed_roles_permissions': 'view_detailed_roles_permissions',
    'safety_review': 'safety_review',
    'facility_unit_metadata_view': 'facility_unit_metadata_view',
    'facility_unit_metadata_create': 'facility_unit_metadata_create',
    'facility_unit_metadata_delete': 'facility_unit_metadata_delete',
    'facility_unit_metadata_edit': 'facility_unit_metadata_edit',
  };

  const hasAccess = (page: string): boolean => {
    if (!currentUser) return false;

    // For built-in roles, use role-based access
    if (['ministry_admin', 'agent', 'school_admin'].includes(currentUser.role)) {
      switch (currentUser.role) {
        case 'ministry_admin':
           return [
             'overview',
             'reports',
             'onboard',
             'system_safety',
             'review',
             // 'entities',
             'term_dates',
             'backup',
             'user_management',
             'incidents'
           ].includes(page);

        case 'agent':
          return [
            'overview',
            'reports',
            'review',
            // 'entities',
            'term_dates',
            'onboard',
            'incidents',
            'user_management'
          ].includes(page);
        case 'school_admin':
          return [
            'overview',
            'assessment',
            'school_form',
            'entities',
            // 'incidents',
            //'incidents',
            'term_dates',
             //'view_incidents',
            'institutions_assessment',
            'user_management'
          ].includes(page);
        default:
          return false;
      }
    }

    // For custom roles, check permissions (both grouped and individual)
    if (currentUser.permissions && currentUser.permissions.length > 0) {
      // First check if it's a grouped permission
      const groupedPerms = groupedPermissions[page];
      if (groupedPerms) {
        return groupedPerms.some(perm => currentUser.permissions!.includes(perm));
      }

      // Then check individual permissions
      const requiredPerm = pagePermissions[page];
      if (!requiredPerm) return false;
      return currentUser.permissions.includes(requiredPerm);
    }

    // Default deny
    return false;
  };

  return (
    <RoleContext.Provider value={{ currentUser, setCurrentUser, hasAccess }}>
      {children}
    </RoleContext.Provider>
  );
};