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
import { KLabel, Txt, Why } from '../ui/Txt'
import { GoalArt, type GoalArtKey } from '../ui/GoalArt'
import { IconChevronRight } from '../ui/icons'
import { useIsDesktop } from '../shell/AppShell'

/* Mobile home for meaning: focus first, then the areas of life. */

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
        paddingTop: Math.max(space.s6, insets.top + space.s3),
        paddingHorizontal: space.s5,
        paddingBottom: 120,
        gap: space.s6,
        maxWidth: isDesktop ? 720 : undefined,
        width: '100%',
        alignSelf: isDesktop ? 'center' : undefined,
      }}
    >
      <Txt size={34} weight="bold" style={{ letterSpacing: -1, lineHeight: 36 }}>
        Goals
      </Txt>

      <View style={{ gap: space.s3 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <KLabel color={t.accentInk}>Focus</KLabel>
          <Pressable onPress={() => router.push('/focus')} hitSlop={6}>
            <Txt size={text.sm} weight="medium" color={t.ink3}>
              Change
            </Txt>
          </Pressable>
        </View>
        <View style={{ gap: space.s3 }}>
          {focus.map((g) => {
            const planned = plannedMinutes(state, g.id)
            return (
              <Pressable
                key={g.id}
                onPress={() => router.push(`/goal/${g.id}`)}
                style={({ pressed }) => ({
                  backgroundColor: t.surfaceInk,
                  borderRadius: radius.lg,
                  overflow: 'hidden',
                  padding: space.s5,
                  paddingTop: 66,
                  gap: 5,
                  transform: [{ translateY: pressed ? 1 : 0 }],
                })}
              >
                {g.image && <GoalArt art={g.image as GoalArtKey} scrim="bottom" />}
                <Txt size={20} weight="semibold" color={t.inkOnDark} style={{ letterSpacing: -0.3, lineHeight: 24 }}>
                  {g.title}
                </Txt>
                {g.why && (
                  <Why size={text.sm} color={t.ink2OnDark}>
                    {g.why}
                  </Why>
                )}
                <Txt size={text.xs} weight="semibold" color={t.accentOnDark} style={{ marginTop: space.s2 }}>
                  {formatDuration(planned)} of ~{g.hoursPerWeek}h this week
                </Txt>
              </Pressable>
            )
          })}
        </View>
      </View>

      <View style={{ gap: space.s3 }}>
        <KLabel>Life</KLabel>
        <View>
          {areas.map((ar, i) => {
            const goals = areaGoals(state, ar.id)
            const open =
              areaStandaloneActions(state, ar.id).filter((a) => a.status === 'open').length +
              goals.reduce(
                (n, g) => n + goalActions(state, g.id).filter((a) => a.status === 'open').length,
                0,
              )
            return (
              <Pressable
                key={ar.id}
                onPress={() => router.push(`/area/${ar.id}`)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: space.s3,
                  paddingVertical: 13,
                  minHeight: 52,
                  borderBottomWidth: i < areas.length - 1 ? 1 : 0,
                  borderBottomColor: t.lineFaint,
                }}
              >
                <View style={{ flex: 1, gap: 1 }}>
                  <Txt weight="semibold">{ar.name}</Txt>
                  <Txt size={text.sm} color={t.ink3} numberOfLines={1}>
                    {goals.length > 0 &&
                      `${goals.length} goal${goals.length === 1 ? '' : 's'}${
                        goals.some((g) => g.focus) ? ' · in focus' : ''
                      } · `}
                    {open} open
                  </Txt>
                </View>
                <IconChevronRight size={14} color={t.ink4} />
              </Pressable>
            )
          })}
        </View>
      </View>
    </ScrollView>
  )
}
