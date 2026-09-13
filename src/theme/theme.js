// src/theme/theme.js
import { createTheme } from '@mui/material/styles';

export const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          primary: { main: '#1976d2' },
          secondary: { main: '#9c27b0' },
          background: { default: '#f4f6f8', paper: '#ffffff' },
          text: { primary: '#1a2027', secondary: '#5f6c7b' },
          divider: 'rgba(0, 0, 0, 0.12)',
        }
      : {
          primary: { main: '#90caf9' },
          secondary: { main: '#ce93d8' },
          background: { default: '#0f172a', paper: '#1e293b' },
          text: { primary: '#f1f5f9', secondary: '#94a3b8' },
          divider: 'rgba(255, 255, 255, 0.12)',
          action: {
            hover: 'rgba(255, 255, 255, 0.08)',
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
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.mode === 'light'
            ? theme.palette.primary.main
            : '#1e293b',
          color: theme.palette.mode === 'light' ? '#ffffff' : '#f1f5f9',
        }),
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: ({ theme }) => ({
          backgroundColor: theme.palette.mode === 'light' ? '#ffffff' : '#1e293b',
          borderRight: `1px solid ${theme.palette.divider}`,
        }),
      },
    },

    // 🔑 THE FIX: Make TextField/OutlinedInput blend into dark mode
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          // Match the paper background so it's not a bright gray box
          backgroundColor: theme.palette.background.paper,
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

    // 🔑 Also fix the Select dropdown — its label + input need the same treatment
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

    // Search icon inside the input should also be visible
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
        head: ({ theme }) => ({
          backgroundColor: theme.palette.mode === 'light'
            ? '#f5f5f5'
            : 'rgba(255, 255, 255, 0.05)',
          fontWeight: 600,
        }),
      },
    },
  },
});

export const createAppTheme = (mode) => createTheme(getDesignTokens(mode));