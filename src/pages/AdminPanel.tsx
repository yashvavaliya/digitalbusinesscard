import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  MapPin,
  Video,
  Star,
  Palette,
  Image,
  Plus,
  Trash2,
  Eye,
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
  office_showcase: {
    images?: string[]
    location?: string
    google_maps_embed?: string
  }
  media_integration: {
    youtube_channel?: string
    instagram_reels?: string
    featured_video?: string
  }
  google_reviews: {
    review_link?: string
    rating?: number
    review_text?: string
  }
  theme_customization: {
    template?: string
    primary_color?: string
    secondary_color?: string
    font_family?: string
    layout?: string
  }
}

const SOCIAL_PLATFORMS = [
  { key: 'instagram', name: 'Instagram', baseUrl: 'https://instagram.com/', icon: '📷' },
  { key: 'twitter', name: 'Twitter/X', baseUrl: 'https://twitter.com/', icon: '🐦' },
  { key: 'youtube', name: 'YouTube', baseUrl: 'https://youtube.com/c/', icon: '📺' },
  { key: 'linkedin', name: 'LinkedIn', baseUrl: 'https://linkedin.com/in/', icon: '💼' },
  { key: 'facebook', name: 'Facebook', baseUrl: 'https://facebook.com/', icon: '📘' },
  { key: 'github', name: 'GitHub', baseUrl: 'https://github.com/', icon: '🐙' },
  { key: 'reddit', name: 'Reddit', baseUrl: 'https://reddit.com/u/', icon: '🤖' },
  { key: 'pinterest', name: 'Pinterest', baseUrl: 'https://pinterest.com/', icon: '📌' },
  { key: 'snapchat', name: 'Snapchat', baseUrl: 'https://snapchat.com/add/', icon: '👻' },
  { key: 'discord', name: 'Discord', baseUrl: 'https://discord.gg/', icon: '🎮' },
  { key: 'telegram', name: 'Telegram', baseUrl: 'https://t.me/', icon: '✈️' },
]

const THEME_TEMPLATES = [
  { id: 'modern', name: 'Modern', preview: 'bg-gradient-to-br from-blue-500 to-purple-600' },
  { id: 'classic', name: 'Classic', preview: 'bg-gradient-to-br from-gray-700 to-gray-900' },
  { id: 'vibrant', name: 'Vibrant', preview: 'bg-gradient-to-br from-pink-500 to-orange-500' },
  { id: 'nature', name: 'Nature', preview: 'bg-gradient-to-br from-green-500 to-teal-600' },
  { id: 'elegant', name: 'Elegant', preview: 'bg-gradient-to-br from-indigo-600 to-purple-700' },
  { id: 'minimal', name: 'Minimal', preview: 'bg-gradient-to-br from-slate-400 to-slate-600' },
]

export default function AdminPanel() {
  const navigate = useNavigate()
  const { user, userData, signOut } = useAuth()
  const [activeSection, setActiveSection] = useState('personal')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [businessCard, setBusinessCard] = useState<BusinessCardData>({
    personal_info: {},
    business_info: {},
    social_media: {},
    office_showcase: { images: [] },
    media_integration: {},
    google_reviews: {},
    theme_customization: { template: 'modern', primary_color: '#3B82F6', secondary_color: '#8B5CF6' },
  })
  const [isPublished, setIsPublished] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/businesscard', { replace: true })
    }
  }, [user, navigate])

  // Set initial username when userData loads
  useEffect(() => {
    if (userData?.username) {
      setNewUsername(userData.username)
    }
  }, [userData])

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
        office_showcase: data.office_showcase || { images: [] },
        media_integration: data.media_integration || {},
        google_reviews: data.google_reviews || {},
        theme_customization: data.theme_customization || { template: 'modern', primary_color: '#3B82F6', secondary_color: '#8B5CF6' },
      })
      setIsPublished(data.is_published || false)
    }
  }

  const handleInputChange = (section: keyof BusinessCardData, field: string, value: any) => {
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

  const handleMultipleFileUpload = async (files: FileList, section: keyof BusinessCardData, field: string) => {
    if (!files || files.length === 0) return

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop()
        const fileName = `${user?.id}/${section}_${field}_${Date.now()}_${Math.random()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('uploads')
          .upload(fileName, file)

        if (uploadError) throw uploadError

        const { data } = supabase.storage
          .from('uploads')
          .getPublicUrl(fileName)

        return data.publicUrl
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      const currentImages = (businessCard.office_showcase?.images || [])
      handleInputChange(section, field, [...currentImages, ...uploadedUrls])
      toast.success(`${uploadedUrls.length} files uploaded successfully!`)
    } catch (error) {
      toast.error('Failed to upload files')
    }
  }

  const removeOfficeImage = (index: number) => {
    const currentImages = businessCard.office_showcase?.images || []
    const updatedImages = currentImages.filter((_, i) => i !== index)
    handleInputChange('office_showcase', 'images', updatedImages)
  }

  const handleUsernameUpdate = async () => {
    if (!user || newUsername === userData?.username) {
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
      // Refresh user data to get updated username
      window.location.reload()
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
          office_showcase: businessCard.office_showcase,
          media_integration: businessCard.media_integration,
          google_reviews: businessCard.google_reviews,
          theme_customization: businessCard.theme_customization,
          is_published: true,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error

      setIsPublished(true)
      toast.success('🎉 Business card published successfully!')
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
              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Business Logo</label>
          <div className="flex items-center space-x-4">
            {businessCard.business_info.logo && (
              <img
                src={businessCard.business_info.logo}
                alt="Logo"
                className="w-16 h-16 rounded object-cover border-2 border-gray-200"
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
                className="w-32 h-20 rounded object-cover border-2 border-gray-200"
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
    </div>
  )

  const renderSocialMedia = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Social Media</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SOCIAL_PLATFORMS.map(platform => (
          <div key={platform.key} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <span className="mr-2">{platform.icon}</span>
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
              <div className="flex items-center text-sm text-blue-600 bg-blue-50 p-2 rounded-lg">
                <Globe className="w-4 h-4 mr-1" />
                <a 
                  href={`${platform.baseUrl}${(businessCard.social_media as any)[platform.key]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline truncate"
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

  const renderOfficeShowcase = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Office / Workplace Showcase</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Office Images</label>
        <div className="space-y-4">
          {businessCard.office_showcase?.images && businessCard.office_showcase.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {businessCard.office_showcase.images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Office ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <button
                    onClick={() => removeOfficeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Add Office Images
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) handleMultipleFileUpload(e.target.files, 'office_showcase', 'images')
              }}
            />
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Office Location</label>
        <input
          type="text"
          value={businessCard.office_showcase?.location || ''}
          onChange={(e) => handleInputChange('office_showcase', 'location', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Office address or location"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Google Maps Embed URL</label>
        <input
          type="url"
          value={businessCard.office_showcase?.google_maps_embed || ''}
          onChange={(e) => handleInputChange('office_showcase', 'google_maps_embed', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Google Maps embed URL"
        />
        <p className="text-xs text-gray-500 mt-1">
          Get embed URL from Google Maps → Share → Embed a map
        </p>
      </div>
    </div>
  )

  const renderMediaIntegration = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Video & Media Integration</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">YouTube Channel</label>
        <input
          type="url"
          value={businessCard.media_integration?.youtube_channel || ''}
          onChange={(e) => handleInputChange('media_integration', 'youtube_channel', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://youtube.com/c/yourchannel"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Instagram Reels/Video Link</label>
        <input
          type="url"
          value={businessCard.media_integration?.instagram_reels || ''}
          onChange={(e) => handleInputChange('media_integration', 'instagram_reels', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://instagram.com/reel/..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Featured Video URL</label>
        <input
          type="url"
          value={businessCard.media_integration?.featured_video || ''}
          onChange={(e) => handleInputChange('media_integration', 'featured_video', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="YouTube, Vimeo, or other video URL"
        />
      </div>

      {businessCard.media_integration?.featured_video && (
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Video Preview</h4>
          <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
            <Video className="w-12 h-12 text-gray-400" />
          </div>
          <p className="text-xs text-gray-500 mt-2">Video will be embedded in your business card</p>
        </div>
      )}
    </div>
  )

  const renderGoogleReviews = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Google Business Reviews</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Google Review Link</label>
        <input
          type="url"
          value={businessCard.google_reviews?.review_link || ''}
          onChange={(e) => handleInputChange('google_reviews', 'review_link', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Google Business review link"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Rating (1-5)</label>
          <input
            type="number"
            min="1"
            max="5"
            step="0.1"
            value={businessCard.google_reviews?.rating || ''}
            onChange={(e) => handleInputChange('google_reviews', 'rating', parseFloat(e.target.value))}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="4.5"
          />
        </div>

        <div className="flex items-center space-x-1 pt-8">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-6 h-6 ${
                star <= (businessCard.google_reviews?.rating || 0)
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          ))}
          <span className="ml-2 text-sm text-gray-600">
            {businessCard.google_reviews?.rating || 0}/5
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Review Text Preview</label>
        <textarea
          value={businessCard.google_reviews?.review_text || ''}
          onChange={(e) => handleInputChange('google_reviews', 'review_text', e.target.value)}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Sample review text to display..."
        />
      </div>
    </div>
  )

  const renderThemeCustomization = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Card Theme & Design</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">Choose Template</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {THEME_TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => handleInputChange('theme_customization', 'template', template.id)}
              className={`p-4 rounded-xl border-2 transition-all ${
                businessCard.theme_customization?.template === template.id
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`w-full h-20 rounded-lg mb-2 ${template.preview}`}></div>
              <p className="text-sm font-medium text-gray-700">{template.name}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={businessCard.theme_customization?.primary_color || '#3B82F6'}
              onChange={(e) => handleInputChange('theme_customization', 'primary_color', e.target.value)}
              className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={businessCard.theme_customization?.primary_color || '#3B82F6'}
              onChange={(e) => handleInputChange('theme_customization', 'primary_color', e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="#3B82F6"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={businessCard.theme_customization?.secondary_color || '#8B5CF6'}
              onChange={(e) => handleInputChange('theme_customization', 'secondary_color', e.target.value)}
              className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={businessCard.theme_customization?.secondary_color || '#8B5CF6'}
              onChange={(e) => handleInputChange('theme_customization', 'secondary_color', e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="#8B5CF6"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
        <select
          value={businessCard.theme_customization?.font_family || 'Inter'}
          onChange={(e) => handleInputChange('theme_customization', 'font_family', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Inter">Inter</option>
          <option value="Roboto">Roboto</option>
          <option value="Open Sans">Open Sans</option>
          <option value="Lato">Lato</option>
          <option value="Montserrat">Montserrat</option>
          <option value="Poppins">Poppins</option>
        </select>
      </div>

      <div className="bg-gray-50 p-6 rounded-xl">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Live Preview</h4>
        <div 
          className="w-full h-48 rounded-xl flex items-center justify-center text-white font-semibold text-lg"
          style={{
            background: `linear-gradient(135deg, ${businessCard.theme_customization?.primary_color || '#3B82F6'}, ${businessCard.theme_customization?.secondary_color || '#8B5CF6'})`,
            fontFamily: businessCard.theme_customization?.font_family || 'Inter'
          }}
        >
          {businessCard.personal_info?.name || 'Your Name'}
        </div>
      </div>
    </div>
  )

  const menuItems = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'business', label: 'Business Info', icon: Building },
    { id: 'social', label: 'Social Media', icon: Share2 },
    { id: 'office', label: 'Office Showcase', icon: MapPin },
    { id: 'media', label: 'Video & Media', icon: Video },
    { id: 'reviews', label: 'Google Reviews', icon: Star },
    { id: 'theme', label: 'Theme & Design', icon: Palette },
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
                    <p className="text-sm font-medium text-gray-900 truncate">@{userData?.username}</p>
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

          <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
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
                {userData?.username && (
                  <a
                    href={`/businesscard/${userData.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 font-medium rounded-xl hover:bg-indigo-200 transition-colors"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    View Public Card
                  </a>
                )}
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
                {activeSection === 'office' && 'Office Showcase'}
                {activeSection === 'media' && 'Video & Media Integration'}
                {activeSection === 'reviews' && 'Google Business Reviews'}
                {activeSection === 'theme' && 'Theme & Design Customization'}
                {activeSection === 'settings' && 'Settings'}
              </h2>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </button>
              <button
                onClick={handlePublish}
                disabled={isSaving}
                className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium rounded-xl shadow-sm hover:shadow-md transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Publishing...' : isPublished ? 'Update' : 'Publish'}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-sm p-8">
                {activeSection === 'personal' && renderPersonalInfo()}
                {activeSection === 'business' && renderBusinessInfo()}
                {activeSection === 'social' && renderSocialMedia()}
                {activeSection === 'office' && renderOfficeShowcase()}
                {activeSection === 'media' && renderMediaIntegration()}
                {activeSection === 'reviews' && renderGoogleReviews()}
                {activeSection === 'theme' && renderThemeCustomization()}
                {activeSection === 'settings' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Account Settings</h3>
                      <p className="text-gray-600">Advanced settings and account management options will be available here.</p>
                    </div>
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