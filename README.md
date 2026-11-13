# Onpoint Trip Lab

*Concept prototype for the Ascend 3.0 case competition. Not affiliated with or endorsed by Onpoints Rewards Pvt Ltd. All user data is fictional.*

A clickable prototype of the Onpoint app with one switch: **Today / With TRIP**. It shows the same user, Riya, going from a trip that is about 17 months away to a first unlock in about 3 months. It is a static web app: full-screen on a phone, and a phone frame with a side panel on desktop.

## Run it locally

Needs Node 20 or newer.

```bash
npm install
npm run dev        # http://localhost:5173
npm run test       # locks every headline number
npm run build      # outputs to dist/
npm run preview    # serves dist/ at http://localhost:4173
```

## What is where

```
src/
  engine/        assumptions.ts (every number, tagged by source), calc.ts (all maths),
                 format.ts (display rounding only), calc.test.ts
  data/          persona, brands, destinations, squad, demoScript
  store/         useLab.ts (Zustand store + derive(), the one place screens get numbers from)
  components/    PhoneFrame, PhoneScreen, ModeSwitch, MonthSlider, ProgressBar, RouteLine,
                 DropCard, TrackingTimeline, SquadStrip, Sheet, Toast, SourceTag, Disclaimer
  screens/app/   TodayHome, TodayRedeem, Onboarding, Home, TripGoal, Shop, Checkout,
                 Tracking, Squad, Unlock, Wrapped, Profile
  screens/team/  Story, Calculator, Growth, Assumptions
  demo/          DemoController, CaptionOverlay
  styles/        tokens.css (brand colours; swap hexes here)
```

**Changing a number:** edit `src/engine/assumptions.ts` only. No screen hard-codes a figure. If you change a default, `npm run test` will fail on purpose until the deck and the tests agree again.

**Changing a colour:** edit `src/styles/tokens.css`. Each colour has a hex and a matching `-rgb` triplet; change both.

## Headline numbers (default settings)

| Output | Today | With TRIP |
| --- | --- | --- |
| Spend routed through Onpoint (₹/month) | 6,000 | 8,000 |
| Effective earn rate | 4% | 6% |
| Onpoints earned per month | 240 | 480 |
| One-time bonuses | 0 | 400 |
| Months to first unlock (Stay, ₹2,000) | no goal shown | 3.3 |
| Months to whole trip (₹4,000) | 16.7 | 7.5 |
| Margin per active user (₹/month) | 120 | 160 |
| Payback on one active user | — | 1.8 months |
| Active earners at month 12 | — | 16,328 |

## Modelling choices worth knowing

- **Bonuses land when they happen.** The live balance counts the welcome bonus and each referral only once it has landed in the story. Forecasts (3.3 and 7.5 months) always assume the full squad. Outside demo mode the app starts with everyone joined, so the deck numbers show.
- **Simulated orders are "pending".** A checkout adds a striped pending segment to the goal bar. It never changes the confirmed balance, which always equals `balance(month)` from the engine.
- **"Pending: 180 Onpoints" in Today mode** is derived: 75% of a month's earn (`pendingShare`, a Team assumption).
- **Squad rank** is computed from illustrative "Drops caught" counts in `src/data/squad.ts`, not from the earn maths. Every squad member earns like Riya, so pooling does not make points faster.
- **The Air India ratio is not shown.** We had no source for it, so the Today screen says "Ratio as per partner terms".

## Deploy to Vercel

The repo root is the project root, so Vercel needs no settings beyond the Vite preset.

**With the CLI**

```bash
npx vercel login
npx vercel --prod
```

**With GitHub:** push this repo, then "Add New Project" on vercel.com and import it. Framework preset: Vite. Build command: `npm run build`. Output directory: `dist`.

There are no environment variables, API calls or analytics. Routing uses the URL hash (`#/home`), and assets use relative paths, so the same `dist/` folder also works on GitHub Pages.

## URLs

| URL | What it does |
| --- | --- |
| `/` | Normal use. Phone layout under 900px wide, phone + side panel above. |
| `/#/team` | Team view on mobile (Calculator, Growth, Assumptions). |
| `/?demo=1` | Demo mode: scripted walkthrough, about 106 seconds. |
| `/?layout=landscape` | Phone + panel on a 16:9 canvas (fills a 1920 × 1080 window). |
| `/?layout=portrait` | Phone alone on a 9:16 canvas (fills a 1080 × 1920 window). |

Put `?demo=1` and `?layout=` before the `#`.

## Record the demo video

Demo mode drives the real app through real clicks; nothing is pre-recorded.

| Key | Action |
| --- | --- |
| → / ← | Next / previous step |
| Space | Play / pause autoplay |
| T | Flip Today / With TRIP |
| R | Reset to step 1 and month 0 |
| H | Hide / show captions |
| C | Hide / show the cursor |

**Landscape (main video)**

1. Open `?demo=1&layout=landscape` in a 1920 × 1080 browser window (full screen on a 1080p display works).
2. Start recording with OBS or the Mac screen recorder (Cmd + Shift + 5).
3. Click once on the page so it has keyboard focus, press **C** to hide the cursor, then **Space** to start.
4. The walkthrough stops by itself after step 12. The thin bar at the very top shows progress.

**Reels (portrait)**

Open `?demo=1&layout=portrait` in a 1080 × 1920 window. The easiest way is Chrome DevTools device mode with a custom 1080 × 1920 device. Then follow the same steps.

To change the script, edit `src/data/demoScript.ts`. Each step has a caption, a duration, a `setup` that puts the app in its starting state, and timed `tap` / `glide` actions.

## Acceptance checklist

- [x] `npm run test` passes, locking every headline number.
- [x] No number on any screen is typed by hand; all come from `calc.ts` via `derive()`.
- [x] Flipping modes lands on the matching screen with the same month.
- [x] Month slider updates every screen and both side-panel charts.
- [x] Every assumption shows its tag in Team view.
- [x] Demo mode runs steps 1–12 with no manual input in about 106 seconds.
- [x] Works at 360px wide and in a 1440px desktop window.
- [x] No real brand logos, no photos of people, disclaimer on every screen and in Profile.
- [x] Lighthouse mobile performance 90+ (96 on the local production build).
- [ ] Mobile Safari and a real Android phone: not yet checked by hand. Checked in headless Chrome only.
