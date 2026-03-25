/**
 * pages/Chapters.jsx — UCU Chapter Management Page
 *
 * New features added:
 *   • chapter_type  — ENUM: lecture | lab | tutorial | seminar | workshop
 *   • status        — active | archived
 *   • Search bar    — client-side filter by name
 *   • Type filter   — filter chips across the top
 *   • Status tabs   — active / archived / all
 *   • Enrolment badge per card showing enrolled user count
 */

import { useEffect, useState } from 'react';
import { getChapters, createChapter, updateChapter, deleteChapter, getUsersInChapter } from '../utils/api';
import { useToast } from '../hooks/useToast';
import Toast from '../components/Toast';
import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Grid, Card, CardContent, CardActions, IconButton, Stack,
  ToggleButton, ToggleButtonGroup, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Alert, CircularProgress, Tooltip, Chip,
  MenuItem, Select, FormControl, InputLabel, InputAdornment, Tabs, Tab, Badge,
} from '@mui/material';
import EditIcon       from '@mui/icons-material/Edit';
import DeleteIcon     from '@mui/icons-material/Delete';
import AddIcon        from '@mui/icons-material/Add';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import TableRowsIcon  from '@mui/icons-material/TableRows';
import MenuBookIcon   from '@mui/icons-material/MenuBook';
import SearchIcon     from '@mui/icons-material/Search';
import PeopleAltIcon  from '@mui/icons-material/PeopleAlt';
import ArchiveIcon    from '@mui/icons-material/Archive';

const UCU = {
  maroon:     '#7B1C1C',
  maroonDark: '#5C1010',
  gold:       '#C9A227',
  goldLight:  '#F5E6B0',
  white:      '#FFFFFF',
};

// Type metadata — colour badge + label for each chapter_type
const TYPE_META = {
  lecture:  { label: 'Lecture',  color: '#1A4A7B', bg: '#E8F4FD' },
  lab:      { label: 'Lab',      color: '#1A5C2E', bg: '#E6F4EA' },
  tutorial: { label: 'Tutorial', color: UCU.maroon, bg: UCU.goldLight },
  seminar:  { label: 'Seminar',  color: '#6A1B9A', bg: '#F3E5F5' },
  workshop: { label: 'Workshop', color: '#E65100', bg: '#FBE9E7' },
};
const TYPES = ['all', 'lecture', 'lab', 'tutorial', 'seminar', 'workshop'];

// ── Component ─────────────────────────────────────────────────────────────────
export default function Chapters({ token }) {
  const { toast, showToast, hideToast } = useToast();

  const [chapters,     setChapters]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [view,         setView]         = useState('grid');
  const [search,       setSearch]       = useState('');
  const [typeFilter,   setTypeFilter]   = useState('all');
  const [statusTab,    setStatusTab]    = useState('active');
  const [enrolCounts,  setEnrolCounts]  = useState({});

  const [formOpen,     setFormOpen]     = useState(false);
  const [editTarget,   setEditTarget]   = useState(null);
  const [form,         setForm]         = useState({ name: '', description: '', chapter_type: 'lecture', status: 'active' });
  const [formError,    setFormError]    = useState('');
  const [saving,       setSaving]       = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);

  // ── Data fetching ───────────────────────────────────────────────────────────
  const fetchChapters = async () => {
    setLoading(true); setError('');
    try {
      const data = await getChapters();
      setChapters(data);
      // Fetch enrolment counts for all chapters in parallel (best-effort)
      const counts = {};
      await Promise.allSettled(
        data.map(async (ch) => {
          try {
            const users = await getUsersInChapter(ch.id, token);
            counts[ch.id] = users.length;
          } catch { counts[ch.id] = 0; }
        })
      );
      setEnrolCounts(counts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchChapters(); }, [token]); // eslint-disable-line

  // ── Derived filtered list ───────────────────────────────────────────────────
  const visible = chapters.filter(ch => {
    const matchSearch = ch.name.toLowerCase().includes(search.toLowerCase());
    const matchType   = typeFilter === 'all' || ch.chapter_type === typeFilter;
    const matchStatus = statusTab  === 'all'  || ch.status === statusTab;
    return matchSearch && matchType && matchStatus;
  });

  // ── Form handlers ───────────────────────────────────────────────────────────
  const openForm = (chapter = null) => {
    setEditTarget(chapter);
    setForm(chapter
      ? { name: chapter.name, description: chapter.description ?? '', chapter_type: chapter.chapter_type ?? 'lecture', status: chapter.status ?? 'active' }
      : { name: '', description: '', chapter_type: 'lecture', status: 'active' }
    );
    setFormError('');
    setFormOpen(true);
  };

  const handleFormSubmit = async () => {
    if (!form.name.trim()) { setFormError('Chapter name is required.'); return; }
    setSaving(true); setFormError('');
    try {
      if (editTarget) {
        await updateChapter(editTarget.id, form, token);
        showToast(`"${form.name}" updated successfully.`, 'success', 'Chapter Updated');
      } else {
        await createChapter(form, token);
        showToast(`"${form.name}" was created.`, 'success', 'Chapter Added');
      }
      setFormOpen(false);
      fetchChapters();
    } catch (err) {
      setFormError(err.message);
      showToast(err.message, 'error', 'Save Failed');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete handlers ─────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const name = deleteTarget.name;
    try {
      await deleteChapter(deleteTarget.id, token);
      setDeleteTarget(null);
      showToast(`"${name}" was deleted.`, 'warning', 'Chapter Deleted');
      fetchChapters();
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error', 'Delete Failed');
    } finally {
      setDeleting(false);
    }
  };

  // ── Type badge chip ─────────────────────────────────────────────────────────
  const TypeChip = ({ type }) => {
    const meta = TYPE_META[type] ?? { label: type, color: '#555', bg: '#eee' };
    return (
      <Chip
        label={meta.label}
        size="small"
        sx={{ bgcolor: meta.bg, color: meta.color, fontWeight: 700, fontSize: 11, height: 22 }}
      />
    );
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <Box>

      {/* ── Page header ── */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ width: 4, height: 26, bgcolor: UCU.gold, borderRadius: 1 }} />
          <Typography variant="h5" fontWeight={800} color={UCU.maroon}>Chapters</Typography>
          {!loading && (
            <Chip
              label={chapters.length}
              size="small"
              sx={{ bgcolor: UCU.goldLight, color: UCU.maroon, fontWeight: 700 }}
            />
          )}
        </Stack>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <ToggleButtonGroup
            value={view} exclusive size="small"
            onChange={(_, v) => v && setView(v)}
            sx={{
              '& .MuiToggleButton-root': { borderColor: 'rgba(123,28,28,0.25)' },
              '& .MuiToggleButton-root.Mui-selected': { bgcolor: UCU.goldLight, color: UCU.maroon },
            }}
          >
            <ToggleButton value="grid"  aria-label="Grid view"><ViewModuleIcon /></ToggleButton>
            <ToggleButton value="table" aria-label="Table view"><TableRowsIcon /></ToggleButton>
          </ToggleButtonGroup>

          <Button
            variant="contained" startIcon={<AddIcon />}
            onClick={() => openForm()}
            sx={{ bgcolor: UCU.maroon, '&:hover': { bgcolor: UCU.maroonDark }, borderRadius: 2, fontWeight: 700 }}
          >
            Add Chapter
          </Button>
        </Stack>
      </Stack>

      {/* ── Status tabs + search + type filter row ── */}
      <Paper sx={{ borderRadius: 2, mb: 2.5, overflow: 'hidden', border: '1px solid rgba(123,28,28,0.1)' }}>
        <Tabs
          value={statusTab}
          onChange={(_, v) => setStatusTab(v)}
          sx={{
            borderBottom: '1px solid rgba(123,28,28,0.1)',
            '& .MuiTab-root': { fontSize: 13, fontWeight: 600, minHeight: 42 },
            '& .Mui-selected': { color: UCU.maroon },
            '& .MuiTabs-indicator': { bgcolor: UCU.maroon },
          }}
        >
          <Tab value="all"      label={`All (${chapters.length})`} />
          <Tab value="active"   label={`Active (${chapters.filter(c => c.status === 'active').length})`} />
          <Tab value="archived" label={
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <ArchiveIcon sx={{ fontSize: 14 }} />
              <span>Archived ({chapters.filter(c => c.status === 'archived').length})</span>
            </Stack>
          } />
        </Tabs>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ p: 1.5 }} alignItems="center">
          {/* Search */}
          <TextField
            size="small" placeholder="Search chapters…" value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{ flex: 1, minWidth: 200, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: UCU.maroon, fontSize: 18 }} /></InputAdornment> } }}
          />

          {/* Type filter chips */}
          <Stack direction="row" spacing={0.75} flexWrap="wrap">
            {TYPES.map(t => (
              <Chip
                key={t}
                label={t === 'all' ? 'All Types' : TYPE_META[t].label}
                size="small"
                clickable
                onClick={() => setTypeFilter(t)}
                sx={{
                  fontWeight: 600, fontSize: 12,
                  bgcolor: typeFilter === t ? UCU.maroon : 'transparent',
                  color:   typeFilter === t ? UCU.white  : 'text.secondary',
                  border:  typeFilter === t ? 'none' : '1px solid rgba(0,0,0,0.18)',
                  '&:hover': { bgcolor: typeFilter === t ? UCU.maroonDark : UCU.goldLight },
                }}
              />
            ))}
          </Stack>
        </Stack>
      </Paper>

      {/* ── Feedback ── */}
      {error   && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress sx={{ color: UCU.maroon }} /></Box>}

      {/* ── Empty state ── */}
      {!loading && !error && visible.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 10, color: 'text.secondary' }}>
          <MenuBookIcon sx={{ fontSize: 72, color: UCU.goldLight }} />
          <Typography mt={2} fontWeight={600}>
            {search || typeFilter !== 'all' ? 'No chapters match your filters.' : 'No chapters yet.'}
          </Typography>
          {!search && typeFilter === 'all' && (
            <Typography variant="body2">Click &quot;Add Chapter&quot; to create the first one.</Typography>
          )}
        </Box>
      )}

      {/* ── Grid View ── */}
      {!loading && view === 'grid' && (
        <Grid container spacing={3}>
          {visible.map((ch, idx) => (
            <Grid item xs={12} sm={6} md={4} key={ch.id}>
              <Card
                sx={{
                  borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
                  border: '1px solid rgba(123,28,28,0.08)',
                  opacity: ch.status === 'archived' ? 0.72 : 1,
                  transition: '0.2s',
                  '&:hover': { boxShadow: '0 6px 22px rgba(123,28,28,0.14)', transform: 'translateY(-3px)' },
                }}
              >
                {/* Top colour strip based on type */}
                <Box sx={{ height: 4, bgcolor: TYPE_META[ch.chapter_type]?.color ?? UCU.maroon, borderRadius: '10px 10px 0 0' }} />
                <CardContent sx={{ flexGrow: 1, pt: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={1} mb={1} flexWrap="wrap" useFlexGap>
                    <Chip label={`#${idx + 1}`} size="small" sx={{ bgcolor: UCU.goldLight, color: UCU.maroon, fontWeight: 700, fontSize: 11 }} />
                    <TypeChip type={ch.chapter_type} />
                    {ch.status === 'archived' && (
                      <Chip icon={<ArchiveIcon sx={{ fontSize: 12 }} />} label="Archived" size="small" sx={{ bgcolor: '#eee', color: '#666', fontSize: 10 }} />
                    )}
                  </Stack>
                  <Typography variant="h6" fontWeight={700} color={UCU.maroon} gutterBottom>{ch.name}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    {ch.description || <em>No description</em>}
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <PeopleAltIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                    <Typography variant="caption" color="text.disabled">
                      {enrolCounts[ch.id] ?? '…'} enrolled
                    </Typography>
                  </Stack>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 1.5 }}>
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => openForm(ch)} sx={{ color: UCU.maroon, '&:hover': { bgcolor: UCU.goldLight } }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" color="error" onClick={() => setDeleteTarget(ch)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* ── Table View ── */}
      {!loading && view === 'table' && (
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.07)', border: '1px solid rgba(123,28,28,0.08)' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: UCU.maroon }}>
                <TableCell sx={{ color: UCU.white, fontWeight: 700, width: 50 }}>#</TableCell>
                <TableCell sx={{ color: UCU.white, fontWeight: 700 }}>Chapter Name</TableCell>
                <TableCell sx={{ color: UCU.white, fontWeight: 700 }}>Type</TableCell>
                <TableCell sx={{ color: UCU.white, fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ color: UCU.white, fontWeight: 700 }}>Enrolled</TableCell>
                <TableCell sx={{ color: UCU.white, fontWeight: 700 }}>Description</TableCell>
                <TableCell sx={{ color: UCU.white, fontWeight: 700 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visible.map((ch, idx) => (
                <TableRow key={ch.id} hover sx={{ opacity: ch.status === 'archived' ? 0.7 : 1, '&:last-child td': { border: 0 } }}>
                  <TableCell><Chip label={idx + 1} size="small" sx={{ bgcolor: UCU.goldLight, color: UCU.maroon, fontWeight: 700 }} /></TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{ch.name}</TableCell>
                  <TableCell><TypeChip type={ch.chapter_type} /></TableCell>
                  <TableCell>
                    <Chip
                      label={ch.status === 'active' ? 'Active' : 'Archived'}
                      size="small"
                      sx={{ bgcolor: ch.status === 'active' ? '#E6F4EA' : '#eee', color: ch.status === 'active' ? '#1A5C2E' : '#666', fontWeight: 600, fontSize: 11 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <PeopleAltIcon sx={{ fontSize: 15, color: 'text.disabled' }} />
                      <Typography variant="body2">{enrolCounts[ch.id] ?? '…'}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ch.description || '—'}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => openForm(ch)} sx={{ color: UCU.maroon }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => setDeleteTarget(ch)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* ── Create / Edit Dialog ── */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} slotProps={{ paper: { sx: { borderRadius: 3, minWidth: 440 } } }}>
        <DialogTitle sx={{ fontWeight: 800, color: UCU.maroon, borderBottom: `3px solid ${UCU.maroon}`, pb: 1.5 }}>
          {editTarget ? 'Edit Chapter' : 'Add New Chapter'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}

          <TextField
            label="Chapter Name" fullWidth margin="normal"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            required autoFocus
          />
          <TextField
            label="Description (optional)" fullWidth margin="normal"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            multiline rows={3}
          />

          <Stack direction="row" spacing={2} mt={0.5}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Type</InputLabel>
              <Select
                value={form.chapter_type}
                label="Type"
                onChange={e => setForm(f => ({ ...f, chapter_type: e.target.value }))}
              >
                {Object.entries(TYPE_META).map(([val, { label }]) => (
                  <MenuItem key={val} value={val}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                value={form.status}
                label="Status"
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setFormOpen(false)} variant="outlined" sx={{ borderColor: UCU.maroon, color: UCU.maroon }}>Cancel</Button>
          <Button onClick={handleFormSubmit} variant="contained" disabled={saving}
            sx={{ bgcolor: UCU.maroon, '&:hover': { bgcolor: UCU.maroonDark } }}>
            {saving ? <CircularProgress size={20} sx={{ color: UCU.white }} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 800, color: 'error.main' }}>Delete Chapter</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setDeleteTarget(null)} variant="outlined">Cancel</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error" disabled={deleting}>
            {deleting ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Toast toast={toast} onClose={hideToast} />
    </Box>
  );
}
