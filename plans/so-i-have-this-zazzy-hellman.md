# Plan: Convert Brit Vibe DC Design to React App

## Context

The user has attached a Figma DC (Design Component) file for "Brit Vibe" — a British nightlife/events booking mobile app. The DC file uses a custom template runtime (`sc-if`, `sc-for`, `{{ }}` interpolations) backed by a JS `Component extends DCLogic` class. The goal is to convert it faithfully into a self-contained React app in `src/app/App.tsx`.

## Scope

**Screens (25+):**
- Splash → Onboarding (3 slides) → Login (phone+OTP) → Guest mode
- Profile setup → Interests → Device verify
- Home (featured snap-scroll, trending, for-you grid)
- Location picker, Featured list, Trending list, Category browse (with filter sheet)
- Event detail (3 variants: music/cinema/sports)
- Artist page, Venue page, Media/poster
- Booking: Tickets → Seats → Order summary → Checkout (countdown timer)
- Payment: Method picker → Card entry → Apple Pay sheet → Result (confetti)
- Ticket QR, PDF ticket, Booking history, Reviews

**No external routing library** — route state is a string (matching the DC pattern): `useState<string>` + history stack `useState<HistEntry[]>`.

## Files to modify

| File | Change |
|---|---|
| `src/styles/fonts.css` | Add Plus Jakarta Sans Google Fonts import |
| `src/styles/theme.css` | Update CSS variables to Brit Vibe dark palette (keep `@theme inline` contract) |
| `src/app/App.tsx` | Full replacement — complete React port of the DC component |

## Implementation approach

### 1. `fonts.css`
```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
```

### 2. `theme.css`
Map DC's dark theme tokens to the existing CSS variable names, preserving the `@theme inline` block structure:
- `--background` → `#1A1717` (dc: `--color-bg-base` dark)
- `--foreground` → `#FAF9F9`
- `--border` → `#5C5555`
- `--primary` → `#F13C38` (brand red)
- etc.

Keep all existing token names (`--background`, `--foreground`, `--card`, `--border`, `--primary`, etc.) so `bg-background`, `text-foreground`, `border-border` classes still compile.

Also inject the DC's own CSS variables (`:root` block with `--color-bg-base`, `--color-brand-primary`, etc.) so all the DC inline styles that reference `var(--color-*)` work.

### 3. `App.tsx` — structure

```
App (default export)
  ├── All constants (EVENTS, CITIES, CATS, etc.)
  ├── State (useState matching DC `state = {...}`)
  ├── Navigation helpers: go(), back(), toast()
  ├── All action handlers (onPhone, sendCode, toggleSave, etc.)
  ├── Derived/computed values (renderVals equivalent — computed inline before return)
  ├── Screen renders: each <sc-if> block → a React function or inline JSX
  └── Return: 390×844 phone frame + active screen + nav bar + toast
```

**Key translation rules:**
- `<sc-if value="{{ r_splash }}">` → `{route === '/' && (<div>...</div>)}`
- `<sc-for list="{{ items }}" as="item">` → `{items.map((item, i) => ...)}`
- `{{ variable }}` → `{variable}`
- `sc-camel-style="{{ styleString }}"` → `style={cssToObj(styleString)}` where `cssToObj` parses semicolon-separated CSS into a React style object
- `onClick="{{ handler }}"` → `onClick={handler}`

**Style handling:** Inline styles in the DC are already camelCase-ready. I'll write a small `css()` helper that parses `"key:val;key2:val2"` strings into `Record<string,string>` for cases where styles are dynamic string expressions. Static style props are written directly as JSX style objects.

**Gradient image fills:** Events use `fill = {position:'absolute', inset:0, background: linear-gradient(150deg, c1, c2)}` — replicated directly as inline style objects.

**QR code:** Port the `qr(seed)` function as-is (pure math, no DOM).

**Confetti:** Port the confetti array generation and CSS animation as-is.

**Countdown timer:** `useEffect` with `setInterval` when route is `/booking/checkout`.

**Splash auto-advance:** `useEffect` with `setTimeout` → navigate to `/onboarding`.

**Scroll-to-top:** `useRef` on the scroll container, reset on route change.

### Animations
Add keyframe CSS directly in `<style>` tag injected via a `<GlobalStyle>` or simply in `fonts.css`/`theme.css` additions. All animations (`spin`, `pulse`, `sheetUp`, `fadeUp`, `fade`, `confetti`, `pop`, `slideX`) are already defined in the DC's `<helmet>` styles — add them to `fonts.css`.

## Verification

After writing:
1. Run the dev server
2. Check splash screen animates and auto-navigates
3. Walk through: Onboarding → Login → Profile setup → Home
4. Tap Featured event → Booking flow → Payment result → View ticket QR
5. Confirm dark theme CSS variables resolve correctly (no white-on-white or missing colors)
