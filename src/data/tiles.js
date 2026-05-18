// American Mahjong tile system
// Standard set: 152 tiles total
// - Suits: Bams (B), Cracks (C), Dots (D), each 1-9, four copies = 108
// - Winds: N, E, W, S, four copies each = 16
// - Dragons: Green (G), Red (R), White/Soap (0) — Note: in 2026 card, White Dragon = 0 (zero)
//   four copies each = 12
// - Flowers (F): 8 tiles
// - Jokers (J): 8 tiles

// Tile codes:
//   1B-9B: bams 1-9
//   1C-9C: cracks 1-9
//   1D-9D: dots 1-9
//   N, E, W, S: winds
//   GD, RD, WD: dragons (Green, Red, White)
//   F: flower
//   J: joker
//
// 2026 card uses "0" as a stand-in for White Dragon (Soap).
// Internally we keep WD; the card parser maps "0" -> WD.

export const SUITS = {
  B: { name: 'Bams', color: 'green' },
  C: { name: 'Cracks', color: 'red' },
  D: { name: 'Dots', color: 'blue' },
};

export const TILE_TYPES = {
  // Suit tiles
  ...Object.fromEntries(
    ['B', 'C', 'D'].flatMap((s) =>
      Array.from({ length: 9 }, (_, i) => [
        `${i + 1}${s}`,
        { kind: 'suit', suit: s, value: i + 1, label: `${i + 1}${s}` },
      ]),
    ),
  ),
  // Winds
  N: { kind: 'wind', label: 'N', wind: 'N' },
  E: { kind: 'wind', label: 'E', wind: 'E' },
  W: { kind: 'wind', label: 'W', wind: 'W' },
  S: { kind: 'wind', label: 'S', wind: 'S' },
  // Dragons — each dragon matches a suit:
  //   Green Dragon matches Bams
  //   Red Dragon matches Cracks
  //   White Dragon (Soap) matches Dots
  GD: { kind: 'dragon', label: 'GD', matchSuit: 'B' },
  RD: { kind: 'dragon', label: 'RD', matchSuit: 'C' },
  WD: { kind: 'dragon', label: 'WD', matchSuit: 'D' }, // also serves as "0" on 2026 card
  // Flowers and Jokers
  F: { kind: 'flower', label: 'F' },
  J: { kind: 'joker', label: 'J' },
};

// Standard counts in a complete set
export const TILE_COUNTS = {
  ...Object.fromEntries(Object.keys(TILE_TYPES).map((k) => [k, 4])),
  F: 8,
  J: 8,
};

// All tile codes in display order, grouped for the picker UI
export const TILE_GROUPS = [
  { label: 'Bams', tiles: ['1B', '2B', '3B', '4B', '5B', '6B', '7B', '8B', '9B'] },
  { label: 'Cracks', tiles: ['1C', '2C', '3C', '4C', '5C', '6C', '7C', '8C', '9C'] },
  { label: 'Dots', tiles: ['1D', '2D', '3D', '4D', '5D', '6D', '7D', '8D', '9D'] },
  { label: 'Winds', tiles: ['N', 'E', 'W', 'S'] },
  { label: 'Dragons', tiles: ['GD', 'RD', 'WD'] },
  { label: 'Special', tiles: ['F', 'J'] },
];

export const ALL_TILES = TILE_GROUPS.flatMap((g) => g.tiles);
