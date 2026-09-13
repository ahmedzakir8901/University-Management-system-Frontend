import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { ColorModeProvider } from './context/ColorModeContext'
import { Toaster } from 'react-hot-toast'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import CssBaseline from '@mui/material/CssBaseline' // <-- NEW

// Create the client for React Query
const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* ColorModeProvider is outermost so the theme applies to EVERYTHING */}
    <ColorModeProvider>
      {/* CssBaseline applies the theme's background & text colors to <body> */}
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
          <Toaster position="top-right" />
        </AuthProvider>
      </QueryClientProvider>
    </ColorModeProvider>
  </React.StrictMode>
)