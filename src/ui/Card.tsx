import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native'
import { radius, space, useTheme } from '../theme'

/* The card family. White surface by default; `dark` for the hero moments;
   `sunken` for supporting context. Elevation is quiet — hierarchy comes
   from size, type, and surface, not stacked shadows. */

export function Card({
  children,
  dark = false,
  sunken = false,
  pad = space.s5,
  onPress,
  style,
}: {
  children: React.ReactNode
  dark?: boolean
  sunken?: boolean
  pad?: number
  onPress?: () => void
  style?: StyleProp<ViewStyle>
}) {
  const t = useTheme()
  const base: ViewStyle = {
    backgroundColor: dark ? t.dark : sunken ? t.cardSunken : t.card,
    borderRadius: radius.lg,
    padding: pad,
    borderWidth: sunken ? 0 : 1,
    borderColor: dark ? 'rgba(245,246,248,0.09)' : t.lineFaint,
    overflow: 'hidden',
  }
  if (!dark && !sunken) {
    Object.assign(base, {
      shadowColor: '#0b0c0e',
      shadowOpacity: 0.04,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    })
  }
  if (!onPress) return <View style={[base, style]}>{children}</View>
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [base, { transform: [{ scale: pressed ? 0.99 : 1 }] }, style]}
    >
      {children}
    </Pressable>
  )
}
