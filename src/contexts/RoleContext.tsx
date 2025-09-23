import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'school_admin' | 'agent' | 'ministry_admin';

export interface User {
  county_id: any;
  id: string;
  name: string;
  email: string;
  role: UserRole;
  county_code?: string;
  county_name?: string;
  school?: string;
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
        return true;
      case 'agent':
        return [
          'overview',
          'reports',
          'assessment',
          'onboard',
          'user_management'
        ].includes(page);
      case 'school_admin':
        return [
          'overview',
          'assessment',
          'reports'
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