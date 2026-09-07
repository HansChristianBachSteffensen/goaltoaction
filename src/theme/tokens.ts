/* ————————————————————————————————————————————————
   North design tokens — performance direction
   Cool light canvas · white cards · near-black type ·
   cobalt for decision & coach · volt for energy & progress.
   Hierarchy through scale and weight, cards as the language.
   ———————————————————————————————————————————————— */

export const light = {
  canvas: '#f4f5f7',
  card: '#ffffff',
  cardSunken: '#eceef1',
  dark: '#0b0c0e', // hero / signature surface
  darkCard: '#141519',

  ink: '#0b0c0e',
  ink2: '#4b4f58',
  ink3: '#8a8f99',
  ink4: '#c6cad2',
  inkOnDark: '#f5f6f8',
  ink2OnDark: 'rgba(245,246,248,0.65)',
  ink3OnDark: 'rgba(245,246,248,0.4)',

  line: 'rgba(11,12,14,0.09)',
  lineStrong: 'rgba(11,12,14,0.16)',
  lineFaint: 'rgba(11,12,14,0.05)',

  accent: '#2743ff', // cobalt — decisions, coach, active
  accentDeep: '#1d33cc',
  accentSoft: 'rgba(39,67,255,0.08)',
  accentLine: 'rgba(39,67,255,0.3)',
  onAccent: '#ffffff',

  volt: '#d8f238', // energy — progress fills, focus marks, on-dark highlights
  voltDeep: '#b8d40f',
  voltSoft: 'rgba(216,242,56,0.18)',
  onVolt: '#0b0c0e',

  scrim: 'rgba(11,12,14,0.45)',
}

export type Palette = typeof light

export const dark: Palette = {
  canvas: '#0b0c0e',
  card: '#16171b',
  cardSunken: '#101114',
  dark: '#16171b',
  darkCard: '#1d1e23',

  ink: '#f3f4f6',
  ink2: '#a6aab3',
  ink3: '#787d87',
  ink4: '#3f434b',
  inkOnDark: '#f5f6f8',
  ink2OnDark: 'rgba(245,246,248,0.65)',
  ink3OnDark: 'rgba(245,246,248,0.4)',

  line: 'rgba(243,244,246,0.1)',
  lineStrong: 'rgba(243,244,246,0.18)',
  lineFaint: 'rgba(243,244,246,0.06)',

  accent: '#5064ff',
  accentDeep: '#3a4ee0',
  accentSoft: 'rgba(80,100,255,0.14)',
  accentLine: 'rgba(80,100,255,0.4)',
  onAccent: '#ffffff',

  volt: '#d8f238',
  voltDeep: '#e4f95c',
  voltSoft: 'rgba(216,242,56,0.14)',
  onVolt: '#0b0c0e',

  scrim: 'rgba(0,0,0,0.6)',
}

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
  sm: 8,
  md: 12,
  lg: 16,
  full: 999,
}

/* Type scale (px) — big, confident jumps */
export const text = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 22,
  x2: 28,
  x3: 44,
  stat: 40,
}

/* One athletic family, many weights. Loaded in the root layout. */
export const font = {
  regular: 'Archivo_400Regular',
  medium: 'Archivo_500Medium',
  semibold: 'Archivo_600SemiBold',
  bold: 'Archivo_700Bold',
  heavy: 'Archivo_800ExtraBold',
  black: 'Archivo_900Black',
  statItalic: 'Archivo_800ExtraBold_Italic',
  voice: 'Archivo_500Medium_Italic', // the "why" voice — direct, contemporary
}
