import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const ThemeSwitcherFloating = () => {
  const [isOpen, setIsOpen] = useState(false)

  const themes = [
    { id: 'gold', label: 'Gold', emoji: '✨', gradient: 'linear-gradient(135deg, #b8860b, #d4af37)' },
    { id: 'dark', label: 'Dark', emoji: '🌙', gradient: 'linear-gradient(135deg, #1a1a1a, #2d2d2d)' },
    { id: 'green', label: 'Green', emoji: '💚', gradient: 'linear-gradient(135deg, #00ff41, #00cc33)' },
    { id: 'blue', label: 'Blue', emoji: '🔵', gradient: 'linear-gradient(135deg, #00d9ff, #0099cc)' },
    { id: 'rose', label: 'Rose', emoji: '🌹', gradient: 'linear-gradient(135deg, #d4607a, #f0a0b0)' },
  ]

  const handleThemeChange = (themeId) => {
    document.documentElement.setAttribute('data-theme', themeId)
    localStorage.setItem('theme', themeId)
    setIsOpen(false)
  }

  const getCurrentTheme = () => {
    const theme = document.documentElement.getAttribute('data-theme') || 'gold'
    return themes.find(t => t.id === theme)
  }

  const currentTheme = getCurrentTheme()

  return (
    <div className="theme-switcher-floating-container">
      {/* Main floating button with animation */}
      <motion.button
        className="theme-switcher-main-btn"
        onClick={() => setIsOpen(!isOpen)}
        animate={{
          y: isOpen ? 0 : [0, -8, 0],
        }}
        transition={{
          duration: isOpen ? 0.3 : 2,
          repeat: isOpen ? 0 : Infinity,
        }}
        style={{
          background: currentTheme?.gradient,
        }}
      >
        <span className="theme-icon">🎨</span>
      </motion.button>

      {/* Theme options bubbles */}
      <AnimatePresence>
        {isOpen && (
          <motion.div className="theme-bubbles-container">
            {themes.map((theme, index) => (
              <motion.button
                key={theme.id}
                className="theme-bubble"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{
                  delay: index * 0.05,
                  type: 'spring',
                  stiffness: 200,
                }}
                onClick={() => handleThemeChange(theme.id)}
                style={{
                  background: theme.gradient,
                }}
                title={theme.label}
              >
                <span className="bubble-emoji">{theme.emoji}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay to close menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="theme-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default ThemeSwitcherFloating
