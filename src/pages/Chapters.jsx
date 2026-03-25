/**
 * pages/Chapters.jsx — UCU Chapter Management Page
 *
 * CRUD = Create, Read, Update, Delete — all four operations in one page:
 *   Read   → fetchChapters() on mount
 *   Create → "Add Chapter" button → dialog form → createChapter() API
 *   Update → "Edit" icon → same dialog pre-filled → updateChapter() API
 *   Delete → "Delete" icon → confirmation dialog → deleteChapter() API
 *
 * View toggle: same data shown as cards (Grid) or rows (Table).
 */

import { useEffect, useState } from 'react';
import { getChapters, createChapter, updateChapter, deleteChapter } from '../utils/api';
import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Grid, Card, CardContent, CardActions, IconButton, Stack,
  ToggleButton, ToggleButtonGroup, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Alert, CircularProgress, Tooltip, Chip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import TableRowsIcon from '@mui/icons-material/TableRows';
import MenuBookIcon from '@mui/icons-material/MenuBook';

const UCU = {
  maroon: '#7B1C1C',
  maroonDark: '#5C1010',
  gold: '#C9A227',
  goldLight: '#F5E6B0',
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function Chapters({ token }) {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('grid');

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ── Data fetching ───────────────────────────────────────────────────────────
  const fetchChapters = async () => {
    setLoading(true); setError('');
    try {
      setChapters(await getChapters());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchChapters(); }, [token]);

  // ── Form handlers ───────────────────────────────────────────────────────────
  const openForm = (chapter = null) => {
    setEditTarget(chapter);
    setForm(chapter ? { name: chapter.name, description: chapter.description ?? '' } : { name: '', description: '' });
    setFormError('');
    setFormOpen(true);
  };

  const handleFormSubmit = async () => {
    if (!form.name.trim()) { setFormError('Chapter name is required.'); return; }
    setSaving(true); setFormError('');
    try {
      editTarget
        ? await updateChapter(editTarget.id, form, token)
        : await createChapter(form, token);
      setFormOpen(false);
      fetchChapters();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete handlers ─────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteChapter(deleteTarget.id, token);
      setDeleteTarget(null);
      fetchChapters();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <Box>

      {/* Page header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ width: 4, height: 26, bgcolor: UCU.gold, borderRadius: 1 }} />
          <Typography variant="h5" fontWeight={800} color={UCU.maroon}>Chapters</Typography>
          {!loading && (
            <Chip
              label={chapters.length}
              size="small"
              sx={{ bgcolor: UCU.goldLight, color: UCU.maroon, fontWeight: 700, fontSize: 12 }}
            />
          )}
        </Stack>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <ToggleButtonGroup
            value={view} exclusive
            onChange={(_, v) => v && setView(v)}
            size="small"
            sx={{
              '& .MuiToggleButton-root': { borderColor: 'rgba(123,28,28,0.25)' },
              '& .MuiToggleButton-root.Mui-selected': { bgcolor: UCU.goldLight, color: UCU.maroon },
            }}
          >
            <ToggleButton value="grid" aria-label="Grid view"><ViewModuleIcon /></ToggleButton>
            <ToggleButton value="table" aria-label="Table view"><TableRowsIcon /></ToggleButton>
          </ToggleButtonGroup>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => openForm()}
            sx={{
              bgcolor: UCU.maroon, '&:hover': { bgcolor: UCU.maroonDark },
              borderRadius: 2, fontWeight: 700,
            }}
          >
            Add Chapter
          </Button>
        </Stack>
      </Stack>

      {/* Feedback */}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress sx={{ color: UCU.maroon }} /></Box>}

      {/* Empty state */}
      {!loading && !error && chapters.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 10, color: 'text.secondary' }}>
          <MenuBookIcon sx={{ fontSize: 72, color: UCU.goldLight }} />
          <Typography mt={2} fontWeight={600}>No chapters yet.</Typography>
          <Typography variant="body2">Click &quot;Add Chapter&quot; to create the first one.</Typography>
        </Box>
      )}

      {/* ── Grid View ── */}
      {!loading && view === 'grid' && (
        <Grid container spacing={3}>
          {chapters.map((ch, idx) => (
            <Grid item xs={12} sm={6} md={4} key={ch.id}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
                  height: '100%', display: 'flex', flexDirection: 'column',
                  border: '1px solid rgba(123,28,28,0.08)',
                  transition: '0.2s',
                  '&:hover': { boxShadow: '0 6px 22px rgba(123,28,28,0.14)', transform: 'translateY(-3px)' },
                }}
              >
                {/* UCU maroon top strip */}
                <Box sx={{ height: 4, bgcolor: UCU.maroon, borderRadius: '10px 10px 0 0' }} />
                <CardContent sx={{ flexGrow: 1, pt: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                    <Chip
                      label={`#${idx + 1}`}
                      size="small"
                      sx={{ bgcolor: UCU.goldLight, color: UCU.maroon, fontWeight: 700, fontSize: 11 }}
                    />
                  </Stack>
                  <Typography variant="h6" fontWeight={700} color={UCU.maroon} gutterBottom>
                    {ch.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {ch.description || <em>No description provided</em>}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 1.5 }}>
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={() => openForm(ch)}
                      sx={{ color: UCU.maroon, '&:hover': { bgcolor: UCU.goldLight } }}
                    >
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
                <TableCell sx={{ color: '#fff', fontWeight: 700, width: 60 }}>#</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Chapter Name</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Description</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {chapters.map((ch, idx) => (
                <TableRow key={ch.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                  <TableCell>
                    <Chip label={idx + 1} size="small" sx={{ bgcolor: UCU.goldLight, color: UCU.maroon, fontWeight: 700 }} />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{ch.name}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{ch.description || '—'}</TableCell>
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
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} slotProps={{ paper: { sx: { borderRadius: 3, minWidth: 400 } } }}>
        <DialogTitle sx={{ fontWeight: 800, color: UCU.maroon, borderBottom: `3px solid ${UCU.maroon}`, pb: 1.5 }}>
          {editTarget ? 'Edit Chapter' : 'Add New Chapter'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <TextField
            label="Chapter Name"
            fullWidth margin="normal"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            required autoFocus
          />
          <TextField
            label="Description (optional)"
            fullWidth margin="normal"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            multiline rows={3}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setFormOpen(false)} variant="outlined" sx={{ borderColor: UCU.maroon, color: UCU.maroon }}>
            Cancel
          </Button>
          <Button
            onClick={handleFormSubmit}
            variant="contained"
            disabled={saving}
            sx={{ bgcolor: UCU.maroon, '&:hover': { bgcolor: UCU.maroonDark } }}
          >
            {saving ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Save'}
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
    </Box>
  );
}
