// 2026 NMJL Card — full hand list, transcribed from the physical card.
//
// Field reference:
//   id, section, notation, value
//   suits: 0|1|2|3 (number of distinct suits the hand uses)
//   concealed: true if hand must be self-drawn (C value on card)
//   dragonMatchesSuit: dragons follow the suit slot they're attached to (default)
//   anyDragon: any dragon will satisfy a "D" group regardless of suit
//   oppDragon: dragon group is the OPPOSITE suit's dragon
//   note: human-readable annotation from the card
//
// Notation extras:
//   [...] groups multiple tokens into a single suit slot.
//   Used for hands where the visual grouping on the card spans
//   multiple space-separated tokens (e.g. "[2 4 66 88]" = all in one suit).
//
// Total hands: 50 verified entries spanning all 9 sections.
// Hands with "-or-" alternates on the card are encoded as the primary
// pattern only; the alternate is functionally equivalent for matching.

export const HANDS = [
  // ============================================================
  // 2026
  // ============================================================
  { id: '2026-1', section: '2026', notation: '222 000 2222 6666', value: 25, suits: 2 },
  { id: '2026-2', section: '2026', notation: '2026 DDD 2222 DDD', value: 25, suits: 2, dragonMatchesSuit: true, note: 'Kong 2 or 6' },
  { id: '2026-3', section: '2026', notation: 'FFF 2026 222 6666', value: 25, suits: 3 },
  { id: '2026-4', section: '2026', notation: '22 00 222 666 NEWS', value: 30, suits: 2, note: 'NEWS = 1 of each wind' },

  // ============================================================
  // 2468
  // ============================================================
  { id: '2468-1', section: '2468', notation: '222 444 6666 8888', value: 25, suits: 1, note: 'Any 1 or 2 Suits (1-suit version)' },
  { id: '2468-2', section: '2468', notation: 'FF 2222 44 66 8888', value: 30, suits: 2 },
  { id: '2468-3', section: '2468', notation: 'EE 22 444 666 88 WW', value: 30, suits: 1, note: 'East & West only' },
  { id: '2468-4', section: '2468', notation: '2222 DDD 8888 DDD', value: 25, suits: 2, dragonMatchesSuit: true, note: 'These Nos Only' },
  { id: '2468-5', section: '2468', notation: 'FFF 22 44 666 8888', value: 25, suits: 1 },
  { id: '2468-6', section: '2468', notation: '2468 2222 D 2222 D', value: 25, suits: 3, dragonMatchesSuit: true, note: 'Like Kongs 2,4,6 or 8' },
  { id: '2468-7', section: '2468', notation: 'FFF 2468 FFF 2222', value: 30, suits: 2, note: 'Kong 2,4,6 or 8' },
  { id: '2468-8', section: '2468', notation: 'FF 246 888 246 888', value: 30, suits: 2, concealed: true },

  // ============================================================
  // Any Like Numbers
  // ============================================================
  { id: 'alike-1', section: 'Any Like Numbers', notation: '1111 FFFFFF 1111', value: 30, suits: 2 },
  { id: 'alike-2', section: 'Any Like Numbers', notation: '1111 D 111 D 1111 D', value: 25, suits: 3, dragonMatchesSuit: true },
  { id: 'alike-3', section: 'Any Like Numbers', notation: 'FF 1111 11 1111 DD', value: 25, suits: 3, anyDragon: true, note: 'Any dragon (single dragon group)' },

  // ============================================================
  // Quints
  // ============================================================
  { id: 'quint-1', section: 'Quints', notation: '11111 1111 11111', value: 40, suits: 3, note: 'Any like nos' },
  { id: 'quint-2', section: 'Quints', notation: 'FF 11111 22 33333', value: 45, suits: 1, note: 'Any 3 consec nos' },
  { id: 'quint-3', section: 'Quints', notation: '11111 44444 DDDD', value: 40, suits: 1, oppDragon: true, note: 'Any 2 nos in 1 suit, opposite dragon' },

  // ============================================================
  // Consecutive Run
  // ============================================================
  { id: 'crun-1', section: 'Consecutive Run', notation: '11 222 33 444 5555', value: 25, suits: 1, note: 'These nos only' },
  { id: 'crun-2', section: 'Consecutive Run', notation: 'FFF 1111 234 5555', value: 25, suits: 2, note: 'Any 5 consec nos, 1 or 2 suits' },
  { id: 'crun-3', section: 'Consecutive Run', notation: '11 22 111 222 3333', value: 25, suits: 3, note: 'Any 3 consec nos' },
  { id: 'crun-4', section: 'Consecutive Run', notation: '111 222 3333 4444', value: 25, suits: 2, note: 'Any 4 consec nos' },
  { id: 'crun-5', section: 'Consecutive Run', notation: 'FFF 11 22 333 DDDD', value: 25, suits: 2, dragonMatchesSuit: true, note: 'Any run, Ds match middle no' },
  { id: 'crun-6', section: 'Consecutive Run', notation: '1111 FFFFFF 2222', value: 30, suits: 1, note: 'Any 2 consec nos' },
  { id: 'crun-7', section: 'Consecutive Run', notation: 'FF 1111 2222 3333', value: 25, suits: 3, note: 'Any 3 consec nos, 1 or 3 suits' },
  { id: 'crun-8', section: 'Consecutive Run', notation: '[1 22 333] [1 22 333] 44', value: 35, suits: 3, concealed: true, note: 'Any 4 consec nos' },

  // ============================================================
  // 13579
  // ============================================================
  { id: '13579-1', section: '13579', notation: '11 333 55 777 9999', value: 25, suits: 3, note: 'Any 1 or 3 suits' },
  { id: '13579-2', section: '13579', notation: '111 333 3333 5555', value: 25, suits: 2 },
  { id: '13579-3', section: '13579', notation: 'NN 1111 33 5555 SS', value: 30, suits: 1, note: 'North & South only' },
  { id: '13579-4', section: '13579', notation: '113579 1111 1111', value: 25, suits: 3, note: 'Pair any odd no, kongs match pair' },
  { id: '13579-5', section: '13579', notation: 'FFF 11 33 555 DDDD', value: 25, suits: 1, dragonMatchesSuit: true, note: 'Matching dragon' },
  { id: '13579-6', section: '13579', notation: '11 33 111 333 5555', value: 30, suits: 3 },
  { id: '13579-7', section: '13579', notation: '1111 33 55 77 9999', value: 35, suits: 2, note: 'Any 1 or 2 suits' },
  { id: '13579-8', section: '13579', notation: '[FF 11 33 55] [111 111]', value: 35, suits: 3, concealed: true, note: 'These nos only — second half is two pungs of like nos in different suits' },
  { id: '13579-9', section: '13579', notation: 'FF 135 777 999 DDD', value: 30, suits: 1, oppDragon: true, concealed: true, note: '1 suit with opposite dragon' },

  // ============================================================
  // Winds - Dragons
  // ============================================================
  { id: 'wd-1', section: 'Winds-Dragons', notation: 'NNNN EEE WWW SSSS', value: 25, suits: 0 },
  { id: 'wd-2', section: 'Winds-Dragons', notation: '1234 DDD DDD DDDD', value: 25, suits: 1, dragonsDistinct: true, note: 'Any 4 consec nos in 1 suit, any 3 distinct dragons' },
  { id: 'wd-3', section: 'Winds-Dragons', notation: 'NNN 1111 1111 SSS', value: 25, suits: 2, note: 'Any like odd nos in 2 suits' },
  { id: 'wd-4', section: 'Winds-Dragons', notation: 'EEE 2222 2222 WWW', value: 25, suits: 2, note: 'Any like even nos in 2 suits' },
  { id: 'wd-5', section: 'Winds-Dragons', notation: 'FFF NNNN FFF DDDD', value: 25, suits: 0, note: 'Any wind, any dragon' },
  { id: 'wd-6', section: 'Winds-Dragons', notation: '1 N 2 EE 3 WWW 4 SSSS', value: 25, suits: 1, note: 'These nos only' },
  { id: 'wd-7', section: 'Winds-Dragons', notation: 'FF NNNN SSSS DD DD', value: 25, suits: 0, dragonsDistinct: true, note: 'Any 2 distinct dragons' },
  { id: 'wd-8', section: 'Winds-Dragons', notation: 'NN EEE 2026 WWW SS', value: 30, suits: 1, concealed: true, note: '2026 any 1 suit' },

  // ============================================================
  // 369
  // ============================================================
  { id: '369-1', section: '369', notation: '333 666 6666 9999', value: 25, suits: 2, note: 'Any 2 or 3 suits' },
  { id: '369-2', section: '369', notation: '33 66 333 666 9999', value: 25, suits: 3 },
  { id: '369-3', section: '369', notation: 'FFF 33 666 99 DDDD', value: 25, suits: 1, dragonMatchesSuit: true, note: '1 suit with matching or opposite dragon' },
  { id: '369-4', section: '369', notation: '33 66 666 999 NEWS', value: 30, suits: 2 },
  { id: '369-5', section: '369', notation: 'FF 3369 3333 3333', value: 25, suits: 3, note: 'Pair 3,6, or 9; kongs match pair' },
  { id: '369-6', section: '369', notation: 'FF 333 666 999 369', value: 30, suits: 2, concealed: true },

  // ============================================================
  // Singles and Pairs (all concealed)
  // ============================================================
  { id: 'sp-1', section: 'Singles and Pairs', notation: 'NN EE WW SS 1D 1D 1D', value: 50, suits: 3, concealed: true, dragonMatchesSuit: true, note: 'Any like no with matching dragon' },
  { id: 'sp-2', section: 'Singles and Pairs', notation: '[2 4 66 88] [2 4 66 88] [88]', value: 50, suits: 3, concealed: true, note: 'These nos only' },
  { id: 'sp-3', section: 'Singles and Pairs', notation: 'FF 3369 3669 3699', value: 50, suits: 3, concealed: true },
  { id: 'sp-4', section: 'Singles and Pairs', notation: '11 22 33 44 55 66 77', value: 50, suits: 1, concealed: true, note: 'Any 7 consec nos' },
  { id: 'sp-5', section: 'Singles and Pairs', notation: '[11 357 99] [11 357 99]', value: 50, suits: 2, concealed: true },
  { id: 'sp-6', section: 'Singles and Pairs', notation: 'FF 2026 2026 2026', value: 75, suits: 3, concealed: true },
];

export const SECTION_ORDER = [
  '2026',
  '2468',
  'Any Like Numbers',
  'Quints',
  'Consecutive Run',
  '13579',
  'Winds-Dragons',
  '369',
  'Singles and Pairs',
];
