// Fictional squad. Avatars are initials on coloured circles, never photos.
// By default every member earns like Riya (the engine's With TRIP monthly earn),
// so the squad does not make the maths faster per person.

export interface SquadMember {
  id: string;
  name: string;
  initials: string;
  /** CSS colour (a brand token). */
  colour: string;
  joined: boolean;
  isYou?: boolean;
  /** Illustrative activity data, used only for the squad rank. */
  dropsCaught: number;
}

export const defaultSquad = (allJoined = true): SquadMember[] => [
  { id: 'riya', name: 'Riya', initials: 'RS', colour: 'var(--brand)', joined: true, isYou: true, dropsCaught: 2 },
  { id: 'meera', name: 'Meera', initials: 'MK', colour: 'var(--brand-pink)', joined: true, dropsCaught: 3 },
  { id: 'kabir', name: 'Kabir', initials: 'KB', colour: 'var(--brand-orange)', joined: true, dropsCaught: 1 },
  { id: 'aarav', name: 'Aarav', initials: 'AJ', colour: 'var(--ink)', joined: allJoined, dropsCaught: 0 },
];

/** Rank of "you" within the squad by Drops caught (1 = most). */
export const squadRank = (squad: SquadMember[]) => {
  const you = squad.find((m) => m.isYou);
  if (!you) return 1;
  return 1 + squad.filter((m) => m.joined && m.dropsCaught > you.dropsCaught).length;
};
