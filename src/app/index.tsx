import { Redirect } from 'expo-router'
import { useIsDesktop } from '../shell/AppShell'

/* The primary destination: the week on a large surface, the day in hand. */
export default function Index() {
  const isDesktop = useIsDesktop()
  return <Redirect href={isDesktop ? '/week' : '/today'} />
}
