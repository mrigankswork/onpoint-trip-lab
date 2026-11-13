import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { demoScript, type DemoCtx } from '../data/demoScript';
import { useFlip } from '../hooks';
import { CAPTIONS_OFF, SCENE, useLab } from '../store/useLab';

const LAST = Math.min(demoScript.length - 1, SCENE ? SCENE - 1 : Infinity);

/**
 * Plays the script in data/demoScript.ts.
 * Keys: → / ← step, Space play/pause, T flip, R reset, H captions, C cursor.
 */
export function DemoController({ sideBySide }: { sideBySide: boolean }) {
  const navigate = useNavigate();
  const flip = useFlip();
  const step = useLab((s) => s.demoStep);
  const setStep = useLab((s) => s.setDemoStep);
  const [playing, setPlaying] = useState(!!SCENE);
  const [run, setRun] = useState(0);
  const [ripple, setRipple] = useState<{ x: number; y: number; key: number } | null>(null);
  const startedAt = useRef(0);
  const live = useRef({ navigate, flip, sideBySide });
  live.current = { navigate, flip, sideBySide };

  // Enter a step: set its starting state, then schedule its taps.
  useEffect(() => {
    const timers: number[] = [];
    let raf = 0;
    let cancelled = false;
    const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms));

    const ctx: DemoCtx = {
      go: (path) => {
        useLab.getState().setView('app');
        live.current.navigate(path);
      },
      tap: (id) => {
        let tries = 0;
        const attempt = () => {
          if (cancelled) return;
          const el = document.querySelector<HTMLElement>(`[data-demo="${id}"]`);
          if (!el) {
            if (tries++ < 20) later(attempt, 100);
            return;
          }
          el.scrollIntoView({ block: 'nearest' });
          const r = el.getBoundingClientRect();
          setRipple({ x: r.left + r.width / 2, y: r.top + r.height / 2, key: performance.now() });
          later(() => el.click(), 260);
        };
        attempt();
      },
      glide: (to, ms) => {
        const from = useLab.getState().month;
        const t0 = performance.now();
        const tick = (now: number) => {
          if (cancelled) return;
          const k = Math.min(1, (now - t0) / ms);
          const eased = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
          useLab.getState().setMonth(k === 1 ? to : from + (to - from) * eased);
          if (k < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      team: (tab) => {
        useLab.getState().setPanelTab(tab);
        if (!live.current.sideBySide) useLab.getState().setView('lab');
      },
    };

    const s = demoScript[step];
    useLab.getState().setHighlight(null);
    s.setup(ctx);
    s.actions.forEach((a) => later(() => a.run(ctx), a.at));
    startedAt.current = performance.now();
    // For clip capture: when this step began, on the wall clock.
    document.body.dataset.sceneStart = String(performance.timeOrigin + startedAt.current);
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      cancelAnimationFrame(raf);
    };
  }, [step, run]);

  // Autoplay: move on when the step's duration is up.
  useEffect(() => {
    if (!playing) return;
    const left = demoScript[step].seconds * 1000 - (performance.now() - startedAt.current);
    const id = setTimeout(() => {
      if (step < LAST) setStep(step + 1);
      else {
        setPlaying(false);
        document.body.dataset.sceneDone = '1';
      }
    }, Math.max(0, left));
    return () => clearTimeout(id);
  }, [playing, step, run, setStep]);

  useEffect(() => {
    const typing = (t: EventTarget | null) =>
      t instanceof HTMLElement && (t.tagName === 'SELECT' || (t.tagName === 'INPUT' && (t as HTMLInputElement).type !== 'range'));
    const down = (e: KeyboardEvent) => {
      if (typing(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
      const st = useLab.getState();
      switch (e.key) {
        case 'ArrowRight':
          st.setDemoStep(Math.min(LAST, st.demoStep + 1));
          break;
        case 'ArrowLeft':
          st.setDemoStep(Math.max(0, st.demoStep - 1));
          break;
        case ' ':
          (document.activeElement as HTMLElement | null)?.blur();
          setPlaying((p) => {
            if (!p) setRun((n) => n + 1); // play restarts the current step from its start
            return !p;
          });
          break;
        case 't':
        case 'T':
          live.current.flip();
          break;
        case 'r':
        case 'R':
          setPlaying(false);
          st.setDemoStep(0);
          setRun((n) => n + 1);
          break;
        case 'h':
        case 'H':
          st.toggleCaptions();
          break;
        case 'c':
        case 'C':
          document.body.classList.toggle('hide-cursor');
          break;
        default:
          return;
      }
      e.preventDefault();
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === ' ' && !typing(e.target)) e.preventDefault();
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  const total = demoScript.length;
  return (
    <>
      <div className={`pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px] bg-white/10 ${CAPTIONS_OFF ? 'hidden' : ''}`} aria-hidden>
        <div
          className="h-full bg-unlock"
          style={{
            width: `${((step + (playing ? 1 : 0)) / total) * 100}%`,
            transition: playing ? `width ${demoScript[step].seconds}s linear` : 'width 200ms ease-out',
          }}
        />
      </div>
      {ripple && (
        <span
          key={ripple.key}
          aria-hidden
          className="pointer-events-none fixed z-[100] h-14 w-14 rounded-full border-2 border-white"
          style={{
            left: ripple.x,
            top: ripple.y,
            background: 'rgb(var(--brand-pink-rgb) / 0.55)',
            animation: 'ripple 650ms ease-out forwards',
          }}
        />
      )}
    </>
  );
}
