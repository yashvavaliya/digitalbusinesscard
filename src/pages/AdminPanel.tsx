import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import {
  User,
  Building,
  Share2,
  Save,
  Camera,
  Upload,
  Edit3,
  Menu,
  X,
  LogOut,
  Settings,
  Globe,
} from 'lucide-react'

interface BusinessCardData {
  personal_info: {
    name?: string
    email?: string
    phone?: string
    address?: string
    photo?: string
  }
  business_info: {
    business_name?: string
    services?: string
    description?: string
    logo?: string
    business_card?: string
  }
  social_media: {
    instagram?: string
    twitter?: string
    youtube?: string
    linkedin?: string
    facebook?: string
    github?: string
    reddit?: string
    pinterest?: string
    snapchat?: string
    discord?: string
    telegram?: string
  }
}

const SOCIAL_PLATFORMS = [
  { key: 'instagram', name: 'Instagram', baseUrl: 'https://instagram.com/' },
  { key: 'twitter', name: 'Twitter', baseUrl: 'https://twitter.com/' },
  { key: 'youtube', name: 'YouTube', baseUrl: 'https://youtube.com/c/' },
  { key: 'linkedin', name: 'LinkedIn', baseUrl: 'https://linkedin.com/in/' },
  { key: 'facebook', name: 'Facebook', baseUrl: 'https://facebook.com/' },
  { key: 'github', name: 'GitHub', baseUrl: 'https://github.com/' },
  { key: 'reddit', name: 'Reddit', baseUrl: 'https://reddit.com/u/' },
  { key: 'pinterest', name: 'Pinterest', baseUrl: 'https://pinterest.com/' },
  { key: 'snapchat', name: 'Snapchat', baseUrl: 'https://snapchat.com/add/' },
  { key: 'discord', name: 'Discord', baseUrl: 'https://discord.gg/' },
  { key: 'telegram', name: 'Telegram', baseUrl: 'https://t.me/' },
]

export default function AdminPanel() {
  const { username } = useParams()
  const navigate = useNavigate()
  const { user, userData, signOut } = useAuth()
  const [activeSection, setActiveSection] = useState('personal')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [newUsername, setNewUsername] = useState(username || '')
  const [businessCard, setBusinessCard] = useState<BusinessCardData>({
    personal_info: {},
    business_info: {},
    social_media: {},
  })
  const [isPublished, setIsPublished] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (user && userData) {
      fetchBusinessCard()
    }
  }, [user, userData])

  const fetchBusinessCard = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('business_cards')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!error && data) {
      setBusinessCard({
        personal_info: data.personal_info || {},
        business_info: data.business_info || {},
        social_media: data.social_media || {},
      })
      setIsPublished(data.is_published || false)
    }
  }

  const handleInputChange = (section: keyof BusinessCardData, field: string, value: string) => {
    setBusinessCard(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }))
  }

  const handleFileUpload = async (file: File, section: keyof BusinessCardData, field: string) => {
    if (!file) return

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user?.id}/${section}_${field}_${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('uploads')
        .getPublicUrl(fileName)

      handleInputChange(section, field, data.publicUrl)
      toast.success('File uploaded successfully!')
    } catch (error) {
      toast.error('Failed to upload file')
    }
  }

  const handleUsernameUpdate = async () => {
    if (!user || newUsername === username) {
      setIsEditing(false)
      return
    }

    try {
      // Check if username is available
      const { data: existingUser } = await supabase
        .from('users')
        .select('username')
        .eq('username', newUsername)
        .single()

      if (existingUser) {
        toast.error('Username already taken')
        return
      }

      const { error } = await supabase
        .from('users')
        .update({ username: newUsername })
        .eq('id', user.id)

      if (error) throw error

      toast.success('Username updated successfully!')
      navigate(`/businesscard/admin/${newUsername}`, { replace: true })
      setIsEditing(false)
    } catch (error) {
      toast.error('Failed to update username')
    }
  }

  const handlePublish = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('business_cards')
        .upsert({
          user_id: user.id,
          personal_info: businessCard.personal_info,
          business_info: businessCard.business_info,
          social_media: businessCard.social_media,
          is_published: true,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error

      setIsPublished(true)
      toast.success('Business card published successfully!')
    } catch (error) {
      toast.error('Failed to publish business card')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      toast.error('Failed to sign out')
    }
  }

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
          <input
            type="text"
            value={businessCard.personal_info.name || ''}
            onChange={(e) => handleInputChange('personal_info', 'name', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={businessCard.personal_info.email || ''}
            onChange={(e) => handleInputChange('personal_info', 'email', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <input
            type="tel"
            value={businessCard.personal_info.phone || ''}
            onChange={(e) => handleInputChange('personal_info', 'phone', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your phone number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
          <input
            type="text"
            value={businessCard.personal_info.address || ''}
            onChange={(e) => handleInputChange('personal_info', 'address', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your address"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
        <div className="flex items-center space-x-4">
          {businessCard.personal_info.photo && (
            <img
              src={businessCard.personal_info.photo}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover"
            />
          )}
          <div className="flex space-x-2">
            <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Upload className="w-4 h-4 mr-2" />
              Upload Photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file, 'personal_info', 'photo')
                }}
              />
            </label>
            <button className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
              <Camera className="w-4 h-4 mr-2" />
              Camera
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderBusinessInfo = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
          <input
            type="text"
            value={businessCard.business_info.business_name || ''}
            onChange={(e) => handleInputChange('business_info', 'business_name', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your business name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Services</label>
          <input
            type="text"
            value={businessCard.business_info.services || ''}
            onChange={(e) => handleInputChange('business_info', 'services', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Services you offer"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea
          value={businessCard.business_info.description || ''}
          onChange={(e) => handleInputChange('business_info', 'description', e.target.value)}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Describe your business..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Business Logo</label>
        <div className="flex items-center space-x-4">
          {businessCard.business_info.logo && (
            <img
              src={businessCard.business_info.logo}
              alt="Logo"
              className="w-16 h-16 rounded object-cover"
            />
          )}
          <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Upload className="w-4 h-4 mr-2" />
            Upload Logo
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileUpload(file, 'business_info', 'logo')
              }}
            />
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Business Card Design</label>
        <div className="flex items-center space-x-4">
          {businessCard.business_info.business_card && (
            <img
              src={businessCard.business_info.business_card}
              alt="Business Card"
              className="w-32 h-20 rounded object-cover"
            />
          )}
          <div className="flex space-x-2">
            <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Upload className="w-4 h-4 mr-2" />
              Upload Design
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file, 'business_info', 'business_card')
                }}
              />
            </label>
            <button className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
              <Camera className="w-4 h-4 mr-2" />
              Camera
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSocialMedia = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Social Media</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SOCIAL_PLATFORMS.map(platform => (
          <div key={platform.key} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {platform.name} Username
            </label>
            <input
              type="text"
              value={(businessCard.social_media as any)[platform.key] || ''}
              onChange={(e) => handleInputChange('social_media', platform.key, e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`Your ${platform.name} username`}
            />
            {(businessCard.social_media as any)[platform.key] && (
              <div className="flex items-center text-sm text-blue-600">
                <Globe className="w-4 h-4 mr-1" />
                <a 
                  href={`${platform.baseUrl}${(businessCard.social_media as any)[platform.key]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {`${platform.baseUrl}${(businessCard.social_media as any)[platform.key]}`}
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  const menuItems = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'business', label: 'Business Info', icon: Building },
    { id: 'social', label: 'Social Media', icon: Share2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  if (!user || !userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="flex">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0 transition-transform`}>
          <div className="flex items-center justify-between p-6 border-b">
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="text-sm font-medium bg-gray-50 border border-gray-300 rounded px-2 py-1"
                    />
                    <button
                      onClick={handleUsernameUpdate}
                      className="text-green-600 hover:text-green-800"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900 truncate">@{username}</p>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <p className="text-xs text-gray-600 truncate">{userData?.email}</p>
              </div>
            </div>
          </div>

          <nav className="p-4 space-y-2">
            {menuItems.map(item => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id)
                    setSidebarOpen(false)
                  }}
                  className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-colors ${
                    activeSection === item.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </button>
              )
            })}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          {/* Header */}
          <div className="bg-white shadow-sm border-b px-6 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 mr-4"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-semibold text-gray-900">
                {activeSection === 'personal' && 'Personal Information'}
                {activeSection === 'business' && 'Business Information'}
                {activeSection === 'social' && 'Social Media'}
                {activeSection === 'settings' && 'Settings'}
              </h2>
            </div>

            <button
              onClick={handlePublish}
              disabled={isSaving}
              className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium rounded-xl shadow-sm hover:shadow-md transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Publishing...' : isPublished ? 'Update' : 'Publish'}
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-sm p-8">
                {activeSection === 'personal' && renderPersonalInfo()}
                {activeSection === 'business' && renderBusinessInfo()}
                {activeSection === 'social' && renderSocialMedia()}
                {activeSection === 'settings' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>
                    <p className="text-gray-600">Settings panel will be implemented here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}