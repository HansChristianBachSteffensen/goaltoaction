import { ScrollView, View, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { CoachContent, CoachSignature } from '../coach/CoachPanel'
import { space, text, useTheme } from '../theme'
import { Txt } from '../ui/Txt'
import { IconArrowLeft } from '../ui/icons'

export default function CoachScreen() {
  const t = useTheme()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  return (
    <ScrollView
      contentContainerStyle={{
        paddingTop: Math.max(space.s5, insets.top + space.s2),
        paddingHorizontal: space.s4,
        paddingBottom: 130,
        gap: space.s4,
        flexGrow: 1,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s3 }}>
        <Pressable onPress={() => router.back()} hitSlop={8} accessibilityLabel="Back">
          <IconArrowLeft size={19} color={t.ink2} strokeWidth={2.2} />
        </Pressable>
        <CoachSignature size={28} />
        <View>
          <Txt size={text.lg} weight="heavy">Coach</Txt>
          <Txt size={text.xs} color={t.ink3}>Watching goals, time and rhythm</Txt>
        </View>
      </View>
      <CoachContent />
    </ScrollView>
  )
}
