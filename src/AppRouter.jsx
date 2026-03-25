/**
 * AppRouter.jsx – Application Routing
 *
 * KEY CONCEPT – React Router v6
 * <Routes> renders only the first <Route> that matches the current URL.
 * <Navigate> performs an instant redirect.
 *
 * KEY CONCEPT – Protected Routes
 * Instead of repeating `token ? <Page> : <Navigate to="/login" />` on every
 * route we create a <ProtectedRoute> wrapper component.  It checks auth and
 * either renders its children or redirects, keeping route definitions clean.
 *
 * KEY CONCEPT – Decoding the JWT on the client
 * The JWT has 3 base64-encoded parts separated by dots: header.payload.signature
 * We can decode the middle part (payload) to read user info like username
 * without making an extra API call.  We do NOT verify the signature here
 * (that is the server's job); we just read the data.
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import ModernLayout from './layouts/ModernLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Chapters from './pages/Chapters';
import Users from './pages/Users';
import Reports from './pages/Reports';

// ── Helper: decode JWT payload ────────────────────────────────────────────────
/**
 * Safely decode the payload section of a JWT without a library.
 * Returns the parsed object, or null if the token is missing / malformed.
 * @param {string} token
 * @returns {{ id: number, username: string, exp: number } | null}
 */
function decodeToken(token) {
  try {
    if (!token) return null;
    const payload = token.split('.')[1];                                   // grab the middle segment
    const json = atob(payload.replaceAll('-', '+').replaceAll('_', '/')); // base64 → string
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// ── ProtectedRoute ─────────────────────────────────────────────────────────────
/**
 * Renders children when a valid token exists; otherwise redirects to /login.
 */
function ProtectedRoute({ token, children }) {
  // Always return the same type (JSX element) from both branches
  return token ? children : <Navigate to="/login" replace />;
}

// ── AppRouter ──────────────────────────────────────────────────────────────────
export default function AppRouter() {
  // Initialise token from localStorage so the user stays logged in on refresh
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  // Decode the payload so we can pass display info to the layout
  const user = decodeToken(token);

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('token');
  };

  return (
    <Router>
      <Routes>
        {/* Public pages */}
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route path="/register" element={<Register />} />

        {/* Root redirect – send logged-in users to dashboard, others to login */}
        <Route
          path="/"
          element={<Navigate to={token ? '/dashboard' : '/login'} replace />}
        />

        {/* Protected pages – wrapped in ModernLayout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute token={token}>
              <ModernLayout onLogout={handleLogout} user={user}>
                <Dashboard token={token} user={user} />
              </ModernLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/chapters"
          element={
            <ProtectedRoute token={token}>
              <ModernLayout onLogout={handleLogout} user={user}>
                <Chapters token={token} />
              </ModernLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute token={token}>
              <ModernLayout onLogout={handleLogout} user={user}>
                <Users token={token} />
              </ModernLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute token={token}>
              <ModernLayout onLogout={handleLogout} user={user}>
                <Reports token={token} />
              </ModernLayout>
            </ProtectedRoute>
          }
        />

        {/* Catch-all – redirect unknown URLs to root */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

