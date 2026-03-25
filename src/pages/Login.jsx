/**
 * pages/Login.jsx — UCU Login Page
 *
 * LAYOUT: Two-panel split screen
 *   Left panel  → UCU branding (maroon background, gold accents, tagline)
 *   Right panel → Login form (white background, clean inputs)
 *
 * KEY CONCEPTS:
 *  - Controlled inputs: each field has `value` + `onChange` tied to React state
 *  - `loading` state disables the button and shows a spinner during the API call
 *  - `error` state shows a MUI Alert when login fails
 *  - On success: token saved to localStorage, navigate to /dashboard
 */

import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box, Button, TextField, Typography, Alert, CircularProgress,
  Stack, Divider, Link,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import { login } from '../utils/api';
import ucuLogo from '../assets/uculogotousenobg.png';

// UCU brand colours — duplicated here so this file is self-contained
const UCU = {
  maroon: '#7B1C1C',
  maroonDark: '#5C1010',
  gold: '#C9A227',
  goldLight: '#F5E6B0',
  white: '#FFFFFF',
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function Login() {
  const navigate = useNavigate();

  // Form fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Submit handler ──────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();          // prevent browser page reload
    setError('');

    // Client-side validation before hitting the API
    if (!username.trim() || !password.trim()) {
      setError('Please enter your username and password.');
      return;
    }

    setLoading(true);
    try {
      const { token } = await login({ username, password });
      localStorage.setItem('token', token);   // persist token for future requests
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>

      {/* ── Left branding panel ── */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: '45%',
          background: `linear-gradient(160deg, ${UCU.maroon} 0%, ${UCU.maroonDark} 100%)`,
          px: 6,
          py: 8,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative background circles */}
        <Box sx={{
          position: 'absolute', width: 300, height: 300,
          borderRadius: '50%', border: `60px solid rgba(201,162,39,0.08)`,
          top: -80, left: -80,
        }} />
        <Box sx={{
          position: 'absolute', width: 200, height: 200,
          borderRadius: '50%', border: `40px solid rgba(201,162,39,0.06)`,
          bottom: -50, right: -50,
        }} />

        {/* UCU Logo */}
        <Box
          sx={{
            width: 130, height: 130,
            borderRadius: '50%',
            bgcolor: UCU.white,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            mb: 3,
            boxShadow: '0 8px 30px rgba(0,0,0,0.35)',
            p: 1.5,
          }}
        >
          <Box
            component="img"
            src={ucuLogo}
            alt="UCU Logo"
            sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </Box>

        <Typography
          variant="h4"
          sx={{ color: UCU.white, fontWeight: 800, textAlign: 'center', lineHeight: 1.2, mb: 1 }}
        >
          Uganda Christian University
        </Typography>

        <Box sx={{ width: 60, height: 3, bgcolor: UCU.gold, borderRadius: 2, my: 2 }} />

        <Typography
          variant="body1"
          sx={{ color: 'rgba(255,255,255,0.75)', textAlign: 'center', maxWidth: 300, lineHeight: 1.7 }}
        >
          Equipping students with knowledge and values to serve God and society.
        </Typography>

        <Stack direction="row" spacing={1} mt={4} alignItems="center">
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: UCU.gold }} />
          <Typography variant="caption" sx={{ color: UCU.goldLight, letterSpacing: 1.5, fontSize: 10 }}>
            LEARNING MANAGEMENT SYSTEM
          </Typography>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: UCU.gold }} />
        </Stack>
      </Box>

      {/* ── Right form panel ── */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: '#FAFAFA',
          px: { xs: 3, sm: 6, md: 8 },
          py: 6,
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 400 }}>

          {/* Mobile-only UCU heading */}
          <Box sx={{ display: { xs: 'block', md: 'none' }, textAlign: 'center', mb: 3 }}>
            <Box
              component="img"
              src={ucuLogo}
              alt="UCU Logo"
              sx={{ width: 56, height: 56, objectFit: 'contain', mb: 0.5 }}
            />
            <Typography variant="h6" fontWeight={800} color={UCU.maroon}>
              Uganda Christian University
            </Typography>
          </Box>

          {/* Form heading */}
          <Stack direction="row" alignItems="center" spacing={1.5} mb={1}>
            <Box sx={{ p: 1, bgcolor: UCU.goldLight, borderRadius: 2 }}>
              <LockIcon sx={{ color: UCU.maroon, fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={800} color={UCU.maroon}>
                Sign In
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Welcome back — please enter your credentials
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ my: 2.5 }} />

          {/* Error alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Login form */}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              label="Username"
              fullWidth
              margin="normal"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoFocus
              autoComplete="username"
              slotProps={{ input: { startAdornment: <PersonIcon sx={{ mr: 1, color: UCU.maroon, fontSize: 20 }} /> } }}
              sx={{ '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: UCU.maroon } }}
            />

            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              slotProps={{ input: { startAdornment: <LockIcon sx={{ mr: 1, color: UCU.maroon, fontSize: 20 }} /> } }}
              sx={{ '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: UCU.maroon } }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                mt: 3,
                py: 1.4,
                fontWeight: 700,
                fontSize: 15,
                bgcolor: UCU.maroon,
                '&:hover': { bgcolor: UCU.maroonDark },
                borderRadius: 2,
              }}
            >
              {loading
                ? <CircularProgress size={22} sx={{ color: '#fff' }} />
                : 'Sign In'
              }
            </Button>
          </Box>

          {/* Register link */}
          <Typography variant="body2" textAlign="center" mt={3} color="text.secondary">
            Don&apos;t have an account?{' '}
            <Link
              component={RouterLink}
              to="/register"
              sx={{ color: UCU.maroon, fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              Register here
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}


