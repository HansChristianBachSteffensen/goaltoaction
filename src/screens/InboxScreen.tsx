import { useState } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { areaName, areas, inboxItems, useStore } from '../state/store'
import type { Action, AreaId } from '../model/types'
import { suggestFor } from '../model/ai'
import { dayName, formatDuration } from '../model/time'
import { radius, space, text, useTheme } from '../theme'
import { KLabel, Txt, Why } from '../ui/Txt'
import { Btn } from '../ui/Btn'
import {
  IconArrowLeft,
  IconCheck,
  IconMail,
  IconNote,
  IconPeople,
  IconSpark,
  IconX,
} from '../ui/icons'
import { useIsDesktop } from '../shell/AppShell'

/* The inbox is where interpretation happens — after capture, not during.
   Desktop: a list you sweep through. Mobile: one thing at a time. */

export default function InboxScreen() {
  const isDesktop = useIsDesktop()
  return isDesktop ? <InboxDesktop /> : <InboxMobile />
}

function SourceIcon({ action }: { action: Action }) {
  const t = useTheme()
  const props = { size: 14, color: t.ink3, strokeWidth: 1.7 }
  return (
    <View
      style={{
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: t.lineFaint,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 1,
      }}
    >
      {action.source === 'email' ? (
        <IconMail {...props} />
      ) : action.source === 'meeting' ? (
        <IconPeople {...props} />
      ) : action.source === 'note' ? (
        <IconNote {...props} />
      ) : (
        <IconSpark {...props} />
      )}
    </View>
  )
}

function AdjustPicker({ onPick }: { onPick: (areaId: AreaId, goalId?: string) => void }) {
  const t = useTheme()
  const goals = useStore((s) => s.goals)
  return (
    <View style={{ gap: space.s2 }}>
      {areas.map((ar) => {
        const areaGoals = goals.filter((g) => g.areaId === ar.id)
        return (
          <View
            key={ar.id}
            style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}
          >
            <Pressable
              onPress={() => onPick(ar.id)}
              style={({ pressed }) => ({
                paddingVertical: 4,
                paddingHorizontal: 10,
                borderRadius: radius.full,
                backgroundColor: pressed ? t.ink : t.lineFaint,
              })}
            >
              <Txt size={text.xs} weight="semibold">
                {ar.name}
              </Txt>
            </Pressable>
            {areaGoals.map((g) => (
              <Pressable
                key={g.id}
                onPress={() => onPick(ar.id, g.id)}
                style={{
                  paddingVertical: 4,
                  paddingHorizontal: 10,
                  borderRadius: radius.full,
                  borderWidth: 1,
                  borderColor: t.line,
                }}
              >
                <Txt size={text.xs} weight="medium" color={t.ink2} numberOfLines={1}>
                  {g.title}
                </Txt>
              </Pressable>
            ))}
          </View>
        )
      })}
    </View>
  )
}

function SuggestionLine({ action }: { action: Action }) {
  const t = useTheme()
  const goals = useStore((s) => s.goals)
  const suggestion = suggestFor(action)
  if (!suggestion) return null
  const goal = suggestion.goalId ? goals.find((g) => g.id === suggestion.goalId) : undefined
  return (
    <View style={{ flexDirection: 'row', gap: 6, flex: 1, minWidth: 0, alignItems: 'flex-start' }}>
      <View style={{ marginTop: 2 }}>
        <IconSpark size={14} color={t.accentDeep} strokeWidth={1.6} />
      </View>
      <Txt size={text.sm} color={t.accentDeep} weight="semibold" style={{ flex: 1, lineHeight: text.sm * 1.45 }}>
        {goal ? goal.title : areaName(suggestion.areaId)}
        {suggestion.day ? ` · ${dayName(suggestion.day)}` : ''}
        {suggestion.duration ? ` · ${formatDuration(suggestion.duration)}` : ''}
        <Txt size={text.sm} color={t.ink3}>
          {'  —  '}
          {suggestion.reason}
        </Txt>
      </Txt>
    </View>
  )
}

/* ————— Desktop ————— */

function InboxDesktop() {
  const t = useTheme()
  const state = useStore()
  const items = inboxItems(state)

  return (
    <ScrollView contentContainerStyle={{ padding: space.s7, maxWidth: 760, width: '100%' }}>
      <View style={{ gap: space.s2, marginBottom: space.s6 }}>
        <Txt size={text.x2} weight="bold" style={{ letterSpacing: -1, lineHeight: text.x2 * 1.05 }}>
          Inbox
        </Txt>
        <Txt color={t.ink3}>
          {items.length === 0
            ? 'Nothing waiting.'
            : `${items.length} captured — decide where they belong, or leave them for later.`}
        </Txt>
      </View>

      {items.length === 0 ? (
        <Why size={text.lg} style={{ paddingVertical: space.s6 }}>
          Everything you’ve caught has a place. Go do something that matters.
        </Why>
      ) : (
        <View style={{ gap: space.s3 }}>
          {items.map((a) => (
            <InboxCard key={a.id} action={a} />
          ))}
        </View>
      )}
    </ScrollView>
  )
}

function InboxCard({ action }: { action: Action }) {
  const t = useTheme()
  const fileInbox = useStore((s) => s.fileInbox)
  const dismissInbox = useStore((s) => s.dismissInbox)
  const [adjusting, setAdjusting] = useState(false)
  const suggestion = suggestFor(action)

  return (
    <View
      style={{
        backgroundColor: t.card,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: t.lineFaint,
        padding: space.s4,
        gap: space.s3,
      }}
    >
      <View style={{ flexDirection: 'row', gap: space.s3, alignItems: 'flex-start' }}>
        <SourceIcon action={action} />
        <View style={{ flex: 1, gap: 1 }}>
          <Txt weight="semibold">{action.title}</Txt>
          {action.sourceDetail && (
            <Txt size={text.sm} color={t.ink3}>
              {action.sourceDetail}
            </Txt>
          )}
        </View>
        <Pressable onPress={() => dismissInbox(action.id)} hitSlop={8} accessibilityLabel="Let it go">
          <IconX size={14} color={t.ink4} />
        </Pressable>
      </View>

      {adjusting ? (
        <View style={{ paddingLeft: 40 }}>
          <AdjustPicker
            onPick={(areaId, goalId) => {
              fileInbox(action.id, { areaId, goalId })
              setAdjusting(false)
            }}
          />
        </View>
      ) : (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: space.s3,
            paddingLeft: 40,
            flexWrap: 'wrap',
          }}
        >
          {suggestion ? (
            <SuggestionLine action={action} />
          ) : (
            <Txt size={text.sm} color={t.ink4}>
              Where does this belong?
            </Txt>
          )}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s2 }}>
            {suggestion ? (
              <>
                <Btn
                  small
                  label="File it"
                  icon={<IconCheck size={12} color={t.canvas} strokeWidth={3} />}
                  onPress={() =>
                    fileInbox(action.id, {
                      areaId: suggestion.areaId,
                      goalId: suggestion.goalId,
                      day: suggestion.day,
                      duration: suggestion.duration,
                    })
                  }
                />
                <Btn small variant="quiet" label="Somewhere else" onPress={() => setAdjusting(true)} />
              </>
            ) : (
              <Btn small variant="ghost" label="Choose a place" onPress={() => setAdjusting(true)} />
            )}
          </View>
        </View>
      )}
    </View>
  )
}

/* ————— Mobile: one at a time ————— */

function InboxMobile() {
  const t = useTheme()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const state = useStore()
  const fileInbox = useStore((s) => s.fileInbox)
  const dismissInbox = useStore((s) => s.dismissInbox)
  const [adjusting, setAdjusting] = useState(false)
  const items = inboxItems(state)
  const current = items[0]
  const suggestion = current ? suggestFor(current) : undefined

  return (
    <ScrollView
      contentContainerStyle={{
        paddingTop: Math.max(space.s6, insets.top + space.s3),
        paddingHorizontal: space.s5,
        paddingBottom: 120,
        gap: space.s5,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s3 }}>
        <Pressable onPress={() => router.back()} hitSlop={8} accessibilityLabel="Back">
          <IconArrowLeft size={18} color={t.ink2} />
        </Pressable>
        <Txt size={28} weight="bold" style={{ letterSpacing: -0.8, flex: 1 }}>
          Inbox
        </Txt>
        {items.length > 0 && (
          <Txt size={text.sm} color={t.ink3}>
            {items.length} left
          </Txt>
        )}
      </View>

      {!current ? (
        <Why size={text.lg} style={{ paddingVertical: space.s5 }}>
          All sorted. Everything you caught has a place.
        </Why>
      ) : (
        <View
          key={current.id}
          style={{
            backgroundColor: t.card,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: t.lineFaint,
            padding: space.s5,
            gap: space.s4,
          }}
        >
          <View style={{ flexDirection: 'row', gap: space.s3, alignItems: 'flex-start' }}>
            <SourceIcon action={current} />
            <View style={{ flex: 1, gap: 2 }}>
              <Txt size={text.lg} weight="semibold" style={{ lineHeight: text.lg * 1.3 }}>
                {current.title}
              </Txt>
              {current.sourceDetail && (
                <Txt size={text.sm} color={t.ink3}>
                  {current.sourceDetail}
                </Txt>
              )}
            </View>
          </View>

          {adjusting ? (
            <View style={{ gap: space.s3 }}>
              <AdjustPicker
                onPick={(areaId, goalId) => {
                  fileInbox(current.id, { areaId, goalId })
                  setAdjusting(false)
                }}
              />
              <Btn small variant="quiet" label="Never mind" onPress={() => setAdjusting(false)} />
            </View>
          ) : (
            <>
              {suggestion && <SuggestionLine action={current} />}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.s2, alignItems: 'center' }}>
                {suggestion ? (
                  <Btn
                    label="File it"
                    icon={<IconCheck size={13} color={t.canvas} strokeWidth={3} />}
                    onPress={() =>
                      fileInbox(current.id, {
                        areaId: suggestion.areaId,
                        goalId: suggestion.goalId,
                        day: suggestion.day,
                        duration: suggestion.duration,
                      })
                    }
                  />
                ) : (
                  <Btn label="Choose a place" onPress={() => setAdjusting(true)} />
                )}
                <Btn variant="ghost" label="Somewhere else" onPress={() => setAdjusting(true)} />
                <Btn
                  variant="quiet"
                  label="Let it go"
                  icon={<IconX size={14} color={t.ink3} />}
                  onPress={() => dismissInbox(current.id)}
                />
              </View>
            </>
          )}
        </View>
      )}
    </ScrollView>
  )
}
