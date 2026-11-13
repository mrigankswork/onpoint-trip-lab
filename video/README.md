# Onpoint Trip Lab: 60-second demo film

A Remotion project. 1920 × 1080, 30 fps, 1,800 frames, plus a 1080 × 1920 cut of the same scenes.
The footage on the phone is recorded from the real prototype, not mocked.

## Make it

```bash
# 1. Record the clips from the prototype (from the repo root)
npm run build && npx vite preview --port 4173      # leave running
node scripts/capture.mjs                           # writes ./captures
cp captures/*.mp4 video/public/clips/ && cp captures/wrapped_card.png video/public/

# 2. Render (from ./video)
npm install
npm run render             # out/onpoint-demo.mp4
npm run render:vertical    # out/onpoint-demo-vertical.mp4
npm run studio             # preview and scrub
```

## Sound

All three layers are generated locally, so there is nothing to license.

- **Music:** `python3 audio/music.py` synthesizes `public/music.mp3`, an original 120 BPM bed. At 120 BPM every storyboard scene change lands on a beat. To use another track, replace the file.
- **Voiceover:** `node audio/voiceover.mjs` speaks the lines with the macOS system voice Samantha and writes `public/voiceover.mp3`. Edit the lines, voice or rate at the top of that file. If timings change, update `VO` in `src/constants.ts` so the music ducks in the right places.
- **Effects:** `public/sfx/*.wav` (tap, whoosh, chime, pop).

`npm run render` uses the music and voiceover when the files exist. Music plays at 0.6 and ducks to 0.25 under each spoken line.

## Where things are

| File | What it holds |
| --- | --- |
| `src/constants.ts` | Every number, colour, end-card line and scene frame range. Set `END.team` and `END.link` here. |
| `src/Film.tsx` | The timeline: clip placement, the camera keyframes, and each scene's text. |
| `src/Phone.tsx` | The phone body. The status bar and Dynamic Island come from the footage. |
| `src/kit.tsx` | Background, Title, Callout, Pill, Sticker, AvatarBubble, MonthChip, Confetti. |
| `src/EndCard.tsx` | The end card. |

Clips run faster than real time where a demo step is longer than its storyboard slot (1.4× to 1.65×). The rates are in `CLIPS` in `src/Film.tsx`.
