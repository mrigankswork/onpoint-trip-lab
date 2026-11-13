import type { ArtKind } from '../data/destinations';

/** Flat illustrated scenes drawn in SVG. No stock photos. */
export function DestinationArt({ kind }: { kind: ArtKind }) {
  const props = {
    viewBox: '0 0 200 120',
    preserveAspectRatio: 'xMidYMax slice',
    className: 'absolute inset-0 h-full w-full',
    'aria-hidden': true,
  } as const;
  switch (kind) {
    case 'mountain':
      return (
        <svg {...props}>
          <circle cx="152" cy="34" r="13" fill="var(--peach)" opacity=".9" />
          <path d="M-10 120 52 46l34 46 36-54 88 82z" fill="#fff" opacity=".14" />
          <path d="M122 38l-10 15 7-3 4 6 5-7 7 3z" fill="#fff" opacity=".55" />
          <path d="M-10 120 40 84l34 24 54-36 82 48z" fill="#fff" opacity=".1" />
          <path d="M20 120l6-16 6 16zm14 0 5-12 5 12zm128 0 6-16 6 16z" fill="var(--ink)" opacity=".45" />
        </svg>
      );
    case 'temple':
      return (
        <svg {...props}>
          <circle cx="44" cy="34" r="12" fill="var(--peach)" opacity=".9" />
          <path d="M118 120V78h8V60h8V44l10-14 10 14v16h8v18h8v42z" fill="#fff" opacity=".2" />
          <path d="M144 30v-10" stroke="#fff" strokeWidth="2" opacity=".5" />
          <path d="M-10 104c30-10 50 8 80 0s50-8 80 0 40 4 60 0v16H-10z" fill="#fff" opacity=".14" />
        </svg>
      );
    case 'desert':
      return (
        <svg {...props}>
          <circle cx="150" cy="38" r="16" fill="var(--peach)" opacity=".85" />
          <path d="M-10 120c40-44 80-44 120-12 30-30 60-30 100 0v12z" fill="#fff" opacity=".16" />
          <path d="M-10 120c50-22 90-22 130 0z" fill="#fff" opacity=".12" />
          <path d="M40 80h6v-8h4v8h6v-12h4v12h6v10H40z" fill="#fff" opacity=".28" />
        </svg>
      );
    case 'sea':
      return (
        <svg {...props}>
          <circle cx="48" cy="36" r="12" fill="var(--peach)" opacity=".9" />
          <path d="M130 84V46l26 38zm-4 0V56l-16 28z" fill="#fff" opacity=".4" />
          <path d="M104 88h58l-8 10h-42z" fill="#fff" opacity=".28" />
          <path d="M-10 102c20-8 30 8 50 0s30-8 50 0 30 8 50 0 30-8 70 0v18H-10z" fill="#fff" opacity=".16" />
        </svg>
      );
    case 'beach':
      return (
        <svg {...props}>
          <circle cx="150" cy="52" r="20" fill="var(--peach)" opacity=".9" />
          <path d="M-10 92c30-8 40 6 70 0s40-8 70 0 40 6 80 0v28H-10z" fill="#fff" opacity=".18" />
          <path d="M42 120c2-24 4-40 10-56" stroke="var(--ink)" strokeWidth="3" fill="none" opacity=".5" />
          <path d="M52 64c-14-8-24-4-30 4 12-4 20-2 30-4zm0 0c4-14 16-18 26-14-12 2-18 6-26 14zm0 0c12-4 22 2 26 12-8-8-16-10-26-12z" fill="var(--ink)" opacity=".5" />
        </svg>
      );
  }
}
