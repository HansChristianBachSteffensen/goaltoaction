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
import type { Action, Goal } from '../model/types'
import {
  NOW_MINUTES,
  TODAY,
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
import { radius, space, text, useTheme } from '../theme'
import { KLabel, Stat, Txt } from '../ui/Txt'
import { Card } from '../ui/Card'
import { Btn } from '../ui/Btn'
import { Meter } from '../ui/Meter'
import { Check } from '../ui/Check'
import { CoachContent, CoachSignature } from '../coach/CoachPanel'
import { IconCheck, IconPlus } from '../ui/icons'
import { useHasCoachPanel, useIsDesktop } from '../shell/AppShell'

export default function WeekScreen() {
  const isDesktop = useIsDesktop()
  return isDesktop ? <WeekDesktop /> : <WeekMobile />
}

/* ————— Outcome card: a focus goal's week at a glance ————— */

function OutcomeCard({ goal, compact = false }: { goal: Goal; compact?: boolean }) {
  const t = useTheme()
  const router = useRouter()
  const state = useStore()
  const planned = plannedMinutes(state, goal.id)
  const intent = (goal.hoursPerWeek ?? 0) * 60
  const next = state.actions.find(
    (a) => a.goalId === goal.id && a.status === 'open' && !a.day && !a.rhythm,
  )
  return (
    <Card
      onPress={() => router.push(`/goal/${goal.id}`)}
      pad={space.s4}
      style={{ flex: 1, minWidth: compact ? 240 : 260, gap: space.s2 }}
    >
      <Txt size={text.md} weight="heavy" numberOfLines={2} style={{ lineHeight: text.md * 1.2, minHeight: compact ? undefined : text.md * 2.4 }}>
        {goal.title}
      </Txt>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
        <Stat size={30}>{formatDuration(planned)}</Stat>
        <Txt size={text.sm} weight="bold" color={t.ink3}>
          / ~{goal.hoursPerWeek}h placed
        </Txt>
      </View>
      <Meter ratio={intent ? planned / intent : 1} />
      {next && (
        <Txt size={text.sm} weight="medium" color={t.ink3} numberOfLines={1}>
          Next: {next.title}
        </Txt>
      )}
    </Card>
  )
}

/* ————— Desktop: outcomes over a full-width calendar card ————— */

const GRID_START = 6 * 60
const GRID_END = 22 * 60
const PX_PER_MIN = 40 / 60

function y(min: number): number {
  return (min - GRID_START) * PX_PER_MIN
}

function WeekDesktop() {
  const t = useTheme()
  const router = useRouter()
  const hasCoach = useHasCoachPanel()
  const state = useStore()
  const focus = state.goals.filter((g) => g.focus)
  const inSuggestion = new Set(state.suggestedBlocks.flatMap((b) => b.actionIds))
  const unplaced = unplacedActions(state).filter((a) => !inSuggestion.has(a.id))

  return (
    <ScrollView contentContainerStyle={{ padding: space.s6, paddingBottom: space.s8 }}>
      <View style={{ width: '100%', maxWidth: 1280, alignSelf: 'center', gap: space.s5 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: space.s4 }}>
          <View style={{ flex: 1, gap: space.s2 }}>
            <KLabel color={t.accent}>Monday 7 – Sunday 13 September</KLabel>
            <Txt size={56} weight="black" style={{ letterSpacing: -2.2, lineHeight: 56 }}>
              This week
            </Txt>
          </View>
          <Btn variant="ghost" label="Choose focus" onPress={() => router.push('/focus')} />
        </View>

        <View style={{ flexDirection: 'row', gap: space.s4, flexWrap: 'wrap' }}>
          {focus.map((g) => (
            <OutcomeCard key={g.id} goal={g} />
          ))}
        </View>

        {unplaced.length > 0 && (
          <Card sunken pad={space.s4} style={{ gap: space.s3 }}>
            <KLabel>Still to place</KLabel>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.s2 }}>
              {unplaced.map((a) => (
                <UnplacedChip key={a.id} action={a} />
              ))}
            </View>
          </Card>
        )}

        <Card pad={space.s4}>
          <View style={{ flexDirection: 'row', paddingLeft: 48 }}>
            <View style={{ position: 'absolute', left: 0, top: 60, width: 46 }}>
              {[8, 12, 16, 20].map((h) => (
                <Txt
                  key={h}
                  size={text.xs}
                  weight="semibold"
                  color={t.ink4}
                  style={{
                    position: 'absolute',
                    top: y(h * 60) - 7,
                    right: 10,
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
        </Card>

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

function UnplacedChip({ action }: { action: Action }) {
  const t = useTheme()
  const state = useStore()
  const schedule = useStore((s) => s.schedule)
  const [picking, setPicking] = useState(false)
  const goal = goalById(state, action.goalId)

  if (picking) {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          backgroundColor: t.card,
          borderRadius: radius.sm,
          borderWidth: 1,
          borderColor: t.accentLine,
          padding: 4,
          paddingLeft: 10,
        }}
      >
        <Txt size={text.sm} weight="bold" style={{ marginRight: 4 }}>
          {action.title} →
        </Txt>
        {WEEK_DAYS.filter((d) => !isPastDay(d)).map((d) => (
          <Pressable
            key={d}
            onPress={() => {
              schedule(action.id, d)
              setPicking(false)
            }}
            style={({ pressed }) => ({
              paddingVertical: 4,
              paddingHorizontal: 7,
              borderRadius: radius.sm - 2,
              backgroundColor: pressed ? t.accent : t.cardSunken,
            })}
          >
            <Txt size={text.xs} weight="bold" color={t.ink2}>
              {dayShort(d)}
            </Txt>
          </Pressable>
        ))}
      </View>
    )
  }

  return (
    <Pressable
      onPress={() => setPicking(true)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        backgroundColor: t.card,
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: t.lineFaint,
        paddingVertical: 7,
        paddingHorizontal: 11,
      }}
    >
      <IconPlus size={13} color={t.accent} strokeWidth={2.5} />
      <Txt size={text.sm} weight="bold">
        {action.title}
      </Txt>
      <Txt size={text.xs} weight="semibold" color={t.ink4}>
        {goal ? goal.title.split(' ').slice(0, 3).join(' ') + '…' : areaName(action.areaId)}
        {action.duration ? ` · ${formatDuration(action.duration)}` : ''}
      </Txt>
    </Pressable>
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
        backgroundColor: today ? t.accentSoft : 'transparent',
        borderRadius: today ? radius.sm : 0,
      }}
    >
      <Pressable
        onPress={() => today && router.push('/today')}
        style={{
          flexDirection: 'row',
          alignItems: 'baseline',
          gap: 6,
          paddingHorizontal: 8,
          paddingBottom: 6,
          paddingTop: 4,
        }}
      >
        <Txt size={text.sm} weight="heavy" color={today ? t.accent : t.ink2}>
          {dayShort(day).toUpperCase()}
        </Txt>
        <Txt
          size={text.sm}
          weight="semibold"
          color={today ? t.accent : t.ink4}
          style={{ fontVariant: ['tabular-nums'] }}
        >
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
              backgroundColor: t.cardSunken,
              borderRadius: radius.sm - 2,
              paddingVertical: 4,
              paddingHorizontal: 7,
            }}
          >
            {a.status === 'done' && <IconCheck size={10} color={t.ink3} strokeWidth={3.5} />}
            <Txt
              size={text.xs}
              weight="bold"
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
              height: 2.5,
              borderRadius: 2,
              backgroundColor: t.accent,
              zIndex: 5,
            }}
          />
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
                height: Math.max(end - s, 32) * PX_PER_MIN,
                borderRadius: radius.sm - 2,
                paddingVertical: 3,
                paddingHorizontal: 7,
                backgroundColor: meeting ? t.cardSunken : 'transparent',
                borderWidth: meeting ? 0 : 1.5,
                borderColor: t.line,
                overflow: 'hidden',
              }}
            >
              <Txt size={text.xs} weight="semibold" color={t.ink2} numberOfLines={1}>
                {e.title}
              </Txt>
              {end - s >= 60 && (
                <Txt size={10} weight="semibold" color={t.ink4} style={{ fontVariant: ['tabular-nums'] }}>
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
                height: Math.max(end - s, 32) * PX_PER_MIN,
                borderRadius: radius.sm - 2,
                paddingVertical: 3,
                paddingHorizontal: 7,
                backgroundColor: g?.focus ? t.ink : t.card,
                borderWidth: g?.focus ? 0 : 1,
                borderColor: t.line,
                opacity: done ? 0.45 : 1,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 3,
                  backgroundColor: g?.focus ? t.volt : t.ink4,
                }}
              />
              <Txt
                size={text.xs}
                weight="bold"
                color={g?.focus ? t.inkOnDark : t.ink}
                numberOfLines={1}
                style={[{ paddingLeft: 3 }, done ? { textDecorationLine: 'line-through' } : null]}
              >
                {a.title}
              </Txt>
              {end - s >= 60 && (
                <Txt
                  size={10}
                  weight="semibold"
                  color={g?.focus ? t.ink3OnDark : t.ink4}
                  style={{ paddingLeft: 3, fontVariant: ['tabular-nums'] }}
                >
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
                height: Math.max(end - s, 32) * PX_PER_MIN,
                borderRadius: radius.sm - 2,
                paddingVertical: 3,
                paddingHorizontal: 7,
                backgroundColor: t.accentSoft,
                borderWidth: 1.5,
                borderStyle: 'dashed',
                borderColor: t.accentLine,
                overflow: 'hidden',
              }}
            >
              <Txt size={text.xs} weight="bold" color={t.accentDeep} numberOfLines={1}>
                + {b.label}
              </Txt>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

/* ————— Mobile: outcomes, then a day-focused planner ————— */

function WeekMobile() {
  const t = useTheme()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const state = useStore()
  const acceptBlock = useStore((s) => s.acceptBlock)
  const dismissBlock = useStore((s) => s.dismissBlock)
  const toggleDone = useStore((s) => s.toggleDone)
  const focus = state.goals.filter((g) => g.focus)
  const [selected, setSelected] = useState(TODAY)

  const events = eventsForDay(state, selected)
  const actions = actionsForDay(state, selected)
  const suggestions = state.suggestedBlocks.filter((b) => b.day === selected)
  const merged = [
    ...events.map((e) => ({ at: toMinutes(e.start), event: e as (typeof events)[0], action: undefined as Action | undefined })),
    ...actions.map((a) => ({ at: a.time ? toMinutes(a.time) : 24 * 60, event: undefined, action: a })),
  ].sort((a, b) => a.at - b.at)

  return (
    <ScrollView
      contentContainerStyle={{
        paddingTop: Math.max(space.s5, insets.top + space.s2),
        paddingBottom: 130,
        gap: space.s4,
      }}
    >
      <View style={{ gap: 6, paddingHorizontal: space.s4 + space.s1 }}>
        <KLabel color={t.accent}>Mon 7 – Sun 13 September</KLabel>
        <Txt size={40} weight="black" style={{ letterSpacing: -1.6, lineHeight: 42 }}>
          This week
        </Txt>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: space.s4, gap: space.s3 }}
      >
        {focus.map((g) => (
          <View key={g.id} style={{ width: 250 }}>
            <OutcomeCard goal={g} compact />
          </View>
        ))}
      </ScrollView>

      {state.suggestedBlocks.length > 0 && (
        <View style={{ paddingHorizontal: space.s4, gap: space.s3 }}>
          {state.suggestedBlocks.map((b) => (
            <Card key={b.id} pad={space.s4} style={{ gap: space.s2, borderColor: t.accentLine, borderStyle: 'dashed', borderWidth: 1.5 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: space.s2 }}>
                <Txt size={text.md} weight="heavy" style={{ flex: 1 }}>
                  {b.label}
                </Txt>
                <Txt size={text.sm} weight="semibold" color={t.ink3}>
                  {dayShort(b.day)} {formatTime(b.start)} · {formatDuration(toMinutes(b.end) - toMinutes(b.start))}
                </Txt>
              </View>
              <Txt size={text.sm} color={t.ink3} style={{ lineHeight: text.sm * 1.45 }}>
                {b.reason}
              </Txt>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s3 }}>
                <Btn small label="Place it" icon={<IconCheck size={13} color={t.onAccent} strokeWidth={3} />} onPress={() => acceptBlock(b.id)} />
                <Pressable onPress={() => dismissBlock(b.id)} style={{ padding: 6 }}>
                  <Txt size={text.sm} weight="bold" color={t.ink3}>
                    Not now
                  </Txt>
                </Pressable>
              </View>
            </Card>
          ))}
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: space.s4, gap: 6 }}
      >
        {WEEK_DAYS.map((d) => {
          const on = d === selected
          const past = isPastDay(d)
          return (
            <Pressable
              key={d}
              onPress={() => setSelected(d)}
              style={{
                alignItems: 'center',
                paddingVertical: 8,
                paddingHorizontal: 14,
                borderRadius: radius.sm + 2,
                backgroundColor: on ? t.ink : t.card,
                borderWidth: on ? 0 : 1,
                borderColor: t.lineFaint,
                opacity: past && !on ? 0.5 : 1,
              }}
            >
              <Txt size={text.xs} weight="heavy" color={on ? t.volt : t.ink3}>
                {dayShort(d).toUpperCase()}
              </Txt>
              <Txt size={text.md} weight="heavy" color={on ? t.canvas : t.ink} style={{ fontVariant: ['tabular-nums'] }}>
                {dayOfMonth(d)}
              </Txt>
            </Pressable>
          )
        })}
      </ScrollView>

      <View style={{ paddingHorizontal: space.s4 }}>
        <Card style={{ gap: space.s2 }}>
          <KLabel>{isToday(selected) ? 'Today' : dayName(selected)}</KLabel>
          {merged.length === 0 && suggestions.length === 0 ? (
            <Txt size={text.md} weight="medium" color={t.ink3} style={{ paddingVertical: space.s2 }}>
              Nothing planned. Good.
            </Txt>
          ) : (
            <View>
              {merged.map((item, i) => (
                <View
                  key={item.event?.id ?? item.action?.id}
                  style={{
                    borderTopWidth: i === 0 ? 0 : 1,
                    borderTopColor: t.lineFaint,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: space.s3,
                    paddingVertical: 12,
                  }}
                >
                  <Txt
                    size={text.sm}
                    weight="semibold"
                    color={t.ink3}
                    style={{ width: 46, fontVariant: ['tabular-nums'] }}
                  >
                    {item.event
                      ? formatTime(item.event.start)
                      : item.action?.time
                        ? formatTime(item.action.time)
                        : ''}
                  </Txt>
                  {item.action ? (
                    <Check
                      done={item.action.status === 'done'}
                      onToggle={() => toggleDone(item.action!.id)}
                      size={22}
                    />
                  ) : (
                    <View style={{ width: 3, alignSelf: 'stretch', borderRadius: 2, backgroundColor: t.ink4 }} />
                  )}
                  <Txt
                    size={text.md}
                    weight={item.action ? 'bold' : 'medium'}
                    color={
                      item.action?.status === 'done'
                        ? t.ink3
                        : item.action
                          ? t.ink
                          : t.ink2
                    }
                    numberOfLines={1}
                    style={[
                      { flex: 1 },
                      item.action?.status === 'done' ? { textDecorationLine: 'line-through' } : null,
                    ]}
                  >
                    {item.event?.title ?? item.action?.title}
                  </Txt>
                </View>
              ))}
            </View>
          )}
        </Card>
      </View>
    </ScrollView>
  )
}
