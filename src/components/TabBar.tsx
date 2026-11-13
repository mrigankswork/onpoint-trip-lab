import { ArrowLeftRight, CircleUser, House, LayoutGrid, ShoppingBag, Users } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLab } from '../store/useLab';

const TRIP_TABS = [
  { id: 'home', label: 'Home', to: '/home', icon: House, match: ['/home', '/goal', '/unlock', '/wrapped'] },
  { id: 'shop', label: 'Shop', to: '/shop', icon: ShoppingBag, match: ['/shop', '/tracking'] },
  { id: 'squad', label: 'Squad', to: '/squad', icon: Users, match: ['/squad'] },
  { id: 'profile', label: 'Profile', to: '/profile', icon: CircleUser, match: ['/profile'] },
];

// Today mode: a plainer bar. "Brands" lives on the home screen in the current product.
const TODAY_TABS = [
  { id: 'home', label: 'Home', to: '/today', icon: House, match: ['/today'] },
  { id: 'brands', label: 'Brands', to: '/today?brands', icon: LayoutGrid, match: [] as string[] },
  { id: 'redeem', label: 'Redeem', to: '/today/redeem', icon: ArrowLeftRight, match: ['/today/redeem'] },
  { id: 'profile', label: 'Account', to: '/profile', icon: CircleUser, match: ['/profile'] },
];

export function TabBar() {
  const mode = useLab((s) => s.mode);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const trip = mode === 'trip';
  const tabs = trip ? TRIP_TABS : TODAY_TABS;
  return (
    <nav
      className="flex shrink-0 border-t border-fg/[0.08] bg-surface px-2 pt-2"
      style={{ paddingBottom: 'max(8px, var(--safe-bottom, env(safe-area-inset-bottom, 0px)))' }}
    >
      {tabs.map((t) => {
        const on = t.match.includes(pathname);
        const Icon = t.icon;
        return (
          <button
            key={t.id}
            data-demo={`tab-${t.id}`}
            onClick={() => navigate(t.to)}
            aria-current={on ? 'page' : undefined}
            className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1 text-[11px] font-medium ${
              on ? (trip ? 'text-accent' : 'text-fg') : 'text-muted'
            }`}
          >
            <Icon size={20} strokeWidth={on ? 2.4 : 1.8} />
            {t.label}
          </button>
        );
      })}
    </nav>
  );
}
