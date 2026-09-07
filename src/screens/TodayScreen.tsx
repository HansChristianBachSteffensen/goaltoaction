import { useMemo } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { actionsForDay, areaName, eventsForDay, goalById, useStore } from '../state/store'
import type { Action, CalendarEvent } from '../model/types'
import { NOW_MINUTES, TODAY, formatDuration, formatTime, toMinutes } from '../model/time'
import { radius, space, text, useTheme } from '../theme'
import { KLabel, Stat, Txt, Why } from '../ui/Txt'
import { Check } from '../ui/Check'
import { Card } from '../ui/Card'
import { Btn } from '../ui/Btn'
import { Meter } from '../ui/Meter'
import { CoachContent, CoachSignature } from '../coach/CoachPanel'
import { IconArrowRight, IconChevronRight, IconRepeat } from '../ui/icons'
import { useHasCoachPanel, useIsDesktop } from '../shell/AppShell'

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
  const mattersIds = new Set(matters.map((a) => a.id))

  const rest = useMemo(() => {
    const items: Array<{ at: number; event?: CalendarEvent; action?: Action }> = []
    for (const e of events) items.push({ at: toMinutes(e.start), event: e })
    for (const a of actions) {
      if (mattersIds.has(a.id)) continue
      items.push({ at: a.time ? toMinutes(a.time) : 24 * 60, action: a })
    }
    return items.sort((x, y) => x.at - y.at)
  }, [events, actions])

  const openMin = computeOpen(state)
  const openLabel =
    openMin >= 60
      ? `${Math.round((openMin / 60) * 2) / 2}h`.replace('.5', '½')
      : `${openMin}m`

  const doneCount = actions.filter((a) => a.status === 'done').length
  const rhythms = state.actions.filter(
    (a) => a.rhythm && !a.day && a.status === 'open' && a.rhythm.includes('evening'),
  )

  return { state, actions, events, meetings, matters, rest, openMin, openLabel, doneCount, rhythms }
}

function computeOpen(state: ReturnType<typeof useStore.getState>): number {
  const dayEnd = 22 * 60
  let busy = 0
  for (const e of eventsForDay(state, TODAY)) {
    const s = Math.max(toMinutes(e.start), NOW_MINUTES)
    const end = toMinutes(e.end)
    if (end > s) busy += end - s
  }
  for (const a of actionsForDay(state, TODAY)) {
    if (!a.time || a.status === 'done') continue
    const s = Math.max(toMinutes(a.time), NOW_MINUTES)
    const end = toMinutes(a.time) + (a.duration ?? 30)
    if (end > s) busy += end - s
  }
  return Math.max(0, dayEnd - NOW_MINUTES - busy)
}

/* ————— Hero: the day's decisive commitment ————— */

function FocusHero({ action, big = false }: { action: Action; big?: boolean }) {
  const t = useTheme()
  const router = useRouter()
  const state = useStore()
  const toggleDone = useStore((s) => s.toggleDone)
  const goal = goalById(state, action.goalId)
  if (!goal) return null

  return (
    <Card dark pad={big ? space.s5 : space.s6} style={{ gap: space.s3 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <KLabel color={t.volt} style={{ flex: 1 }}>
          Next up · {action.time ? formatTime(action.time) : 'Anytime'}
          {action.duration ? ` · ${formatDuration(action.duration)}` : ''}
        </KLabel>
        <Check done={false} onToggle={() => toggleDone(action.id)} size={26} onDark />
      </View>
      <Txt
        size={big ? 26 : 32}
        weight="black"
        color={t.inkOnDark}
        style={{ letterSpacing: -0.8, lineHeight: (big ? 26 : 32) * 1.08 }}
      >
        {action.title}
      </Txt>
      {goal.why && (
        <Why size={text.md} color={t.ink2OnDark}>
          {goal.why}
        </Why>
      )}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: space.s3,
          marginTop: space.s2,
          flexWrap: 'wrap',
        }}
      >
        <Btn
          variant="volt"
          label="Done"
          onPress={() => toggleDone(action.id)}
          icon={<IconArrowRight size={16} color={t.onVolt} strokeWidth={2.5} />}
        />
        <Pressable
          onPress={() => router.push(`/goal/${goal.id}`)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8 }}
        >
          <Txt size={text.sm} weight="bold" color={t.ink2OnDark}>
            {goal.title}
          </Txt>
          <IconChevronRight size={13} color={t.ink3OnDark} />
        </Pressable>
      </View>
    </Card>
  )
}

/* ————— Schedule rows ————— */

function ScheduleRow({
  item,
  onToggle,
  context,
  onContext,
}: {
  item: { event?: CalendarEvent; action?: Action }
  onToggle?: () => void
  context?: string
  onContext?: () => void
}) {
  const t = useTheme()
  if (item.event) {
    const e = item.event
    const past = toMinutes(e.end) < NOW_MINUTES
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: space.s3,
          paddingVertical: 11,
          opacity: past ? 0.4 : 1,
        }}
      >
        <Txt
          size={text.sm}
          weight="semibold"
          color={t.ink3}
          style={{ width: 48, fontVariant: ['tabular-nums'] }}
        >
          {formatTime(e.start)}
        </Txt>
        <View style={{ width: 3, alignSelf: 'stretch', borderRadius: 2, backgroundColor: t.ink4 }} />
        <Txt size={text.md} weight="medium" color={t.ink2} numberOfLines={1} style={{ flex: 1 }}>
          {e.title}
        </Txt>
        <Txt size={text.sm} color={t.ink4} style={{ fontVariant: ['tabular-nums'] }}>
          {formatDuration(toMinutes(e.end) - toMinutes(e.start))}
        </Txt>
      </View>
    )
  }
  const a = item.action!
  const done = a.status === 'done'
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s3, paddingVertical: 11 }}>
      <Txt
        size={text.sm}
        weight="semibold"
        color={t.ink3}
        style={{ width: 48, fontVariant: ['tabular-nums'] }}
      >
        {a.time ? formatTime(a.time) : ''}
      </Txt>
      <Check done={done} onToggle={onToggle ?? (() => {})} size={22} />
      <Txt
        size={text.md}
        weight="bold"
        color={done ? t.ink3 : t.ink}
        numberOfLines={1}
        style={[{ flex: 1 }, done ? { textDecorationLine: 'line-through' } : null]}
      >
        {a.title}
      </Txt>
      {context ? (
        <Pressable
          onPress={onContext}
          style={{
            backgroundColor: t.cardSunken,
            borderRadius: radius.sm - 2,
            paddingHorizontal: 8,
            paddingVertical: 3,
            maxWidth: 150,
          }}
        >
          <Txt size={text.xs} weight="semibold" color={t.ink2} numberOfLines={1}>
            {context}
          </Txt>
        </Pressable>
      ) : null}
      <Txt size={text.sm} color={t.ink4} style={{ fontVariant: ['tabular-nums'] }}>
        {a.duration ? formatDuration(a.duration) : ''}
      </Txt>
    </View>
  )
}

/* ————— Capacity: the day as a bar ————— */

function CapacityCard({ day }: { day: ReturnType<typeof useDay> }) {
  const t = useTheme()
  const dayStart = 7 * 60
  const dayEnd = 22 * 60
  const span = dayEnd - dayStart
  const blocks: Array<{ from: number; to: number; kind: 'event' | 'action' }> = [
    ...day.events.map((e) => ({ from: toMinutes(e.start), to: toMinutes(e.end), kind: 'event' as const })),
    ...day.actions
      .filter((a) => a.time && a.status !== 'done')
      .map((a) => ({
        from: toMinutes(a.time!),
        to: toMinutes(a.time!) + (a.duration ?? 30),
        kind: 'action' as const,
      })),
  ]
  return (
    <Card style={{ gap: space.s3 }}>
      <KLabel>Capacity</KLabel>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
        <Stat size={38}>{day.openLabel}</Stat>
        <Txt size={text.sm} weight="semibold" color={t.ink3} style={{ paddingBottom: 5 }}>
          open before 22:00
        </Txt>
      </View>
      <View
        style={{
          height: 14,
          borderRadius: radius.sm - 2,
          backgroundColor: t.cardSunken,
          overflow: 'hidden',
        }}
      >
        {blocks.map((b, i) => (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: `${(Math.max(b.from - dayStart, 0) / span) * 100}%`,
              width: `${(Math.max(b.to - Math.max(b.from, dayStart), 0) / span) * 100}%`,
              top: 0,
              bottom: 0,
              backgroundColor: b.kind === 'event' ? t.ink4 : t.ink,
            }}
          />
        ))}
        <View
          style={{
            position: 'absolute',
            left: `${((NOW_MINUTES - dayStart) / span) * 100}%`,
            top: -1,
            bottom: -1,
            width: 3,
            backgroundColor: t.accent,
            borderRadius: 2,
          }}
        />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Txt size={text.xs} weight="semibold" color={t.ink4}>
          7:00
        </Txt>
        <Txt size={text.xs} weight="semibold" color={t.ink4}>
          22:00
        </Txt>
      </View>
      <Txt size={text.sm} color={t.ink3}>
        Realistic. {day.meetings.length} meetings, one training block, and room to breathe.
      </Txt>
    </Card>
  )
}

/* ————— Desktop ————— */

function TodayDesktop() {
  const t = useTheme()
  const router = useRouter()
  const hasCoach = useHasCoachPanel()
  const day = useDay()
  const toggleDone = useStore((s) => s.toggleDone)
  const state = day.state
  const inboxCount = state.actions.filter((a) => a.status === 'inbox').length

  return (
    <ScrollView contentContainerStyle={{ padding: space.s6, paddingBottom: space.s8 }}>
      <View style={{ width: '100%', maxWidth: 1200, alignSelf: 'center', gap: space.s5 }}>
        <View style={{ gap: space.s2 }}>
          <KLabel color={t.accent}>Tuesday · 8 September</KLabel>
          <Txt size={56} weight="black" style={{ letterSpacing: -2.2, lineHeight: 56 }}>
            Today
          </Txt>
          <Txt size={text.lg} weight="medium" color={t.ink2}>
            {day.meetings.length} meetings · {day.openLabel} open · {day.matters.length} focus
            commitment{day.matters.length === 1 ? '' : 's'} left
          </Txt>
        </View>

        {day.matters[0] ? (
          <FocusHero action={day.matters[0]} />
        ) : (
          <Card dark style={{ gap: space.s2 }}>
            <KLabel color={t.volt}>Done</KLabel>
            <Txt size={26} weight="black" color={t.inkOnDark} style={{ letterSpacing: -0.6 }}>
              Everything that mattered today is behind you.
            </Txt>
          </Card>
        )}

        <View style={{ flexDirection: 'row', gap: space.s4, flexWrap: 'wrap' }}>
          <Card style={{ flex: 1.5, minWidth: 380, gap: space.s2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <KLabel style={{ flex: 1 }}>Schedule</KLabel>
              {day.doneCount > 0 && (
                <Txt size={text.xs} weight="bold" color={t.ink3}>
                  {day.doneCount} done
                </Txt>
              )}
            </View>
            <View>
              {day.rest.map((item, i) => (
                <View
                  key={item.event?.id ?? item.action?.id}
                  style={{ borderTopWidth: i === 0 ? 0 : 1, borderTopColor: t.lineFaint }}
                >
                  <ScheduleRow
                    item={item}
                    onToggle={item.action ? () => toggleDone(item.action!.id) : undefined}
                    context={
                      item.action
                        ? (goalById(state, item.action.goalId)?.title ?? areaName(item.action.areaId))
                        : undefined
                    }
                    onContext={() => {
                      const a = item.action
                      if (!a) return
                      if (a.goalId) router.push(`/goal/${a.goalId}`)
                      else if (a.areaId) router.push(`/area/${a.areaId}`)
                    }}
                  />
                </View>
              ))}
            </View>
            {day.rhythms.map((a) => (
              <View
                key={a.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  borderTopWidth: 1,
                  borderTopColor: t.lineFaint,
                  paddingTop: space.s3,
                }}
              >
                <IconRepeat size={14} color={t.ink3} strokeWidth={2} />
                <Txt size={text.sm} weight="semibold" color={t.ink2}>
                  {a.title}
                </Txt>
                <Txt size={text.xs} weight="semibold" color={t.ink4}>
                  · every evening
                </Txt>
              </View>
            ))}
          </Card>

          <View style={{ flex: 1, minWidth: 300, gap: space.s4 }}>
            <CapacityCard day={day} />
            {day.matters.length > 1 && (
              <Card style={{ gap: space.s3 }}>
                <KLabel>Also today</KLabel>
                {day.matters.slice(1).map((a) => {
                  const g = goalById(state, a.goalId)!
                  return (
                    <View key={a.id} style={{ flexDirection: 'row', gap: space.s3, alignItems: 'center' }}>
                      <Check done={false} onToggle={() => toggleDone(a.id)} size={22} />
                      <View style={{ flex: 1 }}>
                        <Txt size={text.md} weight="bold">
                          {a.time ? `${formatTime(a.time)} · ` : ''}
                          {a.title}
                        </Txt>
                        <Txt size={text.sm} color={t.ink3} numberOfLines={1}>
                          {g.title}
                        </Txt>
                      </View>
                    </View>
                  )
                })}
              </Card>
            )}
            {inboxCount > 0 && (
              <Card sunken pad={space.s4} onPress={() => router.push('/inbox')}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s2 }}>
                  <Txt size={text.sm} weight="bold" color={t.ink2} style={{ flex: 1 }}>
                    {inboxCount} captures waiting to be sorted
                  </Txt>
                  <IconArrowRight size={15} color={t.ink3} />
                </View>
              </Card>
            )}
          </View>
        </View>

        {!hasCoach && (
          <Card style={{ gap: space.s4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s3 }}>
              <CoachSignature />
              <Txt size={text.md} weight="heavy">
                Coach
              </Txt>
            </View>
            <CoachContent compact />
          </Card>
        )}
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
        paddingTop: Math.max(space.s5, insets.top + space.s2),
        paddingHorizontal: space.s4,
        paddingBottom: 130,
        gap: space.s4,
      }}
    >
      <View style={{ gap: 6, paddingHorizontal: space.s1 }}>
        <KLabel color={t.accent}>Tuesday · 8 September</KLabel>
        <Txt size={40} weight="black" style={{ letterSpacing: -1.6, lineHeight: 42 }}>
          Today
        </Txt>
        <Txt size={text.md} weight="medium" color={t.ink2}>
          {day.meetings.length} meetings · {day.openLabel} open
        </Txt>
      </View>

      {day.matters[0] && <FocusHero action={day.matters[0]} big />}

      <Card pad={space.s4} onPress={() => router.push('/coach')} style={{ gap: space.s2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s3 }}>
          <CoachSignature size={26} />
          <KLabel style={{ flex: 1 }}>Coach</KLabel>
          <IconChevronRight size={14} color={t.ink4} />
        </View>
        <CoachTeaser />
      </Card>

      <Card style={{ gap: space.s2 }}>
        <KLabel>Schedule</KLabel>
        <View>
          {day.rest.map((item, i) => (
            <View
              key={item.event?.id ?? item.action?.id}
              style={{ borderTopWidth: i === 0 ? 0 : 1, borderTopColor: t.lineFaint }}
            >
              <ScheduleRow
                item={item}
                onToggle={item.action ? () => toggleDone(item.action!.id) : undefined}
              />
            </View>
          ))}
        </View>
        {day.rhythms.map((a) => (
          <View
            key={a.id}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              borderTopWidth: 1,
              borderTopColor: t.lineFaint,
              paddingTop: space.s3,
            }}
          >
            <IconRepeat size={14} color={t.ink3} strokeWidth={2} />
            <Txt size={text.sm} weight="semibold" color={t.ink2}>
              {a.title} · every evening
            </Txt>
          </View>
        ))}
      </Card>

      {day.matters.length > 1 && (
        <Card style={{ gap: space.s3 }}>
          <KLabel>Also today</KLabel>
          {day.matters.slice(1).map((a) => (
            <View key={a.id} style={{ flexDirection: 'row', gap: space.s3, alignItems: 'center' }}>
              <Check done={false} onToggle={() => toggleDone(a.id)} size={24} />
              <View style={{ flex: 1 }}>
                <Txt size={text.md} weight="bold">
                  {a.time ? `${formatTime(a.time)} · ` : ''}
                  {a.title}
                </Txt>
                <Txt size={text.sm} color={t.ink3} numberOfLines={1}>
                  {goalById(state, a.goalId)?.title}
                </Txt>
              </View>
            </View>
          ))}
        </Card>
      )}

      {inboxCount > 0 && (
        <Card sunken pad={space.s4} onPress={() => router.push('/inbox')}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s2 }}>
            <Txt size={text.sm} weight="bold" color={t.ink2} style={{ flex: 1 }}>
              {inboxCount} captures waiting to be sorted
            </Txt>
            <IconArrowRight size={15} color={t.ink3} />
          </View>
        </Card>
      )}
    </ScrollView>
  )
}

function CoachTeaser() {
  const t = useTheme()
  const state = useStore()
  const items = useMemo(() => coachTeaserItems(state), [state])
  if (!items) return null
  return (
    <Txt size={text.sm} weight="medium" color={t.ink2} numberOfLines={2} style={{ lineHeight: text.sm * 1.45 }}>
      {items}
    </Txt>
  )
}

function coachTeaserItems(state: ReturnType<typeof useStore.getState>): string {
  const blocks = state.suggestedBlocks
  if (blocks.length > 0) {
    return `${blocks[0].reason} One tap places it.`
  }
  return 'The week is holding its shape. Nothing needs a decision right now.'
}
