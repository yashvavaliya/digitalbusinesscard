import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { Eye, EyeOff, ArrowLeft, Mail, Lock, User } from 'lucide-react'

const signUpSchema = yup.object({
  username: yup.string().required('Username is required').min(3, 'Username must be at least 3 characters'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
})

const signInSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required'),
})

const resetSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
})

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin')
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { signUp, signIn, resetPassword, user, userData } = useAuth()

  // Redirect if already authenticated
  React.useEffect(() => {
    if (user && userData?.username) {
      navigate('/businesscard/admin')
    }
  }, [user, userData, navigate])

  const signUpForm = useForm({
    resolver: yupResolver(signUpSchema),
  })

  const signInForm = useForm({
    resolver: yupResolver(signInSchema),
  })

  const resetForm = useForm({
    resolver: yupResolver(resetSchema),
  })

  const onSignUp = async (data: any) => {
    try {
      await signUp(data.email, data.password, data.username)
      toast.success('Account created successfully!')
      navigate('/businesscard/admin')
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account')
    }
  }

  const onSignIn = async (data: any) => {
    try {
      await signIn(data.email, data.password)
      toast.success('Signed in successfully!')
      navigate('/businesscard/admin')
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in')
    }
  }

  const onReset = async (data: any) => {
    try {
      await resetPassword(data.email)
      toast.success('Password reset email sent!')
      setMode('signin')
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </button>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {mode === 'signin' && 'Welcome Back'}
              {mode === 'signup' && 'Create Account'}
              {mode === 'reset' && 'Reset Password'}
            </h1>
            <p className="text-gray-600">
              {mode === 'signin' && 'Sign in to manage your business card'}
              {mode === 'signup' && 'Get started with your digital business card'}
              {mode === 'reset' && 'Enter your email to reset your password'}
            </p>
          </div>

          {mode === 'signup' && (
            <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...signUpForm.register('username')}
                    type="text"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter your username"
                  />
                </div>
                {signUpForm.formState.errors.username && (
                  <p className="mt-1 text-sm text-red-600">
                    {signUpForm.formState.errors.username.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...signUpForm.register('email')}
                    type="email"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter your email"
                  />
                </div>
                {signUpForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {signUpForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...signUpForm.register('password')}
                    type={showPassword ? 'text' : 'password'}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {signUpForm.formState.errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {signUpForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={signUpForm.formState.isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {signUpForm.formState.isSubmitting ? 'Creating Account...' : 'Create Account'}
              </button>

              <p className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Sign In
                </button>
              </p>
            </form>
          )}

          {mode === 'signin' && (
            <form onSubmit={signInForm.handleSubmit(onSignIn)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...signInForm.register('email')}
                    type="email"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter your email"
                  />
                </div>
                {signInForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {signInForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...signInForm.register('password')}
                    type={showPassword ? 'text' : 'password'}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {signInForm.formState.errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {signInForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setMode('reset')}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={signInForm.formState.isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {signInForm.formState.isSubmitting ? 'Signing In...' : 'Sign In'}
              </button>

              <p className="text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Sign Up
                </button>
              </p>
            </form>
          )}

          {mode === 'reset' && (
            <form onSubmit={resetForm.handleSubmit(onReset)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...resetForm.register('email')}
                    type="email"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter your email"
                  />
                </div>
                {resetForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {resetForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={resetForm.formState.isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resetForm.formState.isSubmitting ? 'Sending...' : 'Send Reset Email'}
              </button>

              <p className="text-center text-sm text-gray-600">
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Sign In
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}