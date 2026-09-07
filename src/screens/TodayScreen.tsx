import { useMemo } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  actionsForDay,
  areaName,
  eventsForDay,
  goalById,
  useStore,
} from '../state/store'
import type { Action, CalendarEvent } from '../model/types'
import { TODAY, formatDuration, formatTime, toMinutes } from '../model/time'
import { font, radius, space, text, useTheme } from '../theme'
import { KLabel, Txt, Why } from '../ui/Txt'
import { Check } from '../ui/Check'
import { ActionRow, EventRow } from '../ui/Row'
import { GoalArt } from '../ui/GoalArt'
import { Meter } from '../ui/Meter'
import { IconArrowRight, IconChevronRight, IconRepeat } from '../ui/icons'
import { useIsDesktop } from '../shell/AppShell'
import type { GoalArtKey } from '../ui/GoalArt'

export default function TodayScreen() {
  const isDesktop = useIsDesktop()
  return isDesktop ? <TodayDesktop /> : <TodayMobile />
}

/* ————— Shared day model ————— */

function useDay() {
  const state = useStore()
  const actions = actionsForDay(state, TODAY)
  const events = eventsForDay(state, TODAY)
  const meetings = events.filter((e) => e.kind === 'meeting')

  const matters = actions.filter((a) => {
    const g = goalById(state, a.goalId)
    return g?.focus && a.status !== 'done' && (a.duration ?? 30) >= 30
  })
  const mattersDone = actions.filter(
    (a) => goalById(state, a.goalId)?.focus && a.status === 'done' && (a.duration ?? 30) >= 30,
  )
  const mattersIds = new Set([...matters, ...mattersDone].map((a) => a.id))

  const rest = useMemo(() => {
    const items: Array<{ at: number; event?: CalendarEvent; action?: Action }> = []
    for (const e of events) items.push({ at: toMinutes(e.start), event: e })
    for (const a of actions) {
      if (mattersIds.has(a.id)) continue
      items.push({ at: a.time ? toMinutes(a.time) : 24 * 60, action: a })
    }
    return items.sort((x, y) => x.at - y.at)
  }, [events, actions])

  const openMin = openMinutes(state)
  const openLabel =
    openMin >= 60
      ? `${Math.round((openMin / 60) * 2) / 2}h open`.replace('.5', '½')
      : `${openMin} min open`

  const rhythms = state.actions.filter(
    (a) => a.rhythm && !a.day && a.status === 'open' && a.rhythm.includes('evening'),
  )

  const allDone = actions.every((a) => a.status === 'done') && matters.length === 0

  return { state, actions, events, meetings, matters, mattersDone, rest, openLabel, rhythms, allDone }
}

function openMinutes(state: ReturnType<typeof useStore.getState>): number {
  const NOW = 7 * 60 + 40
  const dayEnd = 22 * 60
  let busy = 0
  for (const e of eventsForDay(state, TODAY)) {
    const s = Math.max(toMinutes(e.start), NOW)
    const end = toMinutes(e.end)
    if (end > s) busy += end - s
  }
  for (const a of actionsForDay(state, TODAY)) {
    if (!a.time || a.status === 'done') continue
    const s = Math.max(toMinutes(a.time), NOW)
    const end = toMinutes(a.time) + (a.duration ?? 30)
    if (end > s) busy += end - s
  }
  return Math.max(0, dayEnd - NOW - busy)
}

/* ————— Hero card ————— */

function HeroCard({ action, big = false }: { action: Action; big?: boolean }) {
  const t = useTheme()
  const router = useRouter()
  const state = useStore()
  const toggleDone = useStore((s) => s.toggleDone)
  const goal = goalById(state, action.goalId)
  if (!goal) return null

  return (
    <Pressable
      onPress={() => router.push(`/goal/${goal.id}`)}
      style={({ pressed }) => ({
        borderRadius: radius.lg,
        overflow: 'hidden',
        backgroundColor: t.surfaceInk,
        minHeight: big ? 220 : 196,
        padding: space.s5,
        justifyContent: 'flex-end',
        transform: [{ translateY: pressed ? 1 : 0 }],
      })}
    >
      {goal.image && <GoalArt art={goal.image as GoalArtKey} scrim={big ? 'bottom' : 'left'} />}
      <View style={{ position: 'absolute', top: space.s4, right: space.s4 }}>
        <Check done={false} onToggle={() => toggleDone(action.id)} size={28} onDark />
      </View>
      <View style={{ gap: space.s2, maxWidth: big ? undefined : '74%' }}>
        <KLabel color={t.accentOnDark}>
          {action.time ? formatTime(action.time) : 'Anytime'}
          {action.duration ? ` · ${formatDuration(action.duration)}` : ''}
        </KLabel>
        <Txt size={big ? 21 : text.xl} weight="semibold" color={t.inkOnDark}>
          {action.title}
        </Txt>
        {goal.why && (
          <Why size={big ? text.md : 16} color={t.ink2OnDark}>
            {goal.why}
          </Why>
        )}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: space.s1 }}>
          <Txt size={text.sm} weight="medium" color="rgba(244,242,236,0.55)">
            {goal.title}
          </Txt>
          <IconArrowRight size={13} color="rgba(244,242,236,0.55)" />
        </View>
      </View>
    </Pressable>
  )
}

function MattersRow({ action }: { action: Action }) {
  const t = useTheme()
  const state = useStore()
  const toggleDone = useStore((s) => s.toggleDone)
  const goal = goalById(state, action.goalId)
  const done = action.status === 'done'
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: space.s3,
        alignItems: 'flex-start',
        padding: space.s3,
        borderRadius: radius.md,
        backgroundColor: t.surfaceRaised,
        borderWidth: 1,
        borderColor: t.lineFaint,
      }}
    >
      <Check done={done} onToggle={() => toggleDone(action.id)} size={22} />
      <View style={{ flex: 1, gap: 3 }}>
        <View style={{ flexDirection: 'row', gap: space.s3, alignItems: 'baseline' }}>
          {action.time && (
            <Txt size={text.sm} color={t.ink3} style={{ fontVariant: ['tabular-nums'] }}>
              {formatTime(action.time)}
            </Txt>
          )}
          <Txt
            weight="semibold"
            color={done ? t.ink3 : t.ink}
            style={[{ flex: 1 }, done ? { textDecorationLine: 'line-through' } : null]}
          >
            {action.title}
          </Txt>
          {action.duration && (
            <Txt size={text.sm} color={t.ink4}>
              {formatDuration(action.duration)}
            </Txt>
          )}
        </View>
        {!done && goal?.why && <Why color={t.ink3}>{goal.why}</Why>}
      </View>
    </View>
  )
}

/* ————— Desktop ————— */

function TodayDesktop() {
  const t = useTheme()
  const router = useRouter()
  const day = useDay()
  const toggleDone = useStore((s) => s.toggleDone)
  const state = day.state

  const focus = state.goals.filter((g) => g.focus)
  const inboxCount = state.actions.filter((a) => a.status === 'inbox').length

  return (
    <ScrollView contentContainerStyle={{ padding: space.s7, paddingTop: space.s8 }}>
      <View
        style={{
          flexDirection: 'row',
          gap: space.s8,
          maxWidth: 1060,
          width: '100%',
          alignSelf: 'center',
        }}
      >
        <View style={{ flex: 1, maxWidth: 640, gap: space.s7 }}>
          <View style={{ gap: space.s2 }}>
            <Txt size={text.x3} weight="bold" style={{ letterSpacing: -1.4, lineHeight: text.x3 }}>
              Tuesday
            </Txt>
            <Txt color={t.ink3}>
              8 September · {day.meetings.length} meetings · {day.openLabel}
            </Txt>
          </View>

          {(day.matters.length > 0 || day.mattersDone.length > 0) && (
            <View style={{ gap: space.s3 }}>
              <KLabel color={t.accentInk} style={{ marginBottom: space.s1 }}>
                What matters today
              </KLabel>
              {day.matters[0] && <HeroCard action={day.matters[0]} />}
              {day.matters.slice(1).map((a) => (
                <MattersRow key={a.id} action={a} />
              ))}
              {day.mattersDone.map((a) => (
                <MattersRow key={a.id} action={a} />
              ))}
              {day.matters.length === 0 && day.mattersDone.length > 0 && (
                <Why size={text.lg}>Done. The thing that mattered most today is behind you.</Why>
              )}
            </View>
          )}

          <View style={{ gap: space.s3 }}>
            <KLabel>Today</KLabel>
            {day.allDone ? (
              <Why size={text.lg} style={{ paddingVertical: space.s4 }}>
                That’s the day. Nothing else needs you.
              </Why>
            ) : (
              <View>
                {day.rest.map((item) =>
                  item.event ? (
                    <EventRow key={item.event.id} event={item.event} />
                  ) : (
                    <ActionRow
                      key={item.action!.id}
                      action={item.action!}
                      onToggle={() => toggleDone(item.action!.id)}
                      context={contextLabel(item.action!, state)}
                      onPressContext={() => {
                        const a = item.action!
                        if (a.goalId) router.push(`/goal/${a.goalId}`)
                        else if (a.areaId) router.push(`/area/${a.areaId}`)
                      }}
                    />
                  ),
                )}
              </View>
            )}
          </View>

          {day.rhythms.length > 0 && (
            <View style={{ gap: space.s3 }}>
              <KLabel>This evening</KLabel>
              {day.rhythms.map((a) => (
                <RhythmChip key={a.id} title={a.title} />
              ))}
            </View>
          )}
        </View>

        <View style={{ width: 248, gap: space.s4, paddingTop: 76 }}>
          <Pressable
            onPress={() => router.push('/week')}
            style={{
              gap: space.s4,
              padding: space.s4,
              borderRadius: radius.md,
              backgroundColor: t.surfaceRaised,
              borderWidth: 1,
              borderColor: t.lineFaint,
            }}
          >
            <KLabel>This week</KLabel>
            {focus.map((g) => {
              const planned = plannedFor(state, g.id)
              const intent = (g.hoursPerWeek ?? 0) * 60
              return (
                <View key={g.id} style={{ gap: 4 }}>
                  <Txt size={text.sm} weight="semibold" style={{ lineHeight: text.sm * 1.3 }}>
                    {g.title}
                  </Txt>
                  <Txt size={text.xs} color={t.ink3}>
                    {formatDuration(planned)} of ~{g.hoursPerWeek}h placed
                  </Txt>
                  <Meter ratio={intent ? planned / intent : 0} />
                </View>
              )
            })}
          </Pressable>
          {inboxCount > 0 && (
            <Pressable
              onPress={() => router.push('/inbox')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingHorizontal: space.s4,
              }}
            >
              <Txt size={text.sm} color={t.ink3}>
                {inboxCount} captured, waiting to be sorted
              </Txt>
              <IconArrowRight size={13} color={t.ink3} />
            </Pressable>
          )}
        </View>
      </View>
    </ScrollView>
  )
}

/* ————— Mobile ————— */

function TodayMobile() {
  const t = useTheme()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const day = useDay()
  const toggleDone = useStore((s) => s.toggleDone)
  const state = day.state
  const inboxCount = state.actions.filter((a) => a.status === 'inbox').length

  return (
    <ScrollView
      contentContainerStyle={{
        paddingTop: Math.max(space.s6, insets.top + space.s3),
        paddingHorizontal: space.s5,
        paddingBottom: 120,
        gap: space.s6,
      }}
    >
      <View style={{ gap: space.s2 }}>
        <Txt size={34} weight="bold" style={{ letterSpacing: -1, lineHeight: 36 }}>
          Tuesday
        </Txt>
        <Txt color={t.ink3}>
          8 September · {day.meetings.length} meetings · {day.openLabel}
        </Txt>
      </View>

      {inboxCount > 0 && (
        <Pressable
          onPress={() => router.push('/inbox')}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: space.s2,
            paddingVertical: space.s3,
            paddingHorizontal: space.s4,
            borderRadius: radius.md,
            backgroundColor: t.surfaceRaised,
            borderWidth: 1,
            borderColor: t.lineFaint,
          }}
        >
          <Txt size={text.sm} weight="medium" color={t.ink2}>
            {inboxCount} captured · sort {inboxCount === 1 ? 'it' : 'them'} when you’re ready
          </Txt>
          <IconChevronRight size={14} color={t.ink3} />
        </Pressable>
      )}

      {day.matters.length > 0 && (
        <View style={{ gap: space.s3 }}>
          <KLabel color={t.accentInk}>What matters today</KLabel>
          <HeroCard action={day.matters[0]} big />
          {day.matters.slice(1).map((a) => (
            <MattersRow key={a.id} action={a} />
          ))}
        </View>
      )}

      <View style={{ gap: space.s3 }}>
        <KLabel>Today</KLabel>
        {day.allDone ? (
          <Why size={text.lg} style={{ paddingVertical: space.s3 }}>
            That’s the day. Nothing else needs you.
          </Why>
        ) : (
          <View>
            {day.rest.map((item) =>
              item.event ? (
                <EventRow key={item.event.id} event={item.event} big />
              ) : (
                <ActionRow
                  key={item.action!.id}
                  action={item.action!}
                  onToggle={() => toggleDone(item.action!.id)}
                  big
                />
              ),
            )}
          </View>
        )}
      </View>

      {day.rhythms.length > 0 && (
        <View style={{ gap: space.s3 }}>
          <KLabel>This evening</KLabel>
          {day.rhythms.map((a) => (
            <RhythmChip key={a.id} title={a.title} />
          ))}
        </View>
      )}
    </ScrollView>
  )
}

/* ————— Bits ————— */

function RhythmChip({ title }: { title: string }) {
  const t = useTheme()
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.s2,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: t.lineStrong,
        borderStyle: 'dashed',
        borderRadius: radius.full,
        paddingVertical: 6,
        paddingHorizontal: 14,
      }}
    >
      <IconRepeat size={13} color={t.ink2} strokeWidth={1.8} />
      <Txt size={text.sm} weight="medium" color={t.ink2}>
        {title}
      </Txt>
    </View>
  )
}

function contextLabel(a: Action, state: ReturnType<typeof useStore.getState>): string {
  const g = goalById(state, a.goalId)
  if (g) return g.title
  return areaName(a.areaId)
}

function plannedFor(state: ReturnType<typeof useStore.getState>, goalId: string): number {
  return state.actions
    .filter((a) => a.goalId === goalId && a.day && a.status !== 'inbox')
    .reduce((sum, a) => sum + (a.duration ?? 30), 0)
}
