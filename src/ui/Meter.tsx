import { View } from 'react-native'
import { radius, useTheme } from '../theme'

/** Progress bar — time given vs intended. Volt is the energy color. */
export function Meter({
  ratio,
  onDark = false,
  height = 6,
}: {
  ratio: number
  onDark?: boolean
  height?: number
}) {
  const t = useTheme()
  const clamped = Math.max(0, Math.min(1, ratio))
  return (
    <View
      style={{
        height,
        borderRadius: radius.full,
        backgroundColor: onDark ? 'rgba(245,246,248,0.15)' : t.cardSunken,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          width: `${clamped * 100}%`,
          height: '100%',
          borderRadius: radius.full,
          backgroundColor: t.volt,
        }}
      />
    </View>
  )
}
