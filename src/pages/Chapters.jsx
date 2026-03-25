/**
 * pages/Chapters.jsx – Chapter Management Page
 *
 * KEY CONCEPT – CRUD in React
 * CRUD = Create, Read, Update, Delete.  This page demonstrates all four:
 *   Read   → fetchChapters() on mount
 *   Create → dialog form + createChapter() API call
 *   Update → same dialog pre-filled + updateChapter() API call
 *   Delete → confirmation dialog + deleteChapter() API call
 *
 * KEY CONCEPT – Lifting State
 * `token` is passed down from AppRouter as a prop so this component
 * can attach it to every API request without accessing localStorage directly.
 *
 * KEY CONCEPT – View Toggle (Grid / Table)
 * The same data is rendered in two different layouts controlled by the
 * `view` state variable.  This is a common UX pattern.
 */

import { useEffect, useState } from 'react';
import { getChapters, createChapter, updateChapter, deleteChapter } from '../utils/api';
import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Grid, Card, CardContent, CardActions, IconButton, Stack,
  ToggleButton, ToggleButtonGroup, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Alert, CircularProgress, Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import TableRowsIcon from '@mui/icons-material/TableRows';
import MenuBookIcon from '@mui/icons-material/MenuBook';

// ── Component ─────────────────────────────────────────────────────────────────
export default function Chapters({ token }) {
  // ── State ───────────────────────────────────────────────────────────────────
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('grid');  // 'grid' or 'table'

  // Create / Edit dialog
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);    // null = create mode
  const [form, setForm] = useState({ name: '', description: '' });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete confirmation dialog
  const [deleteTarget, setDeleteTarget] = useState(null); // chapter to delete
  const [deleting, setDeleting] = useState(false);

  // ── Data Fetching ────────────────────────────────────────────────────────────
  const fetchChapters = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getChapters(); // public endpoint, no token needed
      setChapters(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // useEffect with [token] dependency: runs once on mount and whenever token changes
  useEffect(() => { fetchChapters(); }, [token]);

  // ── Form Handlers ─────────────────────────────────────────────────────────
  const openForm = (chapter = null) => {
    setEditTarget(chapter);
    setForm(chapter ? { name: chapter.name, description: chapter.description } : { name: '', description: '' });
    setFormError('');
    setFormOpen(true);
  };

  const handleFormSubmit = async () => {
    if (!form.name.trim()) { setFormError('Chapter name is required.'); return; }
    setSaving(true);
    setFormError('');
    try {
      if (editTarget) {
        await updateChapter(editTarget.id, form, token);
      } else {
        await createChapter(form, token);
      }
      setFormOpen(false);
      fetchChapters(); // refresh the list after saving
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete Handlers ───────────────────────────────────────────────────────
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

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ width: '100%' }}>

      {/* Page header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>Chapters</Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          {/* Toggle between grid and table view */}
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={(_, v) => v && setView(v)}
            size="small"
          >
            <ToggleButton value="grid" aria-label="Grid view"><ViewModuleIcon /></ToggleButton>
            <ToggleButton value="table" aria-label="Table view"><TableRowsIcon /></ToggleButton>
          </ToggleButtonGroup>
          <Button
            variant="contained"
            color="primary"
            onClick={() => openForm()}
            sx={{ borderRadius: 2 }}
          >
            + Add Chapter
          </Button>
        </Stack>
      </Stack>

      {/* Loading / error states */}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>}

      {/* Empty state */}
      {!loading && !error && chapters.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <MenuBookIcon sx={{ fontSize: 64, opacity: 0.3 }} />
          <Typography mt={2}>No chapters yet. Click &quot;+ Add Chapter&quot; to create one.</Typography>
        </Box>
      )}

      {/* ── Grid View ── */}
      {!loading && view === 'grid' && (
        <Grid container spacing={3}>
          {chapters.map(ch => (
            <Grid item xs={12} sm={6} md={4} key={ch.id}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: '0.2s',
                  '&:hover': { boxShadow: 6, transform: 'translateY(-3px)' },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>{ch.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {ch.description || <em>No description</em>}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                  <Tooltip title="Edit">
                    <IconButton color="primary" onClick={() => openForm(ch)}><EditIcon /></IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton color="error" onClick={() => setDeleteTarget(ch)}><DeleteIcon /></IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* ── Table View ── */}
      {!loading && view === 'table' && (
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f5f6fa' }}>
              <TableRow>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Description</strong></TableCell>
                <TableCell align="right"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {chapters.map(ch => (
                <TableRow key={ch.id} hover>
                  <TableCell>{ch.name}</TableCell>
                  <TableCell>{ch.description || '—'}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton color="primary" onClick={() => openForm(ch)}><EditIcon /></IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton color="error" onClick={() => setDeleteTarget(ch)}><DeleteIcon /></IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* ── Create / Edit Dialog ── */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} slotProps={{ paper: { sx: { borderRadius: 3, minWidth: 380 } } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editTarget ? 'Edit Chapter' : 'New Chapter'}
        </DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <TextField
            label="Chapter Name"
            fullWidth
            margin="normal"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            required
            autoFocus
          />
          <TextField
            label="Description (optional)"
            fullWidth
            margin="normal"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setFormOpen(false)} variant="outlined" color="secondary">Cancel</Button>
          <Button onClick={handleFormSubmit} variant="contained" color="primary" disabled={saving}>
            {saving ? <CircularProgress size={20} color="inherit" /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Chapter</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} variant="outlined">Cancel</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error" disabled={deleting}>
            {deleting ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

