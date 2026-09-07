import { Platform, Pressable } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { IconCheck } from './icons'
import { useTheme } from '../theme'

/* The action check. Completion fills ink and strikes the mark in volt —
   a small physical pop and a light haptic. Movement, not confetti. */

export function Check({
  done,
  onToggle,
  size = 24,
  onDark = false,
}: {
  done: boolean
  onToggle: () => void
  size?: number
  onDark?: boolean
}) {
  const t = useTheme()
  const scale = useSharedValue(1)

  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  const fill = onDark ? t.volt : t.ink
  const mark = onDark ? t.onVolt : t.volt
  const border = onDark ? 'rgba(245,246,248,0.4)' : t.lineStrong

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
      hitSlop={10}
      onPress={() => {
        if (!done) {
          scale.value = withSequence(
            withTiming(0.8, { duration: 80 }),
            withSpring(1, { damping: 11, stiffness: 300 }),
          )
          if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
          }
        }
        onToggle()
      }}
    >
      <Animated.View
        style={[
          {
            width: size,
            height: size,
            borderRadius: size * 0.32,
            borderWidth: 2,
            borderColor: done ? fill : border,
            backgroundColor: done ? fill : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
          },
          animated,
        ]}
      >
        {done && <IconCheck size={size * 0.6} color={mark} strokeWidth={3.5} />}
      </Animated.View>
    </Pressable>
  )
}
