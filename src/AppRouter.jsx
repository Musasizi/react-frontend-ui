import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import ModernLayout from './layouts/ModernLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Chapters from './pages/Chapters';
import Users from './pages/Users';

export default function AppRouter() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('token');
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={token ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
        <Route path="/dashboard" element={
          token ? (
            <ModernLayout onLogout={handleLogout}>
              <Dashboard />
            </ModernLayout>
          ) : <Navigate to="/login" />
        } />
        <Route path="/chapters" element={
          token ? (
            <ModernLayout onLogout={handleLogout}>
              <Chapters token={token} />
            </ModernLayout>
          ) : <Navigate to="/login" />
        } />
        <Route path="/users" element={
          token ? (
            <ModernLayout onLogout={handleLogout}>
              <Users token={token} />
            </ModernLayout>
          ) : <Navigate to="/login" />
        } />
      </Routes>
    </Router>
  );
}
