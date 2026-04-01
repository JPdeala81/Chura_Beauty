import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'

/**
 * Contexte React pour gérer les thèmes globalement
 * Forces un repaint complet lors du changement
 */
const ThemeContext = createContext()

// Définir les thèmes EN DEHORS du composant pour éviter les re-créations
const THEME_DEFINITIONS = [
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

export const ThemeProvider = ({ children }) => {
  // Initialiser le thème IMMÉDIATEMENT depuis localStorage (pas de useState)
  const savedTheme = typeof window !== 'undefined' ? 
    localStorage.getItem('theme') || 'gold' : 'gold'
  
  const [currentTheme, setCurrentTheme] = useState(savedTheme)
  const [mounted, setMounted] = useState(false)

  // useMemo pour eviter de redéfinir themes à chaque rendu
  const themes = useMemo(() => THEME_DEFINITIONS, [])

  // Appliquer le thème IMMÉDIATEMENT au premier rendu
  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'gold'
    applyThemeImmediate(theme)
    setMounted(true)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const applyTheme = useCallback((themeId) => {
    // Validation
    if (!THEME_DEFINITIONS.find(t => t.id === themeId)) {
      console.error(`❌ Thème invalide: ${themeId}`)
      return
    }

    console.log(`🎨 Changement de thème: ${themeId}`)

    // 1. Appliquer le thème immédiatement
    document.documentElement.setAttribute('data-theme', themeId)
    document.body.setAttribute('data-theme', themeId)
    
    // 2. Mettre à jour colorScheme pour les éléments natifs
    document.documentElement.style.colorScheme = themeId === 'dark' ? 'dark' : 'light'

    // 3. Sauvegarder dans localStorage
    localStorage.setItem('theme', themeId)
    
    // 4. Mettre à jour l'état
    setCurrentTheme(themeId)

    // 5. Force une reflow/repaint complète
    const html = document.documentElement
    html.offsetHeight
    
    // 6. Dispatcher un événement pour d'autres composants
    window.dispatchEvent(new CustomEvent('themechange', { 
      detail: { theme: themeId } 
    }))

    console.log(`✅ Thème appliqué: ${themeId}`)
  }, [])

  // Fonction pour appliquer le thème SANS setter state (utilité au premier rendu)
  const applyThemeImmediate = (themeId) => {
    if (!THEME_DEFINITIONS.find(t => t.id === themeId)) {
      console.error(`❌ Thème invalide: ${themeId}`)
      return
    }

    console.log(`🎨 Thème initial: ${themeId}`)
    document.documentElement.setAttribute('data-theme', themeId)
    document.body.setAttribute('data-theme', themeId)
    document.documentElement.style.colorScheme = themeId === 'dark' ? 'dark' : 'light'
    
    console.log(`✅ Thème initial appliqué à DOM: ${themeId}`)
  }

  const value = {
    currentTheme,
    themes,
    applyTheme,
    mounted
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * Hook pour utiliser le contexte de thème
 */
export const useThemeContext = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useThemeContext doit être utilisé dans ThemeProvider')
  }
  return context
}

export default ThemeContext
