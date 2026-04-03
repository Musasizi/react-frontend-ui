/**
 * pages/Reports.jsx — UCU Analytics & Reports
 */
import { useEffect, useState } from 'react';
import { getChapterStats } from '../utils/api';
import {
    Box, Typography, Stack, Paper, Grid, Chip, CircularProgress,
    Alert, Divider, Table, TableHead, TableRow, TableCell, TableBody,
    TableContainer, Avatar, LinearProgress,
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import ArchiveIcon from '@mui/icons-material/Archive';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ReactApexChart from 'react-apexcharts';

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

// ── KPI Card ─────────────────────────────────────────────────────────────────
const KpiCard = ({ icon, label, value, accent, lightBg, sub }) => (
    <Paper sx={{
        p: 0, borderRadius: 3, flex: 1, overflow: 'hidden',
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
    }}>
        <Box sx={{ height: 3, bgcolor: accent }} />
        <Stack direction="row" alignItems="center" spacing={2} sx={{ p: 2.5 }}>
            <Box sx={{ bgcolor: lightBg, borderRadius: 2.5, p: 1.5, color: accent, flexShrink: 0 }}>
                {icon}
            </Box>
            <Box>
                <Typography variant="h4" fontWeight={900} color={accent} lineHeight={1.1}>
                    {value ?? <CircularProgress size={22} sx={{ color: accent }} />}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>{label}</Typography>
                {sub && <Typography variant="caption" color="text.disabled" display="block">{sub}</Typography>}
            </Box>
        </Stack>
    </Paper>
);

// ── Component ─────────────────────────────────────────────────────────────────
export default function Reports({ token }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        (async () => {
            try {
                setStats(await getChapterStats(token));
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        })();
    }, [token]);

    if (loading) return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 12 }}>
            <CircularProgress sx={{ color: UCU.maroon }} size={44} thickness={3} />
            <Typography variant="body2" color="text.secondary">Loading analytics…</Typography>
        </Box>
    );

    if (error) return <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>;

    const activeCount = Number((stats?.byStatus ?? []).find(s => s.status === 'active')?.count ?? 0);
    const archivedCount = Number((stats?.byStatus ?? []).find(s => s.status === 'archived')?.count ?? 0);
    const total = Number(stats?.chapterTotal) || 1;
    const activePct = Math.round((activeCount / total) * 100);
    const archivedPct = Math.round((archivedCount / total) * 100);

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
        tooltip: { y: { formatter: (val) => `${val} chapter${val === 1 ? '' : 's'}` } },
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
        tooltip: { y: { formatter: (val) => `${val} student${val === 1 ? '' : 's'}` } },
        legend: { show: false },
    };

    return (
        <Box sx={{ width: '100%' }}>

            {/* ── Page header ── */}
            <Box
                sx={{
                    mb: 3.5, borderRadius: 3, overflow: 'hidden',
                    background: `linear-gradient(135deg, ${UCU.maroon} 0%, #A52828 100%)`,
                    p: { xs: 2.5, md: 3 },
                    boxShadow: '0 4px 20px rgba(123,28,28,0.28)',
                    position: 'relative',
                }}
            >
                <Box sx={{
                    position: 'absolute', inset: 0, opacity: 0.04,
                    backgroundImage: 'radial-gradient(circle at 20px 20px, white 1.5px, transparent 0)',
                    backgroundSize: '36px 36px',
                }} />
                <Box sx={{ position: 'absolute', top: -50, right: -50, width: 180, height: 180, borderRadius: '50%', bgcolor: 'rgba(201,162,39,0.18)', filter: 'blur(35px)' }} />
                <Stack direction="row" alignItems="center" spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ bgcolor: 'rgba(255,255,255,0.12)', borderRadius: 2, p: 1.2 }}>
                        <AssessmentIcon sx={{ color: UCU.gold, fontSize: 28 }} />
                    </Box>
                    <Box>
                        <Typography variant="h5" fontWeight={900} color={UCU.white}>Reports & Analytics</Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)' }}>
                            Comprehensive overview of your UCU LMS data
                        </Typography>
                    </Box>
                </Stack>
            </Box>

            {/* ── KPI Row ── */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={3.5} flexWrap="wrap" useFlexGap sx={{ width: '100%' }}>
                <KpiCard icon={<MenuBookIcon />} label="Total Chapters" value={stats?.chapterTotal} accent={UCU.maroon} lightBg="#FDF2F2" sub="All time" />
                <KpiCard icon={<PeopleAltIcon />} label="Registered Users" value={stats?.userTotal} accent="#1A4A7B" lightBg="#EEF4FB" sub="Learner accounts" />
                <KpiCard icon={<HowToRegIcon />} label="Total Enrolments" value={stats?.enrolments} accent="#1A5C2E" lightBg="#EEF8F1" sub="Across all chapters" />
            </Stack>

            {/* ── Charts row ── */}
            <Grid container spacing={3} mb={3.5}>

                {/* Donut — chapters by type */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', overflow: 'hidden', height: '100%' }}>
                        <Box sx={{ px: 3, pt: 2.5, pb: 1.5 }}>
                            <Typography variant="subtitle2" fontWeight={800}>Chapters by Type</Typography>
                            <Typography variant="caption" color="text.disabled">Type distribution breakdown</Typography>
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
                            <Typography variant="caption" color="text.disabled">Top 8 chapters by enrolled students</Typography>
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

            {/* ── Bottom row: status panel + recent table ── */}
            <Grid container spacing={3}>

                {/* Status panel */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                        <Box sx={{ px: 3, pt: 2.5, pb: 1.5 }}>
                            <Typography variant="subtitle2" fontWeight={800}>Chapter Status</Typography>
                            <Typography variant="caption" color="text.disabled">Active vs archived overview</Typography>
                        </Box>
                        <Divider />
                        <Box sx={{ p: 2.5 }}>
                            <Grid container spacing={2} mb={2.5}>
                                {[
                                    { label: 'Active', count: activeCount, color: '#1A5C2E', bg: '#E6F4EA', icon: <CheckCircleOutlineIcon sx={{ fontSize: 20 }} /> },
                                    { label: 'Archived', count: archivedCount, color: '#7B1C1C', bg: '#FDF2F2', icon: <ArchiveIcon sx={{ fontSize: 20 }} /> },
                                ].map(s => (
                                    <Grid item xs={6} key={s.label}>
                                        <Box sx={{ bgcolor: s.bg, borderRadius: 2.5, p: 2, textAlign: 'center' }}>
                                            <Box sx={{ color: s.color, mb: 0.5 }}>{s.icon}</Box>
                                            <Typography variant="h4" fontWeight={900} color={s.color}>{s.count}</Typography>
                                            <Typography variant="caption" color={s.color} fontWeight={600}>{s.label}</Typography>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>

                            <Stack spacing={2}>
                                {[
                                    { label: 'Active', pct: activePct, color: '#1A5C2E' },
                                    { label: 'Archived', pct: archivedPct, color: UCU.maroon },
                                ].map(r => (
                                    <Box key={r.label}>
                                        <Stack direction="row" justifyContent="space-between" mb={0.6}>
                                            <Typography variant="caption" color="text.secondary" fontWeight={600}>{r.label}</Typography>
                                            <Typography variant="caption" fontWeight={800} color={r.color}>{r.pct}%</Typography>
                                        </Stack>
                                        <LinearProgress variant="determinate" value={r.pct}
                                            sx={{
                                                height: 8, borderRadius: 4, bgcolor: `${r.color}18`,
                                                '& .MuiLinearProgress-bar': { bgcolor: r.color, borderRadius: 4 }
                                            }} />
                                    </Box>
                                ))}
                            </Stack>
                        </Box>
                    </Paper>
                </Grid>

                {/* Recent chapters */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                        <Box sx={{ px: 3, pt: 2.5, pb: 1.5 }}>
                            <Typography variant="subtitle2" fontWeight={800}>Recently Added Chapters</Typography>
                            <Typography variant="caption" color="text.disabled">Last 5 chapters created</Typography>
                        </Box>
                        <Divider />
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                                        {['Chapter', 'Type', 'Status', 'Date Added'].map(h => (
                                            <TableCell key={h} sx={{ fontWeight: 700, fontSize: 11, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, py: 1.5 }}>{h}</TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(stats?.recent ?? []).map((ch, idx) => {
                                        const meta = TYPE_META[ch.chapter_type] ?? { label: ch.chapter_type, color: '#777', bg: '#eee' };
                                        return (
                                            <TableRow key={ch.id} hover
                                                sx={{ '&:last-child td': { border: 0 }, transition: '0.15s', '&:hover': { bgcolor: 'rgba(123,28,28,0.02)' } }}>
                                                <TableCell>
                                                    <Stack direction="row" alignItems="center" spacing={1.5}>
                                                        <Avatar sx={{ bgcolor: meta.bg, color: meta.color, width: 32, height: 32 }}>
                                                            <MenuBookIcon sx={{ fontSize: 15 }} />
                                                        </Avatar>
                                                        <Typography variant="body2" fontWeight={700}>{ch.name}</Typography>
                                                    </Stack>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip label={meta.label} size="small"
                                                        sx={{ bgcolor: meta.bg, color: meta.color, fontWeight: 700, fontSize: 10, height: 20 }} />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={ch.status === 'active' ? 'Active' : 'Archived'}
                                                        size="small"
                                                        sx={{ bgcolor: ch.status === 'active' ? '#E6F4EA' : '#F5F5F5', color: ch.status === 'active' ? '#1A5C2E' : '#888', fontWeight: 600, fontSize: 10, height: 20 }}
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ color: 'text.secondary', fontSize: 12, whiteSpace: 'nowrap' }}>
                                                    {ch.created_at ? new Date(ch.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    {(!stats?.recent || stats.recent.length === 0) && (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center" sx={{ color: 'text.secondary', py: 4 }}>No chapter data yet</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
