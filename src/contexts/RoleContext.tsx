import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'school_admin' | 'agent' | 'ministry_admin';

export interface User {
  county_id: any;
  id: string;
  name: string;
  email: string;
  institution_name
  phone?: string;
  role: UserRole;
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

  const hasAccess = (page: string): boolean => {
    if (!currentUser) return false;
    switch (currentUser.role) {
      case 'ministry_admin':
        return [
          'overview',
          'reports',
          // 'maintenance_review',
          // 'safety_review',
          'onboard',
          'system_safety',
          'review',
          'term_dates',
          'backup',
          'user_management'
        ].includes(page)

      case 'agent':
        return [
          'overview',
          'reports',
          'review',
          'term_dates',
          // 'maintenance_review',
          // 'safety_review',
          'onboard',
          'user_management'
        ].includes(page);
      case 'school_admin':
        return [
          'overview',
          'assessment',
          // 'reports',
          'school_form',
          'term_dates',
          'institutions_assessment'
        ].includes(page);
      default:
        return false;
    }
  };

  return (
    <RoleContext.Provider value={{ currentUser, setCurrentUser, hasAccess }}>
      {children}
    </RoleContext.Provider>
  );
};