import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  userData: any
  loading: boolean
  signUp: (email: string, password: string, username: string) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<any>
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
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserData(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchUserData(session.user.id)
        } else {
          setUserData(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserData = async (userId: string) => {
    try {
      console.log('Fetching user data for:', userId)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (data && !error) {
        console.log('User data found:', data)
        setUserData(data)
      } else if (error) {
        console.log('Error fetching user data:', error)
        // If user record doesn't exist, create it
        if (error.code === 'PGRST116' || error.message.includes('No rows found')) {
          console.log('User record not found, creating new user record')
          await createUserRecord(userId)
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  const createUserRecord = async (userId: string) => {
    try {
      const { data: authUser } = await supabase.auth.getUser()
      if (!authUser.user) return

      const email = authUser.user.email
      const username = email?.split('@')[0] || `user_${userId.slice(0, 8)}`

      // Create user record
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert([
          {
            id: userId,
            email: email,
            username: username,
          }
        ])
        .select()
        .single()

      if (userError) {
        console.error('Failed to create user record:', userError)
        return
      }

      // Create business card record
      const { error: cardError } = await supabase
        .from('business_cards')
        .insert([
          {
            user_id: userId,
            personal_info: {},
            business_info: {},
            social_media: {},
            office_showcase: { images: [] },
            media_integration: {},
            google_reviews: {},
            theme_customization: { template: 'modern', primary_color: '#3B82F6', secondary_color: '#8B5CF6' },
            is_published: false,
          }
        ])

      if (cardError) {
        console.warn('Failed to create business card:', cardError.message)
      }

      setUserData(userData)
      console.log('User record created successfully')
    } catch (error) {
      console.error('Error creating user record:', error)
    }
  }

  const signUp = async (email: string, password: string, username: string) => {
    // Check if username already exists
    const { data: existingUsername } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .single()

    if (existingUsername) {
      throw new Error('Username already taken')
    }

    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) throw authError
    if (!authData.user) throw new Error('Failed to create user')

    // Create user record in our custom table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email,
          username,
        }
      ])
      .select()
      .single()

    if (userError) {
      console.error('Failed to create user record:', userError)
      throw new Error(userError.message)
    }

    // Create business card record
    const { error: cardError } = await supabase
      .from('business_cards')
      .insert([
        {
          user_id: authData.user.id,
          personal_info: {},
          business_info: {},
          social_media: {},
          office_showcase: { images: [] },
          media_integration: {},
          google_reviews: {},
          theme_customization: { template: 'modern', primary_color: '#3B82F6', secondary_color: '#8B5CF6' },
          is_published: false,
        }
      ])

    if (cardError) {
      console.warn('Failed to create business card:', cardError.message)
    }

    setUserData(userData)
    return authData
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) throw error
    return data
  }

  const value = {
    user,
    userData,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}