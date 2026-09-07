import { createContext, useContext, type ReactNode } from 'react'
import { useColorScheme } from 'react-native'
import { dark, light, type Palette } from './tokens'

export { space, radius, text, font } from './tokens'
export type { Palette } from './tokens'

const ThemeContext = createContext<Palette>(light)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const scheme = useColorScheme()
  return (
    <ThemeContext.Provider value={scheme === 'dark' ? dark : light}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): Palette {
  return useContext(ThemeContext)
}
