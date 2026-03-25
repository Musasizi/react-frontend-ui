/**
 * pages/Dashboard.jsx — UCU Dashboard / Home Page
 *
 * Charts added (recharts):
 *   • Donut chart  — chapters breakdown by type
 *   • Bar chart    — top chapters by enrolment
 *   • Recent activity feed
 *
 * KEY CONCEPT – Promise.all: runs multiple API requests in PARALLEL (faster).
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography, Box, Card, CardContent, Grid, Paper,
  Avatar, Stack, CircularProgress, Button, Divider, Chip,
} from '@mui/material';
import MenuBookIcon   from '@mui/icons-material/MenuBook';
import GroupIcon      from '@mui/icons-material/Group';
import HowToRegIcon   from '@mui/icons-material/HowToReg';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AssessmentIcon from '@mui/icons-material/Assessment';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { getChapters, getUsers, getChapterStats } from '../utils/api';
import {
  PieChart, Pie, Cell, Tooltip as RTooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

const UCU = {
  maroon:     '#7B1C1C',
  maroonDark: '#5C1010',
  gold:       '#C9A227',
  goldLight:  '#F5E6B0',
  white:      '#FFFFFF',
};

const TYPE_META = {
  lecture:  { label: 'Lecture',  color: '#1A4A7B' },
  lab:      { label: 'Lab',      color: '#1A5C2E' },
  tutorial: { label: 'Tutorial', color: UCU.maroon },
  seminar:  { label: 'Seminar',  color: '#6A1B9A' },
  workshop: { label: 'Workshop', color: '#E65100' },
};

// Renders % in the centre of pie slices
const PieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.06) return null;
  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700}>{`${(percent * 100).toFixed(0)}%`}</text>;
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function Dashboard({ token, user }) {
  const navigate = useNavigate();

  const [stats,        setStats]        = useState(null);
  const [chapterCount, setChapterCount] = useState(null);
  const [userCount,    setUserCount]    = useState(null);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    Promise.all([getChapters(), getUsers(token), getChapterStats(token)])
      .then(([chapters, users, s]) => {
        setChapterCount(chapters.length);
        setUserCount(users.length);
        setStats(s);
      })
      .catch(() => {
        setChapterCount(0);
        setUserCount(0);
      })
      .finally(() => setLoading(false));
  }, [token]);

  // ── Stat cards config ────────────────────────────────────────────────────────
  const statCards = [
    { label: 'Total Chapters',   value: chapterCount, icon: <MenuBookIcon  sx={{ fontSize: 28 }} />, accent: UCU.maroon,  link: '/chapters' },
    { label: 'Registered Users',  value: userCount,    icon: <GroupIcon     sx={{ fontSize: 28 }} />, accent: '#1A4A7B', link: '/users' },
    { label: 'Total Enrolments',  value: stats?.enrolments ?? null, icon: <HowToRegIcon sx={{ fontSize: 28 }} />, accent: '#1A5C2E', link: null },
  ];

  // Recharts data
  const pieData = (stats?.byType ?? []).map(r => ({
    name:  TYPE_META[r.chapter_type]?.label ?? r.chapter_type,
    value: Number(r.count),
    fill:  TYPE_META[r.chapter_type]?.color ?? '#999',
  }));

  const barData = (stats?.enrolments ?? []).map ? [] : [];
  // barData lives in Reports; here we use byType as bar for variety
  const typeBar = (stats?.byType ?? []).map(r => ({
    name:     TYPE_META[r.chapter_type]?.label ?? r.chapter_type,
    chapters: Number(r.count),
    fill:     TYPE_META[r.chapter_type]?.color ?? '#999',
  }));

  const firstName = user?.username
    ? user.username.charAt(0).toUpperCase() + user.username.slice(1)
    : 'there';

  return (
    <Box>
      {/* ── Welcome banner ── */}
      <Paper
        sx={{
          p: { xs: 2.5, md: 3 }, mb: 3, borderRadius: 3,
          background: `linear-gradient(135deg, ${UCU.maroon} 0%, ${UCU.maroonDark} 100%)`,
          color: UCU.white,
          boxShadow: '0 4px 20px rgba(123,28,28,0.3)',
          position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <Box sx={{ position: 'absolute', top: -20, right: -20, width: 140, height: 140, borderRadius: '50%', bgcolor: 'rgba(201,162,39,0.15)' }} />
        <Box sx={{ position: 'absolute', bottom: -30, right: 60, width: 90,  height: 90,  borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.07)' }} />
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={2}>
          <Box>
            <Typography variant="h5" fontWeight={800} gutterBottom>
              Welcome back, {firstName}! 👋
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              Here&apos;s a snapshot of your UCU Learning Management System.
            </Typography>
          </Box>
          <Button
            variant="outlined" endIcon={<AssessmentIcon />}
            onClick={() => navigate('/reports')}
            sx={{ color: UCU.gold, borderColor: UCU.gold, '&:hover': { bgcolor: 'rgba(201,162,39,0.15)', borderColor: UCU.gold }, whiteSpace: 'nowrap', fontWeight: 700 }}
          >
            View Reports
          </Button>
        </Stack>
      </Paper>

      {/* ── Stat cards ── */}
      <Grid container spacing={2.5} mb={3.5}>
        {statCards.map((card, i) => (
          <Grid item xs={12} sm={4} key={i}>
            <Card
              sx={{
                borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
                border: '1px solid rgba(123,28,28,0.08)',
                cursor: card.link ? 'pointer' : 'default',
                transition: '0.2s',
                '&:hover': card.link ? { transform: 'translateY(-3px)', boxShadow: '0 8px 22px rgba(0,0,0,0.12)' } : {},
              }}
              onClick={() => card.link && navigate(card.link)}
            >
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h3" fontWeight={800} color={UCU.maroon}>
                      {card.value === null ? <CircularProgress size={28} sx={{ color: UCU.maroon }} /> : card.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>{card.label}</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: card.accent, width: 52, height: 52 }}>{card.icon}</Avatar>
                </Stack>
                {card.link && (
                  <Stack direction="row" alignItems="center" spacing={0.5} mt={1.5}>
                    <Typography variant="caption" color={UCU.maroon} fontWeight={600}>View all</Typography>
                    <ArrowForwardIcon sx={{ fontSize: 14, color: UCU.maroon }} />
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ── Charts row ── */}
      {!loading && (
        <Grid container spacing={3} mb={3.5}>

          {/* Donut chart */}
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid rgba(123,28,28,0.1)', height: '100%' }}>
              <Typography variant="subtitle1" fontWeight={700} color={UCU.maroon} mb={0.5}>Chapters by Type</Typography>
              <Divider sx={{ mb: 2 }} />
              {pieData.length === 0 ? (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={5}>No data yet</Typography>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" labelLine={false} label={PieLabel}>
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <RTooltip />
                    <Legend iconType="circle" iconSize={10} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Paper>
          </Grid>

          {/* Bar chart — chapters count per type */}
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid rgba(123,28,28,0.1)', height: '100%' }}>
              <Typography variant="subtitle1" fontWeight={700} color={UCU.maroon} mb={0.5}>Chapter Distribution</Typography>
              <Divider sx={{ mb: 2 }} />
              {typeBar.length === 0 ? (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={5}>No data yet</Typography>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={typeBar} margin={{ top: 4, right: 10, bottom: 10, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <RTooltip />
                    <Bar dataKey="chapters" name="Chapters" radius={[5, 5, 0, 0]}>
                      {typeBar.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* ── Recent chapters activity feed ── */}
      {stats?.recent?.length > 0 && (
        <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid rgba(123,28,28,0.1)' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
            <Typography variant="subtitle1" fontWeight={700} color={UCU.maroon}>Recently Added Chapters</Typography>
            <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/chapters')} sx={{ color: UCU.maroon, fontWeight: 600 }}>
              All Chapters
            </Button>
          </Stack>
          <Divider sx={{ mb: 2 }} />
          <Stack spacing={1.5}>
            {stats.recent.map(ch => (
              <Stack key={ch.id} direction="row" alignItems="center" spacing={2} sx={{ py: 0.5 }}>
                <Avatar sx={{ bgcolor: TYPE_META[ch.chapter_type]?.color ?? UCU.maroon, width: 36, height: 36, fontSize: 14 }}>
                  <MenuBookIcon fontSize="small" />
                </Avatar>
                <Box flex={1}>
                  <Typography variant="body2" fontWeight={600}>{ch.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {ch.created_at ? new Date(ch.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </Typography>
                </Box>
                <Chip
                  label={TYPE_META[ch.chapter_type]?.label ?? ch.chapter_type}
                  size="small"
                  sx={{ bgcolor: `${TYPE_META[ch.chapter_type]?.color ?? '#777'}18`, color: TYPE_META[ch.chapter_type]?.color ?? '#777', fontWeight: 700, fontSize: 11 }}
                />
                <Chip
                  label={ch.status === 'active' ? 'Active' : 'Archived'}
                  size="small"
                  sx={{ bgcolor: ch.status === 'active' ? '#E6F4EA' : '#eee', color: ch.status === 'active' ? '#1A5C2E' : '#888', fontWeight: 600, fontSize: 11 }}
                />
              </Stack>
            ))}
          </Stack>
        </Paper>
      )}
    </Box>
  );
}
