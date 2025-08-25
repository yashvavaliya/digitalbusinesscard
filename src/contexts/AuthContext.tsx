import React, { createContext, useContext, useState } from 'react'
import { supabase } from '../lib/supabase'

interface AuthContextType {
  user: any
  userData: any
  loading: boolean
  signUp: (username: string, email: string, password: string) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const signUp = async (username: string, email: string, password: string) => {
    setLoading(true)
    try {
      // Check if email exists
      const { data: existingEmail } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle()

      if (existingEmail) throw new Error('Email already registered')

      // Check if username exists
      const { data: existingUsername } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .maybeSingle()

      if (existingUsername) throw new Error('Username already taken')

      // Insert new user
      const { data, error } = await supabase
        .from('users')
        .insert([{ username, email, password }]) // 🔴 password stored as plain text (later hash it)
        .select()
        .single()

      if (error) throw error
      return data
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .maybeSingle()

      if (error || !data) throw new Error('Invalid email or password')

      setUser(data)
      setUserData(data)
      return data
    } finally {
      setLoading(false)
    }
  }

  const signOut = () => {
    setUser(null)
    setUserData(null)
  }

  return (
    <AuthContext.Provider value={{ user, userData, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
