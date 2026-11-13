import { motion } from 'framer-motion';
import { Download, Share2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { DestinationArt } from '../../components/DestinationArt';
import { Screen, Sticker, WingMark } from '../../components/ui';
import { brands } from '../../data/brands';
import { persona } from '../../data/persona';
import { squadRank } from '../../data/squad';
import { fmtINR, fmtTripPct } from '../../engine/format';
import { useEngine, useLab } from '../../store/useLab';

const FILE = 'onpoint-wrapped.png';

export default function Wrapped() {
  const e = useEngine();
  const squad = useLab((s) => s.squad);
  const activeDrops = useLab((s) => s.activeDrops);
  const showToast = useLab((s) => s.showToast);
  const card = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  // Top brand: the one that earns Riya the most in a month.
  const top = [...brands].sort(
    (a, b) =>
      e.earnFor(b.id, b.spend, activeDrops.includes(b.id)) - e.earnFor(a.id, a.spend, activeDrops.includes(a.id)),
  )[0];

  const stats = [
    { label: 'Earned', value: `${fmtINR(e.trip.balance)} earned` },
    { label: e.dest.name, value: `${e.dest.name}: ${fmtTripPct(e.trip.percent)} there` },
    { label: 'Squad', value: `Squad rank #${squadRank(squad)}` },
    { label: 'Top brand', value: top.name },
  ];

  const render = async () => {
    const { toBlob } = await import('html-to-image');
    const blob = await toBlob(card.current!, { pixelRatio: 3, cacheBust: true });
    if (!blob) throw new Error('Could not render the card');
    return blob;
  };

  const download = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = FILE;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const run = async (share: boolean) => {
    if (busy) return;
    setBusy(true);
    try {
      const blob = await render();
      const file = new File([blob], FILE, { type: 'image/png' });
      if (share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: `${persona.name}'s year on Onpoint` });
      } else {
        download(blob);
        showToast('Card saved as PNG');
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') showToast("Couldn't export the card. Try a screenshot.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <div className="mx-auto w-[78%]">
        <div
          ref={card}
          className="relative flex aspect-[9/16] w-full flex-col overflow-hidden rounded-[28px] p-5 text-white"
          style={{ background: 'linear-gradient(170deg, var(--brand) 0%, var(--ink) 70%)' }}
        >
          <DestinationArt kind={e.dest.art} />
          <div className="relative flex items-center gap-2 text-[12px] font-semibold text-white/80">
            <WingMark size={14} /> Trip Lab
          </div>
          <h1 className="relative mt-3 font-display text-[26px] font-extrabold leading-[1.05]">
            {persona.name}'s {new Date().getFullYear()} on Onpoint
          </h1>
          <div className="relative mt-5 flex flex-1 flex-col items-start gap-3">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.5, duration: 0.3 }}
              >
                <Sticker
                  className={`!px-3 !py-2 !text-[15px] !normal-case ${
                    ['bg-unlock text-ink', 'bg-white text-ink', 'bg-pink text-white', 'bg-orange text-white'][i]
                  }`}
                  rotate={[-2, 2, -1, 3][i]}
                >
                  {s.value}
                </Sticker>
              </motion.div>
            ))}
          </div>
          <p className="relative text-[9px] leading-snug text-white/60">Concept prototype. All user data is fictional.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <button onClick={() => run(false)} disabled={busy} className="btn-ghost">
          <Download size={16} /> Download PNG
        </button>
        <button onClick={() => run(true)} disabled={busy} className="btn">
          <Share2 size={16} /> Share
        </button>
      </div>
      <p className="text-center text-[12px] text-muted">Every figure comes from the engine at the current month.</p>
    </Screen>
  );
}
