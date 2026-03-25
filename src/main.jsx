import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRouter from './AppRouter';
import './index.css';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

/**
 * UCU BRAND THEME — Uganda Christian University
 *
 * Primary colour  → Maroon  (#7B1C1C) — used for sidebar, headers, primary buttons
 * Secondary colour → Gold   (#C9A227) — used for highlights, active states, accents
 * Background       → Warm cream (#F9F5F0) — softer than pure white, feels academic
 *
 * MUI's ThemeProvider applies these colours automatically to all MUI components,
 * so Button, AppBar, TextField focused outlines etc. all "just work" in UCU colours.
 */
const ucuTheme = createTheme({
  palette: {
    primary: {
      main: '#7B1C1C',   // UCU Maroon
      dark: '#5C1010',   // darker maroon — hover / pressed states
      light: '#9C2A2A',   // lighter maroon — outlined variants
      contrastText: '#FFFFFF',   // white text on maroon backgrounds
    },
    secondary: {
      main: '#C9A227',   // UCU Gold
      dark: '#A07D1C',   // darker gold
      light: '#F5E6B0',   // very light gold — icon backgrounds, badges
      contrastText: '#3D2B00',   // dark brown text on gold backgrounds
    },
    background: {
      default: '#F9F5F0',        // warm cream — page background
      paper: '#FFFFFF',        // white — card / dialog surfaces
    },
    error: { main: '#D32F2F' },
    success: { main: '#2E7D32' },
    text: {
      primary: '#1A1A1A',
      secondary: '#5A5A5A',
    },
  },
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
    h4: { fontWeight: 800 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 10,            // slightly rounded — professional but not "playful"
  },
  components: {
    // Make all contained buttons slightly bolder
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          '&:hover': { backgroundColor: '#5C1010' },
        },
        containedSecondary: {
          '&:hover': { backgroundColor: '#A07D1C' },
        },
      },
    },
    // Focused TextField outline in UCU maroon
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#7B1C1C',
          },
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={ucuTheme}>
      <CssBaseline />
      <AppRouter />
    </ThemeProvider>
  </React.StrictMode>
);
