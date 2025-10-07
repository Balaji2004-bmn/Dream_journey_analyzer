import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6366f1',
    secondary: '#8b5cf6',
    accent: '#ec4899',
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#1e293b',
    error: '#ef4444',
    success: '#10b981',
    warning: '#f59e0b',
    disabled: '#94a3b8',
    placeholder: '#cbd5e1',
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
  roundness: 12,
  fonts: {
    ...DefaultTheme.fonts,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
};
