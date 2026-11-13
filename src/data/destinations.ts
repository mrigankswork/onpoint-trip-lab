import { TRIP_PIECES, type DestinationId, type TripPieces } from '../engine/assumptions';
import type { PieceKey } from '../engine/calc';

export type ArtKind = 'mountain' | 'temple' | 'desert' | 'sea' | 'beach';

export interface Destination {
  id: DestinationId;
  name: string;
  fromCity: string;
  art: ArtKind;
  /** Flat gradient built from brand tokens only. */
  gradient: string;
  vibe: string;
  pieces: TripPieces;
  pieceNotes: Record<PieceKey, string>;
  /** Short noun for the travel piece, used in nudges ("2 Drops away from the bus"). */
  travelNoun: string;
  stayPartner: string;
}

export const destinations: Destination[] = [
  {
    id: 'kasol',
    name: 'Kasol',
    fromCity: 'Delhi',
    art: 'mountain',
    gradient: 'linear-gradient(165deg, var(--brand) 0%, var(--ink) 100%)',
    vibe: 'Pines, river, chai',
    pieces: TRIP_PIECES.kasol,
    pieceNotes: { stay: '2 nights, hostel', travel: 'Volvo bus, both ways', experience: 'Kheerganga day trek' },
    travelNoun: 'bus',
    stayPartner: 'Zostel Kasol',
  },
  {
    id: 'rishikesh',
    name: 'Rishikesh',
    fromCity: 'Delhi',
    art: 'temple',
    gradient: 'linear-gradient(165deg, var(--brand-pink) 0%, var(--brand) 100%)',
    vibe: 'Rafting and ghats',
    pieces: TRIP_PIECES.rishikesh,
    pieceNotes: { stay: '2 nights, hostel', travel: 'Bus, both ways', experience: 'River rafting' },
    travelNoun: 'bus',
    stayPartner: 'Zostel Rishikesh',
  },
  {
    id: 'jaipur',
    name: 'Jaipur',
    fromCity: 'Delhi',
    art: 'desert',
    gradient: 'linear-gradient(165deg, var(--brand-orange) 0%, var(--brand-pink) 100%)',
    vibe: 'Forts and food',
    pieces: TRIP_PIECES.jaipur,
    pieceNotes: { stay: '2 nights, hostel', travel: 'Train, both ways', experience: 'Forts pass' },
    travelNoun: 'train',
    stayPartner: 'Zostel Jaipur',
  },
  {
    id: 'pondicherry',
    name: 'Pondicherry',
    fromCity: 'Delhi',
    art: 'sea',
    gradient: 'linear-gradient(195deg, var(--ink) 0%, var(--brand) 100%)',
    vibe: 'Cafes by the sea',
    pieces: TRIP_PIECES.pondicherry,
    pieceNotes: { stay: '2 nights, hostel', travel: 'Budget flight + bus', experience: 'Scuba intro' },
    travelNoun: 'flight',
    stayPartner: 'Zostel Pondicherry',
  },
  {
    id: 'goa',
    name: 'Goa',
    fromCity: 'Delhi',
    art: 'beach',
    gradient: 'linear-gradient(165deg, var(--brand-pink) 0%, var(--brand-orange) 100%)',
    vibe: 'Beach, scooters, sunsets',
    pieces: TRIP_PIECES.goa,
    pieceNotes: { stay: '3 nights, hostel', travel: 'Budget flight, both ways', experience: 'Scooter + kayaking' },
    travelNoun: 'flight',
    stayPartner: 'Zostel Goa',
  },
];

export const destinationById = (id: DestinationId) =>
  destinations.find((d) => d.id === id) ?? destinations[0];

export const PIECE_LABEL: Record<PieceKey, string> = {
  stay: 'Stay',
  travel: 'Travel',
  experience: 'Experience',
};
