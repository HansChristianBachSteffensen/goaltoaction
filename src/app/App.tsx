import { useEffect, useState } from 'react'
import { StoreProvider } from '../model/store'
import { NavProvider } from './nav'
import DesktopShell from '../desktop/DesktopShell'
import MobileShell from '../mobile/MobileShell'

/* One product, two presentations. The mobile app is not the desktop
   app squeezed — it is its own shell over the same model. */

const MOBILE_QUERY = '(max-width: 767px)'

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches)
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY)
    const onChange = () => setIsMobile(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return isMobile
}

export default function App() {
  const isMobile = useIsMobile()
  return (
    <StoreProvider>
      {isMobile ? (
        <NavProvider initial={{ view: 'today' }}>
          <MobileShell />
        </NavProvider>
      ) : (
        <NavProvider initial={{ view: 'week' }}>
          <DesktopShell />
        </NavProvider>
      )}
    </StoreProvider>
  )
}
