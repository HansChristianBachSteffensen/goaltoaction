import { useEffect, useState, type ReactNode } from 'react'
import { Platform, Pressable, View, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { usePathname, useRouter } from 'expo-router'
import { useStore, areas, focusGoals, inboxItems } from '../state/store'
import { font, radius, space, text, useTheme } from '../theme'
import { KLabel, Txt, Why } from '../ui/Txt'
import { IconFocus, IconGoals, IconInbox, IconPlus, IconSun, IconWeek } from '../ui/icons'
import { Capture } from '../screens/Capture'

export const DESKTOP_MIN_WIDTH = 768

export function useIsDesktop(): boolean {
  const { width } = useWindowDimensions()
  return width >= DESKTOP_MIN_WIDTH
}

/* One product, two presentations: a restrained sidebar on desktop,
   three thumb-reach tabs and an always-near capture button on mobile. */

export function AppShell({ children }: { children: ReactNode }) {
  const t = useTheme()
  const isDesktop = useIsDesktop()
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
        <Sidebar onCapture={() => setCapturing(true)} />
        <View style={{ flex: 1, minWidth: 0 }}>{children}</View>
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

/* ————— Desktop sidebar ————— */

function Sidebar({ onCapture }: { onCapture: () => void }) {
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
        width: 232,
        borderRightWidth: 1,
        borderRightColor: t.lineFaint,
        paddingVertical: space.s5,
        paddingLeft: space.s5,
        paddingRight: space.s4,
        gap: space.s6,
      }}
    >
      <Pressable onPress={() => router.push('/week')} style={{ paddingHorizontal: space.s2 }}>
        <Why size={20} color={t.ink}>
          North
        </Why>
      </Pressable>

      <Pressable
        onPress={onCapture}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: space.s2,
          paddingVertical: 8,
          paddingHorizontal: 10,
          borderRadius: radius.md,
          backgroundColor: t.surfaceRaised,
          borderWidth: 1,
          borderColor: t.lineFaint,
        }}
      >
        <IconPlus size={14} color={t.ink2} />
        <Txt size={text.sm} weight="medium" color={t.ink2} style={{ flex: 1 }}>
          Capture
        </Txt>
        <View
          style={{
            borderWidth: 1,
            borderColor: t.line,
            borderRadius: 4,
            paddingHorizontal: 5,
          }}
        >
          <Txt size={text.xs} color={t.ink4}>
            C
          </Txt>
        </View>
      </Pressable>

      <View style={{ gap: 2 }}>
        <SideLink
          label="Today"
          icon={<IconSun size={16} color={pathname === '/today' ? t.ink : t.ink3} strokeWidth={1.8} />}
          active={pathname === '/today'}
          onPress={() => router.push('/today')}
        />
        <SideLink
          label="This week"
          icon={<IconWeek size={16} color={pathname === '/week' ? t.ink : t.ink3} strokeWidth={1.8} />}
          active={pathname === '/week'}
          onPress={() => router.push('/week')}
        />
        <SideLink
          label="Inbox"
          icon={<IconInbox size={16} color={pathname === '/inbox' ? t.ink : t.ink3} strokeWidth={1.8} />}
          active={pathname === '/inbox'}
          onPress={() => router.push('/inbox')}
          badge={inboxCount || undefined}
        />
      </View>

      <View style={{ gap: 2 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: space.s2,
            paddingBottom: space.s2,
          }}
        >
          <KLabel>Focus</KLabel>
          <Pressable onPress={() => router.push('/focus')} hitSlop={8}>
            <IconFocus size={14} color={t.ink4} strokeWidth={1.8} />
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
                paddingVertical: 6,
                paddingHorizontal: space.s2,
                borderRadius: radius.sm,
                backgroundColor: active ? t.lineFaint : 'transparent',
              }}
            >
              <View
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 3,
                  backgroundColor: t.accent,
                  marginTop: 7,
                }}
              />
              <Txt
                size={text.sm}
                weight="medium"
                color={active ? t.ink : t.ink2}
                numberOfLines={2}
                style={{ flex: 1, lineHeight: text.sm * 1.35 }}
              >
                {g.title}
              </Txt>
            </Pressable>
          )
        })}
      </View>

      <View style={{ gap: 2 }}>
        <View style={{ paddingHorizontal: space.s2, paddingBottom: space.s2 }}>
          <KLabel>Life</KLabel>
        </View>
        {areas.map((a) => {
          const active = pathname === `/area/${a.id}`
          return (
            <Pressable
              key={a.id}
              onPress={() => router.push(`/area/${a.id}`)}
              style={{
                paddingVertical: 5,
                paddingHorizontal: space.s2,
                borderRadius: radius.sm,
                backgroundColor: active ? t.lineFaint : 'transparent',
              }}
            >
              <Txt
                size={text.sm}
                weight={active ? 'semibold' : 'medium'}
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

function SideLink({
  label,
  icon,
  active,
  onPress,
  badge,
}: {
  label: string
  icon: ReactNode
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
        paddingVertical: 7,
        paddingHorizontal: space.s2,
        borderRadius: radius.sm,
        backgroundColor: active ? t.lineFaint : 'transparent',
      }}
    >
      {icon}
      <Txt size={text.sm} weight={active ? 'semibold' : 'medium'} color={active ? t.ink : t.ink2}>
        {label}
      </Txt>
      {badge !== undefined && (
        <View
          style={{
            marginLeft: 'auto',
            backgroundColor: t.lineFaint,
            borderRadius: radius.full,
            paddingHorizontal: 7,
            paddingVertical: 1,
          }}
        >
          <Txt size={text.xs} weight="semibold" color={t.ink3}>
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
    pathname === href || (href === '/goals' && (pathname.startsWith('/goal') || pathname.startsWith('/area')))

  return (
    <View
      style={{
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: t.lineFaint,
        backgroundColor: t.canvas,
        paddingTop: 6,
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
            style={{ flex: 1, alignItems: 'center', gap: 2, paddingVertical: 4 }}
          >
            <Icon size={20} color={active ? t.ink : t.ink4} strokeWidth={1.8} />
            <Txt size={text.xs} color={active ? t.ink : t.ink4} style={{ fontFamily: font.medium }}>
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
        bottom: 64 + Math.max(10, insets.bottom),
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: t.ink,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ scale: pressed ? 0.94 : 1 }],
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 6 },
        elevation: 8,
      })}
    >
      <IconPlus size={22} color={t.canvas} strokeWidth={2.2} />
    </Pressable>
  )
}
