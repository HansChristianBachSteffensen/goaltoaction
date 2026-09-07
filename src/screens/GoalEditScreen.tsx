import { useMemo, useState } from 'react'
import { Platform, Pressable, ScrollView, TextInput, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { areas, goalById, nextId, useStore } from '../state/store'
import type { AreaId } from '../model/types'
import { assistGoal } from '../model/ai'
import { font, radius, space, text, useTheme } from '../theme'
import { KLabel, Txt, Why } from '../ui/Txt'
import { Btn } from '../ui/Btn'
import { IconSpark, IconX } from '../ui/icons'
import { useIsDesktop } from '../shell/AppShell'

/* Creating a goal starts from wanting, not from configuring.
   The AI offer sharpens language; it never overwrites without a tap. */

export default function GoalEditScreen() {
  const params = useLocalSearchParams<{ areaId?: string; goalId?: string }>()
  const t = useTheme()
  const router = useRouter()
  const isDesktop = useIsDesktop()
  const insets = useSafeAreaInsets()
  const state = useStore()
  const updateGoal = useStore((s) => s.updateGoal)
  const addGoal = useStore((s) => s.addGoal)
  const existing = goalById(state, params.goalId)

  const [areaId, setAreaId] = useState<AreaId>(
    existing?.areaId ?? (params.areaId as AreaId) ?? 'personal',
  )
  const [title, setTitle] = useState(existing?.title ?? '')
  const [why, setWhy] = useState(existing?.why ?? '')
  const [evidence, setEvidence] = useState<string[]>(existing?.evidence ?? [])
  const [evidenceDraft, setEvidenceDraft] = useState('')
  const [focus, setFocus] = useState(existing?.focus ?? false)
  const [assistDismissed, setAssistDismissed] = useState(false)

  const assist = useMemo(() => (existing ? undefined : assistGoal(title)), [title, existing])
  const showAssist = !!assist && !assistDismissed && (assist.title !== title || (!why && !!assist.why))

  const focusCount = state.goals.filter((g) => g.focus).length
  const canFocus = existing?.focus || focusCount < 3

  function save() {
    const trimmed = title.trim()
    if (!trimmed) return
    if (existing) {
      updateGoal(existing.id, {
        title: trimmed,
        why: why.trim() || undefined,
        evidence,
        areaId,
        focus,
      })
      router.back()
    } else {
      const id = nextId('goal')
      addGoal({
        id,
        areaId,
        title: trimmed,
        why: why.trim() || undefined,
        evidence: evidence.length ? evidence : undefined,
        focus: focus && canFocus,
        hoursPerWeek: focus ? 3 : undefined,
      })
      router.replace(`/goal/${id}`)
    }
  }

  const inputBase = {
    color: t.ink,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null),
  }

  return (
    <ScrollView
      contentContainerStyle={{
        padding: isDesktop ? space.s8 : space.s5,
        paddingTop: isDesktop ? space.s8 : Math.max(space.s6, insets.top + space.s3),
        paddingBottom: 140,
        alignItems: 'center',
      }}
    >
      <View style={{ width: '100%', maxWidth: 600, gap: space.s5 }}>
        <KLabel>{existing ? 'Edit goal' : 'New goal'}</KLabel>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {areas.map((a) => {
            const on = a.id === areaId
            return (
              <Pressable
                key={a.id}
                onPress={() => setAreaId(a.id)}
                style={{
                  paddingVertical: 5,
                  paddingHorizontal: 13,
                  borderRadius: radius.full,
                  backgroundColor: on ? t.ink : 'transparent',
                  borderWidth: on ? 0 : 1,
                  borderColor: t.line,
                }}
              >
                <Txt size={text.sm} weight="medium" color={on ? t.canvas : t.ink2}>
                  {a.name}
                </Txt>
              </Pressable>
            )
          })}
        </View>

        <TextInput
          placeholder="What do you want to change?"
          placeholderTextColor={t.ink4}
          value={title}
          autoFocus={isDesktop}
          onChangeText={(v) => {
            setTitle(v)
            setAssistDismissed(false)
          }}
          style={[
            inputBase,
            {
              fontFamily: font.bold,
              fontSize: isDesktop ? 27 : 23,
              letterSpacing: -0.6,
              paddingVertical: space.s2,
              borderBottomWidth: 1,
              borderBottomColor: t.line,
            },
          ]}
        />

        {showAssist && assist && (
          <View
            style={{
              backgroundColor: t.accentSoft,
              borderWidth: 1,
              borderStyle: 'dashed',
              borderColor: t.accentLine,
              borderRadius: radius.md,
              padding: space.s4,
              gap: space.s3,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <IconSpark size={14} color={t.accentInk} strokeWidth={1.6} />
                <KLabel color={t.accentInk}>Make it yours</KLabel>
              </View>
              <Pressable onPress={() => setAssistDismissed(true)} hitSlop={8}>
                <IconX size={14} color={t.ink3} />
              </Pressable>
            </View>
            <Pressable
              onPress={() => {
                setTitle(assist.title)
                if (!why) setWhy(assist.why)
                if (evidence.length === 0) setEvidence(assist.evidence)
                setAssistDismissed(true)
              }}
              style={{ gap: space.s2 }}
            >
              <Txt size={text.lg} weight="semibold" style={{ letterSpacing: -0.2 }}>
                “{assist.title}”
              </Txt>
              <Why color={t.ink2}>{assist.why}</Why>
              <Txt size={text.sm} color={t.ink3}>
                {assist.evidence.join('  ·  ')}
              </Txt>
              <Txt size={text.sm} weight="semibold" color={t.accentInk} style={{ marginTop: space.s1 }}>
                Use this as a starting point
              </Txt>
            </Pressable>
          </View>
        )}

        <View style={{ gap: space.s2 }}>
          <KLabel>Why this matters</KLabel>
          <TextInput
            placeholder="One honest sentence. Not a business case."
            placeholderTextColor={t.ink4}
            value={why}
            onChangeText={setWhy}
            multiline
            style={[
              inputBase,
              {
                fontFamily: font.editorial,
                fontSize: text.lg,
                lineHeight: text.lg * 1.5,
                paddingVertical: space.s1,
                paddingBottom: space.s2,
                borderBottomWidth: 1,
                borderBottomColor: t.lineFaint,
              },
            ]}
          />
        </View>

        <View style={{ gap: space.s2 }}>
          <KLabel>How I’ll know · optional</KLabel>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
            {evidence.map((e) => (
              <View
                key={e}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 5,
                  borderWidth: 1,
                  borderColor: t.lineStrong,
                  borderRadius: radius.full,
                  paddingVertical: 3,
                  paddingHorizontal: 10,
                }}
              >
                <Txt size={text.xs} weight="medium">
                  {e}
                </Txt>
                <Pressable
                  onPress={() => setEvidence((list) => list.filter((x) => x !== e))}
                  hitSlop={6}
                  accessibilityLabel={`Remove ${e}`}
                >
                  <IconX size={11} color={t.ink4} />
                </Pressable>
              </View>
            ))}
            <TextInput
              placeholder={evidence.length ? 'Add another…' : 'e.g. 10 strict pull-ups'}
              placeholderTextColor={t.ink4}
              value={evidenceDraft}
              onChangeText={setEvidenceDraft}
              onSubmitEditing={() => {
                if (evidenceDraft.trim()) {
                  setEvidence((list) => [...list, evidenceDraft.trim()])
                  setEvidenceDraft('')
                }
              }}
              blurOnSubmit={false}
              style={[
                inputBase,
                { fontFamily: font.regular, fontSize: text.sm, minWidth: 160, paddingVertical: 4 },
              ]}
            />
          </View>
        </View>

        <Pressable
          onPress={() => (canFocus || focus) && setFocus((f) => !f)}
          disabled={!canFocus && !focus}
          accessibilityRole="switch"
          accessibilityState={{ checked: focus }}
          style={{
            flexDirection: 'row',
            gap: space.s3,
            paddingVertical: space.s3,
            opacity: !canFocus && !focus ? 0.6 : 1,
          }}
        >
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              borderWidth: 1.5,
              borderColor: focus ? t.accent : t.lineStrong,
              backgroundColor: focus ? t.accent : 'transparent',
              marginTop: 1,
            }}
          />
          <View style={{ flex: 1, gap: 1 }}>
            <Txt weight="semibold">Give it focus now</Txt>
            <Txt size={text.sm} color={t.ink3}>
              {canFocus || focus
                ? 'It will get deliberate time each week.'
                : 'Three things already have your focus — swap one out first.'}
            </Txt>
          </View>
        </Pressable>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s3, paddingTop: space.s2 }}>
          <Btn label={existing ? 'Save' : 'Create goal'} onPress={save} disabled={!title.trim()} />
          <Btn variant="quiet" label="Cancel" onPress={() => router.back()} />
        </View>
      </View>
    </ScrollView>
  )
}
