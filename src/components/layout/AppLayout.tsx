import React from 'react';
import { AppSidebar as AppSidebar } from './AppSidebarMini';
import { Taskbar } from './Taskbar';
import { useRole } from '@/contexts/RoleContext';
import { Badge } from '@/components/ui/badge';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { currentUser } = useRole();
  const theme = useTheme();
  
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-destructive text-destructive-foreground';
      case 'county_admin':
        return 'bg-warning text-warning-foreground';
      case 'school_admin':
        return 'bg-success text-success-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatRole = (role: string) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Function to toggle the mobile drawer - will be passed to the AppSidebar
  const [mobileOpen, setMobileOpen] = React.useState(false);
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      {/* New Taskbar component added at the top */}
      <Taskbar />
      
      <Box sx={{ display: 'flex', mt: '0' }}> {/* Remove margin since the taskbar is fixed */}
        <AppSidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
        
        <Box component="main" sx={{ 
          flexGrow: 1, 
          p: { xs: 1, sm: 2, md: 3 }, // Responsive padding
          backgroundColor: '#f5f5f5', // Gray background color
          minHeight: 'calc(100vh - 56px)', // Adjust for taskbar height
          width: '100%', // Ensure it takes full width
          overflowX: 'hidden', // Prevent horizontal scrolling
          mt: '56px' // Add top margin to account for the fixed taskbar
        }}>
        
        {/* Main Content with white background and rounded corners */}
        <Box 
          component="main" 
          sx={{
            padding: { xs: '0.75rem', sm: '1rem', md: '1.5rem' }, // Responsive padding
            overflow: 'auto',
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            height: { 
              xs: 'calc(100vh - 8rem)',  // Smaller spacing on mobile
              sm: 'calc(100vh - 9rem)', 
              md: 'calc(100vh - 11rem)' 
            },
            maxWidth: '100%'  // Ensure it doesn't overflow
          }}
        >
          {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};