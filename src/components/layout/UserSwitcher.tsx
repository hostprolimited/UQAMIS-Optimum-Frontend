import React from 'react';
import { Check, ChevronsUpDown, UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRole } from '@/contexts/RoleContext';

const UserSwitcher: React.FC = () => {
  const { currentUser } = useRole();

  const formatRole = (role: string) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (!currentUser) return null;

  return (
    <div className="flex items-center space-x-3 p-2">
      <Avatar className="h-10 w-10">
        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.name}`} />
        <AvatarFallback className="bg-[#FF0000]">
          {currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col text-left">
        <span className="text-base font-semibold">{currentUser.name}</span>
        <span className="text-xs opacity-80">{formatRole(currentUser.role)}</span>
        <span className="text-xs text-muted-foreground">{currentUser.email}</span>
        {currentUser.county && (
          <span className="text-xs text-muted-foreground">{currentUser.county}{currentUser.school && ` • ${currentUser.school}`}</span>
        )}
      </div>
    </div>
  );
};

export default UserSwitcher;