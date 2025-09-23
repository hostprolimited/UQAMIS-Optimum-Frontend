import React, { useState } from 'react';
import { 
  BarChart3, 
  UserPlus, 
  ClipboardCheck, 
  FileText, 
  Users, 
  Shield, 
  Archive,
  ChevronDown,
  User,
  Lock
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useRole } from '@/contexts/RoleContext';

const navigationItems = [
  { 
    title: 'Overview', 
    url: '/', 
    icon: BarChart3, 
    page: 'overview' 
  },
  { 
    title: 'Onboard', 
    url: '/Onboarded-schools', 
    icon: UserPlus, 
    page: 'onboard' 
  },
  { 
    title: 'Assessment', 
    url: '/assessment', 
    icon: ClipboardCheck, 
    page: 'assessment' 
  },
  { 
    title: 'Reports', 
    url: '/reports', 
    icon: FileText, 
    page: 'reports' 
  },
  {
    title: 'User Management',
    icon: Users,
    page: 'user_management',
    children: [
      { title: 'Users', url: '/users', icon: User },
      { title: 'Roles & Permissions', url: '/roles', icon: Lock }
    ]
  },
  { 
    title: 'System Safety', 
    url: '/system-safety', 
    icon: Shield, 
    page: 'system_safety' 
  },
  { 
    title: 'Backup', 
    url: '/backup', 
    icon: Archive, 
    page: 'backup' 
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { hasAccess } = useRole();
  const [openItems, setOpenItems] = useState<string[]>(['User Management']);

  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
      : "hover:bg-sidebar-accent/50 text-sidebar-foreground";

  const toggleItem = (title: string) => {
    setOpenItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isItemOpen = (title: string) => openItems.includes(title);

  return (
    <Sidebar className="w-64" collapsible="icon">
      <SidebarContent className="bg-sidebar">
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-sidebar-foreground">
                QA System
              </h2>
              <p className="text-xs text-sidebar-foreground/70">
                Quality Assurance
              </p>
            </div>
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                if (!hasAccess(item.page)) return null;

                if (item.children) {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <Collapsible 
                        open={isItemOpen(item.title)} 
                        onOpenChange={() => toggleItem(item.title)}
                      >
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton 
                            className="w-full justify-between hover:bg-sidebar-accent/50"
                          >
                            <div className="flex items-center">
                              <item.icon className="mr-3 h-4 w-4" />
                              <span>{item.title}</span>
                            </div>
                            <ChevronDown 
                              className={`h-4 w-4 transition-transform ${
                                isItemOpen(item.title) ? 'rotate-180' : ''
                              }`} 
                            />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.children.map((child) => (
                                <SidebarMenuSubItem key={child.title}>
                                  <SidebarMenuSubButton asChild>
                                    <NavLink 
                                      to={child.url} 
                                      className={getNavCls}
                                    >
                                      <child.icon className="mr-2 h-4 w-4" />
                                      <span>{child.title}</span>
                                    </NavLink>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        )
                      </Collapsible>
                    </SidebarMenuItem>
                  );
                }

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url!} className={getNavCls}>
                        <item.icon className="mr-3 h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}