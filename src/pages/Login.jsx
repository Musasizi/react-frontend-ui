/**
 * pages/Login.jsx – Login Page
 *
 * KEY CONCEPT – Controlled Inputs
 * Each text field's value is stored in React state.  When the user types,
 * the onChange handler updates state, and the state drives what's displayed.
 * This is called a "controlled component" pattern.
 *
 * KEY CONCEPT – Async Form Submission
 * handleSubmit is async so we can await the API call.  We call
 * e.preventDefault() to stop the browser from reloading the page.
 *
 * On success: store the token, call setToken() (lifts state to AppRouter),
 *             and navigate to the dashboard.
 * On failure: display the error message from the API.
 */

import { useState } from 'react';
import {
  TextField, Button, Typography, Box, Alert,
  Card, CardContent, Stack, CircularProgress,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import { login } from '../utils/api';
import { useNavigate } from 'react-router-dom';

export default function Login({ setToken }) {
  // ── State ─────────────────────────────────────────────────────────────────
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');      // error message to display
  const [loading, setLoading] = useState(false);   // disables button while waiting

  const navigate = useNavigate();

  // ── Submit Handler ─────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();   // prevent default browser form submit (page reload)
    setError('');
    setLoading(true);
    try {
      // Call the API; throws an Error on non-2xx responses (see api.js)
      const data = await login(username, password);
      // Save token to localStorage so it persists across page refreshes
      localStorage.setItem('token', data.token);
      setToken(data.token);
      navigate('/dashboard');
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
      <Card sx={{ width: 380, p: 2, borderRadius: 4, boxShadow: 10 }}>
        <CardContent>
          <Stack spacing={2} alignItems="center" mb={1}>
            <SchoolIcon color="primary" sx={{ fontSize: 48 }} />
            <Typography variant="h5" fontWeight={800} color="primary">
              Academia Login
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to manage chapters and users
            </Typography>
          </Stack>

          {/* Show error alert when the login fails */}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

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
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />

            {/* Disable the button while the request is in-flight */}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
              sx={{ mt: 2, py: 1.2, fontWeight: 700, borderRadius: 2 }}
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : 'Login'}
            </Button>

            <Button
              color="secondary"
              fullWidth
              sx={{ mt: 1 }}
              onClick={() => navigate('/register')}
            >
              Don&apos;t have an account? Register
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}

