import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'admin' | 'county_admin' | 'school_admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  county?: string;
  school?: string;
}

interface RoleContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  hasAccess: (page: string) => boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

const mockUsers: User[] = [
  { id: '1', name: 'John Admin', email: 'admin@qa.gov', role: 'admin' },
  { id: '2', name: 'Mary County', email: 'mary@county.gov', role: 'county_admin', county: 'Nairobi' },
  { id: '3', name: 'Peter School', email: 'peter@school.gov', role: 'school_admin', county: 'Nairobi', school: 'Green Valley Primary' }
];

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
  const [currentUser, setCurrentUser] = useState<User>(mockUsers[0]); // Default to admin

  const hasAccess = (page: string): boolean => {
    switch (currentUser.role) {
      case 'admin':
        return true; // Admin can access everything
      case 'county_admin':
        return [
          'overview', 
          'onboard', 
          'assessment', 
          'reports', 
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