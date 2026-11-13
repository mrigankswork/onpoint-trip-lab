// Builds public/voiceover.mp3 from the lines below with the macOS system voice (Samantha, the classic Siri voice).
// Usage: node audio/voiceover.mjs   (macOS only; needs ffmpeg)
import { execFileSync } from 'node:child_process';

const VOICE = 'Samantha';
const RATE = 172; // words a minute
// [start second, line, seconds available before the next line]
const LINES = [
  [0.4, 'Riya earns rewards on almost everything she buys. But her trip is seventeen months away.', 9.2],
  [10.3, 'Same spend. New Onpoint.', 3.5],
  [14.3, 'She picks the trip first: Kasol, with her friends.', 7.5],
  [22.3, 'Now she sees progress in rupees. And Drops, funded by brands, double what she earns.', 6.5],
  [29.4, 'One order. Two hundred rupees closer.', 6.4],
  [36.3, 'Tracked live, at one rupee a point.', 4.5],
  [41.3, 'Her friends join. The goal becomes the group\'s.', 5.5],
  [47.3, 'Her stay unlocks in just over three months, not seventeen.', 5.5],
  [53.3, 'And it\'s worth sharing.', 3.5],
  [57.2, 'Onpoint. Your next weekend starts here.', 2.8],
];

const dur = (f) => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString());
const inputs = [];
const filters = [];
LINES.forEach(([at, text, room], i) => {
  const f = `audio/vo/${String(i).padStart(2, '0')}.aiff`;
  execFileSync('say', ['-v', VOICE, '-r', String(RATE), '-o', f, text]);
  const d = dur(f);
  console.log(`${at.toFixed(1)}s  ${d.toFixed(2)}s of ${room}s  ${d > room ? 'TOO LONG  ' : ''}${text}`);
  inputs.push('-i', f);
  filters.push(`[${i}]adelay=${Math.round(at * 1000)}:all=1[a${i}]`);
});
const mix = `${filters.join(';')};${LINES.map((_, i) => `[a${i}]`).join('')}amix=inputs=${LINES.length}:normalize=0,apad=whole_dur=60,loudnorm=I=-16:TP=-1.5:LRA=11[out]`;
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', mix, '-map', '[out]', '-t', '60', '-ar', '48000', '-b:a', '192k', 'public/voiceover.mp3']);
console.log('wrote public/voiceover.mp3', dur('public/voiceover.mp3').toFixed(2) + 's');
