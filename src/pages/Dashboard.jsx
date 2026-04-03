/**
 * pages/Dashboard.jsx — UCU Dashboard
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography, Box, Card, CardContent, Grid, Paper,
  Avatar, Stack, CircularProgress, Button, Chip, Divider,
} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import GroupIcon from '@mui/icons-material/Group';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import ReactApexChart from 'react-apexcharts';
import { getChapters, getUsers, getChapterStats } from '../utils/api';

const UCU = {
  maroon: '#7B1C1C',
  maroonDark: '#5C1010',
  gold: '#C9A227',
  goldLight: '#F5E6B0',
  white: '#FFFFFF',
};

const TYPE_META = {
  lecture: { label: 'Lecture', color: '#1A4A7B', bg: '#E8F4FD' },
  lab: { label: 'Lab', color: '#1A5C2E', bg: '#E6F4EA' },
  tutorial: { label: 'Tutorial', color: '#7B1C1C', bg: '#F5E6B0' },
  seminar: { label: 'Seminar', color: '#6A1B9A', bg: '#F3E5F5' },
  workshop: { label: 'Workshop', color: '#E65100', bg: '#FBE9E7' },
};

export default function Dashboard({ token, user }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [chapterCount, setChapterCount] = useState(null);
  const [userCount, setUserCount] = useState(null);

  useEffect(() => {
    Promise.all([getChapters(), getUsers(token), getChapterStats(token)])
      .then(([chapters, users, s]) => {
        setChapterCount(chapters.length);
        setUserCount(users.length);
        setStats(s);
      })
      .catch(() => { setChapterCount(0); setUserCount(0); });
  }, [token]);

  const statCards = [
    {
      label: 'Total Chapters', value: chapterCount,
      icon: <MenuBookIcon sx={{ fontSize: 32 }} />,
      accent: UCU.maroon, lightBg: '#FDF2F2',
      trend: '+2 this week', link: '/chapters',
    },
    {
      label: 'Registered Users', value: userCount,
      icon: <GroupIcon sx={{ fontSize: 32 }} />,
      accent: '#1A4A7B', lightBg: '#EEF4FB',
      trend: 'Active learners', link: '/users',
    },
    {
      label: 'Total Enrolments', value: stats?.enrolments ?? null,
      icon: <HowToRegIcon sx={{ fontSize: 32 }} />,
      accent: '#1A5C2E', lightBg: '#EEF8F1',
      trend: 'Across all chapters', link: null,
    },
    {
      label: 'Avg Enrolments', value: chapterCount ? Math.round((stats?.enrolments ?? 0) / chapterCount) : null,
      icon: <TrendingUpIcon sx={{ fontSize: 32 }} />,
      accent: '#7B5200', lightBg: '#FDF7EC',
      trend: 'Per chapter', link: null,
    },
  ];

  const firstName = user?.username
    ? user.username.charAt(0).toUpperCase() + user.username.slice(1)
    : 'there';

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // ── ApexCharts config ───────────────────────────────────────────────────────
  const donutSeries = (stats?.byType ?? []).map(r => Number(r.count));
  const donutLabels = (stats?.byType ?? []).map(r => TYPE_META[r.chapter_type]?.label ?? r.chapter_type);
  const donutColors = (stats?.byType ?? []).map(r => TYPE_META[r.chapter_type]?.color ?? '#999');

  const donutOptions = {
    chart: { type: 'donut', toolbar: { show: false }, animations: { enabled: true, speed: 600 } },
    labels: donutLabels,
    colors: donutColors,
    dataLabels: { enabled: true, formatter: (val) => `${Math.round(val)}%`, style: { fontSize: '12px', fontWeight: 800 }, dropShadow: { enabled: false } },
    plotOptions: { pie: { donut: { size: '60%', labels: { show: true, total: { show: true, label: 'Total', fontSize: '13px', fontWeight: 700, color: '#555', formatter: (w) => w.globals.seriesTotals.reduce((a, b) => a + b, 0) } } } } },
    legend: { position: 'bottom', fontSize: '12px', fontWeight: 600, markers: { width: 10, height: 10, radius: 5 }, itemMargin: { horizontal: 8, vertical: 4 } },
    stroke: { width: 2 },
    tooltip: { y: { formatter: (val) => `${val} chapter${val !== 1 ? 's' : ''}` } },
  };

  const barCategories = (stats?.enrolmentsPerChapter ?? []).slice(0, 8).map(r => r.name.length > 14 ? r.name.slice(0, 13) + '…' : r.name);
  const barSeries = [{ name: 'Enrolled', data: (stats?.enrolmentsPerChapter ?? []).slice(0, 8).map(r => Number(r.enrolled)) }];

  const barOptions = {
    chart: { type: 'bar', toolbar: { show: false }, animations: { enabled: true, speed: 600 } },
    plotOptions: { bar: { borderRadius: 6, columnWidth: '55%', dataLabels: { position: 'top' } } },
    dataLabels: { enabled: true, offsetY: -20, style: { fontSize: '11px', fontWeight: 700, colors: [UCU.maroon] } },
    xaxis: { categories: barCategories, axisBorder: { show: false }, axisTicks: { show: false }, labels: { style: { fontSize: '11px', colors: '#777' }, rotate: -25, rotateAlways: true } },
    yaxis: { labels: { style: { fontSize: '11px', colors: '#aaa' } } },
    colors: [UCU.maroon],
    grid: { borderColor: 'rgba(0,0,0,0.06)', strokeDashArray: 4, yaxis: { lines: { show: true } }, xaxis: { lines: { show: false } } },
    tooltip: { y: { formatter: (val) => `${val} student${val !== 1 ? 's' : ''}` } },
    legend: { show: false },
  };

  return (
    <Box sx={{ width: '100%' }}>

      {/* ── Hero Banner ── */}
      <Box
        sx={{
          mb: 3.5, borderRadius: 4, overflow: 'hidden', position: 'relative',
          background: `linear-gradient(135deg, ${UCU.maroon} 0%, #A52828 50%, ${UCU.maroonDark} 100%)`,
          p: { xs: 3, md: 4 },
          boxShadow: '0 8px 32px rgba(123,28,28,0.35)',
        }}
      >
        {/* Background pattern */}
        <Box sx={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'radial-gradient(circle at 20px 20px, white 2px, transparent 0)',
          backgroundSize: '40px 40px',
        }} />
        {/* Glow orbs */}
        <Box sx={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', bgcolor: 'rgba(201,162,39,0.2)', filter: 'blur(40px)' }} />
        <Box sx={{ position: 'absolute', bottom: -40, left: '30%', width: 150, height: 150, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.06)', filter: 'blur(30px)' }} />

        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
          <Box>
            <Typography variant="caption" sx={{ color: UCU.gold, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', fontSize: 11 }}>
              UCU Learning Management System
            </Typography>
            <Typography variant="h4" fontWeight={900} color={UCU.white} sx={{ mt: 0.5, lineHeight: 1.2 }}>
              {greeting}, {firstName}! 👋
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.72)', mt: 1 }}>
              Here&apos;s what&apos;s happening across your courses today.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5} flexShrink={0}>
            <Button
              variant="contained"
              startIcon={<AutoStoriesIcon />}
              onClick={() => navigate('/chapters')}
              sx={{
                bgcolor: UCU.gold, color: '#3D2600', fontWeight: 800,
                borderRadius: 2.5, px: 2.5,
                '&:hover': { bgcolor: '#E8BC35' },
                boxShadow: '0 4px 14px rgba(201,162,39,0.4)',
              }}
            >
              Chapters
            </Button>
            <Button
              variant="outlined"
              startIcon={<TrendingUpIcon />}
              onClick={() => navigate('/reports')}
              sx={{
                color: UCU.white, borderColor: 'rgba(255,255,255,0.4)', fontWeight: 700,
                borderRadius: 2.5, px: 2.5,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.7)' },
              }}
            >
              Reports
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* ── KPI Cards ── */}
      <Grid container spacing={2.5} mb={3.5}>
        {statCards.map((card, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card
              onClick={() => card.link && navigate(card.link)}
              sx={{
                borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
                cursor: card.link ? 'pointer' : 'default',
                transition: 'all 0.25s',
                overflow: 'hidden',
                '&:hover': card.link ? {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 12px 28px ${card.accent}22`,
                  borderColor: `${card.accent}44`,
                } : {},
              }}
            >
              <Box sx={{ height: 5, bgcolor: card.accent }} />
              <CardContent sx={{ pt: 3, pb: '24px !important', px: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ letterSpacing: 0.8, textTransform: 'uppercase', fontSize: 11 }}>
                      {card.label}
                    </Typography>
                    <Typography variant="h2" fontWeight={900} color={card.accent} sx={{ lineHeight: 1.1, mt: 0.75 }}>
                      {card.value === null
                        ? <CircularProgress size={32} sx={{ color: card.accent }} />
                        : card.value}
                    </Typography>
                  </Box>
                  <Box sx={{ bgcolor: card.lightBg, borderRadius: 2.5, p: 1.8, color: card.accent }}>
                    <Box sx={{ fontSize: 32, display: 'flex' }}>{card.icon}</Box>
                  </Box>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={0.5} mt={3}>
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: 12 }}>
                    {card.trend}
                  </Typography>
                  {card.link && <ArrowForwardIcon sx={{ fontSize: 13, color: card.accent, ml: 'auto' }} />}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ── Charts row ── */}
      <Grid container spacing={2.5} mb={3.5}>

        {/* Donut — chapters by type */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', overflow: 'hidden', height: '100%' }}>
            <Box sx={{ px: 3, pt: 2.5, pb: 1.5 }}>
              <Typography variant="subtitle2" fontWeight={800}>Chapters by Type</Typography>
              <Typography variant="caption" color="text.disabled">Distribution across all chapter types</Typography>
            </Box>
            <Divider />
            <Box sx={{ p: 1 }}>
              {donutSeries.length === 0 ? (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={6}>No data available</Typography>
              ) : (
                <ReactApexChart type="donut" series={donutSeries} options={donutOptions} height={340} />
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Bar — enrolments per chapter */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', overflow: 'hidden', height: '100%' }}>
            <Box sx={{ px: 3, pt: 2.5, pb: 1.5 }}>
              <Typography variant="subtitle2" fontWeight={800}>Enrolments per Chapter</Typography>
              <Typography variant="caption" color="text.disabled">Top 8 chapters by number of enrolled students</Typography>
            </Box>
            <Divider />
            <Box sx={{ p: 1 }}>
              {barSeries[0].data.length === 0 ? (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={8}>No enrolment data</Typography>
              ) : (
                <ReactApexChart type="bar" series={barSeries} options={barOptions} height={340} />
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* ── Recent activity ── */}
      {stats?.recent?.length > 0 && (
        <Paper sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 3, py: 2, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <Box>
              <Typography variant="subtitle2" fontWeight={800} color="text.primary">Recently Added Chapters</Typography>
              <Typography variant="caption" color="text.disabled">Latest 5 entries</Typography>
            </Box>
            <Button size="small" endIcon={<ArrowForwardIcon sx={{ fontSize: 13 }} />}
              onClick={() => navigate('/chapters')}
              sx={{ color: UCU.maroon, fontWeight: 700, fontSize: 12 }}>
              View all
            </Button>
          </Stack>
          <Box>
            {stats.recent.map((ch, idx) => {
              const meta = TYPE_META[ch.chapter_type] ?? { label: ch.chapter_type, color: '#777', bg: '#eee' };
              return (
                <Stack
                  key={ch.id} direction="row" alignItems="center" spacing={2}
                  sx={{
                    px: 3, py: 1.8,
                    borderBottom: idx < stats.recent.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                    transition: '0.15s',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' },
                  }}
                >
                  <Avatar sx={{ bgcolor: meta.bg, color: meta.color, width: 38, height: 38 }}>
                    <MenuBookIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Box flex={1} minWidth={0}>
                    <Typography variant="body2" fontWeight={700} noWrap>{ch.name}</Typography>
                    <Typography variant="caption" color="text.disabled">
                      {ch.created_at ? new Date(ch.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </Typography>
                  </Box>
                  <Chip label={meta.label} size="small"
                    sx={{ bgcolor: meta.bg, color: meta.color, fontWeight: 700, fontSize: 11, height: 22 }} />
                  <Chip
                    label={ch.status === 'active' ? 'Active' : 'Archived'}
                    size="small"
                    sx={{ bgcolor: ch.status === 'active' ? '#E6F4EA' : '#F5F5F5', color: ch.status === 'active' ? '#1A5C2E' : '#888', fontWeight: 600, fontSize: 11, height: 22 }}
                  />
                </Stack>
              );
            })}
          </Box>
        </Paper>
      )}
    </Box>
  );
}
