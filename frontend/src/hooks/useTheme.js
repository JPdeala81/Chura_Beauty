import { useEffect, useState } from 'react'

/**
 * Hook personnalisé pour gérer les thèmes avec changements en temps réel
 * Applique les thèmes aux variables CSS et gère la persistance
 */
export const useTheme = () => {
  const [currentTheme, setCurrentTheme] = useState('gold')

  const themes = [
    { id: 'gold', label: 'Gold Luxury' },
    { id: 'dark', label: 'Dark Elegant' },
    { id: 'green', label: 'Neon Green' },
    { id: 'blue', label: 'Neon Blue' },
    { id: 'rose', label: 'Rose Beauty' }
  ]

  // Charger le thème sauvegardé au montage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'gold'
    applyTheme(savedTheme)
  }, [])

  const applyTheme = (themeId) => {
    // Validation
    if (!themes.find(t => t.id === themeId)) {
      console.error(`❌ Thème invalide: ${themeId}`)
      return
    }

    console.log(`🎨 Changement de thème: ${themeId}`)

    // Appliquer le thème à la structure HTML
    document.documentElement.setAttribute('data-theme', themeId)
    document.documentElement.style.colorScheme = themeId === 'dark' ? 'dark' : 'light'
    document.body.setAttribute('data-theme', themeId)

    // Force browser repaint
    document.documentElement.offsetHeight

    // Sauvegarder dans localStorage
    localStorage.setItem('theme', themeId)

    // Mettre à jour l'état local
    setCurrentTheme(themeId)

    console.log(`✅ Thème appliqué: ${themeId}`)
  }

  const getTheme = (themeId) => themes.find(t => t.id === themeId)

  return {
    currentTheme,
    themes,
    applyTheme,
    getTheme
  }
}

export default useTheme
