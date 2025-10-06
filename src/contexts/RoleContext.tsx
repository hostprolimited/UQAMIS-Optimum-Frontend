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

  const pagePermissions: Record<string, string> = {
    'overview': 'view_county_dashboard',
    'reports': 'view_school_reports',
    'onboard': 'view_institution',
    'system_safety': 'view_system_safety',
    'review': 'maintenance_review',
    'entities': 'view_institution',
    'term_dates': 'manage_term_dates',
    'backup': 'manage_backup',
    'user_management': 'manage_users',
    'assessment': 'create_assessment',
    'school_form': 'view_school_metrics',
    'institutions_assessment': 'view_assessments',
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
            'user_management'
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
            'incidents',
            'term_dates',
            'incidents',
            'institutions_assessment'
          ].includes(page);
        default:
          return false;
      }
    }

    // For custom roles, check permissions
    if (currentUser.permissions && currentUser.permissions.length > 0) {
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