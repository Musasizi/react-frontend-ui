/**
 * layouts/ModernLayout.jsx — UCU-Branded App Shell
 *
 * STRUCTURE:
 *   ┌────────────────────────────────────────────────────┐
 *   │  Sidebar (permanent Drawer, 240px, UCU Maroon)     │
 *   │    UCU crest + university name                     │
 *   │    Navigation items — active = gold left border    │
 *   │    User avatar + name + logout at bottom           │
 *   ├────────────────────────────────────────────────────┤
 *   │  AppBar (white, 3px maroon bottom border)          │
 *   │    Breadcrumb: Home › Current Page                 │
 *   │    Logged-in user chip                             │
 *   ├────────────────────────────────────────────────────┤
 *   │  Page content — {children}                         │
 *   └────────────────────────────────────────────────────┘
 *
 * PROPS:
 *   children  – the page component rendered in the content area
 *   user      – decoded JWT payload: { id, username, email, iat, exp }
 */

import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, List, ListItemButton, ListItemIcon,
  ListItemText, Typography, Avatar, Divider, Stack, Tooltip,
  IconButton, Breadcrumbs, Link, Chip,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LogoutIcon from '@mui/icons-material/Logout';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ucuLogo from '../assets/uculogotousenobg.png';

// ── Constants ─────────────────────────────────────────────────────────────────
const DRAWER_WIDTH = 240;

// UCU brand colours — keep in sync with main.jsx ucuTheme
const UCU = {
  maroon: '#7B1C1C',
  maroonDark: '#5C1010',
  gold: '#C9A227',
  goldLight: '#F5E6B0',
  white: '#FFFFFF',
  offWhite: '#F9F5F0',
};

// Sidebar navigation items
const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { path: '/chapters', label: 'Chapters', icon: <MenuBookIcon /> },
  { path: '/users', label: 'Users', icon: <PeopleIcon /> },
  { path: '/reports', label: 'Reports', icon: <AssessmentIcon /> },
];

// Map path → human-readable breadcrumb label
const PAGE_LABELS = {
  '/dashboard': 'Dashboard',
  '/chapters': 'Chapters',
  '/users': 'Users',
  '/reports': 'Reports',
};

// Pick an avatar background from a small palette, based on first character of username
const AVATAR_COLORS = [UCU.maroon, '#7B3F00', '#1A4A7B', '#1A5C2E', '#4A1A7B'];
const avatarBg = (name = '') =>
  AVATAR_COLORS[(name.codePointAt(0) ?? 0) % AVATAR_COLORS.length];

// ── Component ─────────────────────────────────────────────────────────────────
export default function ModernLayout({ children, user }) {
  const location = useLocation();
  const navigate = useNavigate();

  const username = user?.username ?? 'User';
  const pageLabel = PAGE_LABELS[location.pathname] ?? 'Page';

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // ── Sidebar contents ────────────────────────────────────────────────────────
  const drawer = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: UCU.maroon,
        color: UCU.white,
      }}
    >
      {/* UCU Branding header */}
      <Box sx={{ px: 2.5, pt: 3, pb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} mb={0.5}>
          <Box
            sx={{
              width: 42, height: 42,
              borderRadius: '50%',
              bgcolor: UCU.white,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              p: 0.4,
              boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
            }}
          >
            <Box
              component="img"
              src={ucuLogo}
              alt="UCU Logo"
              sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </Box>
          <Box>
            <Typography
              variant="subtitle1"
              sx={{ color: UCU.white, fontWeight: 800, lineHeight: 1.1, letterSpacing: 0.5 }}
            >
              UCU
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: UCU.goldLight, fontSize: 9, letterSpacing: 0.6, lineHeight: 1, display: 'block' }}
            >
              UGANDA CHRISTIAN UNIVERSITY
            </Typography>
          </Box>
        </Stack>
        <Typography
          variant="caption"
          sx={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, display: 'block', mt: 0.5 }}
        >
          Learning Management System
        </Typography>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)' }} />

      {/* Navigation list */}
      <List sx={{ px: 1.5, pt: 1.5, flexGrow: 1 }}>
        {NAV_ITEMS.map(({ path, label, icon }) => {
          const active = location.pathname === path;
          return (
            <ListItemButton
              key={path}
              onClick={() => navigate(path)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                px: 1.5,
                py: 1,
                color: active ? UCU.gold : 'rgba(255,255,255,0.75)',
                bgcolor: active ? 'rgba(201,162,39,0.15)' : 'transparent',
                borderLeft: active ? `3px solid ${UCU.gold}` : '3px solid transparent',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.08)',
                  color: UCU.white,
                },
                transition: 'all 0.18s ease',
              }}
            >
              <ListItemIcon sx={{ minWidth: 38, color: 'inherit' }}>
                {icon}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography sx={{ fontWeight: active ? 700 : 500, fontSize: 14, color: 'inherit' }}>
                    {label}
                  </Typography>
                }
              />
            </ListItemButton>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)' }} />

      {/* User info + logout at bottom */}
      <Box sx={{ px: 2, py: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: avatarBg(username),
              border: `2px solid ${UCU.gold}`,
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            {username[0]?.toUpperCase()}
          </Avatar>
          <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
            <Typography
              variant="body2"
              sx={{ color: UCU.white, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {username}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.45)', fontSize: 10 }}>
              Student
            </Typography>
          </Box>
          <Tooltip title="Logout">
            <IconButton
              size="small"
              onClick={handleLogout}
              sx={{ color: 'rgba(255,255,255,0.55)', '&:hover': { color: UCU.gold } }}
            >
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
    </Box>
  );

  // ── Full layout shell ───────────────────────────────────────────────────────
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: UCU.offWhite }}>

      {/* Permanent sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            border: 'none',
            boxShadow: '4px 0 20px rgba(0,0,0,0.12)',
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Right side: AppBar + content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top AppBar */}
        <AppBar
          position="static"
          elevation={0}
          sx={{
            bgcolor: UCU.white,
            borderBottom: `3px solid ${UCU.maroon}`,
            color: 'text.primary',
          }}
        >
          <Toolbar sx={{ minHeight: 56 }}>
            <Breadcrumbs
              separator={<NavigateNextIcon fontSize="small" sx={{ color: UCU.maroon }} />}
              sx={{ flexGrow: 1 }}
            >
              <Link
                underline="hover"
                onClick={() => navigate('/dashboard')}
                sx={{ cursor: 'pointer', fontSize: 13, color: UCU.maroon, fontWeight: 600 }}
              >
                Home
              </Link>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: UCU.maroon }}>
                {pageLabel}
              </Typography>
            </Breadcrumbs>

            <Chip
              avatar={
                <Avatar sx={{ bgcolor: `${avatarBg(username)} !important`, fontSize: 12 }}>
                  {username[0]?.toUpperCase()}
                </Avatar>
              }
              label={username}
              size="small"
              variant="outlined"
              sx={{ borderColor: UCU.maroon, color: UCU.maroon, fontWeight: 600, fontSize: 12 }}
            />
          </Toolbar>
        </AppBar>

        {/* Page content */}
        <Box component="main" sx={{ flexGrow: 1, p: 3, overflow: 'auto' }}>
          {children}
        </Box>

        {/* Footer */}
        <Box
          sx={{
            textAlign: 'center',
            py: 1.5,
            borderTop: '1px solid rgba(123,28,28,0.12)',
            color: UCU.maroon,
            fontSize: 11,
            fontWeight: 500,
            opacity: 0.7,
          }}
        >
          © {new Date().getFullYear()} Uganda Christian University — Learning Management System
        </Box>
      </Box>
    </Box>
  );
}


