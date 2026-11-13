// Renders both cuts with voice and music, then normalises each mix to about -14 LUFS.
// Usage: node render.mjs [OnpointDemo|OnpointDemoVertical]   (no argument renders both)
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const OUT = { OnpointDemo: 'out/onpoint-demo-vo.mp4', OnpointDemoVertical: 'out/onpoint-demo-vo-vertical.mp4' };
const ids = process.argv[2] ? [process.argv[2]] : Object.keys(OUT);
const props = { music: fs.existsSync('public/music.mp3'), voiceover: fs.existsSync('public/vo/01.wav'), sfx: true };
if (!props.music) console.warn('No public/music.mp3: rendering without music.');
if (!props.voiceover) console.warn('No public/vo/01.wav: rendering without voiceover. Run audio/tts.py first.');

for (const id of ids) {
  const raw = `out/${id}.raw.mp4`;
  execFileSync('npx', ['remotion', 'render', 'src/index.ts', id, raw, `--props=${JSON.stringify(props)}`, '--codec=h264', '--crf=18', '--log=error'], { stdio: 'inherit' });
  // Video is copied untouched; only the audio is normalised.
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', raw, '-c:v', 'copy', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '48000', '-c:a', 'aac', '-b:a', '256k', '-movflags', '+faststart', OUT[id]]);
  fs.rmSync(raw);
  console.log('wrote', OUT[id]);
}
