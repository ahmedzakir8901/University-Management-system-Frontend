// src/theme/theme.js
import { createTheme } from '@mui/material/styles';

export const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // ===== LIGHT MODE =====
          primary: { main: '#1976d2' },
          secondary: { main: '#9c27b0' },
          background: {
            default: '#f4f6f8',
            paper: '#ffffff',
          },
          text: {
            primary: '#1a2027',
            secondary: '#5f6c7b',
          },
          divider: 'rgba(0, 0, 0, 0.12)',
        }
      : {
          // ===== DARK MODE (improved contrast) =====
          primary: { main: '#90caf9' },
          secondary: { main: '#ce93d8' },
          background: {
            default: '#0d1521',   // Slightly lighter deep navy
            paper: '#1a2332',     // Clearly distinct from default
          },
          text: {
            primary: '#f8fafc',    // Very light — near white
            secondary: '#94a3b8',  // Muted for captions
          },
          divider: 'rgba(255, 255, 255, 0.1)',
          action: {
            hover: 'rgba(255, 255, 255, 0.06)',
            selected: 'rgba(144, 202, 249, 0.16)',
          },
        }),
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  components: {
    // 🔑 CRITICAL FIX: Force Typography to use proper text color
    MuiCssBaseline: {
      styleOverrides: (theme) => ({
        body: {
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
        },
        '#root': {
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default,
        },
      }),
    },
    MuiTypography: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.palette.text.primary,
        }),
        h1: ({ theme }) => ({ color: theme.palette.text.primary }),
        h2: ({ theme }) => ({ color: theme.palette.text.primary }),
        h3: ({ theme }) => ({ color: theme.palette.text.primary }),
        h4: ({ theme }) => ({ color: theme.palette.text.primary }),
        h5: ({ theme }) => ({ color: theme.palette.text.primary }),
        h6: ({ theme }) => ({ color: theme.palette.text.primary }),
        body1: ({ theme }) => ({ color: theme.palette.text.primary }),
        body2: ({ theme }) => ({ color: theme.palette.text.primary }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: 'none',
          backgroundColor: theme.palette.background.paper,
        }),
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper,
        }),
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.mode === 'light'
            ? theme.palette.primary.main
            : '#1a2332',
          color: theme.palette.mode === 'light' ? '#ffffff' : '#f8fafc',
        }),
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: ({ theme }) => ({
          backgroundColor: theme.palette.mode === 'light' ? '#ffffff' : '#1a2332',
          borderRight: `1px solid ${theme.palette.divider}`,
        }),
      },
    },
    // Input fields — visible borders + backgrounds
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.mode === 'light'
            ? '#ffffff'
            : '#0d1521',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.mode === 'light'
              ? 'rgba(0, 0, 0, 0.23)'
              : 'rgba(255, 255, 255, 0.2)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.mode === 'light'
              ? 'rgba(0, 0, 0, 0.4)'
              : 'rgba(255, 255, 255, 0.4)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.primary.main,
          },
          '& input::placeholder': {
            color: theme.palette.text.secondary,
            opacity: 0.7,
          },
        }),
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.palette.text.secondary,
          '&.Mui-focused': {
            color: theme.palette.primary.main,
          },
        }),
      },
    },
    MuiInputAdornment: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.palette.mode === 'light'
            ? 'rgba(0, 0, 0, 0.54)'
            : 'rgba(255, 255, 255, 0.7)',
        }),
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper,
        }),
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderBottom: `1px solid ${theme.palette.divider}`,
        }),
        head: ({ theme }) => ({
          backgroundColor: theme.palette.mode === 'light'
            ? '#f5f5f5'
            : 'rgba(255, 255, 255, 0.04)',
          fontWeight: 600,
          color: theme.palette.text.primary,
        }),
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.palette.text.secondary,
        }),
      },
    },
  },
});

export const createAppTheme = (mode) => createTheme(getDesignTokens(mode));