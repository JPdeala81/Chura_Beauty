import { useState, useEffect } from 'react'

const themes = [
  { id: 'gold', label: 'Luxe Doré', emoji: '✨' },
  { id: 'dark', label: 'Nuit Élégante', emoji: '🌙' },
  { id: 'rose', label: 'Rose Poudré', emoji: '🌸' }
]

const ThemeSwitcher = () => {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState('gold')

  useEffect(() => {
    const saved = localStorage.getItem('chura-theme') || 'gold'
    setCurrent(saved)
    document.documentElement.setAttribute('data-theme', saved)
  }, [])

  const applyTheme = (themeId) => {
    document.documentElement.setAttribute('data-theme', themeId)
    localStorage.setItem('chura-theme', themeId)
    setCurrent(themeId)
    setOpen(false)
  }

  return (
    <div className="theme-switcher">
      <div className={`theme-options ${open ? 'open' : ''}`}>
        {themes.map(theme => (
          <button
            key={theme.id}
            className="theme-option-btn"
            data-target={theme.id}
            onClick={() => applyTheme(theme.id)}
            title={theme.label}
            style={{ outline: current === theme.id ? '2px solid white' : 'none' }}
          >
            <span>{theme.emoji}</span>
            <span className="theme-label">{theme.label}</span>
          </button>
        ))}
      </div>
      <button
        className="theme-btn-main"
        onClick={() => setOpen(!open)}
        title="Changer de thème"
      >
        🎨
      </button>
    </div>
  )
}

export default ThemeSwitcher
