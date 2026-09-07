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

/* The circular action check. Completion gets a small physical pop and a
   light haptic — a sense of movement, never confetti. */

export function Check({
  done,
  onToggle,
  size = 22,
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

  const fill = onDark ? t.inkOnDark : t.ink
  const border = onDark ? 'rgba(244,242,236,0.4)' : t.lineStrong
  const mark = onDark ? t.surfaceInk : t.canvas

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
      hitSlop={10}
      onPress={() => {
        if (!done) {
          scale.value = withSequence(
            withTiming(0.82, { duration: 90 }),
            withSpring(1, { damping: 12, stiffness: 260 }),
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
            borderRadius: size / 2,
            borderWidth: 1.5,
            borderColor: done ? fill : border,
            backgroundColor: done ? fill : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
          },
          animated,
        ]}
      >
        {done && <IconCheck size={size * 0.62} color={mark} strokeWidth={3.5} />}
      </Animated.View>
    </Pressable>
  )
}
