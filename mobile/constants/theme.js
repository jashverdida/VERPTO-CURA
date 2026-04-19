// Project CURA - Corporate White & Green Theme
export const COLORS = {
  // Primary Colors
  white: '#FFFFFF',
  ultraLightSlate: '#F8FAFC',

  // Green Palette
  deepForest: '#065F46',      // Headers, nav, primary accents
  emerald: '#10B981',         // Primary actions, buttons, highlights
  emeraldLight: '#34D399',    // Hover states
  emeraldDark: '#059669',     // Pressed states

  // Slate Palette
  slate50: '#F8FAFC',
  slate100: '#F1F5F9',
  slate200: '#E2E8F0',        // Borders, dividers
  slate300: '#CBD5E1',
  slate400: '#94A3B8',
  slate500: '#64748B',        // Secondary text
  slate600: '#475569',        // Body text
  slate700: '#334155',
  slate800: '#1E293B',        // Headings
  slate900: '#0F172A',        // Primary text

  // Emergency Status Colors
  fireRed: '#EF4444',
  medicalBlue: '#3B82F6',
  accidentOrange: '#F97316',
  rescueYellow: '#EAB308',

  // UI Colors
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Transparency
  overlay: 'rgba(15, 23, 42, 0.6)',
  cardShadow: 'rgba(15, 23, 42, 0.08)',
};

export const SHADOWS = {
  small: {
    shadowColor: COLORS.slate900,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.slate900,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: COLORS.slate900,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  emerald: {
    shadowColor: COLORS.emerald,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FONT_SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  display: 48,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};
