import { Pressable, type StyleProp, type ViewStyle } from 'react-native'
import { font, radius, text, useTheme } from '../theme'
import { Txt } from './Txt'

type Variant = 'primary' | 'ghost' | 'quiet' | 'onDark'

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
    variant === 'primary' ? t.ink : variant === 'onDark' ? t.inkOnDark : 'transparent'
  const fg =
    variant === 'primary'
      ? t.canvas
      : variant === 'onDark'
        ? '#201d18'
        : variant === 'ghost'
          ? t.ink2
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
          gap: 6,
          paddingVertical: small ? 6 : 9,
          paddingHorizontal: small ? 12 : 16,
          borderRadius: radius.full,
          backgroundColor: bg,
          borderWidth: variant === 'ghost' ? 1 : 0,
          borderColor: t.lineStrong,
          opacity: disabled ? 0.4 : pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      {icon}
      <Txt size={small ? text.xs : text.sm} color={fg} style={{ fontFamily: font.semibold }}>
        {label}
      </Txt>
    </Pressable>
  )
}
