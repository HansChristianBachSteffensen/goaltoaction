import { useEffect, useState, type ReactNode } from 'react'
import { Platform, Pressable, View, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { usePathname, useRouter } from 'expo-router'
import { useStore, areas } from '../state/store'
import { font, radius, space, text, useTheme } from '../theme'
import { KLabel, Txt } from '../ui/Txt'
import { IconFocus, IconGoals, IconInbox, IconPlus, IconSun, IconWeek } from '../ui/icons'
import { Capture } from '../screens/Capture'
import { CoachPanel } from '../coach/CoachPanel'

export const DESKTOP_MIN_WIDTH = 768
export const COACH_MIN_WIDTH = 1240

export function useIsDesktop(): boolean {
  const { width } = useWindowDimensions()
  return width >= DESKTOP_MIN_WIDTH
}

export function useHasCoachPanel(): boolean {
  const { width } = useWindowDimensions()
  return width >= COACH_MIN_WIDTH
}

/* Three zones on desktop: compact rail, wide workspace, persistent coach.
   On mobile: full-bleed cards, three tabs, capture always in thumb reach. */

export function AppShell({ children }: { children: ReactNode }) {
  const t = useTheme()
  const isDesktop = useIsDesktop()
  const hasCoach = useHasCoachPanel()
  const pathname = usePathname()
  const router = useRouter()
  const [capturing, setCapturing] = useState(false)

  const immersive = pathname === '/focus'

  useEffect(() => {
    if (Platform.OS !== 'web') return
    function onKey(e: KeyboardEvent) {
      const el = e.target as HTMLElement
      if (el?.tagName === 'INPUT' || el?.tagName === 'TEXTAREA' || el?.isContentEditable) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'c') {
        e.preventDefault()
        setCapturing(true)
      } else if (e.key === '1') router.push('/today')
      else if (e.key === '2') router.push('/week')
      else if (e.key === '3') router.push('/inbox')
      else if (e.key === 'Escape') setCapturing(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [router])

  if (immersive) {
    return (
      <View style={{ flex: 1, backgroundColor: t.canvas }}>
        {children}
        {capturing && <Capture onClose={() => setCapturing(false)} />}
      </View>
    )
  }

  if (isDesktop) {
    return (
      <View style={{ flex: 1, flexDirection: 'row', backgroundColor: t.canvas }}>
        <Rail onCapture={() => setCapturing(true)} />
        <View style={{ flex: 1, minWidth: 0 }}>{children}</View>
        {hasCoach && <CoachPanel />}
        {capturing && <Capture onClose={() => setCapturing(false)} />}
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.canvas }}>
      <View style={{ flex: 1 }}>{children}</View>
      <TabBar />
      <Fab onPress={() => setCapturing(true)} />
      {capturing && <Capture onClose={() => setCapturing(false)} />}
    </View>
  )
}

/* ————— Desktop rail ————— */

function Rail({ onCapture }: { onCapture: () => void }) {
  const t = useTheme()
  const pathname = usePathname()
  const router = useRouter()
  const goals = useStore((s) => s.goals)
  const actions = useStore((s) => s.actions)
  const focus = goals.filter((g) => g.focus)
  const inboxCount = actions.filter((a) => a.status === 'inbox').length

  return (
    <View
      style={{
        width: 216,
        borderRightWidth: 1,
        borderRightColor: t.line,
        paddingVertical: space.s5,
        paddingHorizontal: space.s4,
        gap: space.s6,
        backgroundColor: t.canvas,
      }}
    >
      <Pressable onPress={() => router.push('/week')} style={{ paddingHorizontal: space.s2 }}>
        <Txt size={19} weight="black" style={{ letterSpacing: 2.5 }}>
          NORTH
        </Txt>
      </Pressable>

      <Pressable
        onPress={onCapture}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          gap: space.s2,
          paddingVertical: 10,
          paddingHorizontal: 12,
          borderRadius: radius.sm + 2,
          backgroundColor: t.ink,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        })}
      >
        <IconPlus size={15} color={t.volt} strokeWidth={2.5} />
        <Txt size={text.sm} weight="bold" color={t.canvas} style={{ flex: 1 }}>
          Capture
        </Txt>
        <View
          style={{
            borderWidth: 1,
            borderColor: 'rgba(245,246,248,0.3)',
            borderRadius: 4,
            paddingHorizontal: 5,
          }}
        >
          <Txt size={text.xs} weight="semibold" color="rgba(245,246,248,0.6)">
            C
          </Txt>
        </View>
      </Pressable>

      <View style={{ gap: 3 }}>
        <RailLink
          label="Today"
          icon={IconSun}
          active={pathname === '/today'}
          onPress={() => router.push('/today')}
        />
        <RailLink
          label="This week"
          icon={IconWeek}
          active={pathname === '/week'}
          onPress={() => router.push('/week')}
        />
        <RailLink
          label="Inbox"
          icon={IconInbox}
          active={pathname === '/inbox'}
          onPress={() => router.push('/inbox')}
          badge={inboxCount || undefined}
        />
      </View>

      <View style={{ gap: 3 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: space.s2,
            paddingBottom: space.s1,
          }}
        >
          <KLabel>Focus</KLabel>
          <Pressable onPress={() => router.push('/focus')} hitSlop={8}>
            <IconFocus size={14} color={t.ink4} strokeWidth={2} />
          </Pressable>
        </View>
        {focus.map((g) => {
          const active = pathname === `/goal/${g.id}`
          return (
            <Pressable
              key={g.id}
              onPress={() => router.push(`/goal/${g.id}`)}
              style={{
                flexDirection: 'row',
                gap: 8,
                paddingVertical: 7,
                paddingHorizontal: space.s2,
                borderRadius: radius.sm,
                backgroundColor: active ? t.card : 'transparent',
                borderWidth: active ? 1 : 0,
                borderColor: t.lineFaint,
              }}
            >
              <View
                style={{
                  width: 4,
                  borderRadius: 2,
                  backgroundColor: t.volt,
                  alignSelf: 'stretch',
                }}
              />
              <Txt
                size={text.sm}
                weight={active ? 'bold' : 'semibold'}
                color={active ? t.ink : t.ink2}
                numberOfLines={2}
                style={{ flex: 1, lineHeight: text.sm * 1.3 }}
              >
                {g.title}
              </Txt>
            </Pressable>
          )
        })}
      </View>

      <View style={{ gap: 2 }}>
        <View style={{ paddingHorizontal: space.s2, paddingBottom: space.s1 }}>
          <KLabel>Life</KLabel>
        </View>
        {areas.map((a) => {
          const active = pathname === `/area/${a.id}`
          return (
            <Pressable
              key={a.id}
              onPress={() => router.push(`/area/${a.id}`)}
              style={{
                paddingVertical: 6,
                paddingHorizontal: space.s2,
                borderRadius: radius.sm,
                backgroundColor: active ? t.card : 'transparent',
                borderWidth: active ? 1 : 0,
                borderColor: t.lineFaint,
              }}
            >
              <Txt
                size={text.sm}
                weight={active ? 'bold' : 'semibold'}
                color={active ? t.ink : t.ink2}
              >
                {a.name}
              </Txt>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

function RailLink({
  label,
  icon: Icon,
  active,
  onPress,
  badge,
}: {
  label: string
  icon: (p: { size?: number | string; color?: string; strokeWidth?: number | string }) => React.ReactNode
  active: boolean
  onPress: () => void
  badge?: number
}) {
  const t = useTheme()
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 9,
        paddingHorizontal: space.s2,
        borderRadius: radius.sm,
        backgroundColor: active ? t.card : 'transparent',
        borderWidth: active ? 1 : 0,
        borderColor: t.lineFaint,
      }}
    >
      <Icon size={17} color={active ? t.accent : t.ink3} strokeWidth={active ? 2.2 : 1.9} />
      <Txt size={text.sm} weight={active ? 'bold' : 'semibold'} color={active ? t.ink : t.ink2}>
        {label}
      </Txt>
      {badge !== undefined && (
        <View
          style={{
            marginLeft: 'auto',
            backgroundColor: t.accent,
            borderRadius: radius.sm - 2,
            minWidth: 20,
            alignItems: 'center',
            paddingHorizontal: 5,
            paddingVertical: 1,
          }}
        >
          <Txt size={text.xs} weight="bold" color={t.onAccent}>
            {badge}
          </Txt>
        </View>
      )}
    </Pressable>
  )
}

/* ————— Mobile chrome ————— */

function TabBar() {
  const t = useTheme()
  const pathname = usePathname()
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const tabs = [
    { href: '/today', label: 'Today', icon: IconSun },
    { href: '/week', label: 'Week', icon: IconWeek },
    { href: '/goals', label: 'Goals', icon: IconGoals },
  ] as const

  const isTab = (href: string) =>
    pathname === href ||
    (href === '/goals' && (pathname.startsWith('/goal') || pathname.startsWith('/area')))

  return (
    <View
      style={{
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: t.line,
        backgroundColor: t.card,
        paddingTop: 8,
        paddingBottom: Math.max(10, insets.bottom),
        paddingHorizontal: space.s4,
      }}
    >
      {tabs.map((tab) => {
        const active = isTab(tab.href)
        const Icon = tab.icon
        return (
          <Pressable
            key={tab.href}
            onPress={() => router.push(tab.href)}
            style={{ flex: 1, alignItems: 'center', gap: 3, paddingVertical: 4 }}
          >
            <Icon size={21} color={active ? t.ink : t.ink4} strokeWidth={active ? 2.2 : 1.9} />
            <Txt size={text.xs} color={active ? t.ink : t.ink4} style={{ fontFamily: font.bold }}>
              {tab.label}
            </Txt>
          </Pressable>
        )
      })}
    </View>
  )
}

function Fab({ onPress }: { onPress: () => void }) {
  const t = useTheme()
  const insets = useSafeAreaInsets()
  return (
    <Pressable
      accessibilityLabel="Capture"
      onPress={onPress}
      style={({ pressed }) => ({
        position: 'absolute',
        right: space.s5,
        bottom: 70 + Math.max(10, insets.bottom),
        width: 56,
        height: 56,
        borderRadius: 18,
        backgroundColor: t.ink,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ scale: pressed ? 0.94 : 1 }],
        shadowColor: '#000',
        shadowOpacity: 0.28,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 6 },
        elevation: 8,
      })}
    >
      <IconPlus size={24} color={t.volt} strokeWidth={2.5} />
    </Pressable>
  )
}
