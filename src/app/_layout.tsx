import { useEffect } from 'react'
import { View } from 'react-native'
import { Slot } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter'
import { Fraunces_400Regular_Italic } from '@expo-google-fonts/fraunces'
import { ThemeProvider, useTheme } from '../theme'
import { AppShell } from '../shell/AppShell'

SplashScreen.preventAutoHideAsync().catch(() => {})

function Root() {
  const t = useTheme()
  return (
    <View style={{ flex: 1, backgroundColor: t.canvas }}>
      <StatusBar style="auto" />
      <AppShell>
        <Slot />
      </AppShell>
    </View>
  )
}

export default function Layout() {
  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Fraunces_400Regular_Italic,
  })

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync().catch(() => {})
  }, [loaded])

  if (!loaded) return null

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Root />
      </ThemeProvider>
    </SafeAreaProvider>
  )
}
