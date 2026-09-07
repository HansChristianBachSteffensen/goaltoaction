import { Pressable, ScrollView, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  areaGoals,
  areaName,
  areaStandaloneActions,
  goalActions,
  useStore,
} from '../state/store'
import type { AreaId } from '../model/types'
import { dayShort, formatTime } from '../model/time'
import { radius, space, text, useTheme } from '../theme'
import { KLabel, Txt, Why } from '../ui/Txt'
import { ActionRow } from '../ui/Row'
import { IconArrowLeft, IconChevronRight, IconFocus, IconPlus } from '../ui/icons'
import { useIsDesktop } from '../shell/AppShell'
import { AddActionInline } from './GoalScreen'

/* An Area is a place, not a goal. It holds a few things being moved
   forward — and everything simply being stayed on top of. */

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
  const done = standalone.filter((a) => a.status === 'done')

  return (
    <ScrollView
      contentContainerStyle={{
        padding: isDesktop ? space.s7 : space.s5,
        paddingTop: isDesktop ? space.s7 : Math.max(space.s6, insets.top + space.s3),
        paddingBottom: 120,
        maxWidth: isDesktop ? 760 : undefined,
        width: '100%',
        gap: space.s6,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s3 }}>
        {!isDesktop && (
          <Pressable onPress={() => router.back()} hitSlop={8} accessibilityLabel="Back">
            <IconArrowLeft size={18} color={t.ink2} />
          </Pressable>
        )}
        <Txt
          size={isDesktop ? text.x2 : 28}
          weight="bold"
          style={{ letterSpacing: -0.9, lineHeight: (isDesktop ? text.x2 : 28) * 1.05 }}
        >
          {areaName(areaId)}
        </Txt>
      </View>

      {goals.length > 0 && (
        <View style={{ gap: space.s3 }}>
          <KLabel>Goals</KLabel>
          <View style={{ gap: space.s3 }}>
            {goals.map((g) => {
              const count = goalActions(state, g.id).filter((a) => a.status === 'open').length
              return (
                <Pressable
                  key={g.id}
                  onPress={() => router.push(`/goal/${g.id}`)}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: space.s4,
                    padding: space.s4,
                    paddingHorizontal: space.s5,
                    borderRadius: radius.md,
                    backgroundColor: t.surfaceRaised,
                    borderWidth: 1,
                    borderColor: pressed ? t.line : t.lineFaint,
                  })}
                >
                  <View style={{ flex: 1, gap: 3 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s2 }}>
                      <Txt size={text.lg} weight="semibold" style={{ letterSpacing: -0.2, flexShrink: 1 }}>
                        {g.title}
                      </Txt>
                      {g.focus && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <IconFocus size={12} color={t.accentInk} strokeWidth={2} />
                          <Txt size={text.xs} weight="semibold" color={t.accentInk}>
                            Focus
                          </Txt>
                        </View>
                      )}
                    </View>
                    {g.why && <Why color={t.ink3}>{g.why}</Why>}
                    <Txt size={text.xs} color={t.ink4} style={{ marginTop: 3 }}>
                      {count} open action{count === 1 ? '' : 's'}
                    </Txt>
                  </View>
                  <IconChevronRight size={14} color={t.ink4} />
                </Pressable>
              )
            })}
          </View>
          <NewGoalLink areaId={areaId} label="New goal" />
        </View>
      )}

      <View style={{ gap: space.s3 }}>
        <KLabel>{goals.length > 0 ? 'Everything else' : 'To stay on top of'}</KLabel>
        {open.length === 0 && done.length === 0 && (
          <Txt color={t.ink3} style={{ padding: space.s2 }}>
            Nothing here needs you right now.
          </Txt>
        )}
        <View>
          {open.map((a) => (
            <ActionRow
              key={a.id}
              action={a}
              big={!isDesktop}
              when={a.day ? `${dayShort(a.day)}${a.time ? ` ${formatTime(a.time)}` : ''}` : isDesktop ? '—' : undefined}
              onToggle={() => toggleDone(a.id)}
            />
          ))}
          {done.map((a) => (
            <ActionRow
              key={a.id}
              action={a}
              big={!isDesktop}
              when={a.day ? dayShort(a.day) : ''}
              onToggle={() => toggleDone(a.id)}
            />
          ))}
        </View>
        <AddActionInline areaId={areaId} />
        {goals.length === 0 && (
          <NewGoalLink areaId={areaId} label="Something you want to change here? Start a goal" />
        )}
      </View>
    </ScrollView>
  )
}

function NewGoalLink({ areaId, label }: { areaId: AreaId; label: string }) {
  const t = useTheme()
  const router = useRouter()
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/goal-new', params: { areaId } })}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        alignSelf: 'flex-start',
        padding: space.s2,
      }}
    >
      <IconPlus size={13} color={t.ink3} />
      <Txt size={text.sm} weight="medium" color={t.ink3}>
        {label}
      </Txt>
    </Pressable>
  )
}
