/**
 * pages/Register.jsx – Registration Page
 *
 * KEY CONCEPT – Client-side Validation
 * We check that the two password fields match BEFORE sending a request.
 * This gives the user instant feedback without waiting for the server.
 * Server-side validation (in authController.js) is still required for
 * security – never trust client-only checks.
 */

import { useState } from 'react';
import {
  TextField, Button, Typography, Box, Alert,
  Card, CardContent, Stack, CircularProgress,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import { register } from '../utils/api';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  // ── State ─────────────────────────────────────────────────────────────────
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ── Submit Handler ─────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Client-side validation: passwords must match
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const data = await register(username, password, email);
      setSuccess(data.message || 'Registration successful! Redirecting to login…');
      // Redirect after a short delay so the user sees the success message
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a2332 0%, #2d4a7a 100%)',
      }}
    >
      <Card sx={{ width: 400, p: 2, borderRadius: 4, boxShadow: 10 }}>
        <CardContent>
          <Stack spacing={2} alignItems="center" mb={1}>
            <SchoolIcon color="primary" sx={{ fontSize: 48 }} />
            <Typography variant="h5" fontWeight={800} color="primary">
              Create Account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Join Academia and start managing chapters
            </Typography>
          </Stack>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Username"
              fullWidth
              margin="normal"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoFocus
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <TextField
              label="Confirm Password"
              type="password"
              fullWidth
              margin="normal"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              error={!!confirm && password !== confirm}
              helperText={confirm && password !== confirm ? 'Passwords do not match' : ''}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
              sx={{ mt: 2, py: 1.2, fontWeight: 700, borderRadius: 2 }}
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : 'Register'}
            </Button>

            <Button
              color="secondary"
              fullWidth
              sx={{ mt: 1 }}
              onClick={() => navigate('/login')}
            >
              Already have an account? Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}

