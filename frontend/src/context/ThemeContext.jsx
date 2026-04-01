import React, { createContext, useContext, useEffect, useState } from 'react'

/**
 * Contexte React pour gérer les thèmes globalement
 */
const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('gold')

  const themes = [
    { 
      id: 'gold', 
      label: 'Gold Luxury',
      emoji: '✨',
      gradient: 'linear-gradient(135deg, #b8860b, #d4af37)'
    },
    { 
      id: 'dark',
      label: 'Dark Elegant',
      emoji: '🌙',
      gradient: 'linear-gradient(135deg, #1a1a1a, #2d2d2d)'
    },
    { 
      id: 'green',
      label: 'Neon Green',
      emoji: '💚',
      gradient: 'linear-gradient(135deg, #00ff41, #00cc33)'
    },
    { 
      id: 'blue',
      label: 'Neon Blue',
      emoji: '🔵',
      gradient: 'linear-gradient(135deg, #00d9ff, #0099cc)'
    },
    { 
      id: 'rose',
      label: 'Rose Beauty',
      emoji: '🌹',
      gradient: 'linear-gradient(135deg, #d4607a, #f0a0b0)'
    }
  ]

  // Charger le thème au montage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'gold'
    applyTheme(savedTheme)
    console.log('🎨 ThemeProvider: Thème chargé au démarrage -', savedTheme)
  }, [])

  const applyTheme = (themeId) => {
    // Validation
    if (!themes.find(t => t.id === themeId)) {
      console.error(`❌ ThemeProvider: Thème invalide: ${themeId}`)
      return
    }

    console.log(`🎨 ThemeProvider: Changement de thème: ${themeId}`)

    // Appliquer sur l'élément HTML
    document.documentElement.setAttribute('data-theme', themeId)
    document.documentElement.style.colorScheme = themeId === 'dark' ? 'dark' : 'light'

    // Appliquer aussi sur body pour plus de compatibilité
    document.body.setAttribute('data-theme', themeId)

    // Force browser refresh - déclenche un repaint
    void document.documentElement.offsetHeight

    // Sauvegarder
    localStorage.setItem('theme', themeId)
    setCurrentTheme(themeId)

    // Dispatcher un événement personnalisé pour notifier les autres composants
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: themeId } }))

    console.log(`✅ ThemeProvider: Thème appliqué avec succès - ${themeId}`)
  }

  const value = {
    currentTheme,
    themes,
    applyTheme
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * Hook pour utiliser le contexte de thème dans nos composants
 */
export const useThemeContext = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useThemeContext doit être utilisé dans ThemeProvider')
  }
  return context
}

export default ThemeContext
