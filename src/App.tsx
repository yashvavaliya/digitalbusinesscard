import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import Welcome from './pages/Welcome'
import AuthPage from './pages/AuthPage'
import AdminPanel from './pages/AdminPanel'
import PublicBusinessCard from './pages/PublicBusinessCard'
import SetupInstructions from './components/SetupInstructions'

function App() {
  // Check if Supabase is configured
  const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && 
                               import.meta.env.VITE_SUPABASE_ANON_KEY &&
                               import.meta.env.VITE_SUPABASE_URL !== 'your_supabase_url_here'

  if (!isSupabaseConfigured) {
    return <SetupInstructions />
  }

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#374151',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              },
            }}
          />
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Welcome />} />
              <Route path="businesscard" element={<AuthPage />} />
              <Route path="businesscard/admin" element={<AdminPanel />} />
              <Route path="businesscard/:username" element={<PublicBusinessCard />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App