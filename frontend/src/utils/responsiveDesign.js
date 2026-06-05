// Responsive Design Utilities for Mobile-First Approach

export const breakpoints = {
  xs: 320,  // Extra small devices (iPhone SE, old Android)
  sm: 480,  // Small devices (iPhone 12, 13)
  md: 768,  // Tablets (iPad mini)
  lg: 992,  // Tablets landscape, small laptops
  xl: 1200, // Desktops
  xxl: 1400 // Large desktops
};

export const mediaQueries = {
  xs: `@media (min-width: ${breakpoints.xs}px)`,
  sm: `@media (min-width: ${breakpoints.sm}px)`,
  md: `@media (min-width: ${breakpoints.md}px)`,
  lg: `@media (min-width: ${breakpoints.lg}px)`,
  xl: `@media (min-width: ${breakpoints.xl}px)`,
  xxl: `@media (min-width: ${breakpoints.xxl}px)`
};

// Responsive typography scale
export const typography = {
  // Headlines
  h1: { xs: '1.5rem', sm: '1.8rem', md: '2.2rem', lg: '2.5rem' },
  h2: { xs: '1.3rem', sm: '1.6rem', md: '2rem', lg: '2.2rem' },
  h3: { xs: '1.1rem', sm: '1.4rem', md: '1.8rem', lg: '2rem' },
  h4: { xs: '1rem', sm: '1.2rem', md: '1.5rem', lg: '1.7rem' },
  h5: { xs: '0.95rem', sm: '1.1rem', md: '1.3rem', lg: '1.5rem' },

  // Body text
  body: { xs: '0.875rem', sm: '0.9rem', md: '1rem', lg: '1.1rem' },
  small: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem', lg: '0.95rem' },

  // Line heights
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75
};

// Responsive spacing scale
export const spacing = {
  // Padding/Margin scale: xs, sm, md, lg, xl
  xs: { xs: '0.5rem', sm: '0.5rem', md: '0.75rem', lg: '1rem' },
  sm: { xs: '0.75rem', sm: '1rem', md: '1.25rem', lg: '1.5rem' },
  md: { xs: '1rem', sm: '1.25rem', md: '1.5rem', lg: '2rem' },
  lg: { xs: '1.25rem', sm: '1.5rem', md: '2rem', lg: '2.5rem' },
  xl: { xs: '1.5rem', sm: '2rem', md: '2.5rem', lg: '3rem' },

  // Gap for grids/flex
  gapXS: { xs: '0.5rem', sm: '0.75rem', md: '1rem', lg: '1.25rem' },
  gapSM: { xs: '0.75rem', sm: '1rem', md: '1.25rem', lg: '1.5rem' },
  gapMD: { xs: '1rem', sm: '1.25rem', md: '1.5rem', lg: '2rem' },
  gapLG: { xs: '1.25rem', sm: '1.5rem', md: '2rem', lg: '2.5rem' }
};

// Touch-friendly sizes (minimum 44px for iOS, 48px for Android)
export const touchSize = {
  small: { xs: '2.5rem', md: '2.75rem' },    // 40px-44px
  medium: { xs: '2.75rem', md: '3rem' },     // 44px-48px
  large: { xs: '3rem', md: '3.5rem' },       // 48px-56px
  xlarge: { xs: '3.5rem', md: '4rem' }       // 56px-64px
};

// Responsive grid columns
export const gridColumns = {
  // Auto-fit columns based on screen size
  auto: {
    xs: '1fr',           // 1 column on mobile
    sm: 'repeat(2, 1fr)', // 2 columns on small devices
    md: 'repeat(3, 1fr)', // 3 columns on tablets
    lg: 'repeat(4, 1fr)', // 4 columns on desktop
    xl: 'repeat(5, 1fr)'  // 5 columns on large desktop
  },

  half: {
    xs: '1fr',            // 1 column on mobile
    sm: 'repeat(2, 1fr)', // 2 columns everywhere else
  },

  thirds: {
    xs: '1fr',            // 1 column on mobile
    md: 'repeat(3, 1fr)', // 3 columns on tablet+
  },

  service: {
    xs: '1fr',            // 1 per row on mobile
    sm: 'repeat(2, 1fr)', // 2 per row on small devices
    md: 'repeat(3, 1fr)', // 3 per row on tablets
    lg: 'repeat(4, 1fr)'  // 4 per row on desktop
  }
};

// Helper function to get responsive value based on screen width
export const getResponsiveValue = (screenWidth, valueObj) => {
  if (screenWidth < breakpoints.sm) return valueObj.xs;
  if (screenWidth < breakpoints.md) return valueObj.sm;
  if (screenWidth < breakpoints.lg) return valueObj.md;
  if (screenWidth < breakpoints.xl) return valueObj.lg;
  if (screenWidth < breakpoints.xxl) return valueObj.xl;
  return valueObj.xxl || valueObj.xl;
};

// Responsive padding helper
export const responsivePadding = (screenWidth, scale = 'md') => {
  const values = spacing[scale];
  return getResponsiveValue(screenWidth, values);
};

// Responsive font size helper
export const responsiveFontSize = (screenWidth, level = 'body') => {
  const values = typography[level];
  return getResponsiveValue(screenWidth, values);
};

// Mobile-first CSS generator
export const responsiveStyle = (baseStyle, variants = {}) => {
  return {
    ...baseStyle,
    ...Object.entries(variants).reduce((acc, [breakpoint, style]) => {
      if (breakpoint === 'xs') {
        return { ...acc, ...style };
      }
      return acc;
    }, {})
  };
};

export default {
  breakpoints,
  mediaQueries,
  typography,
  spacing,
  touchSize,
  gridColumns,
  getResponsiveValue,
  responsivePadding,
  responsiveFontSize,
  responsiveStyle
};
