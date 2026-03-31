import { useState, useEffect } from 'react'

const themes = [
  { id: 'gold', label: 'Gold Luxury' },
  { id: 'dark', label: 'Dark Elegant' },
  { id: 'green', label: 'Neon Green' },
  { id: 'blue', label: 'Neon Blue' },
  { id: 'rose', label: 'Rose Beauty' }
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
  }

  return (
    <div className="theme-switcher">
      <div className={`theme-options ${open ? 'open' : ''}`}>
        {themes.map(theme => (
          <button
            key={theme.id}
            className={`theme-option-btn ${current === theme.id ? 'active' : ''}`}
            data-target={theme.id}
            onClick={() => applyTheme(theme.id)}
            title={`Switch to ${theme.label}`}
            aria-pressed={current === theme.id}
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
