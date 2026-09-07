import { Pressable, type StyleProp, type ViewStyle } from 'react-native'
import { font, radius, text, useTheme } from '../theme'
import { Txt } from './Txt'

type Variant = 'primary' | 'dark' | 'ghost' | 'quiet' | 'volt'

/* Buttons are decisive: squared corners, strong weight.
   primary = cobalt (the decision), dark = ink, volt = the one big go. */

export function Btn({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled,
  small,
  style,
}: {
  label: string
  onPress: () => void
  variant?: Variant
  icon?: React.ReactNode
  disabled?: boolean
  small?: boolean
  style?: StyleProp<ViewStyle>
}) {
  const t = useTheme()

  const bg =
    variant === 'primary'
      ? t.accent
      : variant === 'dark'
        ? t.ink
        : variant === 'volt'
          ? t.volt
          : 'transparent'
  const fg =
    variant === 'primary'
      ? t.onAccent
      : variant === 'dark'
        ? t.canvas
        : variant === 'volt'
          ? t.onVolt
          : variant === 'ghost'
            ? t.ink
            : t.ink3

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 7,
          paddingVertical: small ? 7 : 11,
          paddingHorizontal: small ? 13 : 18,
          borderRadius: radius.sm + 2,
          backgroundColor: bg,
          borderWidth: variant === 'ghost' ? 1.5 : 0,
          borderColor: t.lineStrong,
          opacity: disabled ? 0.35 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      {icon}
      <Txt size={small ? text.sm : text.md} color={fg} style={{ fontFamily: font.bold }}>
        {label}
      </Txt>
    </Pressable>
  )
}
