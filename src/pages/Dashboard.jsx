/**
 * pages/Dashboard.jsx – Home / Overview Page
 *
 * KEY CONCEPT – useEffect for data fetching
 * useEffect runs a side-effect after the component renders.
 * Passing [token] as the dependency array means the effect re-runs
 * only when the token changes (e.g. after login).
 *
 * We fetch real counts from the API instead of hard-coding numbers,
 * so the dashboard always reflects live database state.
 */

import { useEffect, useState } from 'react';
import {
  Typography, Box, Card, CardContent, Grid,
  Avatar, Stack, CircularProgress, Divider,
} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import GroupIcon from '@mui/icons-material/Group';
import SchoolIcon from '@mui/icons-material/School';
import { getChapters, getUsers } from '../utils/api';

export default function Dashboard({ token, user }) {
  // ── State ─────────────────────────────────────────────────────────────────
  const [chapterCount, setChapterCount] = useState(null); // null = not yet loaded
  const [userCount, setUserCount] = useState(null);

  // ── Fetch real stats from the API ─────────────────────────────────────────
  useEffect(() => {
    // Using Promise.all fetches both endpoints in parallel (faster than sequential)
    Promise.all([getChapters(), getUsers(token)])
      .then(([chapters, users]) => {
        setChapterCount(chapters.length);
        setUserCount(users.length);
      })
      .catch(() => {
        // If an error occurs (e.g. network issue) show 0 rather than crashing
        setChapterCount(0);
        setUserCount(0);
      });
  }, [token]); // re-run if token changes

  // ── Stats config (icon, label, value, colour) ─────────────────────────────
  const stats = [
    {
      label: 'Total Chapters',
      value: chapterCount,
      icon: <MenuBookIcon sx={{ fontSize: 36 }} />,
      color: '#1976d2',
      bg: '#e3f2fd',
    },
    {
      label: 'Registered Users',
      value: userCount,
      icon: <GroupIcon sx={{ fontSize: 36 }} />,
      color: '#388e3c',
      bg: '#e8f5e9',
    },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Box>
      {/* Welcome banner */}
      <Card
        sx={{
          mb: 4,
          borderRadius: 3,
          boxShadow: 3,
          background: 'linear-gradient(90deg, #1a2332 0%, #2d4a7a 100%)',
          color: '#fff',
        }}
      >
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={2}>
            <Avatar sx={{ width: 64, height: 64, bgcolor: '#1976d2', fontWeight: 700, fontSize: 28 }}>
              <SchoolIcon sx={{ fontSize: 36 }} />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={800}>
                Welcome back, {user?.username ?? 'User'}!
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
                Here is a live overview of your Academia platform.
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Typography variant="h6" fontWeight={700} mb={2} color="text.secondary">
        Platform Stats
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {/* Stat cards */}
      <Grid container spacing={3}>
        {stats.map(stat => (
          <Grid item xs={12} sm={6} key={stat.label}>
            <Card sx={{ borderRadius: 3, boxShadow: 2, p: 1 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  {/* Coloured icon circle */}
                  <Box
                    sx={{
                      width: 60, height: 60,
                      borderRadius: '50%',
                      bgcolor: stat.bg,
                      color: stat.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Box>
                    {/* Show a spinner while data is loading, then the real number */}
                    {stat.value === null
                      ? <CircularProgress size={24} />
                      : <Typography variant="h4" fontWeight={800}>{stat.value}</Typography>
                    }
                    <Typography color="text.secondary" variant="body2">{stat.label}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

