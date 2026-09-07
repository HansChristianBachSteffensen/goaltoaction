import { StyleSheet, View } from 'react-native'
import Svg, {
  Circle,
  Defs,
  Ellipse,
  LinearGradient,
  Path,
  Polygon,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg'

/* Atmospheric artwork for aspirational moments — abstract editorial
   scenes (dawn training, morning light, a warm room, an open field)
   rendered as universal SVG so they ship identically on iOS, Android
   and web. Imagery recedes behind a scrim wherever text sits on top. */

export type GoalArtKey = 'body' | 'business' | 'livingroom' | 'family'

export function GoalArt({
  art,
  scrim = 'bottom',
  scrimStrength = 0.92,
}: {
  art: GoalArtKey
  scrim?: 'bottom' | 'left' | 'none'
  scrimStrength?: number
}) {
  return (
    <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]} pointerEvents="none">
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
      >
        {art === 'body' && <Body />}
        {art === 'business' && <Business />}
        {art === 'livingroom' && <LivingRoom />}
        {art === 'family' && <Family />}
        {scrim !== 'none' && (
          <>
            <Defs>
              <LinearGradient
                id="scrim"
                x1="0"
                y1={scrim === 'bottom' ? '0' : '0'}
                x2={scrim === 'bottom' ? '0' : '1'}
                y2={scrim === 'bottom' ? '1' : '0'}
              >
                <Stop offset="0" stopColor="#100e0c" stopOpacity={scrim === 'bottom' ? 0.42 : scrimStrength} />
                <Stop offset="0.55" stopColor="#100e0c" stopOpacity={scrim === 'bottom' ? 0.62 : 0.5} />
                <Stop offset="1" stopColor="#100e0c" stopOpacity={scrim === 'bottom' ? scrimStrength : 0.12} />
              </LinearGradient>
            </Defs>
            <Rect width="1600" height="900" fill="url(#scrim)" />
          </>
        )}
      </Svg>
    </View>
  )
}

function Body() {
  return (
    <>
      <Defs>
        <LinearGradient id="bodySky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#0d0c10" />
          <Stop offset="0.52" stopColor="#241a1c" />
          <Stop offset="0.74" stopColor="#5a2e21" />
          <Stop offset="0.86" stopColor="#a44f27" />
          <Stop offset="1" stopColor="#12100e" />
        </LinearGradient>
        <RadialGradient id="bodySun" cx="0.62" cy="0.82" r="0.45">
          <Stop offset="0" stopColor="#ffb46b" stopOpacity="0.85" />
          <Stop offset="0.35" stopColor="#e07a3a" stopOpacity="0.35" />
          <Stop offset="1" stopColor="#e07a3a" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect width="1600" height="900" fill="url(#bodySky)" />
      <Rect width="1600" height="900" fill="url(#bodySun)" />
      <Ellipse cx="990" cy="742" rx="74" ry="74" fill="#ffce9e" opacity="0.9" />
      <Rect y="760" width="1600" height="140" fill="#0c0a09" />
      <Path d="M0 760 L1600 760" stroke="#f2a05f" strokeOpacity="0.35" strokeWidth="1.5" />
      <Path
        d="M330 760 l26 -74 a7 7 0 0 1 13 0 l9 26 l10 -14 a6 6 0 0 1 11 2 l14 60 z"
        fill="#0c0a09"
      />
    </>
  )
}

function Business() {
  return (
    <>
      <Defs>
        <LinearGradient id="bizRoom" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#101318" />
          <Stop offset="0.5" stopColor="#1d232c" />
          <Stop offset="1" stopColor="#3a3630" />
        </LinearGradient>
        <LinearGradient id="bizBeam" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#f4d9a8" stopOpacity="0" />
          <Stop offset="0.5" stopColor="#f4d9a8" stopOpacity="0.32" />
          <Stop offset="1" stopColor="#f4d9a8" stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Rect width="1600" height="900" fill="url(#bizRoom)" />
      <Polygon points="900,0 1600,0 1600,900 500,900" fill="url(#bizBeam)" />
      <Rect x="120" y="620" width="1360" height="10" fill="#0b0d10" opacity="0.85" />
      <Rect x="330" y="630" width="14" height="270" fill="#0b0d10" opacity="0.85" />
      <Rect x="1240" y="630" width="14" height="270" fill="#0b0d10" opacity="0.85" />
      <Rect x="620" y="520" width="260" height="100" rx="6" fill="#12151a" />
      <Rect x="630" y="530" width="240" height="80" rx="4" fill="#e8ddc4" opacity="0.14" />
      <Circle cx="1090" cy="565" r="42" fill="#0e1013" />
      <Rect x="1082" y="565" width="16" height="58" fill="#0e1013" />
    </>
  )
}

function LivingRoom() {
  return (
    <>
      <Defs>
        <LinearGradient id="lrWall" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#2a221a" />
          <Stop offset="0.6" stopColor="#4a3a2a" />
          <Stop offset="1" stopColor="#1c1712" />
        </LinearGradient>
        <RadialGradient id="lrGlow" cx="0.72" cy="0.42" r="0.5">
          <Stop offset="0" stopColor="#ffd9a0" stopOpacity="0.75" />
          <Stop offset="0.4" stopColor="#e8a860" stopOpacity="0.22" />
          <Stop offset="1" stopColor="#e8a860" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect width="1600" height="900" fill="url(#lrWall)" />
      <Rect width="1600" height="900" fill="url(#lrGlow)" />
      <Ellipse cx="1152" cy="330" rx="66" ry="40" fill="#0f0c09" />
      <Rect x="1148" y="366" width="8" height="300" fill="#0f0c09" />
      <Path d="M1030 666 h250" stroke="#0f0c09" strokeWidth="10" strokeLinecap="round" />
      <Rect x="270" y="560" width="520" height="150" rx="26" fill="#141009" />
      <Rect x="250" y="530" width="90" height="180" rx="26" fill="#171209" />
      <Rect x="710" y="530" width="90" height="180" rx="26" fill="#171209" />
      <Rect x="0" y="710" width="1600" height="190" fill="#0d0a07" />
      <Ellipse cx="640" cy="770" rx="420" ry="34" fill="#241a10" />
    </>
  )
}

function Family() {
  return (
    <>
      <Defs>
        <LinearGradient id="famField" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#c9b98a" />
          <Stop offset="0.45" stopColor="#a58f5c" />
          <Stop offset="0.72" stopColor="#5c5433" />
          <Stop offset="1" stopColor="#23200f" />
        </LinearGradient>
        <RadialGradient id="famHaze" cx="0.5" cy="0.3" r="0.6">
          <Stop offset="0" stopColor="#f7ecc8" stopOpacity="0.8" />
          <Stop offset="1" stopColor="#f7ecc8" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect width="1600" height="900" fill="url(#famField)" />
      <Rect width="1600" height="900" fill="url(#famHaze)" />
      <Path
        d="M708 900 l14 -180 a9 9 0 0 1 18 0 l8 74 l8 -50 a8 8 0 0 1 16 0 l12 156 z"
        fill="#161307"
      />
      <Circle cx="731" cy="694" r="17" fill="#161307" />
      <Path
        d="M800 900 l10 -122 a7 7 0 0 1 14 0 l6 48 l6 -34 a6 6 0 0 1 12 1 l9 107 z"
        fill="#161307"
      />
      <Circle cx="817" cy="756" r="13" fill="#161307" />
      <Path d="M0 880 q400 -46 800 -40 q400 6 800 40 l0 20 l-1600 0 z" fill="#14110a" />
    </>
  )
}
