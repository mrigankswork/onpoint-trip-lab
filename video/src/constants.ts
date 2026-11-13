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
  // Required credit for the music (CC BY 3.0).
  music: 'Music: "Avec Soin" by Kevin MacLeod (incompetech.com), licensed under CC BY 3.0',
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

// Sound levels.
export const MIX = {
  music: 0.35, // normal
  musicDucked: 0.12, // while a voice line plays
  duckFrames: 8,
  fadeIn: 30, // 1s
  fadeOut: 60, // 2s, ending exactly on the last frame
  sfx: 0.25, // never covers the voice
  musicStart: 0, // seconds into the track to start from
};
