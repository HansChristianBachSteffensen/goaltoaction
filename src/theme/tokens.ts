/* ————————————————————————————————————————————————
   North design tokens
   Warm neutral canvas · graphite ink · one ember accent.
   Hierarchy through weight and space, not color coding.
   ———————————————————————————————————————————————— */

export const light = {
  canvas: '#f6f4ef',
  surface: '#fffefb',
  surfaceRaised: '#ffffff',
  surfaceSunken: '#efece5',
  surfaceInk: '#201d18',

  ink: '#1c1a15',
  ink2: '#56524a',
  ink3: '#8b867c',
  ink4: '#b5afa3',
  inkOnDark: '#f4f2ec',
  ink2OnDark: 'rgba(244,242,236,0.64)',

  line: 'rgba(28,26,21,0.10)',
  lineStrong: 'rgba(28,26,21,0.18)',
  lineFaint: 'rgba(28,26,21,0.055)',

  accent: '#c04f24',
  accentInk: '#a8431d',
  accentSoft: 'rgba(192,79,36,0.09)',
  accentLine: 'rgba(192,79,36,0.28)',
  accentOnDark: '#e8a878',
  onAccent: '#fff7f2',

  scrim: 'rgba(24,21,16,0.35)',
}

export const dark: Palette = {
  canvas: '#161511',
  surface: '#1e1c18',
  surfaceRaised: '#24221d',
  surfaceSunken: '#121110',
  surfaceInk: '#26231d',

  ink: '#edeae2',
  ink2: '#a8a396',
  ink3: '#7d786d',
  ink4: '#55524a',
  inkOnDark: '#f4f2ec',
  ink2OnDark: 'rgba(244,242,236,0.64)',

  line: 'rgba(237,234,226,0.10)',
  lineStrong: 'rgba(237,234,226,0.20)',
  lineFaint: 'rgba(237,234,226,0.05)',

  accent: '#d96b3d',
  accentInk: '#e07a4e',
  accentSoft: 'rgba(217,107,61,0.13)',
  accentLine: 'rgba(217,107,61,0.35)',
  accentOnDark: '#e8a878',
  onAccent: '#21130c',

  scrim: 'rgba(0,0,0,0.5)',
}

export type Palette = typeof light

/* 4px spatial rhythm */
export const space = {
  s1: 4,
  s2: 8,
  s3: 12,
  s4: 16,
  s5: 24,
  s6: 32,
  s7: 48,
  s8: 64,
}

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  full: 999,
}

/* Type scale (px) */
export const text = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 22,
  x2: 30,
  x3: 40,
}

/* Font families — loaded in the root layout. */
export const font = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  editorial: 'Fraunces_400Regular_Italic',
}

/* Small-caps section label */
export const kLabel = {
  fontFamily: font.semibold,
  fontSize: text.xs,
  letterSpacing: 1.1,
  textTransform: 'uppercase' as const,
}
