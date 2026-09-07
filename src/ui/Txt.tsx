import { Text, type TextProps, type TextStyle } from 'react-native'
import { font, text, useTheme } from '../theme'

/* Small typed text helpers so screens stay legible. */

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
          fontFamily: font.semibold,
          fontSize: text.xs,
          letterSpacing: 1.1,
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

/** Editorial voice — the Why lines. Fraunces italic. */
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
          fontFamily: font.editorial,
          fontSize: size,
          lineHeight: size * 1.45,
          color: color ?? t.ink2,
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
          lineHeight: size * 1.4,
          color: color ?? t.ink,
        },
        style,
      ]}
    >
      {children}
    </Text>
  )
}
