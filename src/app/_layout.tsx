import { useEffect } from 'react'
import { View } from 'react-native'
import { Slot } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import {
  Archivo_400Regular,
  Archivo_500Medium,
  Archivo_500Medium_Italic,
  Archivo_600SemiBold,
  Archivo_700Bold,
  Archivo_800ExtraBold,
  Archivo_800ExtraBold_Italic,
  Archivo_900Black,
  useFonts,
} from '@expo-google-fonts/archivo'
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
    Archivo_400Regular,
    Archivo_500Medium,
    Archivo_500Medium_Italic,
    Archivo_600SemiBold,
    Archivo_700Bold,
    Archivo_800ExtraBold,
    Archivo_800ExtraBold_Italic,
    Archivo_900Black,
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
