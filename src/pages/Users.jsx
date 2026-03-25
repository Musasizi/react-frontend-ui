/**
 * pages/Users.jsx – User Management Page
 *
 * KEY CONCEPT – State Management for CRUD
 * This page manages several pieces of state:
 *   users        – the list fetched from the API
 *   loading      – shows a spinner while fetching
 *   error        – shows an Alert if something fails
 *   formOpen     – controls the edit dialog visibility
 *   editTarget   – which user is being edited
 *   deleteTarget – which user is pending deletion (shows confirm dialog)
 *
 * Notice how we separate concerns:
 *   fetchUsers()          → reads from API and updates `users` state
 *   handleFormSubmit()    → calls updateUser() API, then refreshes list
 *   handleDeleteConfirm() → calls deleteUser() API, then refreshes list
 */

import { useEffect, useState } from 'react';
import { getUsers, updateUser, deleteUser } from '../utils/api';
import {
  Box, Typography, Grid, Card, CardContent, CardActions, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button,
  Avatar, Stack, Alert, CircularProgress, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Tooltip,
  ToggleButton, ToggleButtonGroup,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupIcon from '@mui/icons-material/Group';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import TableRowsIcon from '@mui/icons-material/TableRows';

// Palette of avatar background colours (cycles by first letter of username)
const AVATAR_COLORS = ['#1976d2', '#43a047', '#d32f2f', '#f57c00', '#7b1fa2'];
const avatarColor = (name = '') => AVATAR_COLORS[(name.codePointAt(0) ?? 0) % AVATAR_COLORS.length];

// ── Component ─────────────────────────────────────────────────────────────────
export default function Users({ token }) {
  // ── State ──────────────────────────────────────────────────────────────────
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('grid'); // 'grid' or 'table'

  // Edit dialog
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ username: '', email: '' });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ── Data Fetching ───────────────────────────────────────────────────────────
  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getUsers(token);
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // useEffect with [token]: re-fetches when the token changes (e.g. after login).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchUsers(); }, [token]);

  // ── Form Handlers ──────────────────────────────────────────────────────────
  const openForm = (user) => {
    setEditTarget(user);
    setForm({ username: user.username, email: user.email });
    setFormError('');
    setFormOpen(true);
  };

  const handleFormSubmit = async () => {
    if (!form.username.trim() || !form.email.trim()) {
      setFormError('Username and email are required.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      await updateUser(editTarget.id, form, token);
      setFormOpen(false);
      fetchUsers();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete Handlers ─────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteUser(deleteTarget.id, token);
      setDeleteTarget(null);
      fetchUsers();
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
        <Typography variant="h5" fontWeight={700}>Users</Typography>
        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={(_, v) => v && setView(v)}
          size="small"
        >
          <ToggleButton value="grid" aria-label="Grid view"><ViewModuleIcon /></ToggleButton>
          <ToggleButton value="table" aria-label="Table view"><TableRowsIcon /></ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {/* Feedback states */}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>}

      {/* Empty state */}
      {!loading && !error && users.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <GroupIcon sx={{ fontSize: 64, opacity: 0.3 }} />
          <Typography mt={2}>No users registered yet.</Typography>
        </Box>
      )}

      {/* ── Grid View ── */}
      {!loading && view === 'grid' && (
        <Grid container spacing={3}>
          {users.map(u => (
            <Grid item xs={12} sm={6} md={4} key={u.id}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: 2,
                  transition: '0.2s',
                  '&:hover': { boxShadow: 6, transform: 'translateY(-3px)' },
                }}
              >
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: avatarColor(u.username), fontWeight: 700 }}>
                      {u.username[0]?.toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>{u.username}</Typography>
                      <Typography variant="body2" color="text.secondary">{u.email}</Typography>
                      <Chip
                        label={`Joined ${new Date(u.created_at).toLocaleDateString()}`}
                        size="small"
                        sx={{ mt: 0.5, fontSize: 10 }}
                      />
                    </Box>
                  </Stack>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                  <Tooltip title="Edit">
                    <IconButton color="primary" onClick={() => openForm(u)}><EditIcon /></IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton color="error" onClick={() => setDeleteTarget(u)}><DeleteIcon /></IconButton>
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
                <TableCell><strong>Username</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Joined</strong></TableCell>
                <TableCell align="right"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(u => (
                <TableRow key={u.id} hover>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Avatar sx={{ width: 28, height: 28, fontSize: 13, bgcolor: avatarColor(u.username) }}>
                        {u.username[0]?.toUpperCase()}
                      </Avatar>
                      <span>{u.username}</span>
                    </Stack>
                  </TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{new Date(u.created_at).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton color="primary" onClick={() => openForm(u)}><EditIcon /></IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton color="error" onClick={() => setDeleteTarget(u)}><DeleteIcon /></IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* ── Edit Dialog ── */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} slotProps={{ paper: { sx: { borderRadius: 3, minWidth: 380 } } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Edit User</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <TextField
            label="Username"
            fullWidth
            margin="normal"
            value={form.username}
            onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
            required
            autoFocus
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            required
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
        <DialogTitle sx={{ fontWeight: 700 }}>Delete User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{deleteTarget?.username}</strong>?
            This will also remove all their chapter enrolments.
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

