// Card notation parser
//
// Converts NMJL card shorthand into structured groups for scoring.
//
// Notation rules:
//   - Digits: a run of identical digits = a group of that count.
//     "222" = pung of 2s, "6666" = kong of 6s, "11111" = quint of 1s.
//   - Mixed digit runs like "2026" or "2468" = a sequence of singles.
//   - "0" = White Dragon (Soap), used as zero in 2026 and 369 hands.
//   - "F" runs: pair/pung/kong/quint of flowers
//   - "D" runs: dragons whose suit is determined by hand metadata
//   - Winds (N/E/W/S) work like digits
//   - Spaces separate groups; each space-separated number-chunk gets a
//     new suit slot by default
//   - Brackets [...] explicitly group tokens into one shared suit slot.
//     Used for hands like "2 4 66 88 2 4 66 88 88" where tokens
//     1-4 share a suit, 5-8 share another suit, last is third.
//     Written: "[2 4 66 88] [2 4 66 88] [88]"
//
// Hand metadata determines how suit slots resolve:
//   suits: 0 (no suits, only winds/dragons), 1, 2, or 3
//   dragonMatchesSuit: dragons follow their slot's suit (default behavior)
//   anyDragon: any dragon works regardless
//   oppDragon: dragon is the opposite of the slot's suit

export function parseNotation(notation) {
  const groups = [];
  let chunkId = 0;
  let inGroup = false;
  let currentChunk = null;

  const tokens = notation
    .trim()
    .replace(/\[/g, ' [ ')
    .replace(/\]/g, ' ] ')
    .split(/\s+/)
    .filter(Boolean);

  for (const token of tokens) {
    if (token === '-or-') continue;
    if (token === '[') {
      inGroup = true;
      currentChunk = chunkId++;
      continue;
    }
    if (token === ']') {
      inGroup = false;
      currentChunk = null;
      continue;
    }

    const nextChunk = () => (inGroup ? currentChunk : chunkId++);

    let i = 0;
    while (i < token.length) {
      const ch = token[i];
      let j = i + 1;
      while (j < token.length && token[j] === ch) j++;
      const count = j - i;

      if (/[0-9]/.test(ch)) {
        if (count === 1 && j < token.length && /[0-9]/.test(token[j])) {
          // Multi-digit chunk like "2026" → singles
          const chunk = nextChunk();
          let k = i;
          while (k < token.length && /[0-9]/.test(token[k])) {
            const d = token[k];
            if (d === '0') {
              groups.push({ count: 1, kind: 'dragon-zero', _chunk: chunk });
            } else {
              groups.push({ count: 1, kind: 'value', value: parseInt(d), _chunk: chunk });
            }
            k++;
          }
          i = k;
          continue;
        }
        const chunk = nextChunk();
        if (ch === '0') {
          groups.push({ count, kind: 'dragon-zero', _chunk: chunk });
        } else {
          groups.push({ count, kind: 'value', value: parseInt(ch), _chunk: chunk });
        }
      } else if (ch === 'F') {
        groups.push({ count, kind: 'flower' });
      } else if (ch === 'D') {
        const chunk = nextChunk();
        groups.push({ count, kind: 'dragon', _chunk: chunk });
      } else if (ch === 'N' || ch === 'E' || ch === 'W' || ch === 'S') {
        groups.push({ count, kind: 'wind', wind: ch });
      } else {
        throw new Error(`Unknown character: ${ch} in token "${token}"`);
      }
      i = j;
    }
  }

  return groups;
}

// Expand a parsed hand into all valid concrete tile multisets,
// considering suit/dragon assignments.
export function expandHand(parsedGroups, meta) {
  const candidates = [];
  const chunks = [...new Set(
    parsedGroups
      .filter((g) => g.kind === 'value' || g.kind === 'dragon' || g.kind === 'dragon-zero')
      .map((g) => g._chunk)
  )];

  const SUITS = ['B', 'C', 'D'];
  let suitAssignments;

  if (!meta.suits || meta.suits === 0 || chunks.length === 0) {
    suitAssignments = [{}];
  } else if (meta.suits === 1) {
    suitAssignments = SUITS.map((s) =>
      Object.fromEntries(chunks.map((c) => [c, s]))
    );
  } else if (meta.suits === 2) {
    suitAssignments = [];
    for (const a of SUITS) {
      for (const b of SUITS) {
        if (a === b) continue;
        const n = chunks.length;
        // Cap enumeration to avoid blowup on hands with many chunks
        if (n > 12) {
          // Just try a few obvious split points
          const map = {};
          for (let k = 0; k < n; k++) map[chunks[k]] = k < Math.floor(n/2) ? a : b;
          suitAssignments.push(map);
          continue;
        }
        for (let mask = 0; mask < (1 << n); mask++) {
          const map = {};
          let usedA = false, usedB = false;
          for (let k = 0; k < n; k++) {
            if (mask & (1 << k)) { map[chunks[k]] = a; usedA = true; }
            else { map[chunks[k]] = b; usedB = true; }
          }
          if (usedA && usedB) suitAssignments.push(map);
        }
      }
    }
  } else if (meta.suits === 3) {
    suitAssignments = [];
    const n = chunks.length;
    if (n < 3) {
      for (const a of SUITS) for (const b of SUITS) {
        if (a === b) continue;
        const map = {};
        for (let k = 0; k < n; k++) map[chunks[k]] = k % 2 === 0 ? a : b;
        suitAssignments.push(map);
      }
    } else if (n > 9) {
      // Cap: split chunks roughly into thirds
      const map = {};
      const third = Math.ceil(n / 3);
      for (let k = 0; k < n; k++) {
        map[chunks[k]] = SUITS[Math.min(Math.floor(k / third), 2)];
      }
      suitAssignments.push(map);
    } else {
      const enumerate = (idx, current, used) => {
        if (idx === n) {
          if (used.size === 3) suitAssignments.push({ ...current });
          return;
        }
        for (const s of SUITS) {
          current[chunks[idx]] = s;
          const isNew = !used.has(s);
          if (isNew) used.add(s);
          enumerate(idx + 1, current, used);
          if (isNew) used.delete(s);
        }
      };
      enumerate(0, {}, new Set());
    }
  }

  // Collect dragon groups (each has its own slot)
  const dragonGroups = parsedGroups.filter((g) => g.kind === 'dragon');
  const dragonChunkIds = [...new Set(dragonGroups.map((g) => g._chunk))];
  const DRAGONS = ['GD', 'RD', 'WD'];

  // Build dragon assignments per suit assignment.
  // Default: each dragon chunk -> matching dragon for its suit slot.
  // multiDragonDistinct (or implied by 2+ dragon groups when meta.anyDragon
  // or meta.dragonsDistinct): each dragon chunk gets a distinct dragon
  // value. We enumerate all valid assignments.
  function dragonAssignmentsFor(suitAssign) {
    if (dragonChunkIds.length === 0) return [{}];

    if (meta.dragonsDistinct || (meta.anyDragon && dragonChunkIds.length >= 2)) {
      // Enumerate permutations of dragons for the dragon chunks
      // (distinct values required)
      const perms = [];
      const enumerate = (idx, current, used) => {
        if (idx === dragonChunkIds.length) {
          perms.push({ ...current });
          return;
        }
        for (const d of DRAGONS) {
          if (used.has(d)) continue;
          current[dragonChunkIds[idx]] = d;
          used.add(d);
          enumerate(idx + 1, current, used);
          used.delete(d);
        }
      };
      enumerate(0, {}, new Set());
      return perms;
    }

    if (meta.anyDragon) {
      // Single dragon chunk, any dragon — try all 3
      return DRAGONS.map((d) => ({ [dragonChunkIds[0]]: d }));
    }

    // Default: each dragon chunk gets the dragon determined by its
    // attached suit slot (matching, or opposite if meta.oppDragon)
    const map = {};
    for (const cid of dragonChunkIds) {
      const suit = suitAssign[cid];
      let dc;
      if (meta.oppDragon) {
        if (suit === 'B') dc = 'RD';
        else if (suit === 'C') dc = 'GD';
        else dc = 'GD';
      } else {
        dc = suit === 'B' ? 'GD' : suit === 'C' ? 'RD' : 'WD';
      }
      map[cid] = dc;
    }
    return [map];
  }

  for (const assign of suitAssignments) {
    const dragonAssigns = dragonAssignmentsFor(assign);
    for (const dAssign of dragonAssigns) {
      const tiles = new Map();
      for (const g of parsedGroups) {
        if (g.kind === 'value') {
          const code = `${g.value}${assign[g._chunk]}`;
          tiles.set(code, (tiles.get(code) || 0) + g.count);
        } else if (g.kind === 'dragon-zero') {
          tiles.set('WD', (tiles.get('WD') || 0) + g.count);
        } else if (g.kind === 'dragon') {
          const dc = dAssign[g._chunk];
          tiles.set(dc, (tiles.get(dc) || 0) + g.count);
        } else if (g.kind === 'wind') {
          tiles.set(g.wind, (tiles.get(g.wind) || 0) + g.count);
        } else if (g.kind === 'flower') {
          tiles.set('F', (tiles.get('F') || 0) + g.count);
        }
      }
      candidates.push(tiles);
    }
  }

  return candidates;
}
