import { Pressable, View } from 'react-native'
import { font, radius, space, text, useTheme } from '../theme'
import type { Action, CalendarEvent } from '../model/types'
import { formatDuration, formatTime, toMinutes } from '../model/time'
import { NOW_MINUTES } from '../model/time'
import { Check } from './Check'
import { Txt } from './Txt'

/* List rows shared by Today, Goal, Area and Week screens.
   `big` = touch-first (mobile): taller row, time on the right.
   default = desktop density: time column on the left. */

export function ActionRow({
  action,
  onToggle,
  when,
  context,
  onPressContext,
  big = false,
}: {
  action: Action
  onToggle: () => void
  when?: string
  context?: string
  onPressContext?: () => void
  big?: boolean
}) {
  const t = useTheme()
  const done = action.status === 'done'
  const timeLabel =
    when ??
    (action.time ? formatTime(action.time) : '')

  if (big) {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: space.s3,
          paddingVertical: 13,
          minHeight: 48,
          borderBottomWidth: 1,
          borderBottomColor: t.lineFaint,
        }}
      >
        <Check done={done} onToggle={onToggle} size={24} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Txt
            weight="medium"
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
        <Txt size={text.sm} color={t.ink3}>
          {timeLabel || (action.duration ? formatDuration(action.duration) : '')}
        </Txt>
      </View>
    )
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.s3,
        paddingVertical: 10,
        paddingHorizontal: space.s2,
        borderBottomWidth: 1,
        borderBottomColor: t.lineFaint,
      }}
    >
      <Check done={done} onToggle={onToggle} size={20} />
      <Txt size={text.sm} color={t.ink3} style={{ width: 74, fontVariant: ['tabular-nums'] }}>
        {timeLabel}
      </Txt>
      <Txt
        weight="medium"
        numberOfLines={1}
        color={done ? t.ink3 : t.ink}
        style={[{ flex: 1 }, done ? { textDecorationLine: 'line-through' } : null]}
      >
        {action.title}
        {action.note ? (
          <Txt size={text.sm} color={t.ink3}>
            {'  ·  '}
            {action.note}
          </Txt>
        ) : null}
      </Txt>
      {context ? (
        <Pressable
          onPress={onPressContext}
          style={{
            backgroundColor: t.lineFaint,
            borderRadius: radius.full,
            paddingHorizontal: 8,
            paddingVertical: 2,
            maxWidth: 180,
          }}
        >
          <Txt size={text.xs} color={t.ink3} numberOfLines={1} style={{ fontFamily: font.medium }}>
            {context}
          </Txt>
        </Pressable>
      ) : null}
      <Txt
        size={text.sm}
        color={t.ink4}
        style={{ minWidth: 42, textAlign: 'right', fontVariant: ['tabular-nums'] }}
      >
        {action.duration ? formatDuration(action.duration) : ''}
      </Txt>
    </View>
  )
}

export function EventRow({ event, big = false }: { event: CalendarEvent; big?: boolean }) {
  const t = useTheme()
  const past = toMinutes(event.end) < NOW_MINUTES && event.day === '2026-09-08'

  if (big) {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: space.s3,
          paddingVertical: 13,
          minHeight: 48,
          borderBottomWidth: 1,
          borderBottomColor: t.lineFaint,
          opacity: past ? 0.45 : 1,
        }}
      >
        <View style={{ width: 24 }} />
        <Txt color={t.ink2} numberOfLines={1} style={{ flex: 1 }}>
          {event.title}
        </Txt>
        <Txt size={text.sm} color={t.ink3} style={{ fontVariant: ['tabular-nums'] }}>
          {formatTime(event.start)}
        </Txt>
      </View>
    )
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.s3,
        paddingVertical: 10,
        paddingHorizontal: space.s2,
        borderBottomWidth: 1,
        borderBottomColor: t.lineFaint,
        opacity: past ? 0.45 : 1,
      }}
    >
      <View style={{ width: 20 }} />
      <Txt size={text.sm} color={t.ink3} style={{ width: 74, fontVariant: ['tabular-nums'] }}>
        {formatTime(event.start)}
      </Txt>
      <Txt color={t.ink2} numberOfLines={1} style={{ flex: 1 }}>
        {event.title}
      </Txt>
      <Txt
        size={text.sm}
        color={t.ink4}
        style={{ minWidth: 42, textAlign: 'right', fontVariant: ['tabular-nums'] }}
      >
        {formatDuration(toMinutes(event.end) - toMinutes(event.start))}
      </Txt>
    </View>
  )
}
