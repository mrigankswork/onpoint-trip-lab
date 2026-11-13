import React from 'react';
import { AbsoluteFill, Audio, Easing, Freeze, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { C, DURATION, FPS, MIX, N, S, SCREEN, T } from './constants';
import vo from './voLines.json';
import { EndCard } from './EndCard';
import { AvatarBubble, Background, Callout, Confetti, MonthChip, Pill, Sticker, Title, kf, useStage, window01 } from './kit';
import { Phone3D } from './Phone';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const XF = 6; // crossfade between clips, in frames

// Each clip: where it sits on the timeline, where it starts in the footage, and how fast it plays.
// Speeds above 1 fit a longer demo step into its storyboard slot.
const CLIPS: { file: string; from: number; to: number; start: number; rate: number; hold?: number }[] = [
  { file: '01_today', from: S.today[0], to: S.today[1], start: 0.25, rate: 1, hold: 60 },
  { file: '02_flip', from: S.flip[0], to: S.flip[1], start: 0.3, rate: 1 },
  { file: '03_onboarding', from: S.onboarding[0], to: S.onboarding[1], start: 0.6, rate: 1.65 },
  { file: '04_home_drop', from: S.home[0], to: S.home[1], start: 0.5, rate: 1 },
  { file: '05_checkout', from: S.checkout[0], to: S.checkout[1], start: 0.3, rate: 1.4 },
  { file: '06_tracking', from: S.tracking[0], to: S.tracking[1], start: 0.2, rate: 1.5 },
  { file: '07_squad', from: S.squad[0], to: S.squad[1], start: 0.8, rate: 1.5 },
  { file: '08_unlock', from: S.unlock[0], to: S.unlock[1], start: 0.6, rate: 1.45 },
  { file: '09_wrapped', from: S.wrapped[0], to: S.end[0] + 24, start: 0.5, rate: 1 },
];

const Footage: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      {CLIPS.map((c, i) => {
        const from = i === 0 ? c.from : c.from - XF;
        if (f < from || f >= c.to + XF) return null;
        const hold = c.hold ?? 0;
        const video = <OffthreadVideo src={staticFile(`clips/${c.file}.mp4`)} startFrom={Math.round(c.start * FPS)} playbackRate={c.rate} muted style={{ width: SCREEN.w, height: SCREEN.h }} />;
        return (
          <div key={c.file} style={{ position: 'absolute', inset: 0, opacity: i === 0 ? 1 : interpolate(f, [from, from + XF], [0, 1], clamp) }}>
            {f < from + hold ? <Freeze frame={0}>{video}</Freeze> : <Sequence from={from + hold} layout="none">{video}</Sequence>}
          </div>
        );
      })}
    </>
  );
};

export type FilmProps = { music: boolean; voiceover: boolean; sfx: boolean };

// Voice lines as [first frame, last frame], for ducking the music.
const LINES: [number, number][] = vo.lines.map((l: { start: number; length: number }) => [Math.round(l.start * FPS), Math.round((l.start + l.length) * FPS)]);

export const Film: React.FC<FilmProps> = ({ music, voiceover, sfx }) => {
  const f = useCurrentFrame();
  const { W, H, vertical: v } = useStage();
  const cx = W / 2;
  const cy = H / 2;
  const base = v ? 1.42 : 0.92;

  // ---- Camera: one phone, keyframed across the whole film ---------------------------------
  const x = v
    ? 0
    : kf(f, [[400, 0], [440, 400], [650, 400], [678, 0], [860, 0], [885, 330], [1070, 330], [1095, -250], [1220, -250], [1245, -420], [1400, -420], [1425, 0], [1585, 0], [1612, -540]]);
  const restY = v ? 90 : 0;
  const y = kf(f, [[150, H * 0.95], [190, v ? restY : -45], [395, v ? restY : -45], [425, restY]], Easing.out(Easing.cubic));
  const zRaw = kf(f, [[300, 1], [318, 1.8], [388, 1.8], [412, 1], [470, 1], [495, 1.15], [640, 1.15], [665, 1], [690, 1], [710, 1.7], [850, 1.7], [870, 1], [985, 1], [1000, 1.22], [1030, 1.22], [1050, 1], [1095, 1], [1222, 1.12], [1245, 1]]);
  // Vertical: only the flip zooms. Later zooms would run into the title above the phone.
  const z = v ? (f < 420 ? 1 + (zRaw - 1) * 0.55 : 1) : zRaw;
  const pullRaw = kf(f, [[300, 0], [318, 1], [388, 1], [412, 0], [470, 0], [495, 0.6], [640, 0.6], [665, 0], [690, 0], [710, 1], [850, 1], [870, 0], [985, 0], [1000, 1], [1030, 1], [1050, 0], [1095, 0], [1222, 0.5], [1245, 0]]);
  const pull = v && f >= 420 ? 0 : pullRaw;
  // The point on the screen (in app points) that a zoom brings to the middle.
  const fx = kf(f, [[745, 201], [765, 150], [869, 150], [870, 201]]);
  const fy = kf(f, [[420, 83], [421, 300], [689, 300], [690, 283], [745, 283], [765, 455], [869, 455], [870, 110], [1060, 110], [1061, 300]]);
  const scale = base * z;
  const drift = interpolate(f, [190, 230], [0, 1], clamp);
  const rotateX = kf(f, [[150, 25], [192, 0]], Easing.out(Easing.cubic)) + Math.sin(f / 47) * 1.1 * drift;
  const rotateY = kf(f, [[860, 0], [885, -8], [1070, -8], [1095, 0], [1590, 0], [1612, 14]]) + Math.sin(f / 61) * 1.6 * drift;
  const shake = f >= T.unlock && f < T.unlock + 12 ? Math.sin(f * 2.4) * 2 : 0;
  const px = cx + x - (fx - SCREEN.w / 2) * scale * pull + shake;
  const py = cy + y - (fy - SCREEN.h / 2) * scale * pull;
  const phoneOpacity = kf(f, [[1592, 1], [1614, 0.4], [1700, 0.4], [1716, 0]]);
  const flash = interpolate(f, [T.flipSwitch, T.flipSwitch + 16], [-0.4, 1.4], clamp);

  // A point on the resting phone (no zoom) in canvas coordinates.
  const at = (ox: number, sx: number, sy: number, oy = restY): [number, number] => [cx + ox + (sx - SCREEN.w / 2) * base, cy + oy + (sy - SCREEN.h / 2) * base];

  // ---- Text positions ---------------------------------------------------------------------
  const top = { x: 60, y: 185, width: W - 120, align: 'center' as const, size: 78 }; // vertical: above the phone
  const left = v ? top : { x: 130, y: cy, width: 800, align: 'left' as const, size: 92 };
  const right = v ? top : { x: 1070, y: cy, width: 760, align: 'left' as const, size: 88 };
  const low = v ? H - 150 : H - 92; // vertical: pills below the phone

  // ---- Sound ------------------------------------------------------------------------------
  const tapAt = (from: number, start: number, rate: number, ts: number[]) => ts.map((t) => Math.round(from + ((t + 0.26 - start) / rate) * FPS));
  const taps = [
    ...tapAt(S.today[0] + 60, 0.25, 1, [0.9]),
    T.flipTap,
    ...tapAt(S.onboarding[0], 0.6, 1.65, [1.8, 3.6, 5.2, 7.0, 8.6, 11.4]),
    ...tapAt(S.checkout[0], 0.3, 1.4, [0.8, 2.8, 5.4]),
    ...tapAt(S.squad[0], 0.8, 1.5, [1.5, 4.0]),
  ];
  const whooshes = [S.today[0], S.flip[0], S.onboarding[0], S.home[0], S.checkout[0], S.tracking[0], S.squad[0], S.unlock[0], S.wrapped[0]];

  const card = interpolate(f, [T.cardLift, T.cardLift + 30], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const cardH = interpolate(card, [0, 1], [SCREEN.w * 0.78 * (16 / 9) * base * 0.92, v ? 1180 : 900]);
  const cardX = interpolate(card, [0, 1], [px, v ? cx : cx + 470]);
  const cardY = interpolate(card, [0, 1], [py - 60 * base, v ? cy + 120 : cy]);

  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <Background glowX={px} glowY={py} glow={f < 150 ? 0 : phoneOpacity * interpolate(f, [150, 200], [0, 1], clamp)} />

      {/* 0:00 Intro */}
      <Title lines={[['Riya earns ', { t: N.earnToday, c: C.white }, ' Onpoints a month.']]} from={6} to={150} x={W * 0.08} y={cy - kf(f, [[62, 0], [78, v ? 110 : 80]])} width={W * 0.84} align="center" size={v ? 80 : 96} />
      <Title lines={[['Her trip? ', { t: `${N.tripToday} months`, c: C.orange }, ' away.']]} from={72} to={150} x={W * 0.08} y={cy + (v ? 60 : 50)} width={W * 0.84} align="center" size={v ? 80 : 96} />

      {f >= S.today[0] && f < S.end[0] + 24 && (
        <Phone3D x={px} y={py} scale={scale} rotateX={rotateX} rotateY={rotateY} opacity={phoneOpacity}>
          <Footage />
          {/* lime flash as the switch flips */}
          {f >= T.flipSwitch && f < T.flipSwitch + 16 && (
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(100deg, transparent ${flash * 100 - 30}%, ${C.lime}aa ${flash * 100}%, transparent ${flash * 100 + 30}%)` }} />
          )}
        </Phone3D>
      )}

      {/* 0:05 Today */}
      {v ? (
        <>
          <Pill text="Points." x={cx - 110} y={low} k={window01(f, 178, 236)} size={36} />
          <Pill text="Ratios." x={cx + 110} y={low} k={window01(f, 240, 296)} size={36} />
        </>
      ) : (
        <>
          <Callout from={178} to={236} ax={at(0, 34, 195, -45)[0]} ay={at(0, 34, 195, -45)[1]} lx={560} ly={at(0, 34, 195, -45)[1] - 30} text="Points." side="left" />
          <Callout from={240} to={296} ax={at(0, 372, 330, -45)[0]} ay={at(0, 372, 330, -45)[1]} lx={1360} ly={at(0, 372, 330, -45)[1] - 30} text="Ratios." />
        </>
      )}
      <Title lines={[['No trip in sight.']]} from={236} to={298} x={0} y={v ? 190 : H - 78} width={W} align="center" size={v ? 78 : 60} />

      {/* 0:10 Flip */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: v ? 0 : 460, background: `linear-gradient(transparent, ${C.ink} 62%)`, opacity: window01(f, 318, 412) }} />
      <Title lines={[['Same spend. ', { t: 'New Onpoint.', c: C.lime }]]} from={328} to={416} x={0} y={v ? 190 : H - 130} width={W} align="center" size={v ? 78 : 100} />

      {/* 0:14 Onboarding */}
      <Title lines={v ? [['Pick the trip, not'], ['the programme.']] : [['Pick the trip,'], ['not the'], ['programme.']]} sub={`Kasol with the gang · ${N.tripCost}`} from={438} to={654} {...left} />

      {/* 0:22 Home and Drops */}
      {v ? (
        <>
          <Title lines={[['Progress in rupees,'], ['not ratios.']]} from={704} to={752} {...top} />
          <Title lines={[['Brand-funded'], [{ t: '2x Drops.', c: C.orange }]]} from={766} to={860} {...top} />
        </>
      ) : (
        <>
          <Callout from={712} to={748} ax={cx + 270} ay={cy} lx={cx + 360} ly={cy - 70} text="Progress in rupees, not ratios." />
          <Callout from={770} to={852} ax={cx + 158} ay={cy} lx={cx + 440} ly={cy + 90} text="Brand-funded 2x Drops." />
        </>
      )}
      <Sticker text="2x" x={v ? cx + 330 : cx - 420} y={v ? cy - 300 : cy - 120} at={772} to={856} size={v ? 90 : 120} />

      {/* 0:29 Checkout */}
      <Title lines={[[{ t: N.orderGain, c: C.lime }, ' closer'], ['to Kasol.']]} from={v ? 960 : 890} to={1074} {...left} size={v ? 78 : 110} />

      {/* 0:36 Tracking */}
      {[
        ['Tracked live', 1104],
        ['₹1 per point, always', 1124],
      ].map(([text, start], i) => {
        const k = window01(f, start as number, 1226, 14, 8);
        return v ? (
          <Pill key={i} text={text as string} x={cx} y={150 + i * 96} k={k} size={40} />
        ) : (
          <Pill key={i} text={text as string} x={cx - 250 + 190 * base + 40 + k * 60} y={cy - 70 + i * 130} anchor="left" k={k} size={46} />
        );
      })}

      {/* 0:41 Squad */}
      {(
        [
          ['MK', C.pink, 1252, v ? [120, cy - 300] : [cx - 60, cy - 250], undefined],
          ['KB', C.orange, 1268, v ? [W - 120, cy - 60] : [cx + 10, cy + 10], undefined],
          ['AJ', C.brand, T.aaravJoins - 14, v ? [120, cy + 330] : [cx - 50, cy + 270], 'Aarav joined'],
        ] as [string, string, number, [number, number], string | undefined][]
      ).map(([initials, colour, start, [bx, by], label], i) => (
        <AvatarBubble key={initials} initials={initials} colour={colour} x={bx} y={by} px={px + (v ? (bx < cx ? -150 : 150) : 190 * base)} py={by + 30} at={start} to={1404} label={label} seed={i * 2} />
      ))}
      <Title lines={v ? [['Trips are group trips.'], ['So is the goal.']] : [['Trips are'], ['group trips.'], [{ t: 'So is the goal.', c: C.lime }]]} from={1252} to={1404} {...right} />

      {/* 0:47 Unlock */}
      <MonthChip steps={T.monthSteps} x={v ? cx : cx - 560} y={v ? low : cy} from={1422} to={1584} />
      <Title lines={v ? [['First unlock: ', { t: `${N.firstUnlock} months.`, c: C.lime }]] : [['First unlock:'], [{ t: `${N.firstUnlock} months.`, c: C.lime }]]} sub={f >= 1540 ? `Whole trip: ${N.tripWithTrip} months` : ' '} from={T.unlock + 4} to={1584} {...(v ? top : { ...right, x: 1250, width: 620 })} />
      <Confetti at={T.unlock} x={px} y={py - 220 * base} />

      {/* 0:53 Wrapped */}
      {f >= T.cardLift && f < S.end[0] + 8 && (
        <div style={{ position: 'absolute', left: cardX, top: cardY, perspective: 1800, opacity: interpolate(f, [T.cardLift, T.cardLift + 6, S.end[0] - 4, S.end[0] + 8], [0, 1, 1, 0], clamp) }}>
          <Img
            src={staticFile('wrapped_card.png')}
            style={{
              position: 'absolute',
              height: cardH,
              left: (-cardH * 9) / 32,
              top: -cardH / 2,
              borderRadius: cardH * 0.055,
              transform: `rotateY(${(1 - card) * 24 - 6 + Math.sin(f / 40) * 2}deg) rotateZ(${card * 2}deg)`,
              boxShadow: `0 50px 140px ${C.ink}, 0 0 120px ${C.pink}55`,
            }}
          />
        </div>
      )}
      <Title lines={v ? [['Worth posting about.']] : [['Worth'], ['posting'], ['about.']]} from={T.cardLift + 16} to={S.end[0] + 8} {...(v ? top : { x: cx - 300, y: cy, width: 470, align: 'left' as const, size: 92 })} />

      {/* 0:57 End card */}
      <Sequence from={S.end[0] + 6} layout="none">
        <EndCard />
      </Sequence>

      {/* Sound */}
      {music && (
        <Audio
          src={staticFile('music.mp3')}
          startFrom={Math.round(MIX.musicStart * FPS)}
          volume={(t) => {
            const speaking = voiceover ? Math.max(0, ...LINES.map(([a, b]) => Math.min(interpolate(t, [a - MIX.duckFrames, a], [0, 1], clamp), interpolate(t, [b, b + MIX.duckFrames], [1, 0], clamp)))) : 0;
            const level = interpolate(speaking, [0, 1], [MIX.music, MIX.musicDucked]);
            return level * interpolate(t, [0, MIX.fadeIn, DURATION - 1 - MIX.fadeOut, DURATION - 1], [0, 1, 1, 0], clamp);
          }}
        />
      )}
      {/* One sequence per voice line, at the script's start time (frame = seconds × 30). */}
      {voiceover &&
        vo.lines.map((l: { n: number; start: number }) => (
          <Sequence key={`vo${l.n}`} from={Math.round(l.start * FPS)} layout="none">
            <Audio src={staticFile(`vo/${String(l.n).padStart(2, '0')}.wav`)} />
          </Sequence>
        ))}
      {sfx && (
        <>
          {whooshes.map((w) => (
            <Sequence key={`w${w}`} from={w} layout="none">
              <Audio src={staticFile('sfx/whoosh.wav')} volume={MIX.sfx} />
            </Sequence>
          ))}
          {taps.map((t) => (
            <Sequence key={`t${t}`} from={t} layout="none">
              <Audio src={staticFile('sfx/tap.wav')} volume={MIX.sfx} />
            </Sequence>
          ))}
          <Sequence from={T.unlock} layout="none">
            <Audio src={staticFile('sfx/chime.wav')} volume={MIX.sfx} />
          </Sequence>
          <Sequence from={T.cardLift} layout="none">
            <Audio src={staticFile('sfx/pop.wav')} volume={MIX.sfx} />
          </Sequence>
        </>
      )}
    </AbsoluteFill>
  );
};
