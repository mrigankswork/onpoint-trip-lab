import { Minus, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Sheet } from '../../components/Sheet';
import { brandById } from '../../data/brands';
import { fmtINR } from '../../engine/format';
import { useEngine, useLab } from '../../store/useLab';

const STEP = 500;
let flyKey = 0;

/** Simulated checkout: a bottom sheet, no real purchase and no outbound link. */
export default function Checkout() {
  const e = useEngine();
  const brandId = useLab((s) => s.checkoutBrandId);
  const openCheckout = useLab((s) => s.openCheckout);
  const activeDrops = useLab((s) => s.activeDrops);
  const addOrder = useLab((s) => s.addOrder);
  const setFly = useLab((s) => s.setFly);
  const showToast = useLab((s) => s.showToast);
  const [amount, setAmount] = useState(2000);
  // Keep the last brand while the sheet animates out.
  const [shown, setShown] = useState(brandId ?? 'myntra');

  useEffect(() => {
    if (!brandId) return;
    setShown(brandId);
    setAmount(brandById(brandId).spend || 1000);
  }, [brandId]);

  const brand = brandById(shown);
  const inDrop = activeDrops.includes(brand.id);
  const earn = e.earnFor(brand.id, amount, inDrop);

  const place = () => {
    addOrder(brand.id, amount);
    openCheckout(null);
    // "On return": let the sheet close, then fly the points into the goal bar.
    setTimeout(() => {
      setFly({ key: ++flyKey, brandId: brand.id, points: earn });
      showToast(`+${fmtINR(earn)} pending · ${fmtINR(earn)} closer to ${e.dest.name}`);
    }, 300);
  };

  return (
    <Sheet open={!!brandId} onClose={() => openCheckout(null)} title={`You're leaving for ${brand.name}`}>
      <p className="text-[13px] text-muted">
        Shop as usual on {brand.name}. We track the order and bring the points back to your trip.
      </p>
      <div className="mt-4 flex items-center justify-between rounded-[14px] bg-canvas p-3">
        <button aria-label="Decrease amount" onClick={() => setAmount(Math.max(STEP, amount - STEP))} className="rounded-full bg-surface p-3">
          <Minus size={16} />
        </button>
        <div className="text-center">
          <p className="font-display text-3xl font-bold">{fmtINR(amount)}</p>
          <p className="text-[12px] text-muted">order amount (simulated)</p>
        </div>
        <button aria-label="Increase amount" onClick={() => setAmount(amount + STEP)} className="rounded-full bg-surface p-3">
          <Plus size={16} />
        </button>
      </div>
      <p className="mt-3 text-center text-[14px] font-semibold text-orange">
        +{fmtINR(earn)} toward {e.dest.name}
        {inDrop ? ` · ${e.v.dropsMultiplier}x Drop applied` : ''}
      </p>
      <button data-demo="place-order" onClick={place} className="btn mt-4 w-full">
        Place order
      </button>
    </Sheet>
  );
}
