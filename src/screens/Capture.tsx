import { useEffect, useRef, useState } from 'react'
import { KeyboardAvoidingView, Modal, Platform, Pressable, TextInput, View } from 'react-native'
import { useStore, areaName } from '../state/store'
import { suggestFor } from '../model/ai'
import { font, radius, space, text, useTheme } from '../theme'
import { Txt } from '../ui/Txt'
import { Btn } from '../ui/Btn'
import { IconSpark } from '../ui/icons'
import { useIsDesktop } from '../shell/AppShell'

/* Capture asks for nothing but the thought itself.
   Interpretation happens later, in the inbox. */

export function Capture({ onClose }: { onClose: () => void }) {
  const t = useTheme()
  const isDesktop = useIsDesktop()
  const goals = useStore((s) => s.goals)
  const capture = useStore((s) => s.capture)
  const [textValue, setTextValue] = useState('')
  const [saved, setSaved] = useState<string | null>(null)
  const inputRef = useRef<TextInput>(null)

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 60)
    return () => clearTimeout(timer)
  }, [])

  const suggestion = textValue.trim().length > 2 ? suggestFor({ title: textValue }) : undefined
  const suggestedGoal = suggestion?.goalId
    ? goals.find((g) => g.id === suggestion.goalId)
    : undefined

  function save() {
    const value = textValue.trim()
    if (!value) return
    capture(value)
    setSaved(value)
    setTextValue('')
    setTimeout(onClose, 850)
  }

  const panel = saved ? (
    <View style={{ gap: space.s1, paddingVertical: space.s2 }}>
      <Txt size={text.lg} weight="semibold">
        {saved}
      </Txt>
      <Txt size={text.sm} color={t.ink3}>
        Captured. It’s safe in your inbox.
      </Txt>
    </View>
  ) : (
    <>
      <TextInput
        ref={inputRef}
        placeholder="What’s on your mind?"
        placeholderTextColor={t.ink4}
        value={textValue}
        multiline={!isDesktop}
        onChangeText={setTextValue}
        onSubmitEditing={save}
        blurOnSubmit
        returnKeyType="done"
        style={{
          fontFamily: font.medium,
          fontSize: isDesktop ? 20 : 18,
          color: t.ink,
          paddingVertical: 4,
          ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null),
        }}
      />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: space.s4,
          gap: space.s3,
          minHeight: 24,
        }}
      >
        {suggestion ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
            <IconSpark size={14} color={t.accentDeep} strokeWidth={1.6} />
            <Txt size={text.sm} color={t.accentDeep} numberOfLines={1} style={{ flex: 1 }}>
              Looks like {suggestedGoal ? suggestedGoal.title : areaName(suggestion.areaId)} — sort
              it later
            </Txt>
          </View>
        ) : (
          <Txt size={text.sm} color={t.ink4}>
            Nothing else to decide
          </Txt>
        )}
        {!isDesktop && <Btn label="Capture" onPress={save} disabled={!textValue.trim()} />}
      </View>
    </>
  )

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose}>
      <Pressable
        style={{
          flex: 1,
          backgroundColor: t.scrim,
          justifyContent: isDesktop ? 'flex-start' : 'flex-end',
          alignItems: isDesktop ? 'center' : 'stretch',
          paddingTop: isDesktop ? '18%' : 0,
        }}
        onPress={onClose}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={isDesktop ? undefined : { width: '100%' }}
        >
          <Pressable
            onPress={() => {}}
            style={{
              width: isDesktop ? 560 : '100%',
              backgroundColor: t.card,
              borderTopLeftRadius: radius.lg,
              borderTopRightRadius: radius.lg,
              borderBottomLeftRadius: isDesktop ? radius.lg : 0,
              borderBottomRightRadius: isDesktop ? radius.lg : 0,
              padding: space.s5,
              paddingBottom: isDesktop ? space.s4 : space.s6,
              shadowColor: '#000',
              shadowOpacity: 0.2,
              shadowRadius: 32,
              shadowOffset: { width: 0, height: 10 },
              elevation: 12,
            }}
          >
            {panel}
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  )
}
