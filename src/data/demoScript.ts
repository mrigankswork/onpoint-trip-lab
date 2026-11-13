// The scripted walkthrough for ?demo=1. It drives the same store and the same
// components as manual use: every "tap" is a real click on a real element.

import { defaultSquad } from './squad';
import { derive, useLab, type PanelTab } from '../store/useLab';

export interface DemoCtx {
  /** Navigate the phone to a route. */
  go: (path: string) => void;
  /** Show a tap ripple on the element with this data-demo id, then click it. */
  tap: (id: string) => void;
  /** Glide the month slider to a value over a duration. */
  glide: (toMonth: number, ms: number) => void;
  /** Show a Team view tab (side panel on desktop, #/team on mobile). */
  team: (tab: PanelTab) => void;
}

export interface DemoStep {
  mode: 'Today' | 'Flip' | 'TRIP' | 'Team';
  caption: string;
  seconds: number;
  /** Puts the app in this step's starting state, so any step can be entered directly. */
  setup: (ctx: DemoCtx) => void;
  actions: { at: number; run: (ctx: DemoCtx) => void }[];
}

const lab = () => useLab.getState();

/** Before onboarding: no trip yet, Aarav still to join. */
const fresh = (month: number) => {
  lab().resetStory({ fresh: true });
  lab().setMonth(month);
  lab().setPanelTab('story');
};

/** After onboarding, keeping any order already placed in the story. */
const onTrip = (month: number, aaravJoined: boolean) => {
  if (!lab().onboarded) lab().resetStory({ onboarded: true, aaravJoined });
  useLab.setState({ squad: defaultSquad(aaravJoined), welcomeLanded: true, checkoutBrandId: null });
  lab().setMode('trip');
  lab().setMonth(month);
  lab().setPanelTab('story');
};

export const demoScript: DemoStep[] = [
  {
    mode: 'Today',
    caption: 'Meet Riya. 23, first job, spends ₹6,000 a month online.',
    seconds: 8,
    setup: ({ go }) => {
      fresh(0);
      go('/today');
    },
    actions: [{ at: 1800, run: ({ glide }) => glide(6, 4500) }],
  },
  {
    mode: 'Today',
    caption: "She's earning. But when does she actually travel?",
    seconds: 8,
    setup: ({ go }) => {
      fresh(6);
      go('/today');
    },
    actions: [
      { at: 900, run: ({ tap }) => tap('tab-redeem') },
      { at: 3800, run: ({ tap }) => tap('flight-link') },
      { at: 5600, run: ({ tap }) => tap('flight-link') },
    ],
  },
  {
    mode: 'Today',
    caption: "At today's rate, her weekend trip is 17 months away.",
    seconds: 7,
    setup: ({ go }) => {
      fresh(6);
      go('/today/redeem');
    },
    actions: [
      {
        at: 400,
        run: ({ team }) => {
          team('calculator');
          lab().setHighlight('kpi-today-trip');
        },
      },
    ],
  },
  {
    mode: 'Flip',
    caption: 'Same Riya. Same spend. New Onpoint.',
    seconds: 5,
    setup: ({ go }) => {
      fresh(6);
      go('/today');
    },
    actions: [
      { at: 1200, run: ({ tap }) => tap('mode-trip') },
      { at: 1900, run: () => lab().setMonth(0) },
    ],
  },
  {
    mode: 'TRIP',
    caption: 'Step one: pick the trip, not the programme.',
    seconds: 14,
    setup: ({ go }) => {
      fresh(0);
      lab().setMode('trip');
      go('/onboarding');
    },
    actions: [
      { at: 1500, run: ({ tap }) => tap('dest-kasol') },
      { at: 3400, run: ({ tap }) => tap('onb-next') },
      { at: 5600, run: ({ tap }) => tap('onb-squad') },
      { at: 7600, run: ({ tap }) => tap('onb-next') },
      { at: 11200, run: ({ tap }) => tap('onb-start') },
    ],
  },
  {
    mode: 'TRIP',
    caption: 'Drops make every spend count double, funded by brands.',
    seconds: 8,
    setup: ({ go }) => {
      onTrip(0, false);
      go('/home');
    },
    actions: [{ at: 900, run: () => lab().setHighlight('drop-myntra') }],
  },
  {
    mode: 'TRIP',
    caption: '₹200 closer to Kasol. She can see it.',
    seconds: 10,
    setup: ({ go }) => {
      onTrip(0, false);
      go('/home');
    },
    actions: [
      { at: 800, run: ({ tap }) => tap('tab-shop') },
      { at: 2800, run: ({ tap }) => tap('brand-myntra') },
      { at: 5400, run: ({ tap }) => tap('place-order') },
    ],
  },
  {
    mode: 'TRIP',
    caption: 'Tracked live. ₹1 per point, always.',
    seconds: 8,
    setup: ({ go }) => {
      onTrip(0, false);
      // Run the timeline from the start on the order Riya just placed.
      const latest = lab().trackedOrders[0];
      if (latest && latest.createdAt > 0) lab().restartOrder(latest.id);
      else lab().addOrder('myntra', 2000);
      go('/tracking');
    },
    actions: [],
  },
  {
    mode: 'TRIP',
    caption: 'Trips are group trips. So is the goal.',
    seconds: 10,
    setup: ({ go }) => {
      onTrip(0, false);
      go('/squad');
    },
    actions: [
      { at: 1500, run: ({ tap }) => tap('invite-btn') },
      { at: 4000, run: ({ tap }) => tap('send-invite') },
    ],
  },
  {
    mode: 'TRIP',
    caption: 'First unlock in 3.3 months, not 17.',
    seconds: 9,
    setup: ({ go }) => {
      onTrip(0, true);
      go('/unlock');
    },
    actions: [
      // Glide to the engine's exact unlock month (3.33…, shown as 3.3).
      { at: 1200, run: ({ glide }) => glide(derive(lab()).milestones[0].monthsAt, 4300) },
      { at: 7000, run: ({ tap }) => tap('book-hostel') },
    ],
  },
  {
    mode: 'TRIP',
    caption: "And it's worth posting about.",
    seconds: 7,
    setup: ({ go }) => {
      onTrip(4, true);
      go('/wrapped');
    },
    actions: [],
  },
  {
    mode: 'Team',
    caption: "Every number traces to an assumption Onpoint's team can change.",
    seconds: 12,
    setup: ({ go }) => {
      onTrip(4, true);
      go('/profile');
    },
    actions: [
      { at: 500, run: ({ team }) => team('calculator') },
      {
        at: 6000,
        run: ({ team }) => {
          team('growth');
          lab().setHighlight('kpi-actives');
        },
      },
      { at: 9000, run: () => lab().setHighlight('kpi-payback') },
    ],
  },
];

export const demoTotalSeconds = demoScript.reduce((s, x) => s + x.seconds, 0);
