// Professional icon mapping using Bootstrap Icons
// Replaces emoji with professional icons

export const icons = {
  // Actions
  services: 'bi-scissors',
  appointments: 'bi-calendar-check',
  revenue: 'bi-graph-up',
  notifications: 'bi-bell',
  profile: 'bi-person',
  security: 'bi-shield-lock',
  settings: 'bi-gear',
  site: 'bi-globe',

  // Status
  success: 'bi-check-circle',
  error: 'bi-exclamation-circle',
  warning: 'bi-exclamation-triangle',
  info: 'bi-info-circle',
  pending: 'bi-hourglass-split',
  confirmed: 'bi-check-lg',
  rejected: 'bi-x-circle',

  // Navigation
  home: 'bi-house',
  logout: 'bi-box-arrow-right',
  login: 'bi-box-arrow-in-right',
  back: 'bi-arrow-left',
  menu: 'bi-list',
  close: 'bi-x',

  // Common
  plus: 'bi-plus-circle',
  edit: 'bi-pencil',
  delete: 'bi-trash',
  save: 'bi-floppy',
  cancel: 'bi-x-circle',
  refresh: 'bi-arrow-clockwise',
  download: 'bi-download',
  upload: 'bi-upload',

  // Communication
  email: 'bi-envelope',
  whatsapp: 'bi-chat-left-text',
  phone: 'bi-telephone',
  message: 'bi-chat-dots',

  // Business
  payment: 'bi-credit-card',
  invoice: 'bi-receipt',
  wallet: 'bi-wallet2',
  money: 'bi-cash-coin',

  // Media
  camera: 'bi-camera',
  image: 'bi-image',
  video: 'bi-film',
  gallery: 'bi-images',

  // Utility
  search: 'bi-search',
  filter: 'bi-funnel',
  sort: 'bi-arrow-down-up',
  expand: 'bi-chevron-down',
  collapse: 'bi-chevron-up',
  copy: 'bi-clipboard',
  print: 'bi-printer',

  // Time
  clock: 'bi-clock',
  calendar: 'bi-calendar2',

  // Location
  location: 'bi-geo-alt',
  map: 'bi-map',

  // Theme
  sun: 'bi-sun',
  moon: 'bi-moon',

  // Data
  chart: 'bi-bar-chart',
  stats: 'bi-graph-up',
  users: 'bi-people',
  user: 'bi-person',
};

// Get icon class with size
export const getIconClass = (iconName, size = 'md') => {
  const sizeClass = {
    xs: 'fs-6',
    sm: 'fs-5',
    md: 'fs-4',
    lg: 'fs-3',
    xl: 'fs-2',
    '2xl': 'fs-1',
  }[size] || 'fs-4';

  return `bi ${icons[iconName] || 'bi-question-circle'} ${sizeClass}`;
};

// Get icon element
export const getIcon = (iconName, size = 'md', className = '') => {
  return `<i class="${getIconClass(iconName, size)} ${className}"></i>`;
};

// React icon component
export const Icon = ({ name, size = 'md', className = '' }) => {
  return `<i class="${getIconClass(name, size)} ${className}"></i>`;
};

export default icons;
