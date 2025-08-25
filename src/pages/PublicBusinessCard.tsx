import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Star,
  ExternalLink,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Facebook,
  Github,
  MessageCircle,
  Camera,
  Users,
  Send,
  Gamepad2,
  Video,
  Building,
  User,
  ArrowLeft,
} from 'lucide-react'

interface BusinessCardData {
  id: string
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
  user: {
    username: string
    email: string
  }
}

const SOCIAL_ICONS = {
  instagram: { icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-50 hover:bg-pink-100' },
  twitter: { icon: Twitter, color: 'text-blue-500', bg: 'bg-blue-50 hover:bg-blue-100' },
  youtube: { icon: Youtube, color: 'text-red-600', bg: 'bg-red-50 hover:bg-red-100' },
  linkedin: { icon: Linkedin, color: 'text-blue-700', bg: 'bg-blue-50 hover:bg-blue-100' },
  facebook: { icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-50 hover:bg-blue-100' },
  github: { icon: Github, color: 'text-gray-800', bg: 'bg-gray-50 hover:bg-gray-100' },
  reddit: { icon: MessageCircle, color: 'text-orange-600', bg: 'bg-orange-50 hover:bg-orange-100' },
  pinterest: { icon: Camera, color: 'text-red-600', bg: 'bg-red-50 hover:bg-red-100' },
  snapchat: { icon: Camera, color: 'text-yellow-500', bg: 'bg-yellow-50 hover:bg-yellow-100' },
  discord: { icon: Gamepad2, color: 'text-indigo-600', bg: 'bg-indigo-50 hover:bg-indigo-100' },
  telegram: { icon: Send, color: 'text-blue-500', bg: 'bg-blue-50 hover:bg-blue-100' },
}

const SOCIAL_URLS = {
  instagram: 'https://instagram.com/',
  twitter: 'https://twitter.com/',
  youtube: 'https://youtube.com/c/',
  linkedin: 'https://linkedin.com/in/',
  facebook: 'https://facebook.com/',
  github: 'https://github.com/',
  reddit: 'https://reddit.com/u/',
  pinterest: 'https://pinterest.com/',
  snapchat: 'https://snapchat.com/add/',
  discord: 'https://discord.gg/',
  telegram: 'https://t.me/',
}

export default function PublicBusinessCard() {
  const { username } = useParams()
  const [businessCard, setBusinessCard] = useState<BusinessCardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (username) {
      fetchBusinessCard()
    }
  }, [username])

  const fetchBusinessCard = async () => {
    try {
      setLoading(true)
      setError(null)

      // First, find the user by username
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, username, email')
        .eq('username', username)
        .single()

      if (userError || !userData) {
        setError('Business card not found')
        return
      }

      // Then fetch their published business card
      const { data: cardData, error: cardError } = await supabase
        .from('business_cards')
        .select('*')
        .eq('user_id', userData.id)
        .eq('is_published', true)
        .single()

      if (cardError || !cardData) {
        setError('Business card not found or not published')
        return
      }

      setBusinessCard({
        ...cardData,
        user: userData,
      })
    } catch (err) {
      setError('Failed to load business card')
    } finally {
      setLoading(false)
    }
  }

  const getSocialLinks = () => {
    if (!businessCard?.social_media) return []
    
    return Object.entries(businessCard.social_media)
      .filter(([_, value]) => value && value.trim() !== '')
      .map(([platform, username]) => ({
        platform,
        username: username as string,
        url: `${SOCIAL_URLS[platform as keyof typeof SOCIAL_URLS]}${username}`,
        ...SOCIAL_ICONS[platform as keyof typeof SOCIAL_ICONS],
      }))
  }

  const getThemeStyles = () => {
    const theme = businessCard?.theme_customization
    return {
      background: `linear-gradient(135deg, ${theme?.primary_color || '#3B82F6'}, ${theme?.secondary_color || '#8B5CF6'})`,
      fontFamily: theme?.font_family || 'Inter',
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading business card...</p>
        </div>
      </div>
    )
  }

  if (error || !businessCard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Business Card Not Found</h1>
            <p className="text-gray-600 mb-6">
              The business card for "@{username}" could not be found or is not published yet.
            </p>
            <a
              href="/"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </a>
          </div>
        </div>
      </div>
    )
  }

  const socialLinks = getSocialLinks()
  const themeStyles = getThemeStyles()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
          {/* Hero Section */}
          <div 
            className="relative h-48 flex items-center justify-center text-white"
            style={{ background: themeStyles.background }}
          >
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: themeStyles.fontFamily }}>
                {businessCard.personal_info?.name || businessCard.business_info?.business_name || 'Business Card'}
              </h1>
              {businessCard.business_info?.business_name && businessCard.personal_info?.name && (
                <p className="text-xl opacity-90">{businessCard.business_info.business_name}</p>
              )}
            </div>
          </div>

          {/* Profile Section */}
          <div className="relative px-8 pb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 -mt-16">
              {/* Profile Photo */}
              <div className="relative">
                {businessCard.personal_info?.photo ? (
                  <img
                    src={businessCard.personal_info.photo}
                    alt="Profile"
                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center">
                    <User className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                {businessCard.business_info?.logo && (
                  <div className="absolute -bottom-2 -right-2">
                    <img
                      src={businessCard.business_info.logo}
                      alt="Logo"
                      className="w-12 h-12 rounded-full border-2 border-white shadow-md object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left mt-8 md:mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {businessCard.personal_info?.name || 'Name not provided'}
                </h2>
                {businessCard.business_info?.services && (
                  <p className="text-lg text-gray-600 mb-4">{businessCard.business_info.services}</p>
                )}
                {businessCard.business_info?.description && (
                  <p className="text-gray-700 leading-relaxed">{businessCard.business_info.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Mail className="w-5 h-5 mr-2 text-blue-600" />
              Contact Information
            </h3>
            <div className="space-y-4">
              {businessCard.personal_info?.email && (
                <a
                  href={`mailto:${businessCard.personal_info.email}`}
                  className="flex items-center p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group"
                >
                  <Mail className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="text-gray-700 group-hover:text-blue-600">{businessCard.personal_info.email}</span>
                </a>
              )}
              {businessCard.personal_info?.phone && (
                <a
                  href={`tel:${businessCard.personal_info.phone}`}
                  className="flex items-center p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group"
                >
                  <Phone className="w-5 h-5 text-green-600 mr-3" />
                  <span className="text-gray-700 group-hover:text-green-600">{businessCard.personal_info.phone}</span>
                </a>
              )}
              {businessCard.personal_info?.address && (
                <div className="flex items-center p-3 rounded-xl bg-gray-50">
                  <MapPin className="w-5 h-5 text-red-600 mr-3" />
                  <span className="text-gray-700">{businessCard.personal_info.address}</span>
                </div>
              )}
              {businessCard.office_showcase?.location && (
                <div className="flex items-center p-3 rounded-xl bg-gray-50">
                  <Building className="w-5 h-5 text-purple-600 mr-3" />
                  <span className="text-gray-700">{businessCard.office_showcase.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Social Media */}
          {socialLinks.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Globe className="w-5 h-5 mr-2 text-blue-600" />
                Social Media
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {socialLinks.map(({ platform, username, url, icon: Icon, color, bg }) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center p-3 rounded-xl ${bg} transition-all duration-200 hover:scale-105 group`}
                  >
                    <Icon className={`w-5 h-5 ${color} mr-3`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 capitalize">{platform}</p>
                      <p className="text-sm font-medium text-gray-900 truncate">@{username}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Google Reviews */}
        {businessCard.google_reviews?.rating && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-500" />
              Customer Reviews
            </h3>
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center space-x-1">
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
              </div>
              <span className="text-lg font-semibold text-gray-900">
                {businessCard.google_reviews.rating}/5
              </span>
            </div>
            {businessCard.google_reviews.review_text && (
              <p className="text-gray-700 mb-4 italic">"{businessCard.google_reviews.review_text}"</p>
            )}
            {businessCard.google_reviews.review_link && (
              <a
                href={businessCard.google_reviews.review_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View All Reviews
              </a>
            )}
          </div>
        )}

        {/* Office Showcase */}
        {businessCard.office_showcase?.images && businessCard.office_showcase.images.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Building className="w-5 h-5 mr-2 text-purple-600" />
              Office Showcase
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {businessCard.office_showcase.images.map((image, index) => (
                <div key={index} className="aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                  <img
                    src={image}
                    alt={`Office ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Featured Video */}
        {businessCard.media_integration?.featured_video && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Video className="w-5 h-5 mr-2 text-red-600" />
              Featured Video
            </h3>
            <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <Video className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Video content will be displayed here</p>
                <a
                  href={businessCard.media_integration.featured_video}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Watch Video
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 py-8">
          <p className="text-gray-500 text-sm">
            Powered by Digital Business Card Builder
          </p>
          <a
            href="/"
            className="inline-flex items-center mt-4 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Create Your Own Business Card
          </a>
        </div>
      </div>
    </div>
  )
}