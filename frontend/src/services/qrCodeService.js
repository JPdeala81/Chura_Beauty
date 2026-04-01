import api from './api'

/**
 * Service QR Code - Gère la configuration et l'activation du module QR Code
 */

// Récupérer la configuration actuelle du QR Code
export const getQRCodeConfig = async () => {
  try {
    const response = await api.get('/site-settings/qr-code-config')
    console.log('✅ QR Code config chargée:', response.data)
    return response.data
  } catch (error) {
    console.warn('⚠️ QR Code config non trouvée (premier accès):', error.message)
    // Retourner une config par défaut si non trouvée
    return {
      enabled: false,
      type: 'info', // 'info' ou 'call'
      ussdCode: '',
      phoneNumber: '',
      createdAt: new Date().toISOString()
    }
  }
}

// Mettre à jour la configuration du QR Code
export const updateQRCodeConfig = async (config) => {
  try {
    const response = await api.put('/site-settings/qr-code-config', config)
    console.log('✅ QR Code config mise à jour:', response.data)
    return response.data.config || response.data
  } catch (error) {
    console.error('❌ Erreur mise à jour QR Code config:', error)
    throw error
  }
}

// Activer le QR Code
export const enableQRCode = async () => {
  try {
    const config = await getQRCodeConfig()
    config.enabled = true
    return await updateQRCodeConfig(config)
  } catch (error) {
    console.error('❌ Erreur activation QR Code:', error)
    throw error
  }
}

// Désactiver le QR Code
export const disableQRCode = async () => {
  try {
    const config = await getQRCodeConfig()
    config.enabled = false
    return await updateQRCodeConfig(config)
  } catch (error) {
    console.error('❌ Erreur désactivation QR Code:', error)
    throw error
  }
}

// Générer le contenu du QR Code selon le type
export const generateQRCodeContent = (config, serviceId) => {
  if (!config.enabled) {
    return null
  }

  switch (config.type) {
    case 'info':
      // Retourner une URL vers les infos du service
      return `${window.location.origin}/service/${serviceId}`

    case 'call':
      // Générer un URI pour appel/USSD
      if (config.ussdCode) {
        return `tel:${config.ussdCode}`
      } else if (config.phoneNumber) {
        return `tel:${config.phoneNumber}`
      }
      return null

    default:
      return null
  }
}

// Générer l'URL pour une API QR Code tierce (comme qrserver.com)
export const generateQRCodeUrl = (content, size = 300) => {
  if (!content) return null

  // Encoder le contenu
  const encoded = encodeURIComponent(content)

  // Retourner l'URL de qrserver (gratuit et sans authentification)
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}`
}
