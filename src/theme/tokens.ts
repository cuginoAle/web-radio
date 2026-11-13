export const colors = {
  background: '#141210',
  surface: '#1E1B18',
  surfaceRaised: '#2A2622',
  border: '#3A342E',
  text: '#F5EDE1',
  textMuted: '#B8AC9C',
  accent: '#F5A623',
  accentSoft: '#2E2416', // accent at ~12% over background
  onAccent: '#1A1408',
  warning: '#FFB199',
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { sm: 8, md: 12, lg: 16, pill: 999 } as const;

// Android resolves embedded fonts by file name (expo-font plugin in app.json).
export const fonts = {
  title: 'DMSerifDisplay_400Regular',
  body: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
} as const;

export const fontSizes = { caption: 13, body: 15, subtitle: 17, title: 22, display: 34 } as const;

/** Minimum touch target (dp) required by the handover. */
export const TOUCH_TARGET = 48;
