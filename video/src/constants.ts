// Every number and line of text in the film. Numbers mirror the prototype's engine
// (src/engine/assumptions.ts in the app), so the video and the prototype cannot disagree.

export const FPS = 30;
export const DURATION = 1800;

export const C = {
  ink: '#01000D',
  brand: '#4D1089',
  orange: '#F56F31',
  pink: '#F23276',
  peach: '#FBD4C1',
  lime: '#D7FF3A',
  white: '#FFFFFF',
};

export const N = {
  earnToday: '240', // Onpoints a month today
  tripToday: '17', // months to the whole trip today (16.7, as the deck rounds it)
  tripWithTrip: '7.5', // months to the whole trip With TRIP
  firstUnlock: '3.3', // months to the Stay unlock
  tripCost: '₹4,000',
  orderGain: '₹200', // 2x Drop on a ₹2,000 Myntra order
};

export const END = {
  line: 'Your next weekend starts here.',
  pillars: ['Trip Goals', 'Reward Drops', 'In it together', 'Proof & trust'],
  // Fill these in before the final export. Empty strings are left off the end card.
  team: '',
  link: '',
};

// The app screen, in points (iPhone 18 Pro), as captured.
export const SCREEN = { w: 402, h: 874, r: 62 };

// Storyboard frame ranges.
export const S = {
  intro: [0, 150],
  today: [150, 300],
  flip: [300, 420],
  onboarding: [420, 660],
  home: [660, 870],
  checkout: [870, 1080],
  tracking: [1080, 1230],
  squad: [1230, 1410],
  unlock: [1410, 1590],
  wrapped: [1590, 1710],
  end: [1710, 1800],
} as const;

// Moments inside the footage that the camera and sound are cut to.
export const T = {
  flipTap: 327,
  flipSwitch: 335,
  kasolTap: 475,
  placeOrder: 985,
  aaravJoins: 1344,
  monthSteps: [
    [1410, 'Month 0'],
    [1453, 'Month 1'],
    [1468, 'Month 2'],
    [1487, 'Month 3'],
    [1508, 'Month 3.3'],
  ] as [number, string][],
  unlock: 1510,
  cardLift: 1620,
};

// When the voiceover speaks, in frames [start, end]. The music ducks under these.
// Keep in step with audio/voiceover.mjs (start second and measured length of each line).
export const VO: [number, number][] = [
  [0.4, 5.34], [10.3, 2.02], [14.3, 3.38], [22.3, 5.8], [29.4, 2.77], [36.3, 2.3], [41.3, 2.89], [47.3, 3.9], [53.3, 1.3], [57.2, 2.66],
].map(([at, len]) => [Math.round(at * FPS), Math.round((at + len) * FPS)]);
