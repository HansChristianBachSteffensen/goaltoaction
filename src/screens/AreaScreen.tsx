import { Pressable, ScrollView, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  areaGoals,
  areaName,
  areaStandaloneActions,
  goalActions,
  plannedMinutes,
  useStore,
} from '../state/store'
import type { AreaId, Goal } from '../model/types'
import { dayShort, formatDuration, formatTime } from '../model/time'
import { radius, space, text, useTheme } from '../theme'
import { KLabel, Stat, Txt, Why } from '../ui/Txt'
import { Card } from '../ui/Card'
import { Check } from '../ui/Check'
import { Meter } from '../ui/Meter'
import { CoachSignature } from '../coach/CoachPanel'
import { IconArrowLeft, IconChevronRight, IconFocus, IconPlus } from '../ui/icons'
import { useIsDesktop } from '../shell/AppShell'
import { AddActionInline } from './GoalScreen'

/* An Area is a place, not a goal: what's being moved forward here,
   and what's simply being stayed on top of. */

export default function AreaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const areaId = id as AreaId
  const t = useTheme()
  const router = useRouter()
  const isDesktop = useIsDesktop()
  const insets = useSafeAreaInsets()
  const state = useStore()
  const toggleDone = useStore((s) => s.toggleDone)
  const goals = areaGoals(state, areaId)
  const standalone = areaStandaloneActions(state, areaId)
  const open = standalone.filter((a) => a.status === 'open')

  const doneThisWeek = state.actions.filter(
    (a) =>
      a.status === 'done' &&
      (a.areaId === areaId || goals.some((g) => g.id === a.goalId)),
  )
  const focusGoal = goals.find((g) => g.focus)

  return (
    <ScrollView
      contentContainerStyle={{
        padding: isDesktop ? space.s6 : space.s4,
        paddingTop: isDesktop ? space.s6 : Math.max(space.s5, insets.top + space.s2),
        paddingBottom: 130,
        gap: space.s5,
      }}
    >
      <View style={{ width: '100%', maxWidth: 1200, alignSelf: 'center', gap: space.s5 }}>
        <View style={{ gap: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s3 }}>
            {!isDesktop && (
              <Pressable onPress={() => router.back()} hitSlop={8} accessibilityLabel="Back">
                <IconArrowLeft size={19} color={t.ink2} strokeWidth={2.2} />
              </Pressable>
            )}
            <KLabel color={t.accent}>Area</KLabel>
          </View>
          <Txt
            size={isDesktop ? 56 : 40}
            weight="black"
            style={{ letterSpacing: isDesktop ? -2.2 : -1.6, lineHeight: isDesktop ? 56 : 42 }}
          >
            {areaName(areaId)}
          </Txt>
          <Txt size={text.md} weight="medium" color={t.ink2}>
            {focusGoal
              ? `Direction: ${focusGoal.title}.`
              : goals.length > 0
                ? 'Steady — nothing here is in focus right now.'
                : 'Maintenance only. Nothing here needs a goal.'}
          </Txt>
        </View>

        <View style={{ flexDirection: 'row', gap: space.s4, flexWrap: 'wrap' }}>
          {goals.map((g) => (
            <AreaGoalCard key={g.id} goal={g} />
          ))}

          <Card style={{ flex: 1.2, minWidth: 300, gap: space.s2 }}>
            <KLabel>{goals.length > 0 ? 'Everything else' : 'To stay on top of'}</KLabel>
            {open.length === 0 ? (
              <Txt size={text.md} weight="medium" color={t.ink3} style={{ paddingVertical: space.s2 }}>
                Nothing here needs you right now.
              </Txt>
            ) : (
              <View>
                {open.map((a, i) => (
                  <View
                    key={a.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: space.s3,
                      paddingVertical: 11,
                      borderTopWidth: i === 0 ? 0 : 1,
                      borderTopColor: t.lineFaint,
                    }}
                  >
                    <Check done={false} onToggle={() => toggleDone(a.id)} size={22} />
                    <Txt size={text.md} weight="bold" numberOfLines={1} style={{ flex: 1 }}>
                      {a.title}
                    </Txt>
                    <Txt size={text.sm} weight="semibold" color={t.ink4}>
                      {a.day
                        ? `${dayShort(a.day)}${a.time ? ` ${formatTime(a.time)}` : ''}`
                        : a.duration
                          ? formatDuration(a.duration)
                          : ''}
                    </Txt>
                  </View>
                ))}
              </View>
            )}
            <AddActionInline areaId={areaId} />
          </Card>

          <View style={{ flex: 1, minWidth: 280, gap: space.s4 }}>
            {doneThisWeek.length > 0 && (
              <Card sunken style={{ gap: space.s2 }}>
                <KLabel>This week already</KLabel>
                {doneThisWeek.slice(0, 3).map((a) => (
                  <Txt key={a.id} size={text.sm} weight="semibold" color={t.ink2}>
                    ✓ {a.title}
                  </Txt>
                ))}
              </Card>
            )}
            <AreaCoachNote areaId={areaId} />
            <Pressable
              onPress={() => router.push({ pathname: '/goal-new', params: { areaId } })}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                borderRadius: radius.lg,
                borderWidth: 1.5,
                borderStyle: 'dashed',
                borderColor: t.lineStrong,
                paddingVertical: space.s4,
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <IconPlus size={16} color={t.ink2} strokeWidth={2.5} />
              <Txt size={text.md} weight="bold" color={t.ink2}>
                {goals.length > 0 ? 'New goal' : 'Start a goal here'}
              </Txt>
            </Pressable>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

function AreaGoalCard({ goal }: { goal: Goal }) {
  const t = useTheme()
  const router = useRouter()
  const state = useStore()
  const open = goalActions(state, goal.id).filter((a) => a.status === 'open')
  const next = open.find((a) => !a.rhythm && !a.day) ?? open[0]
  const planned = plannedMinutes(state, goal.id)
  const intent = (goal.hoursPerWeek ?? 0) * 60

  return (
    <Card
      dark={goal.focus}
      onPress={() => router.push(`/goal/${goal.id}`)}
      style={{ flex: 1.4, minWidth: 320, gap: space.s3 }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {goal.focus && <IconFocus size={14} color={t.volt} strokeWidth={2.2} />}
        <KLabel color={goal.focus ? t.volt : t.ink3}>
          {goal.focus ? 'In focus' : 'Goal'}
        </KLabel>
      </View>
      <Txt
        size={22}
        weight="heavy"
        color={goal.focus ? t.inkOnDark : t.ink}
        style={{ letterSpacing: -0.4, lineHeight: 25 }}
      >
        {goal.title}
      </Txt>
      {goal.why && (
        <Why size={text.sm} color={goal.focus ? t.ink2OnDark : t.ink2}>
          {goal.why}
        </Why>
      )}
      {goal.evidence && goal.evidence.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {goal.evidence.map((e) => (
            <View
              key={e}
              style={{
                borderWidth: 1,
                borderColor: goal.focus ? 'rgba(245,246,248,0.25)' : t.line,
                borderRadius: radius.sm - 2,
                paddingVertical: 3,
                paddingHorizontal: 8,
              }}
            >
              <Txt size={text.xs} weight="bold" color={goal.focus ? t.ink2OnDark : t.ink2}>
                {e}
              </Txt>
            </View>
          ))}
        </View>
      )}
      {intent > 0 && (
        <View style={{ gap: 6, marginTop: space.s1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Txt size={text.sm} weight="bold" color={goal.focus ? t.ink2OnDark : t.ink2}>
              {formatDuration(planned)} of ~{goal.hoursPerWeek}h this week
            </Txt>
            <Txt size={text.sm} weight="bold" color={goal.focus ? t.ink2OnDark : t.ink3}>
              {Math.round(Math.min(1, planned / intent) * 100)}%
            </Txt>
          </View>
          <Meter ratio={planned / intent} onDark={goal.focus} />
        </View>
      )}
      {next && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Txt size={text.sm} weight="bold" color={goal.focus ? t.volt : t.accentDeep}>
            Next: {next.title}
          </Txt>
          <IconChevronRight size={13} color={goal.focus ? t.ink3OnDark : t.ink4} />
        </View>
      )}
    </Card>
  )
}

function AreaCoachNote({ areaId }: { areaId: AreaId }) {
  const t = useTheme()
  const state = useStore()
  const goals = areaGoals(state, areaId)

  let note: string | null = null
  const focusGoal = goals.find((g) => g.focus)
  if (focusGoal) {
    const planned = plannedMinutes(state, focusGoal.id)
    const intent = (focusGoal.hoursPerWeek ?? 0) * 60
    note =
      intent > 0 && planned < intent
        ? `“${focusGoal.title}” has ${formatDuration(planned)} of its ~${focusGoal.hoursPerWeek}h placed. The gap is decided on the week, not here.`
        : `“${focusGoal.title}” has its week fully placed. Protect the blocks.`
  } else if (goals.length > 0) {
    note = `Nothing here is in focus. That's a choice, not a failure — it waits its turn.`
  } else {
    note = `Pure maintenance. Keeping this list short is the win.`
  }

  return (
    <Card pad={space.s4} style={{ gap: space.s2 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s2 }}>
        <CoachSignature size={24} />
        <KLabel>Coach</KLabel>
      </View>
      <Txt size={text.sm} weight="medium" color={t.ink2} style={{ lineHeight: text.sm * 1.5 }}>
        {note}
      </Txt>
    </Card>
  )
}
