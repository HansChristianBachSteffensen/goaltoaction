import { useState } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  actionsForDay,
  areaName,
  eventsForDay,
  goalById,
  plannedMinutes,
  unplacedActions,
  useStore,
} from '../state/store'
import type { Action, SuggestedBlock } from '../model/types'
import {
  NOW_MINUTES,
  WEEK_DAYS,
  dayName,
  dayOfMonth,
  dayShort,
  formatDuration,
  formatTime,
  isPastDay,
  isToday,
  toMinutes,
} from '../model/time'
import { font, radius, space, text, useTheme } from '../theme'
import { KLabel, Txt, Why } from '../ui/Txt'
import { Btn } from '../ui/Btn'
import { Meter } from '../ui/Meter'
import { ActionRow, EventRow } from '../ui/Row'
import { IconCheck, IconPlus, IconX } from '../ui/icons'
import { useIsDesktop } from '../shell/AppShell'

export default function WeekScreen() {
  const isDesktop = useIsDesktop()
  return isDesktop ? <WeekDesktop /> : <WeekMobile />
}

/* ————— Suggestion card (shared) ————— */

function SuggestionCard({ block }: { block: SuggestedBlock }) {
  const t = useTheme()
  const acceptBlock = useStore((s) => s.acceptBlock)
  const dismissBlock = useStore((s) => s.dismissBlock)
  return (
    <View
      style={{
        gap: space.s2,
        padding: space.s3,
        borderRadius: radius.md,
        backgroundColor: t.accentSoft,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: t.accentLine,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: space.s2,
        }}
      >
        <Txt size={text.sm} weight="semibold">
          {block.label}
        </Txt>
        <Txt size={text.xs} color={t.ink2}>
          {dayShort(block.day)} {formatTime(block.start)} ·{' '}
          {formatDuration(toMinutes(block.end) - toMinutes(block.start))}
        </Txt>
      </View>
      <Txt size={text.sm} color={t.ink2} style={{ lineHeight: text.sm * 1.45 }}>
        {block.reason}
      </Txt>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: space.s1,
        }}
      >
        <Btn
          small
          label="Add to week"
          icon={<IconCheck size={12} color={t.canvas} strokeWidth={3} />}
          onPress={() => acceptBlock(block.id)}
        />
        <Pressable onPress={() => dismissBlock(block.id)} hitSlop={8} accessibilityLabel="Dismiss">
          <IconX size={14} color={t.ink3} />
        </Pressable>
      </View>
    </View>
  )
}

/* ————— Desktop: rail + 7-day grid ————— */

const GRID_START = 6 * 60
const GRID_END = 22 * 60
const PX_PER_MIN = 36 / 60

function y(min: number): number {
  return (min - GRID_START) * PX_PER_MIN
}

function WeekDesktop() {
  const t = useTheme()
  const router = useRouter()
  const state = useStore()
  const focus = state.goals.filter((g) => g.focus)
  const inSuggestion = new Set(state.suggestedBlocks.flatMap((b) => b.actionIds))
  const unplaced = unplacedActions(state).filter((a) => !inSuggestion.has(a.id))

  return (
    <View style={{ flex: 1, padding: space.s7, paddingBottom: space.s6, gap: space.s6 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: space.s4,
        }}
      >
        <View style={{ gap: space.s2 }}>
          <Txt size={text.x2} weight="bold" style={{ letterSpacing: -1, lineHeight: text.x2 * 1.05 }}>
            This week
          </Txt>
          <Txt color={t.ink3}>Monday 7 – Sunday 13 September</Txt>
        </View>
        <Btn label="Choose focus" variant="ghost" onPress={() => router.push('/focus')} />
      </View>

      <View style={{ flex: 1, flexDirection: 'row', gap: space.s6, minHeight: 0 }}>
        <ScrollView style={{ width: 264, flexGrow: 0 }} contentContainerStyle={{ gap: space.s6 }}>
          <View style={{ gap: space.s3 }}>
            <KLabel>What this week gets</KLabel>
            <View>
              {focus.map((g, i) => {
                const planned = plannedMinutes(state, g.id)
                const intent = (g.hoursPerWeek ?? 0) * 60
                return (
                  <Pressable
                    key={g.id}
                    onPress={() => router.push(`/goal/${g.id}`)}
                    style={{
                      gap: 4,
                      paddingVertical: space.s3,
                      borderBottomWidth: i < focus.length - 1 ? 1 : 0,
                      borderBottomColor: t.lineFaint,
                    }}
                  >
                    <Txt size={text.sm} weight="semibold" style={{ lineHeight: text.sm * 1.35 }}>
                      {g.title}
                    </Txt>
                    <Txt size={text.xs} color={t.ink3}>
                      {formatDuration(planned)} of ~{g.hoursPerWeek}h placed
                    </Txt>
                    <View style={{ marginTop: 3 }}>
                      <Meter ratio={intent ? planned / intent : 1} />
                    </View>
                  </Pressable>
                )
              })}
            </View>
          </View>

          {state.suggestedBlocks.length > 0 && (
            <View style={{ gap: space.s3 }}>
              <KLabel>Suggestions</KLabel>
              {state.suggestedBlocks.map((b) => (
                <SuggestionCard key={b.id} block={b} />
              ))}
            </View>
          )}

          {unplaced.length > 0 && (
            <View style={{ gap: space.s3 }}>
              <KLabel>Still to place</KLabel>
              <View>
                {unplaced.map((a, i) => (
                  <UnplacedRow key={a.id} action={a} last={i === unplaced.length - 1} />
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: space.s4 }}>
          <View style={{ flexDirection: 'row', paddingLeft: 48 }}>
            <View style={{ position: 'absolute', left: 0, top: 64, width: 44 }}>
              {[8, 12, 16, 20].map((h) => (
                <Txt
                  key={h}
                  size={text.xs}
                  color={t.ink4}
                  style={{
                    position: 'absolute',
                    top: y(h * 60) - 7,
                    right: 8,
                    fontVariant: ['tabular-nums'],
                  }}
                >
                  {h}:00
                </Txt>
              ))}
            </View>
            {WEEK_DAYS.map((day, i) => (
              <DayColumn key={day} day={day} last={i === WEEK_DAYS.length - 1} />
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  )
}

function UnplacedRow({ action, last }: { action: Action; last: boolean }) {
  const t = useTheme()
  const state = useStore()
  const schedule = useStore((s) => s.schedule)
  const [picking, setPicking] = useState(false)
  const goal = goalById(state, action.goalId)

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.s2,
        paddingVertical: space.s2,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: t.lineFaint,
      }}
    >
      <Pressable style={{ flex: 1, minWidth: 0, gap: 1 }} onPress={() => setPicking((p) => !p)}>
        <Txt size={text.sm} weight="medium">
          {action.title}
        </Txt>
        <Txt size={text.xs} color={t.ink4} numberOfLines={1}>
          {goal ? goal.title : areaName(action.areaId)}
          {action.duration ? ` · ${formatDuration(action.duration)}` : ''}
        </Txt>
      </Pressable>
      {picking ? (
        <View style={{ flexDirection: 'row', gap: 3 }}>
          {WEEK_DAYS.filter((d) => !isPastDay(d)).map((d) => (
            <Pressable
              key={d}
              onPress={() => {
                schedule(action.id, d)
                setPicking(false)
              }}
              style={({ pressed }) => ({
                paddingVertical: 3,
                paddingHorizontal: 6,
                borderRadius: radius.sm,
                backgroundColor: pressed ? t.ink : t.lineFaint,
              })}
            >
              <Txt size={text.xs} weight="semibold" color={t.ink2}>
                {dayShort(d)}
              </Txt>
            </Pressable>
          ))}
        </View>
      ) : (
        <IconPlus size={13} color={t.ink4} />
      )}
    </View>
  )
}

function DayColumn({ day, last }: { day: string; last: boolean }) {
  const t = useTheme()
  const router = useRouter()
  const state = useStore()
  const toggleDone = useStore((s) => s.toggleDone)
  const acceptBlock = useStore((s) => s.acceptBlock)
  const events = eventsForDay(state, day)
  const actions = actionsForDay(state, day)
  const timed = actions.filter((a) => a.time)
  const untimed = actions.filter((a) => !a.time)
  const suggestions = state.suggestedBlocks.filter((b) => b.day === day)
  const past = isPastDay(day)
  const today = isToday(day)

  return (
    <View
      style={{
        flex: 1,
        minWidth: 0,
        borderLeftWidth: 1,
        borderLeftColor: t.lineFaint,
        borderRightWidth: last ? 1 : 0,
        borderRightColor: t.lineFaint,
        paddingHorizontal: 4,
        opacity: past ? 0.45 : 1,
      }}
    >
      <Pressable
        onPress={() => today && router.push('/today')}
        style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, paddingHorizontal: 6, paddingBottom: 8, paddingTop: 2 }}
      >
        <Txt size={text.sm} weight="semibold" color={today ? t.accentInk : t.ink2}>
          {dayShort(day)}
        </Txt>
        <Txt size={text.sm} color={today ? t.accentInk : t.ink4} style={{ fontVariant: ['tabular-nums'] }}>
          {dayOfMonth(day)}
        </Txt>
      </Pressable>
      <View style={{ gap: 3, paddingHorizontal: 2, paddingBottom: 6, minHeight: 30 }}>
        {untimed.map((a) => (
          <Pressable
            key={a.id}
            onPress={() => toggleDone(a.id)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              backgroundColor: t.surfaceRaised,
              borderWidth: 1,
              borderColor: t.line,
              borderRadius: radius.sm,
              paddingVertical: 3,
              paddingHorizontal: 7,
            }}
          >
            {a.status === 'done' && <IconCheck size={10} color={t.ink4} strokeWidth={3} />}
            <Txt
              size={text.xs}
              weight="medium"
              numberOfLines={1}
              color={a.status === 'done' ? t.ink4 : t.ink2}
              style={a.status === 'done' ? { textDecorationLine: 'line-through' } : undefined}
            >
              {a.title}
            </Txt>
          </Pressable>
        ))}
      </View>
      <View style={{ height: y(GRID_END), position: 'relative' }}>
        {[8, 10, 12, 14, 16, 18, 20].map((h) => (
          <View
            key={h}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: y(h * 60),
              height: 1,
              backgroundColor: t.lineFaint,
            }}
          />
        ))}
        {today && (
          <View
            style={{
              position: 'absolute',
              left: -2,
              right: -2,
              top: y(NOW_MINUTES),
              height: 2,
              borderRadius: 1,
              backgroundColor: t.accent,
              zIndex: 5,
            }}
          >
            <View
              style={{
                position: 'absolute',
                left: -3,
                top: -2,
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: t.accent,
              }}
            />
          </View>
        )}
        {events.map((e) => {
          const s = toMinutes(e.start)
          const end = toMinutes(e.end)
          const meeting = e.kind === 'meeting'
          return (
            <View
              key={e.id}
              style={{
                position: 'absolute',
                left: 2,
                right: 2,
                top: y(s),
                height: Math.max(end - s, 34) * PX_PER_MIN,
                borderRadius: radius.sm,
                paddingVertical: 2,
                paddingHorizontal: 7,
                backgroundColor: meeting ? t.surfaceSunken : 'transparent',
                borderWidth: meeting ? 0 : 1,
                borderColor: t.line,
                overflow: 'hidden',
              }}
            >
              <Txt size={text.xs} weight="medium" color={meeting ? t.ink2 : t.ink3} numberOfLines={1}>
                {e.title}
              </Txt>
              {end - s >= 60 && (
                <Txt size={10} color={meeting ? t.ink3 : t.ink4} style={{ fontVariant: ['tabular-nums'] }}>
                  {formatTime(e.start)}
                </Txt>
              )}
            </View>
          )
        })}
        {timed.map((a) => {
          const s = toMinutes(a.time!)
          const end = s + (a.duration ?? 30)
          const g = goalById(state, a.goalId)
          const done = a.status === 'done'
          return (
            <Pressable
              key={a.id}
              onPress={() => g && router.push(`/goal/${g.id}`)}
              style={{
                position: 'absolute',
                left: 2,
                right: 2,
                top: y(s),
                height: Math.max(end - s, 34) * PX_PER_MIN,
                borderRadius: radius.sm,
                paddingVertical: 2,
                paddingHorizontal: 7,
                backgroundColor: t.surfaceRaised,
                borderWidth: 1,
                borderColor: t.lineFaint,
                borderLeftWidth: 2,
                borderLeftColor: g?.focus ? t.accent : t.ink4,
                opacity: done ? 0.5 : 1,
                overflow: 'hidden',
              }}
            >
              <Txt
                size={text.xs}
                weight="medium"
                numberOfLines={1}
                style={done ? { textDecorationLine: 'line-through' } : undefined}
              >
                {a.title}
              </Txt>
              {end - s >= 60 && (
                <Txt size={10} color={t.ink4} style={{ fontVariant: ['tabular-nums'] }}>
                  {formatTime(a.time!)}
                </Txt>
              )}
            </Pressable>
          )
        })}
        {suggestions.map((b) => {
          const s = toMinutes(b.start)
          const end = toMinutes(b.end)
          return (
            <Pressable
              key={b.id}
              onPress={() => acceptBlock(b.id)}
              style={{
                position: 'absolute',
                left: 2,
                right: 2,
                top: y(s),
                height: Math.max(end - s, 34) * PX_PER_MIN,
                borderRadius: radius.sm,
                paddingVertical: 2,
                paddingHorizontal: 7,
                backgroundColor: t.accentSoft,
                borderWidth: 1.5,
                borderStyle: 'dashed',
                borderColor: t.accentLine,
                overflow: 'hidden',
              }}
            >
              <Txt size={text.xs} weight="medium" color={t.accentInk} numberOfLines={1}>
                {b.label}
              </Txt>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

/* ————— Mobile: focus meters, suggestions, day-by-day agenda ————— */

function WeekMobile() {
  const t = useTheme()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const state = useStore()
  const focus = state.goals.filter((g) => g.focus)

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
          This week
        </Txt>
        <Txt color={t.ink3}>Mon 7 – Sun 13 September</Txt>
      </View>

      <View style={{ gap: space.s1 }}>
        <KLabel>What this week gets</KLabel>
        {focus.map((g, i) => {
          const planned = plannedMinutes(state, g.id)
          const intent = (g.hoursPerWeek ?? 0) * 60
          return (
            <Pressable
              key={g.id}
              onPress={() => router.push(`/goal/${g.id}`)}
              style={{
                gap: 6,
                paddingVertical: space.s3,
                borderBottomWidth: i < focus.length - 1 ? 1 : 0,
                borderBottomColor: t.lineFaint,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: space.s3,
                }}
              >
                <Txt weight="semibold" style={{ flex: 1 }}>
                  {g.title}
                </Txt>
                <Txt size={text.xs} color={t.ink3} style={{ fontVariant: ['tabular-nums'] }}>
                  {formatDuration(planned)} / ~{g.hoursPerWeek}h
                </Txt>
              </View>
              <Meter ratio={intent ? planned / intent : 1} />
            </Pressable>
          )
        })}
      </View>

      {state.suggestedBlocks.length > 0 && (
        <View style={{ gap: space.s3 }}>
          <KLabel>Suggestions</KLabel>
          {state.suggestedBlocks.map((b) => (
            <SuggestionCard key={b.id} block={b} />
          ))}
        </View>
      )}

      <View style={{ gap: space.s5 }}>
        {WEEK_DAYS.map((day) => (
          <MobileDay key={day} day={day} />
        ))}
      </View>
    </ScrollView>
  )
}

function MobileDay({ day }: { day: string }) {
  const t = useTheme()
  const state = useStore()
  const toggleDone = useStore((s) => s.toggleDone)
  const events = eventsForDay(state, day)
  const actions = actionsForDay(state, day)
  const past = isPastDay(day)
  const today = isToday(day)

  if (past) {
    const doneCount = actions.filter((a) => a.status === 'done').length
    return (
      <View style={{ opacity: 0.55, flexDirection: 'row', alignItems: 'baseline', gap: space.s2 }}>
        <Txt size={text.lg} weight="semibold">
          {dayName(day)}
        </Txt>
        <Txt size={text.sm} color={t.ink4}>
          {doneCount > 0 ? `${doneCount} done` : 'passed'}
        </Txt>
      </View>
    )
  }

  const merged: Array<{ at: number; eventId?: string; actionId?: string }> = [
    ...events.map((e) => ({ at: toMinutes(e.start), eventId: e.id })),
    ...actions.map((a) => ({ at: a.time ? toMinutes(a.time) : 24 * 60, actionId: a.id })),
  ].sort((x, y2) => x.at - y2.at)

  return (
    <View style={{ gap: space.s1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: space.s2 }}>
        <Txt size={text.lg} weight="semibold" color={today ? t.accentInk : t.ink}>
          {today ? 'Today' : dayName(day)}
        </Txt>
        <Txt size={text.sm} color={t.ink4}>
          {dayOfMonth(day)} September
        </Txt>
      </View>
      {merged.length === 0 ? (
        <Txt size={text.sm} color={t.ink4} style={{ paddingVertical: space.s2 }}>
          Nothing planned. Good.
        </Txt>
      ) : (
        <View>
          {merged.map((item) => {
            if (item.eventId) {
              const e = events.find((x) => x.id === item.eventId)!
              return <EventRow key={e.id} event={e} big />
            }
            const a = actions.find((x) => x.id === item.actionId)!
            return <ActionRow key={a.id} action={a} onToggle={() => toggleDone(a.id)} big />
          })}
        </View>
      )}
    </View>
  )
}
