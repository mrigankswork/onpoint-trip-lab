// Brands appear as text on neutral tiles only. No logos.
// Base earn blends to the 4% baseRate assumption on Riya's ₹6,000 (checked in brands.test.ts).

const LOADED_AT = Date.now();
const hours = (h: number) => LOADED_AT + h * 3600_000;

export interface Brand {
  id: string;
  name: string;
  category: string;
  baseEarn: number;
  /** Riya's monthly spend at this brand, in ₹. */
  spend: number;
  /** Whether this brand runs a Drop by default. Live state is in the store's activeDrops. */
  inDrop: boolean;
  dropEndsAt?: number;
  redemptionPartner?: boolean;
}

export const brands: Brand[] = [
  { id: 'myntra', name: 'Myntra', category: 'Fashion', baseEarn: 0.05, spend: 2000, inDrop: true, dropEndsAt: hours(31.2) },
  { id: 'nykaa', name: 'Nykaa', category: 'Beauty', baseEarn: 0.06, spend: 1000, inDrop: true, dropEndsAt: hours(19.65) },
  { id: 'swiggy', name: 'Swiggy', category: 'Food delivery', baseEarn: 0.02, spend: 2000, inDrop: false },
  { id: 'croma', name: 'Croma', category: 'Electronics', baseEarn: 0.02, spend: 500, inDrop: false },
  { id: 'giftcards', name: 'Gift cards', category: 'Vouchers', baseEarn: 0.06, spend: 500, inDrop: false },
  { id: 'zostel', name: 'Zostel', category: 'Travel stays', baseEarn: 0.04, spend: 0, inDrop: false, redemptionPartner: true },
];

export const brandById = (id: string) => brands.find((b) => b.id === id) ?? brands[0];

export const DEFAULT_DROPS = brands.filter((b) => b.inDrop).map((b) => b.id);
