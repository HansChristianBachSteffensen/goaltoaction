import { useMemo, useState } from 'react'
import { Platform, Pressable, ScrollView, TextInput, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { areaName, goalActions, goalById, plannedMinutes, useStore } from '../state/store'
import type { Action } from '../model/types'
import { dayShort, formatDuration, formatTime } from '../model/time'
import { font, radius, space, text, useTheme } from '../theme'
import { KLabel, Txt, Why } from '../ui/Txt'
import { Btn } from '../ui/Btn'
import { ActionRow } from '../ui/Row'
import { GoalArt, type GoalArtKey } from '../ui/GoalArt'
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

  const hero = (
    <View
      style={{
        backgroundColor: t.surfaceInk,
        borderRadius: isDesktop ? radius.lg : 0,
        overflow: 'hidden',
        padding: space.s5,
        paddingTop: isDesktop ? space.s6 : Math.max(space.s6, insets.top) + 76,
        minHeight: isDesktop ? 260 : undefined,
        justifyContent: 'flex-end',
        gap: space.s2,
      }}
    >
      {goal.image && <GoalArt art={goal.image as GoalArtKey} scrim="bottom" />}
      {!isDesktop && (
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel="Back"
          style={{
            position: 'absolute',
            top: Math.max(space.s4, insets.top),
            left: space.s4,
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: 'rgba(16,14,12,0.45)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconArrowLeft size={18} color={t.inkOnDark} />
        </Pressable>
      )}
      <Pressable onPress={() => router.push(`/area/${goal.areaId}`)}>
        <KLabel color="rgba(244,242,236,0.55)">{areaName(goal.areaId)}</KLabel>
      </Pressable>
      <Txt
        size={isDesktop ? text.x2 : 26}
        weight="bold"
        color={t.inkOnDark}
        style={{ letterSpacing: -0.7, lineHeight: (isDesktop ? text.x2 : 26) * 1.12, maxWidth: 560 }}
      >
        {goal.title}
      </Txt>
      {goal.why && (
        <Why size={isDesktop ? text.lg : text.md} color={t.ink2OnDark} style={{ maxWidth: 480 }}>
          {goal.why}
        </Why>
      )}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: space.s4,
          marginTop: space.s3,
          flexWrap: 'wrap',
        }}
      >
        {goal.evidence && goal.evidence.length > 0 ? (
          <View style={{ gap: space.s2 }}>
            <KLabel color="rgba(244,242,236,0.45)">How I’ll know</KLabel>
            <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
              {goal.evidence.map((e) => (
                <View
                  key={e}
                  style={{
                    borderWidth: 1,
                    borderColor: 'rgba(244,242,236,0.25)',
                    borderRadius: radius.full,
                    paddingVertical: 3,
                    paddingHorizontal: 10,
                  }}
                >
                  <Txt size={text.xs} weight="medium" color="rgba(244,242,236,0.85)">
                    {e}
                  </Txt>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View />
        )}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s2 }}>
          {goal.focus ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <IconFocus size={13} color={t.accentOnDark} strokeWidth={2} />
              <Txt size={text.xs} weight="semibold" color={t.accentOnDark}>
                In focus · {formatDuration(planned)} of ~{goal.hoursPerWeek}h this week
              </Txt>
            </View>
          ) : (
            <Pressable
              onPress={() => router.push('/focus')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                borderWidth: 1,
                borderColor: 'rgba(244,242,236,0.3)',
                borderRadius: radius.full,
                paddingVertical: 6,
                paddingHorizontal: 13,
              }}
            >
              <IconFocus size={13} color="rgba(244,242,236,0.8)" strokeWidth={2} />
              <Txt size={text.sm} weight="medium" color="rgba(244,242,236,0.8)">
                Give it focus
              </Txt>
            </Pressable>
          )}
          <Pressable
            onPress={() => router.push({ pathname: '/goal-new', params: { goalId: goal.id } })}
            hitSlop={6}
            style={{ paddingVertical: 6, paddingHorizontal: 10 }}
          >
            <Txt size={text.sm} weight="medium" color="rgba(244,242,236,0.55)">
              Edit
            </Txt>
          </Pressable>
        </View>
      </View>
    </View>
  )

  return (
    <ScrollView
      contentContainerStyle={{
        padding: isDesktop ? space.s6 : 0,
        paddingTop: isDesktop ? space.s6 : 0,
        paddingBottom: 120,
        maxWidth: isDesktop ? 860 : undefined,
        width: '100%',
      }}
    >
      {hero}
      <View
        style={{
          gap: space.s6,
          paddingTop: space.s6,
          paddingHorizontal: isDesktop ? 0 : space.s5,
          maxWidth: isDesktop ? 640 : undefined,
        }}
      >
        {scheduled.length > 0 && (
          <Section label="This week">
            {scheduled.map((a) => (
              <ActionRow
                key={a.id}
                action={a}
                big={!isDesktop}
                when={`${dayShort(a.day!)}${a.time ? ` ${formatTime(a.time)}` : ''}`}
                onToggle={() => toggleDone(a.id)}
              />
            ))}
          </Section>
        )}
        {next.length > 0 && (
          <Section label="Up next">
            {next.map((a) => (
              <ActionRow
                key={a.id}
                action={a}
                big={!isDesktop}
                when={isDesktop ? '—' : undefined}
                onToggle={() => toggleDone(a.id)}
              />
            ))}
          </Section>
        )}
        {rhythms.length > 0 && (
          <Section label="Rhythms">
            {rhythms.map((a) => (
              <View
                key={a.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: space.s3,
                  paddingVertical: isDesktop ? 10 : 13,
                  paddingHorizontal: isDesktop ? space.s2 : 0,
                  borderBottomWidth: 1,
                  borderBottomColor: t.lineFaint,
                }}
              >
                <View style={{ width: isDesktop ? 20 : 24, alignItems: 'center' }}>
                  <IconRepeat size={13} color={t.ink4} strokeWidth={1.8} />
                </View>
                <Txt weight="medium" style={{ flex: 1 }}>
                  {a.title}
                </Txt>
                <Txt size={text.sm} color={t.ink3}>
                  {a.rhythm}
                </Txt>
              </View>
            ))}
          </Section>
        )}
        {done.length > 0 && (
          <Section label="Done this week">
            {done.map((a) => (
              <ActionRow
                key={a.id}
                action={a}
                big={!isDesktop}
                when={a.day ? dayShort(a.day) : ''}
                onToggle={() => toggleDone(a.id)}
              />
            ))}
          </Section>
        )}
        <AddActionInline goalId={goal.id} areaId={goal.areaId} />
      </View>
    </ScrollView>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: space.s2 }}>
      <KLabel>{label}</KLabel>
      <View>{children}</View>
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
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.s3,
        paddingVertical: space.s2,
        paddingHorizontal: space.s2,
      }}
    >
      <IconPlus size={14} color={t.ink4} />
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
          fontFamily: font.regular,
          fontSize: text.md,
          color: t.ink,
          paddingVertical: 4,
          ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null),
        }}
      />
    </View>
  )
}
