import { Pressable, ScrollView, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { areaName, useStore } from '../state/store'
import { radius, space, text, useTheme } from '../theme'
import { KLabel, Txt, Why } from '../ui/Txt'
import { IconCheck, IconMinus, IconPlus } from '../ui/icons'
import { useIsDesktop } from '../shell/AppShell'

/* Choosing focus is the product's most deliberate moment.
   Not a settings checkbox — a quiet, full-attention decision. */

const INK_BG = '#201d18'
const ON = '#f4f2ec'
const ON_DIM = 'rgba(244,242,236,0.55)'
const ON_FAINT = 'rgba(244,242,236,0.4)'
const LINE = 'rgba(244,242,236,0.12)'

export default function FocusScreen() {
  const router = useRouter()
  const isDesktop = useIsDesktop()
  const insets = useSafeAreaInsets()
  const goals = useStore((s) => s.goals)
  const toggleFocus = useStore((s) => s.toggleFocus)
  const setHours = useStore((s) => s.setHours)
  const chosen = goals.filter((g) => g.focus)
  const full = chosen.length >= 3

  return (
    <View style={{ flex: 1, backgroundColor: INK_BG }}>
      <ScrollView
        contentContainerStyle={{
          paddingVertical: Math.max(isDesktop ? space.s8 : space.s6, insets.top + space.s3),
          paddingHorizontal: isDesktop ? space.s6 : space.s5,
          alignItems: 'center',
        }}
      >
        <View style={{ width: '100%', maxWidth: 640, gap: isDesktop ? space.s7 : space.s6 }}>
          <View style={{ gap: space.s3 }}>
            <Why size={isDesktop ? 36 : 27} color={ON} style={{ lineHeight: (isDesktop ? 36 : 27) * 1.18 }}>
              What deserves more of you right now?
            </Why>
            <Txt color={ON_DIM}>Choose up to three. Nothing else disappears — it just waits its turn.</Txt>
          </View>

          <View>
            {goals.map((g) => {
              const active = g.focus
              const disabled = !active && full
              return (
                <View
                  key={g.id}
                  style={{
                    gap: space.s2,
                    paddingVertical: space.s4,
                    borderBottomWidth: 1,
                    borderBottomColor: LINE,
                    opacity: disabled ? 0.35 : 1,
                  }}
                >
                  <Pressable
                    onPress={() => toggleFocus(g.id)}
                    disabled={disabled}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: active }}
                    style={{ flexDirection: 'row', gap: space.s4, alignItems: 'flex-start' }}
                  >
                    <View
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 13,
                        borderWidth: 1.5,
                        borderColor: active ? '#d96b3d' : ON_FAINT,
                        backgroundColor: active ? '#d96b3d' : 'transparent',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: 3,
                      }}
                    >
                      {active && <IconCheck size={13} color="#fff" strokeWidth={3.5} />}
                    </View>
                    <View style={{ flex: 1, gap: 3 }}>
                      <KLabel color={ON_FAINT}>{areaName(g.areaId)}</KLabel>
                      <Txt size={isDesktop ? 20 : text.lg} weight="semibold" color={ON} style={{ letterSpacing: -0.3 }}>
                        {g.title}
                      </Txt>
                      {g.why && (
                        <Why color={ON_DIM} size={isDesktop ? text.md : text.sm}>
                          {g.why}
                        </Why>
                      )}
                    </View>
                  </Pressable>
                  {active && (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: space.s2,
                        marginLeft: 42,
                        alignSelf: 'flex-start',
                        borderWidth: 1,
                        borderColor: 'rgba(244,242,236,0.18)',
                        borderRadius: radius.full,
                        paddingVertical: 3,
                        paddingHorizontal: 6,
                      }}
                    >
                      <Pressable
                        onPress={() => setHours(g.id, (g.hoursPerWeek ?? 2) - 1)}
                        hitSlop={6}
                        accessibilityLabel="Less time"
                        style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}
                      >
                        <IconMinus size={13} color={ON_DIM} />
                      </Pressable>
                      <Txt
                        size={text.sm}
                        weight="semibold"
                        color={ON}
                        style={{ minWidth: 92, textAlign: 'center', fontVariant: ['tabular-nums'] }}
                      >
                        ~{g.hoursPerWeek ?? 2}h a week
                      </Txt>
                      <Pressable
                        onPress={() => setHours(g.id, (g.hoursPerWeek ?? 2) + 1)}
                        hitSlop={6}
                        accessibilityLabel="More time"
                        style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}
                      >
                        <IconPlus size={13} color={ON_DIM} />
                      </Pressable>
                    </View>
                  )}
                </View>
              )
            })}
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: space.s4,
              paddingBottom: space.s6,
            }}
          >
            <Txt size={text.sm} color={ON_DIM}>
              {chosen.length === 0 ? 'Nothing chosen yet' : `${chosen.length} of 3 chosen`}
            </Txt>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => ({
                backgroundColor: ON,
                borderRadius: radius.full,
                paddingVertical: 10,
                paddingHorizontal: 20,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Txt size={text.sm} weight="semibold" color={INK_BG}>
                That’s my focus
              </Txt>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
