import { Text, type TextProps, type TextStyle } from 'react-native'
import { font, text, useTheme } from '../theme'

/* Small typed text helpers so screens stay legible. */

/** Uppercase micro-label — bold, tracked, athletic. */
export function KLabel({
  children,
  color,
  style,
}: {
  children: React.ReactNode
  color?: string
  style?: TextStyle
}) {
  const t = useTheme()
  return (
    <Text
      style={[
        {
          fontFamily: font.bold,
          fontSize: text.xs,
          letterSpacing: 1.3,
          textTransform: 'uppercase',
          color: color ?? t.ink3,
        },
        style,
      ]}
    >
      {children}
    </Text>
  )
}

/** The "why" voice — direct and contemporary, not decorative. */
export function Why({
  children,
  color,
  size = text.md,
  style,
  numberOfLines,
}: {
  children: React.ReactNode
  color?: string
  size?: number
  style?: TextStyle
  numberOfLines?: number
}) {
  const t = useTheme()
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        {
          fontFamily: font.voice,
          fontSize: size,
          lineHeight: size * 1.4,
          color: color ?? t.ink2,
        },
        style,
      ]}
    >
      {children}
    </Text>
  )
}

/** Big athletic number — extra-bold italic, NRC-style. */
export function Stat({
  children,
  size = text.stat,
  color,
  style,
}: {
  children: React.ReactNode
  size?: number
  color?: string
  style?: TextStyle
}) {
  const t = useTheme()
  return (
    <Text
      style={[
        {
          fontFamily: font.statItalic,
          fontSize: size,
          lineHeight: size * 1.02,
          letterSpacing: -0.5,
          color: color ?? t.ink,
        },
        style,
      ]}
    >
      {children}
    </Text>
  )
}

export function Txt({
  children,
  size = text.md,
  weight = 'regular',
  color,
  style,
  ...rest
}: TextProps & {
  size?: number
  weight?: keyof typeof font
  color?: string
}) {
  const t = useTheme()
  return (
    <Text
      {...rest}
      style={[
        {
          fontFamily: font[weight],
          fontSize: size,
          lineHeight: size * 1.35,
          color: color ?? t.ink,
        },
        style,
      ]}
    >
      {children}
    </Text>
  )
}
