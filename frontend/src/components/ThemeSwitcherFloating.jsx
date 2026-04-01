import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useThemeContext } from '../context/ThemeContext'

const ThemeSwitcherFloating = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { currentTheme, themes, applyTheme } = useThemeContext()

  const handleThemeChange = (themeId) => {
    console.log('🎨 ThemeSwitcherFloating: Changement de thème:', themeId)
    applyTheme(themeId)
    setIsOpen(false)
  }

  const currentThemeObj = themes.find(t => t.id === currentTheme) || themes[0]

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
          background: currentThemeObj?.gradient,
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
