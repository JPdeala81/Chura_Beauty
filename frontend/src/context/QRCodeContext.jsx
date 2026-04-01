import React, { createContext, useContext, useEffect, useState } from 'react'
import api from '../services/api'

const QRCodeContext = createContext()

export const QRCodeProvider = ({ children }) => {
  const [qrConfig, setQRConfig] = useState({
    enabled: false,
    mode: 'service_info', // 'service_info' or 'ussd_call'
    ussdCode: '*241#',
    phoneNumber: ''
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load QR config from API
  const fetchQRConfig = async () => {
    try {
      setLoading(true)
      const response = await api.get('/site-settings/qrcode')
      if (response.data?.config) {
        setQRConfig(response.data.config)
      }
    } catch (err) {
      console.warn('QR Code config not found, using defaults:', err.message)
      // Use default config if not found
    } finally {
      setLoading(false)
    }
  }

  // Update QR config
  const updateQRConfig = async (newConfig) => {
    try {
      const response = await api.patch('/site-settings/qrcode', { config: newConfig })
      setQRConfig(response.data.config || newConfig)
      return response.data
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  // Toggle QR Code feature
  const toggleQRCode = async (enabled) => {
    const updated = { ...qrConfig, enabled }
    return updateQRConfig(updated)
  }

  // Change QR mode
  const setQRMode = async (mode) => {
    const updated = { ...qrConfig, mode }
    return updateQRConfig(updated)
  }

  // Update USSD code
  const setUSSDCode = async (ussdCode) => {
    const updated = { ...qrConfig, ussdCode }
    return updateQRConfig(updated)
  }

  // Update phone number
  const setPhoneNumber = async (phoneNumber) => {
    const updated = { ...qrConfig, phoneNumber }
    return updateQRConfig(updated)
  }

  // Generate QR code data for service
  const generateServiceQRData = (service) => {
    if (!qrConfig.enabled) return null

    if (qrConfig.mode === 'service_info') {
      // Return service info URL
      return `${window.location.origin}/service/${service._id || service.id}`
    } else if (qrConfig.mode === 'ussd_call') {
      // Return USSD code as tel: link
      return `tel:${qrConfig.ussdCode}`
    }

    return null
  }

  useEffect(() => {
    fetchQRConfig()
  }, [])

  const value = {
    qrConfig,
    loading,
    error,
    fetchQRConfig,
    updateQRConfig,
    toggleQRCode,
    setQRMode,
    setUSSDCode,
    setPhoneNumber,
    generateServiceQRData
  }

  return (
    <QRCodeContext.Provider value={value}>
      {children}
    </QRCodeContext.Provider>
  )
}

export const useQRCodeContext = () => {
  const context = useContext(QRCodeContext)
  if (!context) {
    throw new Error('useQRCodeContext must be used within QRCodeProvider')
  }
  return context
}

export default QRCodeContext
