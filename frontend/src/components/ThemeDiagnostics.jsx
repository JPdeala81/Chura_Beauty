import { useThemeContext } from '../context/ThemeContext'

/**
 * Composant de diagnostic pour tester le système de thème
 */
const ThemeDiagnostics = () => {
  const { currentTheme, themes, applyTheme } = useThemeContext()

  const getCurrentCSSVariable = (varName) => {
    const value = getComputedStyle(document.documentElement).getPropertyValue(varName)
    return value.trim()
  }

  const testThemeApplication = () => {
    const dataTheme = document.documentElement.getAttribute('data-theme')
    const primaryColor = getCurrentCSSVariable('--primary-color')
    const bgColor = getCurrentCSSVariable('--bg-color')
    const textColor = getCurrentCSSVariable('--text-color')
    
    console.log('🔍 DIAGNOSTICS THÈME:')
    console.log('  data-theme attribute:', dataTheme)
    console.log('  React currentTheme:', currentTheme)
    console.log('  CSS --primary-color:', primaryColor)
    console.log('  CSS --bg-color:', bgColor)
    console.log('  CSS --text-color:', textColor)
    
    return {
      dataTheme,
      currentTheme,
      primaryColor,
      bgColor,
      textColor
    }
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      background: 'var(--surface)',
      border: '2px solid var(--primary-color)',
      padding: '1.5rem',
      borderRadius: '0.75rem',
      zIndex: 10000,
      maxWidth: '300px',
      fontSize: '0.85rem'
    }}>
      <h6 style={{ marginTop: 0, color: 'var(--primary-color)' }}>🎨 Theme Diagnostics</h6>
      
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ margin: '0.25rem 0' }}>
          <strong>Current Theme:</strong> {currentTheme}
        </p>
        <p style={{ margin: '0.25rem 0' }}>
          <strong>data-theme attr:</strong> {document.documentElement.getAttribute('data-theme')}
        </p>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <p style={{ margin: '0.25rem 0', fontSize: '0.75rem' }}>
          Primary: <span style={{ 
            background: 'var(--primary-color)', 
            color: 'white', 
            padding: '2px 6px', 
            borderRadius: '3px' 
          }}>
          Color
          </span>
        </p>
        <p style={{ margin: '0.25rem 0', fontSize: '0.75rem' }}>
          BG: <span style={{ 
            background: 'var(--bg-color)', 
            color: 'var(--text-color)', 
            border: '1px solid var(--primary-color)',
            padding: '2px 6px', 
            borderRadius: '3px' 
          }}>
          Background
          </span>
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        {themes.map(theme => (
          <button
            key={theme.id}
            onClick={() => applyTheme(theme.id)}
            style={{
              padding: '0.5rem',
              background: currentTheme === theme.id ? 'var(--primary-color)' : 'var(--bg-color)',
              color: currentTheme === theme.id ? 'white' : 'var(--text-color)',
              border: '1px solid var(--primary-color)',
              borderRadius: '0.25rem',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: currentTheme === theme.id ? 'bold' : 'normal'
            }}
          >
            {theme.emoji} {theme.id}
          </button>
        ))}
      </div>

      <button
        onClick={testThemeApplication}
        style={{
          width: '100%',
          marginTop: '0.5rem',
          padding: '0.5rem',
          background: 'var(--primary-color)',
          color: 'white',
          border: 'none',
          borderRadius: '0.25rem',
          cursor: 'pointer',
          fontSize: '0.75rem'
        }}
      >
        📊 Test Diagnostics
      </button>
    </div>
  )
}

export default ThemeDiagnostics
