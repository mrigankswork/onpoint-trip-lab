import type { Tag } from '../engine/assumptions';

// Case fact = brand purple, Public source = teal, Team assumption = orange.
const STYLE: Record<Tag, string> = {
  'Case fact': 'bg-brand/10 text-brand',
  'Public source': 'bg-teal/10 text-teal',
  'Team assumption': 'bg-orange/10 text-orange',
};

export function SourceTag({ tag, className = '' }: { tag: Tag; className?: string }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold ${STYLE[tag]} ${className}`}>
      {tag}
    </span>
  );
}
