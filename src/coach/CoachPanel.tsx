import { useMemo, useState } from 'react'
import { Platform, Pressable, ScrollView, TextInput, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useRouter } from 'expo-router'
import { useStore } from '../state/store'
import { coachItems, coachReply, type CoachItem } from './coach'
import { font, radius, space, text, useTheme } from '../theme'
import { KLabel, Txt } from '../ui/Txt'
import { Btn } from '../ui/Btn'
import { IconArrowRight, IconCheck, IconSpark, IconX } from '../ui/icons'

/* The coach surface: one primary move, its reasoning on demand,
   the signals behind it, and a composer that answers from state. */

export function CoachSignature({ size = 30 }: { size?: number }) {
  const t = useTheme()
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
        backgroundColor: t.dark,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <IconSpark size={size * 0.55} color={t.volt} strokeWidth={1.8} />
    </View>
  )
}

export function CoachContent({ compact = false }: { compact?: boolean }) {
  const t = useTheme()
  const router = useRouter()
  const state = useStore()
  const acceptBlock = useStore((s) => s.acceptBlock)
  const dismissBlock = useStore((s) => s.dismissBlock)
  const capture = useStore((s) => s.capture)
  const [dismissed, setDismissed] = useState<string[]>([])
  const [showReason, setShowReason] = useState<string | null>(null)
  const [thread, setThread] = useState<Array<{ who: 'you' | 'coach'; text: string }>>([])
  const [draft, setDraft] = useState('')

  const items = useMemo(
    () => coachItems(state).filter((i) => !dismissed.includes(i.id)),
    [state, dismissed],
  )
  const primary = items.find((i) => i.kind === 'move') ?? items[0]
  const rest = items.filter((i) => i !== primary)

  function run(item: CoachItem) {
    if (!item.action) return
    if (item.action.type === 'accept-block') acceptBlock(item.action.blockId)
    else router.push(item.action.href as never)
  }

  function send(q?: string) {
    const question = (q ?? draft).trim()
    if (!question) return
    const reply = coachReply(question, state)
    if (reply.capture) capture(reply.capture)
    setThread((th) => [...th, { who: 'you', text: question }, { who: 'coach', text: reply.text }])
    setDraft('')
  }

  return (
    <View style={{ flex: 1, gap: space.s4 }}>
      {primary ? (
        <Animated.View
          key={primary.id}
          entering={FadeInDown.duration(240)}
          style={{
            backgroundColor: t.dark,
            borderRadius: radius.lg,
            padding: space.s5,
            gap: space.s3,
          }}
        >
          <KLabel color={t.volt}>
            {primary.kind === 'move' ? 'Recommended move' : primary.kind === 'signal' ? 'Worth knowing' : 'Earned'}
          </KLabel>
          <Txt size={text.lg} weight="heavy" color={t.inkOnDark} style={{ lineHeight: text.lg * 1.2 }}>
            {primary.title}
          </Txt>
          <Txt size={text.sm} color={t.ink2OnDark} style={{ lineHeight: text.sm * 1.5 }}>
            {primary.detail}
          </Txt>
          {primary.context.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {primary.context.map((c) => (
                <View
                  key={c}
                  style={{
                    borderWidth: 1,
                    borderColor: 'rgba(245,246,248,0.25)',
                    borderRadius: radius.sm,
                    paddingVertical: 3,
                    paddingHorizontal: 8,
                    maxWidth: '100%',
                    flexShrink: 1,
                  }}
                >
                  <Txt size={text.xs} weight="semibold" color={t.ink2OnDark} numberOfLines={1}>
                    {c}
                  </Txt>
                </View>
              ))}
            </View>
          )}
          {showReason === primary.id && primary.reason && (
            <Txt size={text.sm} color={t.ink2OnDark} style={{ lineHeight: text.sm * 1.5 }}>
              {primary.reason}
            </Txt>
          )}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s2, marginTop: space.s1, flexWrap: 'wrap' }}>
            {primary.action && (
              <Btn
                small
                variant="volt"
                label={primary.action.label}
                icon={
                  primary.action.type === 'accept-block' ? (
                    <IconCheck size={14} color={t.onVolt} strokeWidth={3} />
                  ) : (
                    <IconArrowRight size={14} color={t.onVolt} strokeWidth={2.5} />
                  )
                }
                onPress={() => run(primary)}
              />
            )}
            {primary.reason && (
              <Pressable
                onPress={() => setShowReason((r) => (r === primary.id ? null : primary.id))}
                style={{ paddingVertical: 7, paddingHorizontal: 8 }}
              >
                <Txt size={text.sm} weight="semibold" color={t.ink2OnDark}>
                  {showReason === primary.id ? 'Hide reasoning' : 'Why?'}
                </Txt>
              </Pressable>
            )}
            <Pressable
              onPress={() => setDismissed((d) => [...d, primary.id])}
              style={{ paddingVertical: 7, paddingHorizontal: 8, marginLeft: 'auto' }}
              accessibilityLabel="Not now"
            >
              <Txt size={text.sm} weight="semibold" color={t.ink3OnDark}>
                Not now
              </Txt>
            </Pressable>
          </View>
        </Animated.View>
      ) : (
        <View
          style={{
            backgroundColor: t.dark,
            borderRadius: radius.lg,
            padding: space.s5,
            gap: space.s2,
          }}
        >
          <KLabel color={t.volt}>All clear</KLabel>
          <Txt size={text.md} color={t.ink2OnDark}>
            Nothing needs a decision right now. The week is holding its shape.
          </Txt>
        </View>
      )}

      {rest.length > 0 && (
        <View style={{ gap: space.s2 }}>
          {rest.slice(0, compact ? 2 : 4).map((item) => (
            <Pressable
              key={item.id}
              onPress={() => run(item)}
              disabled={!item.action}
              style={{
                backgroundColor: t.card,
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: t.lineFaint,
                padding: space.s4,
                gap: 3,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 2,
                    backgroundColor: item.kind === 'win' ? t.volt : t.accent,
                  }}
                />
                <Txt size={text.sm} weight="bold" style={{ flex: 1 }} numberOfLines={1}>
                  {item.title}
                </Txt>
                {item.action && <IconArrowRight size={13} color={t.ink4} />}
              </View>
              <Txt size={text.sm} color={t.ink3} numberOfLines={2} style={{ lineHeight: text.sm * 1.45 }}>
                {item.detail}
              </Txt>
            </Pressable>
          ))}
        </View>
      )}

      {thread.length > 0 && (
        <View style={{ gap: space.s2 }}>
          {thread.slice(-4).map((m, i) => (
            <View
              key={i}
              style={{
                alignSelf: m.who === 'you' ? 'flex-end' : 'flex-start',
                maxWidth: '92%',
                backgroundColor: m.who === 'you' ? t.accentSoft : t.card,
                borderWidth: m.who === 'you' ? 0 : 1,
                borderColor: t.lineFaint,
                borderRadius: radius.md,
                paddingVertical: space.s2,
                paddingHorizontal: space.s3,
              }}
            >
              <Txt size={text.sm} color={t.ink2} style={{ lineHeight: text.sm * 1.5 }}>
                {m.text}
              </Txt>
            </View>
          ))}
        </View>
      )}

      <View style={{ marginTop: 'auto', gap: space.s2 }}>
        <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
          {["What's slipping?", 'Plan my Friday'].map((q) => (
            <Pressable
              key={q}
              onPress={() => send(q)}
              style={{
                borderWidth: 1,
                borderColor: t.line,
                borderRadius: radius.full,
                paddingVertical: 5,
                paddingHorizontal: 11,
              }}
            >
              <Txt size={text.xs} weight="semibold" color={t.ink2}>
                {q}
              </Txt>
            </Pressable>
          ))}
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: space.s2,
            backgroundColor: t.card,
            borderWidth: 1,
            borderColor: t.line,
            borderRadius: radius.md,
            paddingLeft: space.s4,
            paddingRight: 6,
            paddingVertical: 6,
          }}
        >
          <TextInput
            placeholder="Ask, adjust, or hand something off…"
            placeholderTextColor={t.ink3}
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={() => send()}
            style={{
              flex: 1,
              fontFamily: font.medium,
              fontSize: text.sm,
              color: t.ink,
              paddingVertical: 6,
              ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null),
            }}
          />
          <Pressable
            onPress={() => send()}
            disabled={!draft.trim()}
            accessibilityLabel="Send"
            style={{
              width: 32,
              height: 32,
              borderRadius: radius.sm,
              backgroundColor: draft.trim() ? t.accent : t.cardSunken,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconArrowRight size={15} color={draft.trim() ? t.onAccent : t.ink3} strokeWidth={2.5} />
          </Pressable>
        </View>
      </View>
    </View>
  )
}

/** Desktop: persistent right-hand coach column. */
export function CoachPanel() {
  const t = useTheme()
  return (
    <View
      style={{
        width: 340,
        borderLeftWidth: 1,
        borderLeftColor: t.line,
        backgroundColor: t.canvas,
        padding: space.s5,
        gap: space.s4,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s3 }}>
        <CoachSignature />
        <View>
          <Txt size={text.md} weight="heavy">
            Coach
          </Txt>
          <Txt size={text.xs} color={t.ink3}>
            Watching goals, time and rhythm
          </Txt>
        </View>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
        <CoachContent />
      </ScrollView>
    </View>
  )
}
