import { useState } from 'react'
import { useThemeContext } from '../context/ThemeContext'

const ThemeSwitcher = () => {
  const [open, setOpen] = useState(false)
  const { currentTheme, themes, applyTheme } = useThemeContext()

  const handleThemeChange = (themeId) => {
    console.log('🎨 ThemeSwitcher: Changement de thème:', themeId)
    applyTheme(themeId)
    setOpen(false)
  }

  return (
    <div className="theme-switcher">
      <div className={`theme-options ${open ? 'open' : ''}`}>
        {themes.map(theme => (
          <button
            key={theme.id}
            className={`theme-option-btn ${currentTheme === theme.id ? 'active' : ''}`}
            data-target={theme.id}
            onClick={() => handleThemeChange(theme.id)}
            title={`Switch to ${theme.label}`}
            aria-pressed={currentTheme === theme.id}
          >
            <span className="theme-label">{theme.label}</span>
          </button>
        ))}
      </div>
      <button
        className="theme-btn-main"
        onClick={() => setOpen(!open)}
        title="Switch Theme"
        aria-expanded={open}
      >
        <span>THEMES</span>
      </button>
    </div>
  )
}

export default ThemeSwitcher
