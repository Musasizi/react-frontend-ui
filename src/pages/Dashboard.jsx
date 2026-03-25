/**
 * pages/Dashboard.jsx — UCU Dashboard / Home Page
 *
 * KEY CONCEPT – useEffect for data fetching
 * useEffect runs a side-effect after the component renders.
 * Passing [token] as the dependency array means the effect re-runs
 * only when the token changes (e.g. after login).
 *
 * Promise.all fetches both API endpoints in PARALLEL (faster than sequential).
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography, Box, Card, CardContent, Grid,
  Avatar, Stack, CircularProgress, Button, Divider,
} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import GroupIcon from '@mui/icons-material/Group';
import SchoolIcon from '@mui/icons-material/School';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { getChapters, getUsers } from '../utils/api';

// UCU brand colours — self-contained so this file is easy to read
const UCU = {
  maroon: '#7B1C1C',
  maroonDark: '#5C1010',
  gold: '#C9A227',
  goldLight: '#F5E6B0',
  white: '#FFFFFF',
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function Dashboard({ token, user }) {
  const navigate = useNavigate();

  // null = still loading, number = loaded
  const [chapterCount, setChapterCount] = useState(null);
  const [userCount, setUserCount] = useState(null);

  // Fetch both counts in parallel when the component mounts
  useEffect(() => {
    Promise.all([getChapters(), getUsers(token)])
      .then(([chapters, users]) => {
        setChapterCount(chapters.length);
        setUserCount(users.length);
      })
      .catch(() => {
        setChapterCount(0);
        setUserCount(0);
      });
  }, [token]);

  // ── Stat card config ────────────────────────────────────────────────────────
  const stats = [
    {
      label: 'Total Chapters',
      value: chapterCount,
      icon: <MenuBookIcon sx={{ fontSize: 32 }} />,
      iconBg: UCU.goldLight,
      iconColor: UCU.maroon,
      accentColor: UCU.maroon,
      action: () => navigate('/chapters'),
      actionLabel: 'View Chapters',
    },
    {
      label: 'Registered Users',
      value: userCount,
      icon: <GroupIcon sx={{ fontSize: 32 }} />,
      iconBg: '#E8F4FD',
      iconColor: '#1A4A7B',
      accentColor: '#1A4A7B',
      action: () => navigate('/users'),
      actionLabel: 'View Users',
    },
  ];

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <Box>

      {/* ── Welcome Banner ── */}
      <Card
        sx={{
          mb: 4,
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(123,28,28,0.18)',
          background: `linear-gradient(120deg, ${UCU.maroon} 0%, ${UCU.maroonDark} 100%)`,
          color: UCU.white,
          position: 'relative',
        }}
      >
        {/* Subtle decorative circle */}
        <Box sx={{
          position: 'absolute', right: -30, top: -30,
          width: 160, height: 160, borderRadius: '50%',
          bgcolor: 'rgba(201,162,39,0.12)',
        }} />
        <CardContent sx={{ py: 3.5, px: 4 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={2.5}>
            <Avatar
              sx={{
                width: 68, height: 68,
                bgcolor: UCU.gold,
                boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
              }}
            >
              <SchoolIcon sx={{ fontSize: 38, color: UCU.maroon }} />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                Welcome back, {user?.username ?? 'Student'}!
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
                Uganda Christian University — Learning Management System
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* ── Section heading ── */}
      <Stack direction="row" alignItems="center" spacing={1} mb={1}>
        <Box sx={{ width: 4, height: 22, bgcolor: UCU.gold, borderRadius: 1 }} />
        <Typography variant="h6" fontWeight={700} color={UCU.maroon}>
          Platform Overview
        </Typography>
      </Stack>
      <Divider sx={{ mb: 3, borderColor: 'rgba(123,28,28,0.15)' }} />

      {/* ── Stat cards ── */}
      <Grid container spacing={3}>
        {stats.map(stat => (
          <Grid item xs={12} sm={6} key={stat.label}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                border: `1px solid rgba(123,28,28,0.08)`,
                transition: '0.2s',
                '&:hover': { boxShadow: '0 6px 20px rgba(123,28,28,0.12)', transform: 'translateY(-2px)' },
              }}
            >
              {/* Top accent strip */}
              <Box sx={{ height: 4, bgcolor: stat.accentColor, borderRadius: '10px 10px 0 0' }} />
              <CardContent sx={{ pt: 2.5 }}>
                <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                  <Box
                    sx={{
                      width: 56, height: 56,
                      borderRadius: 2.5,
                      bgcolor: stat.iconBg,
                      color: stat.iconColor,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Box>
                    {stat.value === null
                      ? <CircularProgress size={24} sx={{ color: UCU.maroon }} />
                      : (
                        <Typography variant="h3" fontWeight={800} color={stat.accentColor} lineHeight={1}>
                          {stat.value}
                        </Typography>
                      )
                    }
                    <Typography color="text.secondary" variant="body2" mt={0.3}>
                      {stat.label}
                    </Typography>
                  </Box>
                </Stack>

                <Button
                  variant="outlined"
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                  onClick={stat.action}
                  sx={{
                    borderColor: stat.accentColor,
                    color: stat.accentColor,
                    fontWeight: 600,
                    borderRadius: 2,
                    '&:hover': { bgcolor: `${stat.accentColor}10` },
                  }}
                >
                  {stat.actionLabel}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}


