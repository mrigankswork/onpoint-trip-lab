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

- `public/sfx/*.wav` are simple synthesized effects (tap, whoosh, chime, pop).
- Music is not included. Put a royalty-free track at `public/music.mp3` and render again; it plays at 0.6 and fades out on the end card.
- A voiceover at `public/voiceover.mp3` is picked up the same way, and ducks the music to 0.25.

## Where things are

| File | What it holds |
| --- | --- |
| `src/constants.ts` | Every number, colour, end-card line and scene frame range. Set `END.team` and `END.link` here. |
| `src/Film.tsx` | The timeline: clip placement, the camera keyframes, and each scene's text. |
| `src/Phone.tsx` | The phone body. The status bar and Dynamic Island come from the footage. |
| `src/kit.tsx` | Background, Title, Callout, Pill, Sticker, AvatarBubble, MonthChip, Confetti. |
| `src/EndCard.tsx` | The end card. |

Clips run faster than real time where a demo step is longer than its storyboard slot (1.4× to 1.65×). The rates are in `CLIPS` in `src/Film.tsx`.
