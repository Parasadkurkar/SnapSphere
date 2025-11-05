import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Divider,
  IconButton,
  Badge,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Home,
  Search,
  AddBox,
  Mail,
  Notifications,
  Logout,
  Menu as MenuIcon
} from '@mui/icons-material';
import { getConversations, getNotifications } from '../services/api';

const drawerWidth = 280;

function MainLayout({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
//   const [user, setUser] = useState(() => {
//   const u = localStorage.getItem('user');
//   return u ? JSON.parse(u) : null;
// });


// --- ADD THIS EFFECT: to keep sidebar always in sync!
  // useEffect(() => {
  //   // Optional: add location or custom event as dependency for robustness
  //   const stored = localStorage.getItem('user');
  //   if (stored) user(JSON.parse(stored));
  // }, [location]);

  React.useEffect(() => {
    fetchUnreadCounts();
    const interval = setInterval(fetchUnreadCounts, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCounts = async () => {
    try {
      const notifResponse = await getNotifications();
      const unreadNotif = notifResponse.data.filter(n => !n.read).length;
      setUnreadNotifications(unreadNotif);

      const messagesResponse = await getConversations();
      const unreadMsg = messagesResponse.data.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
      setUnreadMessages(unreadMsg);
    } catch (err) {
      console.error('Error fetching unread counts:', err);
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    onLogout();
    navigate('/');
  };

  const menuItems = [
    { label: 'Home', icon: <Home />, path: '/' },
    { label: 'Search', icon: <Search />, path: '/search' },
    { label: 'Create', icon: <AddBox />, path: '/create' },
    { 
      label: 'Messages', 
      icon: <Mail />, 
      path: '/messages',
      badge: unreadMessages
    },
    { 
      label: 'Notifications', 
      icon: <Notifications />, 
      path: '/notifications',
      badge: unreadNotifications
    }
  ];

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '20px',
              fontWeight: 'bold'
            }}
          >
            📸
          </Box>
          <Box>
            <Box sx={{ fontWeight: 'bold', fontSize: '16px' }}>SnapSphere</Box>
            <Box sx={{ fontSize: '12px', color: '#666' }}>Share Your Moments</Box>
          </Box>
        </Box>
      </Box>

      <Divider />

      {/* Navigation Menu */}
      <List sx={{ flex: 1, px: 1 }}>
        {menuItems.map((item) => (
          <ListItem
            key={item.path}
            button
            onClick={() => {
              navigate(item.path);
              setMobileOpen(false);
            }}
            sx={{
              my: 0.5,
              borderRadius: '12px',
              background: location.pathname === item.path ? '#f0f2f5' : 'transparent',
              color: location.pathname === item.path ? '#667eea' : 'inherit',
              '&:hover': { background: '#f0f2f5' },
              transition: 'all 0.2s',
              fontWeight: location.pathname === item.path ? 600 : 400,
              position: 'relative'
            }}
          >
            <ListItemIcon
              sx={{ color: 'inherit', justifyContent: 'center', minWidth: '40px' }}
            >
              {item.badge && item.badge > 0 ? (
                <Badge badgeContent={item.badge} color="error">
                  {item.icon}
                </Badge>
              ) : (
                item.icon
              )}
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>

      <Divider />

      {/* User Profile & Logout */}
      <Box sx={{ p: 2 }}>
        <ListItem
          button
          onClick={handleMenuOpen}
          sx={{
            borderRadius: '12px',
            display: 'flex',
            gap: 1,
            '&:hover': { background: '#f0f2f5' }
          }}
        >
          <Avatar src={user?.profilePic} sx={{ width: 32, height: 32 }} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ fontSize: '14px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name}
              </Box>
              <Box sx={{ fontSize: '12px', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                @{user?.username}
              </Box>
            </Box>
        </ListItem>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={() => {
            handleMenuClose();
            navigate(`/profile/${user?.id}`);
          }}>
            Profile
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <Logout sx={{ mr: 1 }} /> Logout
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Mobile Menu Button */}
      <IconButton
        color="inherit"
        onClick={() => setMobileOpen(!mobileOpen)}
        sx={{
          display: { xs: 'flex', sm: 'none' },
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 1200,
          background: 'white',
          border: '1px solid #e1e8ed'
        }}
      >
        <MenuIcon />
      </IconButton>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: '#fff',
            borderRight: '1px solid #e1e8ed'
          }
        }}
      >
        {drawer}
      </Drawer>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box'
          }
        }}
      >
        {drawer}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1, sm: 2 },
          background: '#fafafa',
          minHeight: '100vh',
          marginLeft: { xs: 0, sm: 0 }
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

export default MainLayout;