/**
 * pages/Reports.jsx — UCU Analytics & Reports Page
 *
 * Sections:
 *   1. Summary stat cards  (chapters, users, enrolments)
 *   2. Chapters by Type    — Recharts PieChart / Donut
 *   3. Enrolments per Chapter — Recharts BarChart
 *   4. Chapters by Status  — simple stats row
 *   5. Recent Activity feed (latest 5 chapters added)
 */

import { useEffect, useState } from 'react';
import { getChapterStats } from '../utils/api';
import {
    Box, Typography, Stack, Paper, Grid, Chip, CircularProgress,
    Alert, Divider, Table, TableHead, TableRow, TableCell, TableBody,
    TableContainer, Avatar,
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import {
    PieChart, Pie, Cell, Tooltip as RTooltip, Legend, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

const UCU = {
    maroon: '#7B1C1C',
    maroonDark: '#5C1010',
    gold: '#C9A227',
    goldLight: '#F5E6B0',
    white: '#FFFFFF',
};

// Pie chart colours — one per chapter type
const TYPE_COLORS = ['#1A4A7B', '#1A5C2E', '#7B1C1C', '#6A1B9A', '#E65100'];
const TYPE_META = {
    lecture: { label: 'Lecture', color: '#1A4A7B' },
    lab: { label: 'Lab', color: '#1A5C2E' },
    tutorial: { label: 'Tutorial', color: UCU.maroon },
    seminar: { label: 'Seminar', color: '#6A1B9A' },
    workshop: { label: 'Workshop', color: '#E65100' },
};

// ── Stat Card helper ──────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, accent }) => (
    <Paper
        sx={{
            p: 2.5, borderRadius: 3, flex: 1,
            border: `1px solid rgba(123,28,28,0.1)`,
            boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
            display: 'flex', alignItems: 'center', gap: 2,
        }}
    >
        <Avatar sx={{ bgcolor: accent, width: 48, height: 48 }}>{icon}</Avatar>
        <Box>
            <Typography variant="h4" fontWeight={800} color={UCU.maroon}>{value ?? '—'}</Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>{label}</Typography>
        </Box>
    </Paper>
);

// ── Custom Pie label ──────────────────────────────────────────────────────────
const PieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700}>
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function Reports({ token }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const data = await getChapterStats(token);
                setStats(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        })();
    }, [token]);

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress sx={{ color: UCU.maroon }} />
        </Box>
    );

    if (error) return <Alert severity="error">{error}</Alert>;

    // Normalise data for recharts
    const pieData = (stats?.byType ?? []).map(r => ({
        name: TYPE_META[r.chapter_type]?.label ?? r.chapter_type,
        value: Number(r.count),
        fill: TYPE_META[r.chapter_type]?.color ?? '#999',
    }));

    const barData = (stats?.enrolmentsPerChapter ?? []).map(r => ({
        name: r.name.length > 18 ? r.name.slice(0, 16) + '…' : r.name,
        enrolled: Number(r.enrolled),
    }));

    const activeCount = (stats?.byStatus ?? []).find(s => s.status === 'active')?.count ?? 0;
    const archivedCount = (stats?.byStatus ?? []).find(s => s.status === 'archived')?.count ?? 0;

    return (
        <Box>
            {/* ── Header ── */}
            <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
                <Box sx={{ width: 4, height: 26, bgcolor: UCU.gold, borderRadius: 1 }} />
                <AssessmentIcon sx={{ color: UCU.maroon, fontSize: 28 }} />
                <Typography variant="h5" fontWeight={800} color={UCU.maroon}>Reports & Analytics</Typography>
            </Stack>

            {/* ── Summary stat cards ── */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={3.5} flexWrap="wrap" useFlexGap>
                <StatCard icon={<MenuBookIcon />} label="Total Chapters" value={stats?.chapterTotal} accent={UCU.maroon} />
                <StatCard icon={<PeopleAltIcon />} label="Registered Users" value={stats?.userTotal} accent="#1A4A7B" />
                <StatCard icon={<HowToRegIcon />} label="Total Enrolments" value={stats?.enrolments} accent="#1A5C2E" />
            </Stack>

            {/* ── Charts row ── */}
            <Grid container spacing={3} mb={3.5}>

                {/* Donut chart — Chapters by type */}
                <Grid item xs={12} md={5}>
                    <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid rgba(123,28,28,0.1)', height: '100%' }}>
                        <Typography variant="subtitle1" fontWeight={700} color={UCU.maroon} mb={1.5}>
                            Chapters by Type
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        {pieData.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>No data available</Typography>
                        ) : (
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%" cy="50%"
                                        innerRadius={65} outerRadius={105}
                                        dataKey="value"
                                        labelLine={false}
                                        label={PieLabel}
                                    >
                                        {pieData.map((entry, i) => (
                                            <Cell key={i} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <RTooltip formatter={(val, name) => [val, name]} />
                                    <Legend iconType="circle" iconSize={10} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </Paper>
                </Grid>

                {/* Bar chart — Enrolments per chapter */}
                <Grid item xs={12} md={7}>
                    <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid rgba(123,28,28,0.1)', height: '100%' }}>
                        <Typography variant="subtitle1" fontWeight={700} color={UCU.maroon} mb={1.5}>
                            Enrolments per Chapter
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        {barData.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>No enrolment data</Typography>
                        ) : (
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={barData} margin={{ top: 4, right: 10, bottom: 30, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                                    <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" interval={0} />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                                    <RTooltip />
                                    <Bar dataKey="enrolled" name="Enrolled" fill={UCU.maroon} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            {/* ── Status + Recent row ── */}
            <Grid container spacing={3}>

                {/* Status breakdown */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid rgba(123,28,28,0.1)' }}>
                        <Typography variant="subtitle1" fontWeight={700} color={UCU.maroon} mb={1.5}>
                            Chapter Status
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Stack spacing={2}>
                            {[
                                { label: 'Active', count: activeCount, color: '#1A5C2E', bg: '#E6F4EA' },
                                { label: 'Archived', count: archivedCount, color: '#5C1010', bg: '#FBE9E7' },
                            ].map(row => (
                                <Stack key={row.label} direction="row" justifyContent="space-between" alignItems="center">
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <FiberManualRecordIcon sx={{ color: row.color, fontSize: 14 }} />
                                        <Typography variant="body2" fontWeight={600}>{row.label}</Typography>
                                    </Stack>
                                    <Chip
                                        label={row.count}
                                        size="small"
                                        sx={{ bgcolor: row.bg, color: row.color, fontWeight: 700, minWidth: 40 }}
                                    />
                                </Stack>
                            ))}

                            <Divider />
                            {/* Percentage bars */}
                            {[
                                { label: 'Active', count: activeCount, color: '#1A5C2E' },
                                { label: 'Archived', count: archivedCount, color: UCU.maroon },
                            ].map(row => {
                                const total = Number(stats?.chapterTotal) || 1;
                                const pct = Math.round((Number(row.count) / total) * 100);
                                return (
                                    <Box key={row.label}>
                                        <Stack direction="row" justifyContent="space-between">
                                            <Typography variant="caption" color="text.secondary">{row.label}</Typography>
                                            <Typography variant="caption" fontWeight={700}>{pct}%</Typography>
                                        </Stack>
                                        <Box sx={{ bgcolor: '#eee', borderRadius: 5, height: 7, overflow: 'hidden', mt: 0.5 }}>
                                            <Box sx={{ width: `${pct}%`, bgcolor: row.color, height: '100%', borderRadius: 5, transition: 'width 0.8s ease' }} />
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Stack>
                    </Paper>
                </Grid>

                {/* Recent chapters table */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid rgba(123,28,28,0.1)' }}>
                        <Typography variant="subtitle1" fontWeight={700} color={UCU.maroon} mb={1.5}>
                            Recently Added Chapters
                        </Typography>
                        <Divider sx={{ mb: 1 }} />
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700, color: UCU.maroon }}>Chapter</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: UCU.maroon }}>Type</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: UCU.maroon }}>Status</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: UCU.maroon }}>Added</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(stats?.recent ?? []).map(ch => (
                                        <TableRow key={ch.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                                            <TableCell sx={{ fontWeight: 600 }}>{ch.name}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={TYPE_META[ch.chapter_type]?.label ?? ch.chapter_type}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: `${TYPE_META[ch.chapter_type]?.color ?? '#777'}18`,
                                                        color: TYPE_META[ch.chapter_type]?.color ?? '#777',
                                                        fontWeight: 700, fontSize: 11,
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={ch.status === 'active' ? 'Active' : 'Archived'}
                                                    size="small"
                                                    sx={{ bgcolor: ch.status === 'active' ? '#E6F4EA' : '#eee', color: ch.status === 'active' ? '#1A5C2E' : '#666', fontWeight: 600, fontSize: 11 }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ color: 'text.secondary', fontSize: 12 }}>
                                                {ch.created_at ? new Date(ch.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {(!stats?.recent || stats.recent.length === 0) && (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center" sx={{ color: 'text.secondary', py: 3 }}>No chapter data yet</TableCell>
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
