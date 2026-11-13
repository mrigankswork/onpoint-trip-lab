// Renders a composition, switching on music and voiceover if the files are in public/.
// Usage: node render.mjs [OnpointDemo|OnpointDemoVertical] [out file]
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const id = process.argv[2] ?? 'OnpointDemo';
const out = process.argv[3] ?? (id === 'OnpointDemo' ? 'out/onpoint-demo.mp4' : 'out/onpoint-demo-vertical.mp4');
const props = { music: fs.existsSync('public/music.mp3'), voiceover: fs.existsSync('public/voiceover.mp3'), sfx: true };
console.log(id, '->', out, props);
execFileSync('npx', ['remotion', 'render', 'src/index.ts', id, out, `--props=${JSON.stringify(props)}`, '--codec=h264', '--crf=18'], { stdio: 'inherit' });
