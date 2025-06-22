import { useState } from 'react';
import { TextField, Button, Typography, Box, Snackbar, Card, CardContent, Stack } from '@mui/material';
import { register } from '../utils/api';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = await register(username, password, email);
    if (data.message) {
      setSnackbar({ open: true, message: 'Registration successful! Please login.' });
      setTimeout(() => navigate('/login'), 1000);
    } else {
      setSnackbar({ open: true, message: data.error || 'Registration failed' });
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Card sx={{ minWidth: 350, p: 3, borderRadius: 4, boxShadow: 6 }}>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h4" align="center" fontWeight={800} color="primary">Register</Typography>
            <form onSubmit={handleSubmit}>
              <TextField label="Username" fullWidth margin="normal" value={username} onChange={e => setUsername(e.target.value)} required />
              <TextField label="Email" fullWidth margin="normal" value={email} onChange={e => setEmail(e.target.value)} required />
              <TextField label="Password" type="password" fullWidth margin="normal" value={password} onChange={e => setPassword(e.target.value)} required />
              <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2, fontWeight: 700 }}>Register</Button>
              <Button color="secondary" fullWidth sx={{ mt: 1 }} onClick={() => navigate('/login')}>Back to Login</Button>
            </form>
          </Stack>
        </CardContent>
      </Card>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
    </Box>
  );
}
