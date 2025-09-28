import * as React from 'react';
import { styled, useTheme, Theme, CSSObject } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import useMediaQuery from '@mui/material/useMediaQuery';
import { NavLink, useLocation } from 'react-router-dom';
import { useRole } from '@/contexts/RoleContext';
import Collapse from '@mui/material/Collapse';
import List from '@mui/material/List';
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
  Lock,
  GraduationCap
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

// Drawer width
const drawerWidth = 280; // Increased from 240 to 280
const mobileDrawerWidth = 120; // Increased mobile drawer width as well

// Styles for the drawer when it's open
const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

// Styles for the drawer when it's closed
const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

// Styled component for the drawer header
export const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // We can make this smaller since we've adjusted the layout
  minHeight: '40px',
  [theme.breakpoints.down('sm')]: {
    minHeight: '40px',
  },
}));

// Primary blue color for sidebar
const primaryBlue = '#010162';

// Styled component for the drawer
const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    position: 'relative', // Changed from 'fixed' to 'relative'
    marginTop: '56px', // Added margin-top equal to taskbar height
    height: 'calc(100vh - 56px)', // Adjust height to account for taskbar
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': {
        ...openedMixin(theme),
        backgroundColor: primaryBlue,
        color: '#fff',
        position: 'fixed',
        top: '56px', // Start below the taskbar
        height: 'calc(100% - 56px)', // Adjust height
      },
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': {
        ...closedMixin(theme),
        backgroundColor: primaryBlue,
        color: '#fff',
        position: 'fixed',
        top: '56px', // Start below the taskbar
        height: 'calc(100% - 56px)', // Adjust height
      },
    }),
  }),
);

// Define the navigation items with their icons
const navigationItems = [
  { 
    title: 'Overview', 
    url: '/dashboard', 
    icon: BarChart3, 
    page: 'overview' 
  },
  { 
    title: 'Institutions', 
    url: '/onboarded-schools', 
    icon: UserPlus, 
    page: 'onboard' 
  },
  { 
    title: 'Assessments',
    children: [
      { title: 'Facility Assessment', url: '/assessments/add', icon: ClipboardCheck },
      { title: 'Safety  Report', url: '/safety/assessment/report', icon: ClipboardCheck },
      { title: 'Maintenance Report', url: '/maintenance/assessment', icon: FileText },
    ],
    icon: ClipboardCheck,
    page: 'assessment'
  },

  {
    title: 'Assessment Review', 
    url: 'assessments/review', 
    icon: ClipboardCheck, 
    page: 'assessment_review'
  },
  {
    title: 'School Metrics', 
    url: '/school-metrics',
    icon: GraduationCap,
    page: 'school_form'
  },
  { 
    title: 'Reports', 
    url: '/reports', 
    icon: FileText, 
    page: 'reports' 
  },
 
  // {
  //   title: 'Institutions Report',
  //   url: 'maintenance/assessment',
  //   icon: FileText,
  //   page: 'institutions_assessment'
  // },
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

// Custom Icon Component to use Lucide Icons with Material UI
const LucideIconWrapper = ({ icon: Icon, ...props }: { icon: LucideIcon }) => {
  return (
    <div style={{ 
      backgroundColor: '#ffffff', 
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '32px',
      height: '32px',
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)'
    }}>
      <Icon color="#010162 " size={18} strokeWidth={2} {...props} />
    </div>
  );
};

interface AppSidebarProps {
  mobileOpen?: boolean;
  handleDrawerToggle?: () => void;
}

export function AppSidebar({ mobileOpen = false, handleDrawerToggle }: AppSidebarProps) {
  const theme = useTheme();
  const location = useLocation();
  const { hasAccess } = useRole();
  const [open, setOpen] = React.useState(false);
  const [openItems, setOpenItems] = React.useState<string[]>(['User Management']);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // DrawerHeader is now exported directly from the file

  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  
  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const toggleItem = (title: string) => {
    setOpenItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isItemOpen = (title: string) => openItems.includes(title);

  // Use the parent component's toggle function if provided
  const toggleMobileDrawer = () => {
    if (handleDrawerToggle) {
      handleDrawerToggle();
    }
  };

  // Drawer content to be reused for both desktop and mobile
  const drawerContent = (
    <>
      <DrawerHeader>
        <div className="flex w-full items-center p-2">
          {open && (
            <div className="flex flex-1 items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                  QA System
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                  Quality Assurance
                </Typography>
              </div>
            </div>
          )}
          <IconButton 
            onClick={open ? handleDrawerClose : handleDrawerOpen}
            sx={{ color: '#fff' }}
          >
            {open ? (
              theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />
            ) : (
              theme.direction === 'rtl' ? <ChevronLeftIcon /> : <ChevronRightIcon />
            )}
          </IconButton>
        </div>
      </DrawerHeader>
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />
    </>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* Mobile Drawer */}
      {isMobile ? (
        <MuiDrawer
          variant="temporary"
          open={mobileOpen}
          onClose={toggleMobileDrawer}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: mobileDrawerWidth, // Use narrower width for mobile
              backgroundColor: primaryBlue,
              color: '#fff',
              zIndex: 1300 // Ensure drawer appears above other content
            },
          }}
        >
          {drawerContent}
          <Divider />
          <List>
            {navigationItems.map((item) => {
          if (!hasAccess(item.page)) return null;

          if (item.children) {
            return (
              <React.Fragment key={item.title}>
                <ListItem disablePadding sx={{ display: 'block' }}>
                  <ListItemButton
                    onClick={() => toggleItem(item.title)}
                    sx={{
                      minHeight: 48,
                      justifyContent: open ? 'initial' : 'center',
                      px: 2.5,
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 3 : 'auto',
                        justifyContent: 'center',
                      }}
                    >
                      <LucideIconWrapper icon={item.icon} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.title} 
                      sx={{ opacity: open ? 1 : 0 }} 
                    />
                    {open && (
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          isItemOpen(item.title) ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </ListItemButton>
                </ListItem>
                <Collapse in={open && isItemOpen(item.title)} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children.map((child) => (
                      <ListItem key={child.title} disablePadding sx={{ display: 'block' }}>
                        <ListItemButton
                          component={NavLink}
                          to={child.url}
                          selected={isActive(child.url)}
                          sx={{
                            minHeight: 48,
                            justifyContent: open ? 'initial' : 'center',
                            px: 2.5,
                            pl: open ? 4 : 2.5,
                            '&.Mui-selected': {
                              backgroundColor: 'rgba(25, 118, 210, 0.08)',
                            },
                            '&:hover': {
                              backgroundColor: 'rgba(0, 0, 0, 0.04)',
                            }
                          }}
                        >
                          <ListItemIcon
                            sx={{
                              minWidth: 0,
                              mr: open ? 3 : 'auto',
                              justifyContent: 'center',
                            }}
                          >
                            <LucideIconWrapper icon={child.icon} />
                          </ListItemIcon>
                          <ListItemText 
                            primary={child.title} 
                            sx={{ opacity: open ? 1 : 0 }} 
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </React.Fragment>
            );
          }

          return (
            <ListItem key={item.title} disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                component={NavLink}
                to={item.url!}
                selected={isActive(item.url!)}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(255, 255, 255, 0.16)',
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  <LucideIconWrapper icon={item.icon} />
                </ListItemIcon>
                <ListItemText primary={item.title} sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </ListItem>
          );
        })}
          </List>
        </MuiDrawer>
      ) : (
        // Desktop Drawer
        <Drawer variant="permanent" open={open}>
          {drawerContent}
          <Divider />
          <List>
            {navigationItems.map((item) => {
              if (!hasAccess(item.page)) return null;

              if (item.children) {
                return (
                  <React.Fragment key={item.title}>
                    <ListItem disablePadding sx={{ display: 'block' }}>
                      <ListItemButton
                        onClick={() => toggleItem(item.title)}
                        sx={{
                          minHeight: { xs: 42, sm: 48 }, // Smaller on mobile
                          justifyContent: open ? 'initial' : 'center',
                          px: { xs: 1.5, sm: 2.5 }, // Less padding on mobile
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          }
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 0,
                            mr: open ? 3 : 'auto',
                            justifyContent: 'center',
                          }}
                        >
                          <LucideIconWrapper icon={item.icon} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={item.title} 
                          primaryTypographyProps={{
                            fontSize: { xs: '0.8125rem', sm: '0.875rem' } // Smaller text on mobile
                          }}
                          sx={{ opacity: open ? 1 : 0 }} 
                        />
                        {open && (
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              isItemOpen(item.title) ? 'rotate-180' : ''
                            }`}
                          />
                        )}
                      </ListItemButton>
                    </ListItem>
                    <Collapse in={open && isItemOpen(item.title)} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding>
                        {item.children.map((child) => (
                          <ListItem key={child.title} disablePadding sx={{ display: 'block' }}>
                            <ListItemButton
                              component={NavLink}
                              to={child.url}
                              selected={isActive(child.url)}
                              sx={{
                                minHeight: { xs: 40, sm: 48 }, // Smaller on mobile
                                justifyContent: open ? 'initial' : 'center',
                                px: { xs: 1.5, sm: 2.5 }, // Less padding on mobile
                                pl: open ? { xs: 3, sm: 4 } : { xs: 1.5, sm: 2.5 },
                                fontSize: { xs: '0.8125rem', sm: '0.875rem' }, // Smaller text on mobile
                                '&.Mui-selected': {
                                  backgroundColor: 'rgba(255, 255, 255, 0.16)',
                                },
                                '&:hover': {
                                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                }
                              }}
                            >
                              <ListItemIcon
                                sx={{
                                  minWidth: 0,
                                  mr: open ? 3 : 'auto',
                                  justifyContent: 'center',
                                }}
                              >
                                <LucideIconWrapper icon={child.icon} />
                              </ListItemIcon>
                              <ListItemText 
                                primary={child.title}
                                primaryTypographyProps={{
                                  fontSize: { xs: '0.8125rem', sm: '0.875rem' } // Smaller text on mobile
                                }}
                                sx={{ opacity: open ? 1 : 0 }} 
                              />
                            </ListItemButton>
                          </ListItem>
                        ))}
                      </List>
                    </Collapse>
                  </React.Fragment>
                );
              }

              return (
                <ListItem key={item.title} disablePadding sx={{ display: 'block' }}>
                  <ListItemButton
                    component={NavLink}
                    to={item.url!}
                    selected={isActive(item.url!)}
                    sx={{
                      minHeight: { xs: 42, sm: 48 }, // Smaller on mobile
                      justifyContent: open ? 'initial' : 'center',
                      px: { xs: 1.5, sm: 2.5 }, // Less padding on mobile
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(25, 118, 210, 0.08)',
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      }
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 3 : 'auto',
                        justifyContent: 'center',
                      }}
                    >
                      <LucideIconWrapper icon={item.icon} />
                    </ListItemIcon>
                    <ListItemText primary={item.title} sx={{ opacity: open ? 1 : 0 }} />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Drawer>
      )}
    </Box>
  );
}