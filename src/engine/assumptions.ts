// Every number the prototype uses lives here, tagged by where it came from.
// calc.ts reads only from this file. Nothing else in the app may hard-code a figure.

export type Tag = 'Case fact' | 'Public source' | 'Team assumption';
export type Unit = 'inr' | 'inrMonth' | 'pct' | 'x' | 'pts' | 'count' | 'ratio';

export interface Assumption {
  value: number;
  label: string;
  tag: Tag;
  note: string;
  unit: Unit;
  /** Fixed display text for values that are not plain numbers (e.g. "200+"). */
  display?: string;
  min?: number;
  max?: number;
  step?: number;
}

const define = <T extends Record<string, Assumption>>(t: T) => t;

export const ASSUMPTIONS = define({
  pointValueINR: {
    value: 1,
    label: 'Value of 1 Onpoint',
    tag: 'Case fact',
    unit: 'inr',
    note: '1 Onpoint = ₹1 in gift vouchers (App Store listing: https://apps.apple.com/mx/app/on-point-app/id6748437943)',
  },
  indigoRatio: {
    value: 4 / 5,
    label: 'IndiGo BluChip conversion',
    tag: 'Public source',
    unit: 'ratio',
    display: '5 Onpoints → 4 BluChips',
    note: 'IndiGo partner page: https://www.goindigo.in/loyalty/partners/onpoint.html',
  },
  brandCount: {
    value: 200,
    label: 'Partner brands',
    tag: 'Case fact',
    unit: 'count',
    display: '200+',
    note: 'Same App Store listing',
  },
  baseRate: {
    value: 0.04,
    label: 'Base earn rate',
    tag: 'Team assumption',
    unit: 'pct',
    note: 'Blended earn across categories; replace with survey or real rates',
    min: 0.01,
    max: 0.1,
    step: 0.005,
  },
  routedSpendToday: {
    value: 6000,
    label: 'Spend routed through Onpoint (Today)',
    tag: 'Team assumption',
    unit: 'inrMonth',
    note: 'First-jobber online spend via Onpoint',
    min: 2000,
    max: 20000,
    step: 500,
  },
  spendLift: {
    value: 1 / 3,
    label: 'Spend lift With TRIP',
    tag: 'Team assumption',
    unit: 'pct',
    note: 'Goal visibility and Drop reminders route more spend through Onpoint (₹6,000 → ₹8,000)',
    min: 0,
    max: 1,
    step: 0.01,
  },
  dropsShare: {
    value: 0.5,
    label: 'Share of spend inside a Drop',
    tag: 'Team assumption',
    unit: 'pct',
    note: 'Share of spend that lands inside a live Drop',
    min: 0,
    max: 1,
    step: 0.05,
  },
  dropsMultiplier: {
    value: 2,
    label: 'Drop multiplier',
    tag: 'Team assumption',
    unit: 'x',
    note: 'Brand-funded boost',
    min: 1,
    max: 4,
    step: 0.5,
  },
  welcomeBonus: {
    value: 100,
    label: 'Welcome bonus',
    tag: 'Team assumption',
    unit: 'pts',
    note: "Similar in size to Onpoint's current new-user offer",
    min: 0,
    max: 500,
    step: 50,
  },
  referralBonus: {
    value: 100,
    label: 'Referral bonus per friend',
    tag: 'Team assumption',
    unit: 'pts',
    note: 'Paid when the friend makes a first purchase',
    min: 0,
    max: 500,
    step: 50,
  },
  friendsJoined: {
    value: 3,
    label: 'Friends joined',
    tag: 'Team assumption',
    unit: 'count',
    note: "Riya's squad",
    min: 0,
    max: 10,
    step: 1,
  },
  pendingShare: {
    value: 0.75,
    label: 'Share of a month’s earn still pending',
    tag: 'Team assumption',
    unit: 'pct',
    note: 'Drives the unexplained "Pending" line in Today mode; brands confirm orders after the return window',
  },
  affiliateCommission: {
    value: 0.06,
    label: 'Affiliate commission',
    tag: 'Team assumption',
    unit: 'pct',
    note: 'Average commission Onpoint receives from brands',
    min: 0.04,
    max: 0.12,
    step: 0.005,
  },
  ambassadors: {
    value: 100,
    label: 'Campus ambassadors',
    tag: 'Team assumption',
    unit: 'count',
    note: '50 campuses × 2',
    min: 10,
    max: 500,
    step: 10,
  },
  ambassadorStipend: {
    value: 3000,
    label: 'Ambassador stipend',
    tag: 'Team assumption',
    unit: 'inrMonth',
    note: 'Monthly stipend per ambassador',
    min: 1000,
    max: 10000,
    step: 500,
  },
  signupsPerAmbassador: {
    value: 40,
    label: 'Sign-ups per ambassador per month',
    tag: 'Team assumption',
    unit: 'count',
    note: 'Monthly sign-ups each ambassador brings',
    min: 10,
    max: 100,
    step: 5,
  },
  activationRate: {
    value: 0.4,
    label: 'Activation rate',
    tag: 'Team assumption',
    unit: 'pct',
    note: 'Sign-up to first tracked purchase',
    min: 0.1,
    max: 1,
    step: 0.05,
  },
  monthlyChurn: {
    value: 0.08,
    label: 'Monthly churn',
    tag: 'Team assumption',
    unit: 'pct',
    note: 'Active earners lost per month',
    min: 0,
    max: 0.3,
    step: 0.01,
  },
  inviteRate: {
    value: 0.05,
    label: 'Invite rate',
    tag: 'Team assumption',
    unit: 'ratio',
    note: 'New active users each active user brings per month',
    min: 0,
    max: 0.2,
    step: 0.01,
  },
});

export type AssumptionKey = keyof typeof ASSUMPTIONS;
export type Values = Record<AssumptionKey, number>;

export const DEFAULTS = Object.fromEntries(
  Object.entries(ASSUMPTIONS).map(([k, a]) => [k, a.value]),
) as Values;

export const assumption = (key: AssumptionKey): Assumption => ASSUMPTIONS[key];

// Per-person trip costs in ₹, split into the three unlock pieces. All Team assumptions.
export interface TripPieces {
  stay: number;
  travel: number;
  experience: number;
}

export const TRIP_PIECES = {
  kasol: { stay: 2000, travel: 1400, experience: 600 },
  rishikesh: { stay: 1600, travel: 1000, experience: 900 },
  jaipur: { stay: 1800, travel: 900, experience: 800 },
  pondicherry: { stay: 2400, travel: 4000, experience: 1100 },
  goa: { stay: 3000, travel: 5000, experience: 1500 },
} satisfies Record<string, TripPieces>;

export type DestinationId = keyof typeof TRIP_PIECES;

export const TRIP_NOTES: Record<DestinationId, string> = {
  kasol: 'Stay ₹2,000 (2 nights hostel) + Travel ₹1,400 (Volvo bus both ways) + Experience ₹600',
  rishikesh: 'Stay ₹1,600 (2 nights hostel) + Travel ₹1,000 (bus both ways) + Experience ₹900 (rafting)',
  jaipur: 'Stay ₹1,800 (2 nights hostel) + Travel ₹900 (train both ways) + Experience ₹800 (forts)',
  pondicherry: 'Stay ₹2,400 (2 nights hostel) + Travel ₹4,000 (budget flight + bus) + Experience ₹1,100',
  goa: 'Stay ₹3,000 (3 nights hostel) + Travel ₹5,000 (budget flight both ways) + Experience ₹1,500',
};

export const SQUAD_SIZE = 4;
