# Onpoint Trip Lab

*Concept prototype for the Ascend 3.0 case competition. Not affiliated with or endorsed by Onpoints Rewards Pvt Ltd. All user data is fictional.*

A clickable prototype of the Onpoint app with one switch: **Today / With TRIP**. It shows the same user, Riya, going from a trip that is about 17 months away to a first unlock in about 3 months. It is a static web app with two views and a switch between them:

- **The app**: what Riya sees. Full-screen on a phone; inside an iPhone 18 Pro-sized frame (402 × 874 points) on its background on desktop. It opens with onboarding (welcome, pick the trip, who's coming, your plan) and then drops into the main app, with a short guide to its four parts.
- **Trip Lab**: why it works. What each screen proves, plus the Calculator, Growth model and Assumptions behind every number.

On desktop the switch is in the top bar. On a phone, tap **Lab** at the top left of the app, and **Back to the app** in the Lab.

**Dark mode** is part of the app itself: the moon button at the top left of the phone (desktop), or the switch in Profile. The Trip Lab stays light. The dark values are in `src/styles/tokens.css` under `[data-theme='dark']`.

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
  components/    PhoneFrame, PhoneScreen, LabView, ViewSwitch, ModeSwitch, MonthSlider, ProgressBar,
                 RouteLine, DropCard, TrackingTimeline, SquadStrip, Sheet, Toast, SourceTag, Disclaimer
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

- **Bonuses land when they happen.** The live balance counts the welcome bonus and each referral only once it has landed in the story. Forecasts (3.3 and 7.5 months) always assume the full squad. Outside demo mode the whole squad counts as joined once onboarding is done, so the deck numbers show; in demo mode Aarav joins on screen in step 9.
- **What the browser remembers.** Mode, month, the chosen trip, light or dark, and whether onboarding is done, in `localStorage`, so a refresh does not restart onboarding. "Start over from onboarding" in Profile resets it. Demo mode never reads or writes it.
- **Every button answers.** Nothing real is bought or transferred. "Transfer" in Today mode shows a simulated result, and "How many points do I need for a flight?" opens a sheet that states what today's app cannot tell Riya, using the engine's own numbers.
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
| `/` | Normal use. Opens on onboarding the first time, then on the app's Home. |
| `/#/team` | Opens the Trip Lab on the Calculator. |
| `/?demo=1` | Demo mode: scripted walkthrough, about 106 seconds. |
| `/?layout=landscape` | Phone and Trip Lab side by side on a 16:9 canvas (fills a 1920 × 1080 window). Recording only. |
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
- [x] Works at 360px wide, in a short 1280 × 680 window and in a 1440px desktop window.
- [x] No real brand logos, no photos of people, disclaimer on every screen and in Profile.
- [x] Lighthouse mobile performance 90+ (96 on the local production build).
- [ ] Mobile Safari and a real Android phone: not yet checked by hand. Checked in headless Chrome only.

## Recording clips for the demo film

Three more URL options, used by `scripts/capture.mjs`:

- `?layout=bare`: the app screen alone at the full viewport, with its status bar and safe areas, no phone frame.
- `?captions=0`: hides the demo captions and the progress line.
- `?demo=1&scene=N`: plays demo step N on its own and stops when it ends.

`node scripts/capture.mjs` records one clip per step into `./captures` (needs the preview server on port 4173, Chrome and ffmpeg). The film itself is in `./video`; see `video/README.md`.
