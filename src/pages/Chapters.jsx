import { useEffect, useState } from 'react';
import { getChapters, createChapter, updateChapter, deleteChapter } from '../utils/api';
import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, Card, CardContent, CardActions, IconButton, Stack, ToggleButton, ToggleButtonGroup, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import TableRowsIcon from '@mui/icons-material/TableRows';

export default function Chapters({ token }) {
  const [chapters, setChapters] = useState([]);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [view, setView] = useState('grid');

  const fetchChapters = async () => {
    const data = await getChapters(token);
    setChapters(data);
  };

  useEffect(() => { fetchChapters(); }, [token]);

  const handleOpen = (chapter) => {
    setEdit(chapter || null);
    setForm(chapter ? { name: chapter.name, description: chapter.description } : { name: '', description: '' });
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const handleSubmit = async () => {
    if (edit) await updateChapter(edit.id, form, token);
    else await createChapter(form, token);
    setOpen(false);
    fetchChapters();
  };

  const handleDelete = async (id) => {
    await deleteChapter(id, token);
    fetchChapters();
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>Chapters</Typography>
        <Stack direction="row" spacing={2}>
          <ToggleButtonGroup value={view} exclusive onChange={(_, v) => v && setView(v)} size="small">
            <ToggleButton value="grid" aria-label="Grid view"><ViewModuleIcon /></ToggleButton>
            <ToggleButton value="table" aria-label="Table view"><TableRowsIcon /></ToggleButton>
          </ToggleButtonGroup>
          <Button variant="contained" color="primary" onClick={() => handleOpen()} sx={{ borderRadius: 2, boxShadow: 2 }}>
            Add Chapter
          </Button>
        </Stack>
      </Stack>
      {view === 'grid' ? (
        <Grid container spacing={3}>
          {chapters.map(ch => (
            <Grid item xs={12} sm={6} md={4} key={ch.id}>
              <Card sx={{ borderRadius: 3, boxShadow: 2, background: '#fff', transition: '0.2s', '&:hover': { boxShadow: 6, transform: 'translateY(-4px)' } }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>{ch.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{ch.description}</Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <IconButton color="primary" onClick={() => handleOpen(ch)}><EditIcon /></IconButton>
                  <IconButton color="error" onClick={() => handleDelete(ch.id)}><DeleteIcon /></IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2, background: '#fff' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {chapters.map(ch => (
                <TableRow key={ch.id}>
                  <TableCell>{ch.name}</TableCell>
                  <TableCell>{ch.description}</TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => handleOpen(ch)}><EditIcon /></IconButton>
                    <IconButton color="error" onClick={() => handleDelete(ch.id)}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Dialog open={open} onClose={handleClose} PaperProps={{ sx: { borderRadius: 3, minWidth: 350 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>{edit ? 'Edit Chapter' : 'Add Chapter'}</DialogTitle>
        <DialogContent>
          <TextField label="Name" fullWidth margin="normal" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoFocus sx={{ mb: 2 }} />
          <TextField label="Description" fullWidth margin="normal" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} multiline rows={3} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} variant="outlined" color="secondary">Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
