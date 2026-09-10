import { Outlet } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Box, IconButton, Avatar, Menu, MenuItem, Divider } from '@mui/material';
import { Dashboard as DashboardIcon, People, Logout, School, Event, AccountBalance, MenuBook, LocalLibrary, Notifications, Settings, Apartment, Class, HowToReg, Grade } from '@mui/icons-material'; // <--- Added Grade icon
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { EventNote } from '@mui/icons-material';
import { Home } from '@mui/icons-material';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Students', icon: <People />, path: '/students' },
  { text: 'Courses', icon: <MenuBook />, path: '/courses' },
  { text: 'Faculty', icon: <School />, path: '/faculty' },
  { text: 'Sections', icon: <Class />, path: '/sections' },
  { text: 'Enrollments', icon: <HowToReg />, path: '/enrollments' },
  { text: 'Grades', icon: <Grade />, path: '/grades' }, // <--- NEW: Grades module
  { text: 'Attendance', icon: <Event />, path: '/attendance' },
  { text: 'Finance', icon: <AccountBalance />, path: '/finance' },
  { text: 'Library', icon: <LocalLibrary />, path: '/library' },
  { text: 'Notifications', icon: <Notifications />, path: '/notifications' },
  { text: 'Infrastructure', icon: <Apartment />, path: '/infrastructure' },
  { text: 'Settings', icon: <Settings />, path: '/settings' },
  { text: 'Exams', icon: <EventNote />, path: '/exams' },
  { text: 'Hostel', icon: <Home />, path: '/hostel' }, // <--- NEW: Hostel module
  
];

function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const drawerContent = (
    <Box>
      <Toolbar><Typography variant="h6" noWrap>University MS</Typography></Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.text}
            onClick={() => navigate(item.path)}
            selected={location.pathname === item.path}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            University Management System
          </Typography>
          <IconButton color="inherit" onClick={handleMenu}>
            <Avatar sx={{ bgcolor: 'secondary.main' }}>
              {user ? user.name[0] : 'U'}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose}>Profile</MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` }, mt: '64px' }}>
        <Outlet />
      </Box>
    </Box>
  );
}

export default DashboardLayout;