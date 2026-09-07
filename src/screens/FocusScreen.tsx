import { Pressable, ScrollView, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { areaName, useStore } from '../state/store'
import { radius, space, text, useTheme } from '../theme'
import { KLabel, Txt, Why } from '../ui/Txt'
import { IconCheck, IconMinus, IconPlus } from '../ui/icons'
import { useIsDesktop } from '../shell/AppShell'

/* Choosing focus is the product's most deliberate moment:
   a full-attention takeover on the performance surface. */

const BG = '#0b0c0e'
const ON = '#f5f6f8'
const ON_DIM = 'rgba(245,246,248,0.6)'
const ON_FAINT = 'rgba(245,246,248,0.38)'
const LINE = 'rgba(245,246,248,0.12)'
const VOLT = '#d8f238'

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
    <View style={{ flex: 1, backgroundColor: BG }}>
      <ScrollView
        contentContainerStyle={{
          paddingVertical: Math.max(isDesktop ? space.s8 : space.s6, insets.top + space.s3),
          paddingHorizontal: isDesktop ? space.s6 : space.s5,
          alignItems: 'center',
        }}
      >
        <View style={{ width: '100%', maxWidth: 680, gap: isDesktop ? space.s7 : space.s6 }}>
          <View style={{ gap: space.s3 }}>
            <KLabel color={VOLT}>Focus · up to three</KLabel>
            <Txt
              size={isDesktop ? 46 : 32}
              weight="black"
              color={ON}
              style={{ letterSpacing: -1.6, lineHeight: (isDesktop ? 46 : 32) * 1.08 }}
            >
              What deserves more of you right now?
            </Txt>
            <Txt size={text.md} weight="medium" color={ON_DIM}>
              Nothing else disappears — it just waits its turn.
            </Txt>
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
                        width: 28,
                        height: 28,
                        borderRadius: 9,
                        borderWidth: 2,
                        borderColor: active ? VOLT : ON_FAINT,
                        backgroundColor: active ? VOLT : 'transparent',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: 3,
                      }}
                    >
                      {active && <IconCheck size={15} color={BG} strokeWidth={3.5} />}
                    </View>
                    <View style={{ flex: 1, gap: 3 }}>
                      <KLabel color={ON_FAINT}>{areaName(g.areaId)}</KLabel>
                      <Txt
                        size={isDesktop ? 22 : text.lg}
                        weight="heavy"
                        color={ON}
                        style={{ letterSpacing: -0.4 }}
                      >
                        {g.title}
                      </Txt>
                      {g.why && (
                        <Why color={ON_DIM} size={text.sm}>
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
                        marginLeft: 44,
                        alignSelf: 'flex-start',
                        borderWidth: 1.5,
                        borderColor: LINE,
                        borderRadius: radius.sm + 2,
                        paddingVertical: 3,
                        paddingHorizontal: 6,
                      }}
                    >
                      <Pressable
                        onPress={() => setHours(g.id, (g.hoursPerWeek ?? 2) - 1)}
                        hitSlop={6}
                        accessibilityLabel="Less time"
                        style={{ width: 26, height: 26, alignItems: 'center', justifyContent: 'center' }}
                      >
                        <IconMinus size={14} color={ON_DIM} strokeWidth={2.5} />
                      </Pressable>
                      <Txt
                        size={text.sm}
                        weight="heavy"
                        color={ON}
                        style={{ minWidth: 96, textAlign: 'center', fontVariant: ['tabular-nums'] }}
                      >
                        ~{g.hoursPerWeek ?? 2}h a week
                      </Txt>
                      <Pressable
                        onPress={() => setHours(g.id, (g.hoursPerWeek ?? 2) + 1)}
                        hitSlop={6}
                        accessibilityLabel="More time"
                        style={{ width: 26, height: 26, alignItems: 'center', justifyContent: 'center' }}
                      >
                        <IconPlus size={14} color={ON_DIM} strokeWidth={2.5} />
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
            <Txt size={text.sm} weight="bold" color={ON_DIM}>
              {chosen.length === 0 ? 'Nothing chosen yet' : `${chosen.length} of 3 chosen`}
            </Txt>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => ({
                backgroundColor: VOLT,
                borderRadius: radius.sm + 2,
                paddingVertical: 12,
                paddingHorizontal: 22,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              })}
            >
              <Txt size={text.md} weight="heavy" color={BG}>
                That’s my focus
              </Txt>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
