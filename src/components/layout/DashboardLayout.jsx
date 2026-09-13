import { Outlet } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Drawer, List, ListItemButton, ListItemIcon,
  ListItemText, Box, IconButton, Avatar, Menu, MenuItem, Divider, Tooltip
} from '@mui/material';
import {
  Dashboard as DashboardIcon, People, Logout, School, Event, AccountBalance,
  MenuBook, LocalLibrary, Notifications, Settings, Apartment, Class, HowToReg,
  Grade, EventNote, Home, Reviews, History, Brightness4, Brightness7
} from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useColorMode } from '../../context/ColorModeContext';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/', roles: ['ADMIN', 'FACULTY', 'STUDENT'] },
  { text: 'Students', icon: <People />, path: '/students', roles: ['ADMIN', 'FACULTY'] },
  { text: 'Courses', icon: <MenuBook />, path: '/courses', roles: ['ADMIN', 'FACULTY'] },
  { text: 'Faculty', icon: <School />, path: '/faculty', roles: ['ADMIN'] },
  { text: 'Sections', icon: <Class />, path: '/sections', roles: ['ADMIN', 'FACULTY'] },
  { text: 'Enrollments', icon: <HowToReg />, path: '/enrollments', roles: ['ADMIN', 'FACULTY'] },
  { text: 'Grades', icon: <Grade />, path: '/grades', roles: ['ADMIN', 'FACULTY', 'STUDENT'] },
  { text: 'Attendance', icon: <Event />, path: '/attendance', roles: ['ADMIN', 'FACULTY'] },
  { text: 'Exams', icon: <EventNote />, path: '/exams', roles: ['ADMIN', 'FACULTY'] },
  { text: 'Finance', icon: <AccountBalance />, path: '/finance', roles: ['ADMIN', 'STUDENT'] },
  { text: 'Library', icon: <LocalLibrary />, path: '/library', roles: ['ADMIN', 'FACULTY', 'STUDENT'] },
  { text: 'Hostel', icon: <Home />, path: '/hostel', roles: ['ADMIN', 'STUDENT'] },
  { text: 'Evaluations', icon: <Reviews />, path: '/evaluations', roles: ['ADMIN', 'STUDENT'] },
  { text: 'Notifications', icon: <Notifications />, path: '/notifications', roles: ['ADMIN', 'FACULTY', 'STUDENT'] },
  { text: 'Infrastructure', icon: <Apartment />, path: '/infrastructure', roles: ['ADMIN'] },
  { text: 'Settings', icon: <Settings />, path: '/settings', roles: ['ADMIN'] },
  { text: 'Audit Logs', icon: <History />, path: '/audit-logs', roles: ['ADMIN'] },
];

function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { mode, toggleColorMode } = useColorMode();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Filter menu items based on the user's role
  const visibleItems = menuItems.filter(item => item.roles.includes(user?.role));

  const drawerContent = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap sx={{ fontWeight: 'bold' }}>
          University MS
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {visibleItems.map((item) => (
          <ListItemButton
            key={item.text}
            onClick={() => navigate(item.path)}
            selected={location.pathname === item.path}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': { backgroundColor: 'primary.dark' },
                '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
              },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* ===== Top App Bar ===== */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          width: `calc(100% - ${drawerWidth}px)`,
          ml: `${drawerWidth}px`,
        }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            University Management System
          </Typography>

          {/* Dark Mode Toggle */}
          <Tooltip title={mode === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}>
            <IconButton color="inherit" onClick={toggleColorMode} sx={{ mr: 1 }}>
              {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
            </IconButton>
          </Tooltip>

          {/* User Avatar Menu */}
          <IconButton color="inherit" onClick={handleMenu}>
            <Avatar sx={{ bgcolor: 'secondary.main', width: 36, height: 36 }}>
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={() => { handleClose(); navigate('/profile'); }}>
              Profile
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* ===== Permanent Sidebar (ALWAYS visible) ===== */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>

      {/* ===== Main Content ===== */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: `calc(100% - ${drawerWidth}px)`,
          mt: '64px', // Push content below the fixed AppBar
          backgroundColor: 'background.default',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

export default DashboardLayout;