import { useMemo, useState } from 'react'
import { Platform, Pressable, ScrollView, TextInput, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { areaName, goalActions, goalById, plannedMinutes, useStore } from '../state/store'
import type { Action } from '../model/types'
import { dayShort, formatDuration, formatTime } from '../model/time'
import { font, radius, space, text, useTheme } from '../theme'
import { KLabel, Stat, Txt, Why } from '../ui/Txt'
import { Card } from '../ui/Card'
import { Check } from '../ui/Check'
import { Meter } from '../ui/Meter'
import { IconArrowLeft, IconFocus, IconPlus, IconRepeat } from '../ui/icons'
import { useIsDesktop } from '../shell/AppShell'

export default function GoalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const isDesktop = useIsDesktop()
  const t = useTheme()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const state = useStore()
  const toggleDone = useStore((s) => s.toggleDone)
  const goal = goalById(state, id)
  const all = goal ? goalActions(state, goal.id) : []

  const { scheduled, rhythms, next, done } = useMemo(() => {
    const scheduled: Action[] = []
    const next: Action[] = []
    const done: Action[] = []
    const rhythmMap = new Map<string, Action>()
    for (const a of all) {
      if (a.rhythm && !rhythmMap.has(a.rhythm))
        rhythmMap.set(a.rhythm, { ...a, title: a.title.split(' — ')[0] })
      if (a.status === 'done') done.push(a)
      else if (a.day) scheduled.push(a)
      else if (!a.rhythm) next.push(a)
    }
    scheduled.sort((x, y) => `${x.day}${x.time ?? '99'}`.localeCompare(`${y.day}${y.time ?? '99'}`))
    return { scheduled, rhythms: [...rhythmMap.values()], next, done }
  }, [all])

  if (!goal) return null
  const planned = plannedMinutes(state, goal.id)
  const intent = (goal.hoursPerWeek ?? 0) * 60

  return (
    <ScrollView
      contentContainerStyle={{
        padding: isDesktop ? space.s6 : space.s4,
        paddingTop: isDesktop ? space.s6 : Math.max(space.s5, insets.top + space.s2),
        paddingBottom: 130,
      }}
    >
      <View style={{ width: '100%', maxWidth: 1100, alignSelf: 'center', gap: space.s4 }}>
        <Card dark pad={isDesktop ? space.s6 : space.s5} style={{ gap: space.s3 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s3 }}>
            {!isDesktop && (
              <Pressable onPress={() => router.back()} hitSlop={8} accessibilityLabel="Back">
                <IconArrowLeft size={19} color={t.inkOnDark} strokeWidth={2.2} />
              </Pressable>
            )}
            <Pressable onPress={() => router.push(`/area/${goal.areaId}`)}>
              <KLabel color={t.ink3OnDark}>{areaName(goal.areaId)}</KLabel>
            </Pressable>
            {goal.focus && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginLeft: 'auto' }}>
                <IconFocus size={13} color={t.volt} strokeWidth={2.2} />
                <KLabel color={t.volt}>In focus</KLabel>
              </View>
            )}
          </View>
          <Txt
            size={isDesktop ? 40 : 28}
            weight="black"
            color={t.inkOnDark}
            style={{ letterSpacing: -1.2, lineHeight: (isDesktop ? 40 : 28) * 1.1, maxWidth: 640 }}
          >
            {goal.title}
          </Txt>
          {goal.why && (
            <Why size={text.md} color={t.ink2OnDark} style={{ maxWidth: 520 }}>
              {goal.why}
            </Why>
          )}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              gap: space.s5,
              marginTop: space.s2,
              flexWrap: 'wrap',
            }}
          >
            {goal.evidence && goal.evidence.length > 0 && (
              <View style={{ gap: space.s2, flex: 1, minWidth: 220 }}>
                <KLabel color={t.ink3OnDark}>How I’ll know</KLabel>
                <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                  {goal.evidence.map((e) => (
                    <View
                      key={e}
                      style={{
                        borderWidth: 1,
                        borderColor: 'rgba(245,246,248,0.25)',
                        borderRadius: radius.sm - 2,
                        paddingVertical: 4,
                        paddingHorizontal: 9,
                      }}
                    >
                      <Txt size={text.xs} weight="bold" color={t.ink2OnDark}>
                        {e}
                      </Txt>
                    </View>
                  ))}
                </View>
              </View>
            )}
            {goal.focus && intent > 0 && (
              <View style={{ gap: 6, minWidth: 220 }}>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                  <Stat size={30} color={t.volt}>
                    {formatDuration(planned)}
                  </Stat>
                  <Txt size={text.sm} weight="bold" color={t.ink2OnDark}>
                    / ~{goal.hoursPerWeek}h this week
                  </Txt>
                </View>
                <Meter ratio={planned / intent} onDark />
              </View>
            )}
            <View style={{ flexDirection: 'row', gap: space.s2, marginLeft: 'auto' }}>
              {!goal.focus && (
                <Pressable
                  onPress={() => router.push('/focus')}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    borderWidth: 1.5,
                    borderColor: 'rgba(245,246,248,0.3)',
                    borderRadius: radius.sm + 2,
                    paddingVertical: 8,
                    paddingHorizontal: 14,
                  }}
                >
                  <IconFocus size={14} color={t.inkOnDark} strokeWidth={2.2} />
                  <Txt size={text.sm} weight="bold" color={t.inkOnDark}>
                    Give it focus
                  </Txt>
                </Pressable>
              )}
              <Pressable
                onPress={() => router.push({ pathname: '/goal-new', params: { goalId: goal.id } })}
                style={{ paddingVertical: 8, paddingHorizontal: 10 }}
              >
                <Txt size={text.sm} weight="bold" color={t.ink3OnDark}>
                  Edit
                </Txt>
              </Pressable>
            </View>
          </View>
        </Card>

        <View style={{ flexDirection: 'row', gap: space.s4, flexWrap: 'wrap' }}>
          <Card style={{ flex: 1.4, minWidth: 320, gap: space.s2 }}>
            <KLabel>This week</KLabel>
            {scheduled.length === 0 ? (
              <Txt size={text.md} weight="medium" color={t.ink3}>
                Nothing scheduled yet.
              </Txt>
            ) : (
              <View>
                {scheduled.map((a, i) => (
                  <GoalRow
                    key={a.id}
                    action={a}
                    first={i === 0}
                    when={`${dayShort(a.day!)}${a.time ? ` ${formatTime(a.time)}` : ''}`}
                    onToggle={() => toggleDone(a.id)}
                  />
                ))}
              </View>
            )}
            {done.length > 0 && (
              <>
                <KLabel style={{ marginTop: space.s3 }}>Done</KLabel>
                <View>
                  {done.map((a, i) => (
                    <GoalRow
                      key={a.id}
                      action={a}
                      first={i === 0}
                      when={a.day ? dayShort(a.day) : ''}
                      onToggle={() => toggleDone(a.id)}
                    />
                  ))}
                </View>
              </>
            )}
          </Card>

          <View style={{ flex: 1, minWidth: 280, gap: space.s4 }}>
            <Card style={{ gap: space.s2 }}>
              <KLabel>Up next</KLabel>
              {next.length === 0 ? (
                <Txt size={text.md} weight="medium" color={t.ink3}>
                  No unscheduled actions.
                </Txt>
              ) : (
                <View>
                  {next.map((a, i) => (
                    <GoalRow key={a.id} action={a} first={i === 0} onToggle={() => toggleDone(a.id)} />
                  ))}
                </View>
              )}
              <AddActionInline goalId={goal.id} areaId={goal.areaId} />
            </Card>
            {rhythms.length > 0 && (
              <Card sunken style={{ gap: space.s3 }}>
                <KLabel>Rhythms</KLabel>
                {rhythms.map((a) => (
                  <View key={a.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <IconRepeat size={14} color={t.ink3} strokeWidth={2.2} />
                    <Txt size={text.sm} weight="bold" style={{ flex: 1 }}>
                      {a.title}
                    </Txt>
                    <Txt size={text.xs} weight="bold" color={t.ink3}>
                      {a.rhythm}
                    </Txt>
                  </View>
                ))}
              </Card>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

function GoalRow({
  action,
  onToggle,
  when,
  first,
}: {
  action: Action
  onToggle: () => void
  when?: string
  first?: boolean
}) {
  const t = useTheme()
  const done = action.status === 'done'
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.s3,
        paddingVertical: 11,
        borderTopWidth: first ? 0 : 1,
        borderTopColor: t.lineFaint,
      }}
    >
      <Check done={done} onToggle={onToggle} size={22} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Txt
          size={text.md}
          weight="bold"
          numberOfLines={1}
          color={done ? t.ink3 : t.ink}
          style={done ? { textDecorationLine: 'line-through' } : undefined}
        >
          {action.title}
        </Txt>
        {action.note && (
          <Txt size={text.sm} color={t.ink4} numberOfLines={1}>
            {action.note}
          </Txt>
        )}
      </View>
      <Txt size={text.sm} weight="semibold" color={t.ink4} style={{ fontVariant: ['tabular-nums'] }}>
        {when ?? (action.duration ? formatDuration(action.duration) : '')}
      </Txt>
    </View>
  )
}

export function AddActionInline({
  goalId,
  areaId,
}: {
  goalId?: string
  areaId?: Action['areaId']
}) {
  const t = useTheme()
  const addAction = useStore((s) => s.addAction)
  const [value, setValue] = useState('')
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s3, paddingVertical: space.s2 }}>
      <IconPlus size={15} color={t.accent} strokeWidth={2.5} />
      <TextInput
        placeholder="Add an action…"
        placeholderTextColor={t.ink4}
        value={value}
        onChangeText={setValue}
        onSubmitEditing={() => {
          if (value.trim()) {
            addAction(value.trim(), { goalId, areaId })
            setValue('')
          }
        }}
        style={{
          flex: 1,
          fontFamily: font.medium,
          fontSize: text.md,
          color: t.ink,
          paddingVertical: 4,
          ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null),
        }}
      />
    </View>
  )
}
