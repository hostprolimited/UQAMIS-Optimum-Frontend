import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '@/contexts/RoleContext';
import { LogOut, User, ChevronDown } from 'lucide-react';
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from '@/components/ui/avatar';
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { UserSwitcher } from './UserSwitcher';

export function Taskbar() {
  const { currentUser } = useRole();
  const navigate = useNavigate();
  
  // Format user's role (e.g., county_admin -> County Admin)
  const formatRole = (role: string) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };
  
  // Get user initials for avatar fallback
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };
  
  // Handle sign out action
  const handleSignOut = () => {
    // In a real app, you'd handle authentication logout here
    console.log('Signing out...');
    navigate('/auth/login');
  };
  
  return (
    <div className="fixed top-0 left-0 right-0 h-14 bg-[#FF0000] text-white shadow-md z-50 px-4">
      <div className="flex items-center justify-between h-full w-full">
        {/* Left side - Logo or title */}
        <div className="flex items-center">
          <h1 className="text-xl font-bold">UQAMIS Optimum</h1>
        </div>
        
        {/* Right side - User switcher menu */}
        <div className="flex items-center space-x-4">
          <div className="user-switcher-wrapper">
            <UserSwitcher />
          </div>
          
          {/* Sign out button */}
          <Button 
            variant="ghost" 
            size="sm"
            className="text-white hover:bg-red-700 focus:bg-red-700 flex items-center gap-1"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-1" />
            <span>Sign out</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
