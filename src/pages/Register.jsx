/**
 * pages/Register.jsx — UCU Registration Page
 *
 * Same split-panel layout as Login.jsx:
 *   Left  → UCU branding panel (maroon)
 *   Right → Registration form (white)
 *
 * KEY CONCEPTS:
 *  - Client-side password confirmation check before hitting the API
 *  - success state shows a green Alert, then redirects to /login after 1.5s
 *  - error state shows a red Alert for any API or validation failure
 */

import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box, Button, TextField, Typography, Alert, CircularProgress,
  Stack, Divider, Link,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import { register } from '../utils/api';
import ucuLogo from '../assets/uculogotousenobg.png';

const UCU = {
  maroon: '#7B1C1C',
  maroonDark: '#5C1010',
  gold: '#C9A227',
  goldLight: '#F5E6B0',
  white: '#FFFFFF',
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ── Submit handler ──────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('All fields are required.');
      return;
    }
    // Client-side check — server also validates, but this gives instant feedback
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const data = await register(username, password, email);
      setSuccess(data.message || 'Account created! Redirecting to login…');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const passwordMismatch = !!confirm && password !== confirm;

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
        {/* Decorative circles */}
        <Box sx={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', border: `60px solid rgba(201,162,39,0.08)`, top: -80, left: -80 }} />
        <Box sx={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', border: `40px solid rgba(201,162,39,0.06)`, bottom: -50, right: -50 }} />

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

        <Typography variant="h4" sx={{ color: UCU.white, fontWeight: 800, textAlign: 'center', lineHeight: 1.2, mb: 1 }}>
          Uganda Christian University
        </Typography>

        <Box sx={{ width: 60, height: 3, bgcolor: UCU.gold, borderRadius: 2, my: 2 }} />

        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.75)', textAlign: 'center', maxWidth: 300, lineHeight: 1.7 }}>
          Create your account and join the UCU learning community today.
        </Typography>

        <Stack direction="row" spacing={1} mt={4} alignItems="center">
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: UCU.gold }} />
          <Typography variant="caption" sx={{ color: UCU.goldLight, letterSpacing: 1.5, fontSize: 10 }}>
            STUDENT PORTAL
          </Typography>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: UCU.gold }} />
        </Stack>
      </Box>

      {/* ── Right form panel ── */}
      <Box
        sx={{
          flex: 1,
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
          bgcolor: '#FAFAFA',
          px: { xs: 3, sm: 6, md: 8 },
          py: 6,
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 420 }}>

          {/* Mobile heading */}
          <Box sx={{ display: { xs: 'block', md: 'none' }, textAlign: 'center', mb: 3 }}>
            <Box
              component="img"
              src={ucuLogo}
              alt="UCU Logo"
              sx={{ width: 56, height: 56, objectFit: 'contain', mb: 0.5 }}
            />
            <Typography variant="h6" fontWeight={800} color={UCU.maroon}>Uganda Christian University</Typography>
          </Box>

          <Stack direction="row" alignItems="center" spacing={1.5} mb={1}>
            <Box sx={{ p: 1, bgcolor: UCU.goldLight, borderRadius: 2 }}>
              <HowToRegIcon sx={{ color: UCU.maroon, fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={800} color={UCU.maroon}>Create Account</Typography>
              <Typography variant="body2" color="text.secondary">Fill in your details to register</Typography>
            </Box>
          </Stack>

          <Divider sx={{ my: 2.5 }} />

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{success}</Alert>}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              label="Username"
              fullWidth margin="normal"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required autoFocus
              slotProps={{ input: { startAdornment: <PersonIcon sx={{ mr: 1, color: UCU.maroon, fontSize: 20 }} /> } }}
            />
            <TextField
              label="Email"
              type="email"
              fullWidth margin="normal"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              slotProps={{ input: { startAdornment: <EmailIcon sx={{ mr: 1, color: UCU.maroon, fontSize: 20 }} /> } }}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth margin="normal"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              slotProps={{ input: { startAdornment: <LockIcon sx={{ mr: 1, color: UCU.maroon, fontSize: 20 }} /> } }}
            />
            <TextField
              label="Confirm Password"
              type="password"
              fullWidth margin="normal"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              error={passwordMismatch}
              helperText={passwordMismatch ? 'Passwords do not match' : ''}
              slotProps={{ input: { startAdornment: <LockIcon sx={{ mr: 1, color: passwordMismatch ? 'error.main' : UCU.maroon, fontSize: 20 }} /> } }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading || !!success}
              sx={{
                mt: 3, py: 1.4, fontWeight: 700, fontSize: 15,
                bgcolor: UCU.maroon, '&:hover': { bgcolor: UCU.maroonDark },
                borderRadius: 2,
              }}
            >
              {loading
                ? <CircularProgress size={22} sx={{ color: '#fff' }} />
                : 'Create Account'
              }
            </Button>
          </Box>

          <Typography variant="body2" textAlign="center" mt={3} color="text.secondary">
            Already have an account?{' '}
            <Link
              component={RouterLink}
              to="/login"
              sx={{ color: UCU.maroon, fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              Sign in here
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}


