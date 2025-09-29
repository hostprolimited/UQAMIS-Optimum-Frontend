import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '@/contexts/RoleContext';
import { LogOut, User, ChevronDown, School, MapPin, Phone, Mail, Building } from 'lucide-react';
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
import countiesData from '@/constants/data.json';
// import { UserSwitcher } from './UserSwitcher';

// Kenya county code to name mapping from data.json
const countiesTable = countiesData.find((item: any) => item.type === 'table' && item.name === 'counties');
const counties = countiesTable?.data || [];
const countyCodeToName: Record<string, string> = counties.reduce((acc: Record<string, string>, county: any) => {
  acc[county.county_id] = county.county_name;
  return acc;
}, {});

export function Taskbar() {
  const { currentUser, setCurrentUser } = useRole();
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
    console.log('Signing out...');
    setCurrentUser(null);
    localStorage.removeItem('auth_token');
    navigate('/');
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
          {currentUser?.role === 'school_admin' ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-white hover:bg-red-700 focus:bg-red-700 flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="" alt={currentUser.name} />
                    <AvatarFallback className="bg-red-800 text-white">
                      {getUserInitials(currentUser.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">{currentUser.name}</span>
                    <span className="text-xs opacity-90">{formatRole(currentUser.role)}</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{currentUser.email}</p>
                    <p className="text-xs leading-none text-muted-foreground flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {currentUser.phone}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="font-normal">
                  <div className="flex items-center gap-2 mb-2">
                    <School className="w-4 h-4" />
                    <span className="text-sm font-medium">Institution</span>
                  </div>
                  <div className="flex flex-col space-y-1 text-sm">
                    <p className="font-medium">{currentUser.institution?.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{currentUser.institution?.type} School</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {currentUser.institution?.county}, {currentUser.institution?.subcounty}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {currentUser.institution?.email}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {currentUser.institution?.phone_number}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : currentUser?.role === 'agent' ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-white hover:bg-red-700 focus:bg-red-700 flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="" alt={currentUser.name} />
                    <AvatarFallback className="bg-red-800 text-white">
                      {getUserInitials(currentUser.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">{currentUser.name}</span>
                    <span className="text-xs opacity-90">{formatRole(currentUser.role)}</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{currentUser.email}</p>
                    <p className="text-xs leading-none text-muted-foreground flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {currentUser.phone}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="font-normal">
                  <div className="flex items-center gap-2 mb-2">
                    <Building className="w-4 h-4" />
                    <span className="text-sm font-medium">County</span>
                  </div>
                  <div className="flex flex-col space-y-1 text-sm">
                    <p className="font-medium">{countyCodeToName[currentUser.county_code] || 'Unknown County'}</p>
                    <p className="text-xs text-muted-foreground">County Code: {currentUser.county_code}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : currentUser?.role === 'ministry_admin' ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-white hover:bg-red-700 focus:bg-red-700 flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="" alt={currentUser.name} />
                    <AvatarFallback className="bg-red-800 text-white">
                      {getUserInitials(currentUser.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">{currentUser.name}</span>
                    <span className="text-xs opacity-90">{formatRole(currentUser.role)}</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{currentUser.email}</p>
                    <p className="text-xs leading-none text-muted-foreground flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {currentUser.phone}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="font-normal">
                  <div className="flex items-center gap-2 mb-2">
                    <Building className="w-4 h-4" />
                    <span className="text-sm font-medium">Jurisdiction</span>
                  </div>
                  <div className="flex flex-col space-y-1 text-sm">
                    <p className="font-medium">National Level</p>
                    <p className="text-xs text-muted-foreground">Ministry of Education</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            /* Sign out button for other roles */
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-red-700 focus:bg-red-700 flex items-center gap-1"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-1" />
              <span>Sign out</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
