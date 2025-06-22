import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Avatar, Typography, Divider, useTheme } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LogoutIcon from '@mui/icons-material/Logout';
import { Link, useLocation } from 'react-router-dom';

const drawerWidth = 220;

const navItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Chapters', icon: <MenuBookIcon />, path: '/chapters' },
  { text: 'Users', icon: <GroupIcon />, path: '/users' },
];

// Helper to get initials and color
function getAvatarProps(name) {
  if (!name) return { children: 'A', sx: { bgcolor: '#1976d2', color: '#fff' } };
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  // Pick a color based on char code
  const colors = ['#1976d2', '#43a047', '#d32f2f', '#fbc02d', '#7b1fa2'];
  const color = colors[(name.charCodeAt(0) + (name.charCodeAt(1) || 0)) % colors.length];
  return { children: initials, sx: { bgcolor: color, color: '#fff' } };
}

export default function ModernLayout({ children, onLogout, user }) {
  const location = useLocation();
  // Example user fallback
  const displayName = user?.name || 'Academia Admin';
  const displayEmail = user?.email || 'admin@academia.com';
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: 'background.default' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: '#222b36',
            color: '#fff',
            border: 'none',
          },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
          <Avatar {...getAvatarProps(displayName)} sx={{ width: 64, height: 64, mb: 2, ...getAvatarProps(displayName).sx }} />
          <Typography variant="h6" fontWeight={700}>{displayName}</Typography>
          <Typography variant="body2" color="rgba(255,255,255,0.7)">{displayEmail}</Typography>
        </Box>
        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.12)' }} />
        <List>
          {navItems.map(item => (
            <ListItem button key={item.text} component={Link} to={item.path} selected={location.pathname === item.path} sx={{
              borderRadius: 2,
              my: 1,
              mx: 2,
              background: location.pathname === item.path ? 'rgba(25, 118, 210, 0.15)' : 'none',
              '&:hover': { background: 'rgba(25, 118, 210, 0.08)' },
            }}>
              <ListItemIcon sx={{ color: '#fff' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
        <Box flexGrow={1} />
        <List>
          <ListItem button onClick={onLogout} sx={{ borderRadius: 2, mx: 2, mb: 2, '&:hover': { background: 'rgba(25, 118, 210, 0.08)' } }}>
            <ListItemIcon sx={{ color: '#fff' }}><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 4 }, minHeight: '100vh', display: 'flex', flexDirection: 'column', maxWidth: '100vw' }}>
        {children}
        <Box sx={{ mt: 'auto', textAlign: 'center', py: 2, color: 'rgba(0,0,0,0.4)' }}>
          © {new Date().getFullYear()} Academia Platform
        </Box>
      </Box>
    </Box>
  );
}
