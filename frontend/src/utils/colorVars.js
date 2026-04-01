/**
 * Utilitaires pour les couleurs des dashboards
 * Tous les composants doivent utiliser ces fonctions
 * pour garantir la cohérence et la compatibilité des thèmes
 */

/**
 * Palette de variables CSS pour les thèmes
 * Chaque dashboard peut utiliser ces variables
 */
export const getCSSVariable = (varName) => {
  return `var(--${varName})`
}

export const colorVars = {
  // Couleurs primaires
  primary: getCSSVariable('primary-color'),
  primaryLight: getCSSVariable('primary-light'),
  primaryDark: getCSSVariable('primary-dark'),
  
  // Backgrounds
  bgColor: getCSSVariable('bg-color'),
  surface: getCSSVariable('surface'),
  
  // Textes
  textColor: getCSSVariable('text-color'),
  textSecondary: getCSSVariable('text-medium'),
  textMuted: getCSSVariable('text-muted'),
  
  // Spécifiques
  successColor: getCSSVariable('success-color'),
  dangerColor: getCSSVariable('danger-color'),
  warningColor: getCSSVariable('warning-color'),
  infoColor: getCSSVariable('info-color'),
  
  // Gradients
  gradientPrimary: getCSSVariable('gradient-primary'),
  gradientDark: getCSSVariable('gradient-dark'),
  
  // Ombres
  shadowLuxury: getCSSVariable('shadow-luxury'),
  shadowCard: getCSSVariable('shadow-card'),
}

/**
 * Retourne un objet de style compatible avec les thèmes
 */
export const getThemeStyle = (property, varName) => {
  return {
    [property]: getCSSVariable(varName)
  }
}

/**
 * Combine plusieurs propriétés CSS avec des variables
 */
export const getThemeStyles = (styleObj) => {
  const result = {}
  for (const [key, varName] of Object.entries(styleObj)) {
    result[key] = getCSSVariable(varName)
  }
  return result
}

export default colorVars
