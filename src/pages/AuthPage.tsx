import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { Eye, EyeOff, ArrowLeft, Mail, Lock, User } from 'lucide-react'

const signUpSchema = yup.object({
  username: yup.string().required('Username is required').min(3),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required(),
})

const signInSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required'),
})

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { signUp, signIn, user, userData } = useAuth()

  // Redirect if already authenticated
  React.useEffect(() => {
    if (user && userData?.email) {
      navigate(`/businesscard/admin/${userData.email}`)
    }
  }, [user, userData, navigate])

  const signUpForm = useForm({
    resolver: yupResolver(signUpSchema),
  })

  const signInForm = useForm({
    resolver: yupResolver(signInSchema),
  })

  const onSignUp = async (data: any) => {
    setLoading(true)
    try {
      await signUp(data.username, data.email, data.password)
      toast.success('Account created successfully! Please sign in.')
      setMode('signin')
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  const onSignIn = async (data: any) => {
    setLoading(true)
    try {
      await signIn(data.email, data.password)
      toast.success('Signed in successfully!')
      navigate(`/businesscard/admin/${data.email}`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {mode === 'signin' ? 'Welcome Back' : 'Create Your Account'}
            </h1>
          </div>

          {mode === 'signup' && (
            <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-6">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...signUpForm.register('username')}
                    type="text"
                    className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your username"
                  />
                </div>
                {signUpForm.formState.errors.username && (
                  <p className="mt-1 text-sm text-red-600">{signUpForm.formState.errors.username.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...signUpForm.register('email')}
                    type="email"
                    className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your email"
                  />
                </div>
                {signUpForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600">{signUpForm.formState.errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...signUpForm.register('password')}
                    type={showPassword ? 'text' : 'password'}
                    className="w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your password"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 text-white rounded-xl">
                {loading ? 'Creating...' : 'Create Account'}
              </button>

              <p className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <button type="button" onClick={() => setMode('signin')} className="text-blue-600 font-medium">
                  Sign In
                </button>
              </p>
            </form>
          )}

          {mode === 'signin' && (
            <form onSubmit={signInForm.handleSubmit(onSignIn)} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...signInForm.register('email')}
                    type="email"
                    className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...signInForm.register('password')}
                    type={showPassword ? 'text' : 'password'}
                    className="w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your password"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 text-white rounded-xl">
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              <p className="text-center text-sm text-gray-600">
                Don’t have an account?{' '}
                <button type="button" onClick={() => setMode('signup')} className="text-blue-600 font-medium">
                  Sign Up
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
