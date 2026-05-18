// Suggestion engine
//
// Given a player's hand (multiset of tiles including jokers), score each
// candidate hand on the card and return a ranked list.
//
// Joker rules in American Mah Jongg:
//   - Jokers may substitute for tiles in any group of 3+ (pung, kong, quint).
//   - Jokers may NOT be used in pairs or singles.
//   - "Concealed" hands have the same joker rules but must be self-drawn.

import { parseNotation, expandHand } from './cardParser.js';

// Score a single candidate tile multiset against the player's hand.
// Returns: { tilesHave, tilesNeed, jokersUsed, jokersNeeded, achievable }
function scoreCandidate(candidate, playerTiles, options = {}) {
  const playerCopy = new Map(playerTiles);
  const have = new Map();
  const need = new Map();
  let jokersAvailable = playerCopy.get('J') || 0;
  playerCopy.delete('J');
  let jokersUsed = 0;

  // First pass: take from player's actual tiles
  for (const [tile, count] of candidate.entries()) {
    const haveCount = playerCopy.get(tile) || 0;
    const taken = Math.min(haveCount, count);
    if (taken > 0) {
      have.set(tile, taken);
      playerCopy.set(tile, haveCount - taken);
    }
    const remaining = count - taken;
    if (remaining > 0) need.set(tile, remaining);
  }

  // Second pass: apply jokers to groups of 3+
  // We need to know which target groups have count >= 3
  // For each tile in `need`, joker can fill if the ORIGINAL candidate count >= 3
  const needAfterJokers = new Map();
  for (const [tile, remaining] of need.entries()) {
    const originalCount = candidate.get(tile);
    const jokerEligible = originalCount >= 3 && tile !== 'F'; // flowers are weird; treat as joker-ineligible for safety
    if (jokerEligible && jokersAvailable > 0) {
      // How many jokers we can apply here: limited by jokers, and by the
      // group needing to retain at least one natural tile? No — in American
      // MJ rules, you can fill a whole pung with jokers as long as you have
      // them. Actually, re-checking the rules: you need at least one of the
      // actual tile to declare the group when exposed. For closed groups
      // jokers can fill freely. For v1 we'll go with: jokers can substitute
      // any tile in a group of 3+. This is the common house rule.
      const used = Math.min(jokersAvailable, remaining);
      jokersAvailable -= used;
      jokersUsed += used;
      const stillNeeded = remaining - used;
      if (stillNeeded > 0) needAfterJokers.set(tile, stillNeeded);
    } else {
      needAfterJokers.set(tile, remaining);
    }
  }

  // Concealed hands: do not use jokers as freely if option set
  // (For v1 we apply jokers regardless; flag if it's a concealed hand)

  const totalNeeded = [...needAfterJokers.values()].reduce((a, b) => a + b, 0);
  const totalHave = 14 - totalNeeded;

  return {
    tilesHave: totalHave,
    tilesNeed: totalNeeded,
    jokersUsed,
    jokersRemaining: jokersAvailable,
    needBreakdown: needAfterJokers,
    achievable: totalNeeded === 0,
  };
}

// Score a hand against the player's tiles. Tries all suit assignments
// and returns the best one.
export function scoreHand(hand, playerTiles) {
  const parsed = parseNotation(hand.notation);
  const candidates = expandHand(parsed, hand);

  let best = null;
  let bestCandidate = null;
  for (const cand of candidates) {
    const result = scoreCandidate(cand, playerTiles);
    if (!best || result.tilesHave > best.tilesHave ||
        (result.tilesHave === best.tilesHave && result.jokersUsed < best.jokersUsed)) {
      best = result;
      bestCandidate = cand;
    }
  }

  return {
    hand,
    score: best.tilesHave,
    jokersUsed: best.jokersUsed,
    tilesNeeded: best.tilesNeed,
    needBreakdown: best.needBreakdown,
    achievable: best.achievable,
    bestCandidate, // the concrete tile multiset for the best assignment
  };
}

// Rank all hands against the player's tiles
export function rankHands(hands, playerTiles) {
  const scored = hands.map((h) => scoreHand(h, playerTiles));
  // Sort: more tiles you have > fewer jokers needed > higher hand value
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.jokersUsed !== b.jokersUsed) return a.jokersUsed - b.jokersUsed;
    return b.hand.value - a.hand.value;
  });
  return scored;
}
