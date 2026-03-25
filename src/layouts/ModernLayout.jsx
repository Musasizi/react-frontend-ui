/**
 * layouts/ModernLayout.jsx – Persistent Sidebar Layout
 *
 * KEY CONCEPT – Layout Components
 * A layout component wraps page content with shared UI (sidebar, header, footer).
 * Pages are passed as `children` so the layout stays the same while only the
 * main content area changes when the user navigates.
 *
 * Props:
 *  children  – The page component to render in the main content area
 *  onLogout  – Callback invoked when the user clicks Logout
 *  user      – Decoded JWT payload ({ id, username }) or null
 */

import {
  Box, Drawer, List, ListItem, ListItemIcon, ListItemText,
  Avatar, Typography, Divider, AppBar, Toolbar, Chip,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LogoutIcon from '@mui/icons-material/Logout';
import { Link, useLocation } from 'react-router-dom';

// Width of the permanent sidebar (in pixels)
const DRAWER_WIDTH = 230;

// Navigation items shown in the sidebar
const NAV_ITEMS = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Chapters', icon: <MenuBookIcon />, path: '/chapters' },
  { text: 'Users', icon: <GroupIcon />, path: '/users' },
];

// ── Helper: pick an Avatar background colour based on the username ────────────
const AVATAR_COLORS = ['#1976d2', '#43a047', '#d32f2f', '#fbc02d', '#7b1fa2'];

function avatarColor(name = '') {
  const code = (name.codePointAt(0) ?? 0) + (name.codePointAt(1) ?? 0);
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ModernLayout({ children, onLogout, user }) {
  const location = useLocation();
  const username = user?.username || 'User';
  const initials = username.slice(0, 2).toUpperCase();

  // Find the nav item matching the current path to show as a breadcrumb
  const activeNav = NAV_ITEMS.find(n => n.path === location.pathname);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>

      {/* ── Sidebar ── */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            background: '#1a2332',
            color: '#fff',
            border: 'none',
          },
        }}
      >
        {/* User avatar + info */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4, px: 2 }}>
          <Avatar sx={{ width: 64, height: 64, mb: 1.5, bgcolor: avatarColor(username), fontWeight: 700, fontSize: 24 }}>
            {initials}
          </Avatar>
          <Typography variant="subtitle1" fontWeight={700} noWrap>{username}</Typography>
          <Chip label="Logged in" size="small" color="success" sx={{ mt: 0.5, height: 20, fontSize: 11 }} />
        </Box>

        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />

        {/* Navigation links */}
        <List sx={{ px: 1, mt: 1 }}>
          {NAV_ITEMS.map(item => {
            const active = location.pathname === item.path;
            return (
              <ListItem
                button
                key={item.text}
                component={Link}
                to={item.path}
                sx={{
                  borderRadius: 2,
                  my: 0.5,
                  background: active ? 'rgba(25,118,210,0.25)' : 'transparent',
                  borderLeft: active ? '3px solid #1976d2' : '3px solid transparent',
                  '&:hover': { background: 'rgba(255,255,255,0.06)' },
                }}
              >
                <ListItemIcon sx={{ color: active ? '#64b5f6' : 'rgba(255,255,255,0.7)', minWidth: 36 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography fontWeight={active ? 700 : 400} fontSize={14}>
                      {item.text}
                    </Typography>
                  }
                />
              </ListItem>
            );
          })}
        </List>

        <Box flexGrow={1} />

        {/* Logout button at the bottom of the sidebar */}
        <List sx={{ px: 1, mb: 1 }}>
          <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 1 }} />
          <ListItem
            button
            onClick={onLogout}
            sx={{ borderRadius: 2, '&:hover': { background: 'rgba(211,47,47,0.15)' } }}
          >
            <ListItemIcon sx={{ color: '#ef9a9a', minWidth: 36 }}><LogoutIcon /></ListItemIcon>
            <ListItemText primary={<Typography fontSize={14} color="#ef9a9a">Logout</Typography>} />
          </ListItem>
        </List>
      </Drawer>

      {/* ── Main Content ── */}
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f5f6fa' }}>

        {/* Top bar showing the current page name */}
        <AppBar position="static" elevation={0} sx={{ bgcolor: '#fff', borderBottom: '1px solid #e0e0e0' }}>
          <Toolbar variant="dense">
            <Typography variant="h6" fontWeight={700} color="text.primary">
              {activeNav?.text ?? 'Academia'}
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Page content */}
        <Box sx={{ flexGrow: 1, p: { xs: 2, sm: 4 } }}>
          {children}
        </Box>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', py: 2, color: 'rgba(0,0,0,0.35)', fontSize: 12 }}>
          © {new Date().getFullYear()} Academia Platform
        </Box>
      </Box>
    </Box>
  );
}

