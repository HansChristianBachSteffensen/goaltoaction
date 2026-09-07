# North

**What matters → what deserves focus now → what do I actually do?**

North is a working prototype of a goal-to-action product: a calm personal
operating system that connects meaning, focus, action and time. It is not a
task manager with goals bolted on — it starts one level higher and lets the
week, not the backlog, be where intentions become real.

## The product model

Three nouns, nothing else:

- **Area** — a permanent place in life (Health, Work, Home, Family, Money,
  Personal). Areas hold things; they are not goals and need no mission
  statement.
- **Goal** — an idea about how something should be, in your own words
  (*"Build a body I'm proud of"*). A goal may carry a **Why** (one honest,
  emotional sentence) and optional **How I'll know** evidence. Neither is
  required — *"Be someone my kids want to talk to"* is a complete goal.
- **Action** — anything that can actually be done. Actions belong to an
  Area, or to a Goal inside an Area. Mundane obligations never need a goal.

One property carries the product's point of view: **Focus**. Up to three
goals can be in focus at once, each with an approximate weekly time
intention. Focus decides where discretionary energy goes; it never makes
anything else disappear.

Everything else in the interface — **Today**, **This week**, **Inbox** — is
a view of time, not another object to maintain.

## The loop

Capture → decide (Inbox) → give the week what it gets → do today's few
things that matter. Capture asks for nothing but the thought itself; the
inbox is where interpretation happens, with transparent, reversible
suggestions ("Looks like the living room — Sat 10:00 · 45 min — three small
actions fit one quiet slot"). The week shows its finite reality: fixed
commitments, meetings, rhythms, and how much of each focus intention has
actually been given time.

## Running it

```bash
npm install
npm run web        # web (desktop + mobile web)
npm run ios        # iOS simulator
npm run android    # Android
```

The prototype lives in a fixed demo week (Mon 7 – Sun 13 September 2026,
"now" is Tuesday 07:40) so the seeded story is always coherent. State is
in-memory (Zustand) and resets on reload — intentional for a prototype.

On web, desktop gets keyboard shortcuts: `C` capture, `1` Today, `2` This
week, `3` Inbox.

## Architecture

Universal **Expo + React Native** app (iOS, Android, web) with one shared
product model and two deliberate presentations:

- `src/model/` — pure TypeScript domain: types, the fixed demo week,
  seeded realistic data, and the heuristic "AI" (`ai.ts`) that stands in
  for contextual intelligence. Every suggestion carries a human-readable
  reason and is only ever applied by an explicit user action.
- `src/state/store.ts` — Zustand store + pure selectors.
- `src/theme/` — design tokens for the performance direction: cool
  near-white canvas, white cards, near-black type, cobalt for decisions
  and the coach, volt for progress and focus energy; Archivo carries the
  whole type system (900 display, 800-italic stat numbers, 700 card
  titles). The dark palette is tuned, not inverted.
- `src/coach/` — the coach: derived intelligence computed from the user's
  actual goals, schedule and behavior. Every card carries a reason, one
  primary move is recommended at a time, and changes only happen through
  explicit user actions. On wide desktop it is a persistent right-hand
  panel; on mobile it lives at the top of Today.
- `src/ui/` — primitives: text styles (including the athletic Stat
  numeral), the check control (Reanimated pop + light haptic, volt mark on
  ink), cards, meters, buttons, and Tabler icons behind product-named
  wrappers.
- `src/shell/AppShell.tsx` — responsive chrome: compact rail + wide card
  workspace + persistent coach panel on desktop (≥1240px), three
  thumb-reach tabs + capture button on mobile.
- `src/screens/` — each screen adapts its layout per form factor while
  sharing all logic.
- `src/app/` — Expo Router routes (`/today`, `/week`, `/goals`, `/inbox`,
  `/focus`, `/goal/[id]`, `/area/[id]`, `/goal-new`).

### Dependency notes

Kept deliberately small, per the project's dependency discipline:
Expo Router, Reanimated (purposeful motion only), `react-native-svg` +
`@tabler/icons-react-native`, Zustand, `expo-haptics`, self-hosted Google
fonts. Styling uses the typed token module with RN `StyleSheet` — NativeWind
was considered and skipped: on this brand-new SDK the built-in styling did
the same job with zero toolchain risk, and the tokens keep it as systematic.
TanStack Query, form/validation and chart libraries were left out because
the prototype has no server state, no heavy forms, and nothing a 3-px time
meter doesn't communicate better than a chart.

### Visual QA

`scripts/shot.mjs` screenshots the running dev server at desktop and mobile
sizes, in light and dark (`node scripts/shot.mjs name --path /week
[--mobile] [--dark]`); `scripts/flow.mjs` walks the capture → suggest →
accept loop. Every screen in the prototype was reviewed against those
renders, both form factors, both themes.
