import { View } from 'react-native'
import { radius, useTheme } from '../theme'

/** Thin time meter — placed vs intended. Weight, not color coding. */
export function Meter({ ratio, onDark = false }: { ratio: number; onDark?: boolean }) {
  const t = useTheme()
  const clamped = Math.max(0, Math.min(1, ratio))
  return (
    <View
      style={{
        height: 3,
        borderRadius: radius.full,
        backgroundColor: onDark ? 'rgba(244,242,236,0.16)' : t.lineFaint,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          width: `${clamped * 100}%`,
          height: '100%',
          borderRadius: radius.full,
          backgroundColor: onDark ? 'rgba(244,242,236,0.8)' : t.ink2,
        }}
      />
    </View>
  )
}
