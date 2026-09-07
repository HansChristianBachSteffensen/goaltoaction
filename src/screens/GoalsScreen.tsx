import { Pressable, ScrollView, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  areaGoals,
  areaStandaloneActions,
  areas,
  goalActions,
  plannedMinutes,
  useStore,
} from '../state/store'
import { formatDuration } from '../model/time'
import { radius, space, text, useTheme } from '../theme'
import { KLabel, Stat, Txt, Why } from '../ui/Txt'
import { Card } from '../ui/Card'
import { Meter } from '../ui/Meter'
import { IconChevronRight, IconFocus } from '../ui/icons'
import { useIsDesktop } from '../shell/AppShell'

/* Mobile home for meaning: the three focus goals as strong cards,
   then the areas of life underneath. */

export default function GoalsScreen() {
  const t = useTheme()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const isDesktop = useIsDesktop()
  const state = useStore()
  const focus = state.goals.filter((g) => g.focus)

  return (
    <ScrollView
      contentContainerStyle={{
        paddingTop: Math.max(space.s5, insets.top + space.s2),
        paddingHorizontal: space.s4,
        paddingBottom: 130,
        gap: space.s4,
        maxWidth: isDesktop ? 760 : undefined,
        width: '100%',
        alignSelf: isDesktop ? 'center' : undefined,
      }}
    >
      <View style={{ gap: 6, paddingHorizontal: space.s1 }}>
        <KLabel color={t.accent}>Focus · This season</KLabel>
        <Txt size={40} weight="black" style={{ letterSpacing: -1.6, lineHeight: 42 }}>
          Goals
        </Txt>
      </View>

      <View style={{ gap: space.s3 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: space.s1,
          }}
        >
          <KLabel>In focus</KLabel>
          <Pressable onPress={() => router.push('/focus')} hitSlop={6}>
            <Txt size={text.sm} weight="bold" color={t.accent}>
              Change
            </Txt>
          </Pressable>
        </View>
        {focus.map((g) => {
          const planned = plannedMinutes(state, g.id)
          const intent = (g.hoursPerWeek ?? 0) * 60
          return (
            <Card key={g.id} dark onPress={() => router.push(`/goal/${g.id}`)} style={{ gap: space.s2 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <IconFocus size={13} color={t.volt} strokeWidth={2.2} />
                <KLabel color={t.volt}>Focus</KLabel>
              </View>
              <Txt
                size={22}
                weight="heavy"
                color={t.inkOnDark}
                style={{ letterSpacing: -0.4, lineHeight: 25 }}
              >
                {g.title}
              </Txt>
              {g.why && (
                <Why size={text.sm} color={t.ink2OnDark}>
                  {g.why}
                </Why>
              )}
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: space.s1 }}>
                <Stat size={26} color={t.volt}>
                  {formatDuration(planned)}
                </Stat>
                <Txt size={text.sm} weight="bold" color={t.ink2OnDark}>
                  / ~{g.hoursPerWeek}h this week
                </Txt>
              </View>
              <Meter ratio={intent ? planned / intent : 1} onDark />
            </Card>
          )
        })}
      </View>

      <View style={{ gap: space.s3 }}>
        <View style={{ paddingHorizontal: space.s1 }}>
          <KLabel>Life</KLabel>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.s3 }}>
          {areas.map((ar) => {
            const goals = areaGoals(state, ar.id)
            const open =
              areaStandaloneActions(state, ar.id).filter((a) => a.status === 'open').length +
              goals.reduce(
                (n, g) => n + goalActions(state, g.id).filter((a) => a.status === 'open').length,
                0,
              )
            const inFocus = goals.some((g) => g.focus)
            return (
              <Card
                key={ar.id}
                pad={space.s4}
                onPress={() => router.push(`/area/${ar.id}`)}
                style={{ flexBasis: '47%', flexGrow: 1, gap: 4 }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Txt size={text.lg} weight="heavy" style={{ flex: 1, letterSpacing: -0.3 }}>
                    {ar.name}
                  </Txt>
                  <IconChevronRight size={14} color={t.ink4} />
                </View>
                <Txt size={text.sm} weight="semibold" color={t.ink3}>
                  {goals.length > 0
                    ? `${goals.length} goal${goals.length === 1 ? '' : 's'}${inFocus ? ' · focus' : ''}`
                    : 'Maintenance'}
                </Txt>
                <Txt size={text.sm} weight="semibold" color={t.ink4}>
                  {open} open
                </Txt>
              </Card>
            )
          })}
        </View>
      </View>
    </ScrollView>
  )
}
