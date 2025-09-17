import React from 'react';
import { Check, ChevronsUpDown, UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useRole, type User } from '@/contexts/RoleContext';

const mockUsers: User[] = [
  { id: '1', name: 'John Admin', email: 'admin@qa.gov', role: 'admin' },
  { 
    id: '2', 
    name: 'Mary County', 
    email: 'mary@county.gov', 
    role: 'county_admin', 
    county: 'Nairobi' 
  },
  { 
    id: '3', 
    name: 'Peter School', 
    email: 'peter@school.gov', 
    role: 'school_admin', 
    county: 'Nairobi', 
    school: 'Green Valley Primary' 
  },
  { 
    id: '4', 
    name: 'Alice County', 
    email: 'alice@county.gov', 
    role: 'county_admin', 
    county: 'Mombasa' 
  },
];

export function UserSwitcher() {
  const { currentUser, setCurrentUser } = useRole();
  const [open, setOpen] = React.useState(false);

  const formatRole = (role: string) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-64 justify-between"
        >
          <div className="flex items-center space-x-2">
            <UserIcon className="h-4 w-4" />
            <div className="flex flex-col text-left">
              <span className="text-sm font-medium">{currentUser.name}</span>
              <span className="text-xs text-muted-foreground">
                {formatRole(currentUser.role)}
              </span>
            </div>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0">
        <Command>
          <CommandInput placeholder="Search users..." />
          <CommandList>
            <CommandEmpty>No user found.</CommandEmpty>
            <CommandGroup heading="Switch User">
              {mockUsers.map((user) => (
                <CommandItem
                  key={user.id}
                  value={user.name}
                  onSelect={() => {
                    setCurrentUser(user);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      currentUser.id === user.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatRole(user.role)} • {user.email}
                    </span>
                    {user.county && (
                      <span className="text-xs text-muted-foreground">
                        {user.county}{user.school && ` • ${user.school}`}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}