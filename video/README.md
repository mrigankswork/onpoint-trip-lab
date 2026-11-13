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
npm run render             # both cuts, with voice and music
npm run studio             # preview and scrub
```

## Sound

- **Voice:** Kokoro TTS (open source, runs locally), voice `af_heart`. `npm run voice -- af_heart` writes `public/vo/01.wav` … `10.wav` and `src/voLines.json`, which the film reads to place each line and duck the music. Lines and start times are at the top of `audio/tts.py`. Setup: `python3.11 -m venv audio/.venv && audio/.venv/bin/pip install kokoro-onnx soundfile`, then download `kokoro-v1.0.onnx` and `voices-v1.0.bin` from the kokoro-onnx GitHub releases into `audio/models/`.
- **Music:** `public/music.mp3` is "Avec Soin" by Kevin MacLeod (incompetech.com), licensed under CC BY 3.0. The credit is on the end card and must stay with the video wherever it is posted.
- **Effects:** `public/sfx/*.wav` (tap, whoosh, chime, pop).
- **Levels** are in `MIX` in `src/constants.ts`: music 0.35, ducking to 0.12 under a voice line over 8 frames, 1s fade in, 2s fade out, effects 0.25.

`npm run render` writes `out/onpoint-demo-vo.mp4` and `out/onpoint-demo-vo-vertical.mp4` and normalises each mix with ffmpeg's loudnorm.

## Where things are

| File | What it holds |
| --- | --- |
| `src/constants.ts` | Every number, colour, end-card line and scene frame range. Set `END.team` and `END.link` here. |
| `src/Film.tsx` | The timeline: clip placement, the camera keyframes, and each scene's text. |
| `src/Phone.tsx` | The phone body. The status bar and Dynamic Island come from the footage. |
| `src/kit.tsx` | Background, Title, Callout, Pill, Sticker, AvatarBubble, MonthChip, Confetti. |
| `src/EndCard.tsx` | The end card. |

Clips run faster than real time where a demo step is longer than its storyboard slot (1.4× to 1.65×). The rates are in `CLIPS` in `src/Film.tsx`.
