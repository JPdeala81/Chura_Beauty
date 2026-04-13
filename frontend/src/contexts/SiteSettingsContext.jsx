import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const SiteSettingsContext = createContext(null)

export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext)
  if (!context) {
    throw new Error('useSiteSettings must be used within SiteSettingsProvider')
  }
  return context
}

export const SiteSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    app_name: 'Chura Beauty Salon',
    app_logo: '',
    hero_background_image: '',
    homepage_hero_title: 'Bienvenue',
    homepage_hero_subtitle: '',
    footer_phone: '',
    footer_email: '',
    footer_whatsapp: '',
    footer_instagram: '',
    footer_facebook: '',
    footer_twitter: '',
    tagline: '',
    footer_company_name: '',
    footer_address: '',
    privacy_policy: '',
    terms_of_service: ''
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('📦 Loading site settings from API...')
      const response = await api.get('/site-settings')
      const settingsData = response.data || {}
      
      console.log('✅ Site settings loaded:', {
        app_name: settingsData.app_name,
        hasLogo: !!settingsData.app_logo,
        hasHeroBg: !!settingsData.hero_background_image,
        footer_phone: settingsData.footer_phone
      })
      
      setSettings(prev => ({
        ...prev,
        ...settingsData
      }))
    } catch (err) {
      console.error('⚠️ Could not load site settings:', err.message)
      setError(err.message)
      // Don't fail - use defaults
    } finally {
      setLoading(false)
    }
  }

  // Load settings on mount
  useEffect(() => {
    loadSettings()
  }, [])

  // Refresh settings function for use in admin dashboard
  const refreshSettings = async () => {
    await loadSettings()
  }

  const value = {
    settings,
    loading,
    error,
    refreshSettings,
    // Direct access to common fields
    appName: settings.app_name,
    appLogo: settings.app_logo,
    heroBackground: settings.hero_background_image,
    heroTitle: settings.homepage_hero_title,
    heroSubtitle: settings.homepage_hero_subtitle,
    footerPhone: settings.footer_phone,
    footerEmail: settings.footer_email,
    footerWhatsapp: settings.footer_whatsapp,
    footerInstagram: settings.footer_instagram,
    footerFacebook: settings.footer_facebook,
    footerTwitter: settings.footer_twitter,
    companyName: settings.footer_company_name,
    address: settings.footer_address
  }

  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  )
}
