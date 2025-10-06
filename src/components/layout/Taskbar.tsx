import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '@/contexts/RoleContext';
import { LogOut, User, ChevronDown, School, MapPin, Phone, Mail, Building, Bell, AlertTriangle, CheckCircle, Clock, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from '@/components/ui/avatar';
import {
  Card,
  CardContent
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

  // Notification state
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  
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
  
  // Generate notifications based on user role
  React.useEffect(() => {
    if (!currentUser) return;

    const generateNotifications = () => {
      const baseNotifications = [
        {
          id: 1,
          type: 'system',
          title: 'Welcome to UQAMIS Optimum',
          message: 'Your account has been successfully set up.',
          time: '2 hours ago',
          read: false,
          priority: 'low'
        }
      ];

      if (currentUser.role === 'school_admin') {
        return [
          ...baseNotifications,
          {
            id: 2,
            type: 'assessment',
            title: 'Assessment Due',
            message: 'Maintenance assessment for Chemistry Lab is due in 2 days.',
            time: '1 hour ago',
            read: false,
            priority: 'medium'
          },
          {
            id: 3,
            type: 'incident',
            title: 'New Incident Reported',
            message: 'Fire incident reported in your school premises.',
            time: '30 mins ago',
            read: false,
            priority: 'high'
          },
          {
            id: 4,
            type: 'report',
            title: 'Report Submitted',
            message: 'Your safety assessment report has been submitted successfully.',
            time: '1 day ago',
            read: true,
            priority: 'low'
          }
        ];
      } else if (currentUser.role === 'agent') {
        return [
          ...baseNotifications,
          {
            id: 2,
            type: 'assignment',
            title: 'New School Assignment',
            message: 'You have been assigned to assess Westlands Academy.',
            time: '45 mins ago',
            read: false,
            priority: 'high'
          },
          {
            id: 3,
            type: 'review',
            title: 'Assessment Review Required',
            message: 'Safety assessment for Kibera School needs your review.',
            time: '2 hours ago',
            read: false,
            priority: 'medium'
          },
          {
            id: 4,
            type: 'deadline',
            title: 'Deadline Approaching',
            message: 'Assessment deadline for 3 schools is approaching.',
            time: '3 hours ago',
            read: true,
            priority: 'medium'
          }
        ];
      } else if (currentUser.role === 'ministry_admin') {
        return [
          ...baseNotifications,
          {
            id: 2,
            type: 'system',
            title: 'System Update',
            message: 'New assessment guidelines have been published.',
            time: '1 hour ago',
            read: false,
            priority: 'high'
          },
          {
            id: 3,
            type: 'report',
            title: 'Monthly Report Ready',
            message: 'National assessment summary report is now available.',
            time: '2 hours ago',
            read: false,
            priority: 'medium'
          },
          {
            id: 4,
            type: 'alert',
            title: 'Critical Incident Alert',
            message: 'Multiple fire incidents reported across 5 counties.',
            time: '30 mins ago',
            read: false,
            priority: 'critical'
          },
          {
            id: 5,
            type: 'review',
            title: 'Pending Reviews',
            message: '15 assessment reports awaiting your approval.',
            time: '4 hours ago',
            read: true,
            priority: 'medium'
          }
        ];
      }

      return baseNotifications;
    };

    const userNotifications = generateNotifications();
    setNotifications(userNotifications);
    setUnreadCount(userNotifications.filter(n => !n.read).length);
  }, [currentUser]);

  // Handle sign out action
  const handleSignOut = () => {
    console.log('Signing out...');
    setCurrentUser(null);
    localStorage.removeItem('auth_token');
    navigate('/');
  };

  // Mark notification as read
  const markAsRead = (notificationId: number) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string, priority: string) => {
    if (priority === 'critical') return <AlertTriangle className="w-4 h-4 text-red-500" />;
    if (priority === 'high') return <AlertTriangle className="w-4 h-4 text-orange-500" />;
    if (type === 'assessment' || type === 'assignment') return <CheckCircle className="w-4 h-4 text-blue-500" />;
    if (type === 'incident' || type === 'alert') return <AlertTriangle className="w-4 h-4 text-red-500" />;
    return <Bell className="w-4 h-4 text-gray-500" />;
  };
  
  return (
    <div className="fixed top-0 left-0 right-0 h-14 bg-[#FF0000] text-white shadow-md z-50 px-4">
      <div className="flex items-center justify-between h-full w-full">
        {/* Left side - Logo or title */}
        <div className="flex items-center">
          <h1 className="text-xl font-bold">UQAMIS Optimum</h1>
        </div>
        
        {/* Center/Right side - Notifications and User menu */}
        <div className="flex items-center space-x-4">
          {/* Notification Panel */}
          {currentUser && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-white hover:bg-red-700 focus:bg-red-700 relative">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-96 p-0 border-0 shadow-2xl"
                sideOffset={8}
              >
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                    {unreadCount > 0 && (
                      <button
                        className="text-sm text-blue-600 hover:underline"
                        onClick={() => {
                          setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                          setUnreadCount(0);
                        }}
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  {/* Notification list */}
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">
                        <Bell className="w-12 h-12 mx-auto mb-3 opacity-50 text-gray-400" />
                        <p className="text-sm font-medium">No notifications</p>
                        <p className="text-xs text-gray-500 mt-1">You're all caught up!</p>
                      </div>
                    ) : (
                      <div className="p-2">
                        {notifications.map((notification) => (
                          <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={cn(
                              "flex items-start space-x-3 p-3 mx-2 mb-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 cursor-pointer border-l-4",
                              !notification.read && "bg-blue-50 hover:bg-blue-100 border-l-blue-500",
                              notification.priority === 'high' && "border-l-orange-500",
                              notification.priority === 'critical' && "border-l-red-500"
                            )}
                            onClick={() => markAsRead(notification.id)}
                          >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                              {notification.title[0].toUpperCase()}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className={cn(
                                  "text-sm font-semibold truncate text-gray-900",
                                  !notification.read && "text-blue-900"
                                )}>
                                  {notification.title}
                                </p>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2 animate-pulse"></div>
                                )}
                              </div>

                              <p className="text-sm text-gray-700 leading-relaxed mb-2">
                                {notification.message}
                              </p>

                              <div className="flex items-center justify-between">
                                <p className="text-xs text-gray-500 flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {notification.time}
                                </p>

                                {/* Priority indicator */}
                                <div className="flex items-center space-x-1">
                                  {notification.priority === 'critical' && (
                                    <Badge className="bg-red-100 text-red-800 text-xs px-2 py-0.5">
                                      Critical
                                    </Badge>
                                  )}
                                  {notification.priority === 'high' && (
                                    <Badge className="bg-orange-100 text-orange-800 text-xs px-2 py-0.5">
                                      High
                                    </Badge>
                                  )}
                                  {notification.priority === 'medium' && (
                                    <Badge className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5">
                                      Medium
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              {/* Action buttons for specific types */}
                              {notification.type === 'assignment' && (
                                <div className="mt-3 space-x-2">
                                  <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                                    View Details
                                  </button>
                                  <button className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors">
                                    Dismiss
                                  </button>
                                </div>
                              )}

                              {notification.type === 'incident' && (
                                <div className="mt-3 space-x-2">
                                  <button className="px-3 py-1 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                                    Respond Now
                                  </button>
                                  <button className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors">
                                    View Report
                                  </button>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="p-4 border-t border-gray-100 text-center">
                      <button className="text-sm text-blue-600 hover:underline font-medium">
                        View all notifications
                      </button>
                    </div>
                  )}
                </motion.div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* User menu */}
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
                    <p className="font-medium">{currentUser.institution_name}</p>
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
