import { LucideIcon } from 'lucide-react';

export interface RolePermission {
  role: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  users: number;
  permissions: {
    [key: string]: {
      [key: string]: boolean;
    };
  };
}