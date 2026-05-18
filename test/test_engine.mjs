// Smoke tests for the suggestion engine.
// Run: npm test
import { HANDS } from '../src/data/cards.js';
import { rankHands } from '../src/lib/suggestEngine.js';
import { parseNotation, expandHand } from '../src/lib/cardParser.js';

let passed = 0, failed = 0;
const test = (name, fn) => {
  try { fn(); console.log('  ✓', name); passed++; }
  catch (e) { console.log('  ✗', name, '\n   ', e.message); failed++; }
};

console.log('Parser tests:');
test('parses pung', () => {
  const g = parseNotation('222');
  if (g.length !== 1 || g[0].count !== 3 || g[0].value !== 2) throw new Error(JSON.stringify(g));
});
test('parses 2026 as singles', () => {
  const g = parseNotation('2026');
  if (g.length !== 4) throw new Error(`got ${g.length} groups: ${JSON.stringify(g)}`);
  if (g[1].kind !== 'dragon-zero') throw new Error('0 should be dragon-zero');
});
test('parses winds', () => {
  const g = parseNotation('NNNN EEE');
  if (g.length !== 2 || g[0].count !== 4 || g[0].wind !== 'N') throw new Error(JSON.stringify(g));
});

console.log('\nEngine tests:');
test('empty hand returns no ranked hands', () => {
  const r = rankHands(HANDS, new Map());
  if (r.length !== 0 && r[0].score > 0) throw new Error('expected 0 score');
});
test('all hands total 14 tiles', () => {
  for (const h of HANDS) {
    const parsed = parseNotation(h.notation);
    const total = parsed.reduce((s, g) => s + g.count, 0);
    if (total !== 14) throw new Error(`${h.id} (${h.notation}) has ${total} tiles`);
  }
});
test('full match scores 14/14', () => {
  // Build the exact tiles for 2468-3: EE 22 444 666 88 WW in B
  const player = new Map([['E',2],['2B',2],['4B',3],['6B',3],['8B',2],['W',2]]);
  const r = rankHands(HANDS, player);
  const top = r.find(x => x.hand.id === '2468-3');
  if (!top || top.score !== 14) throw new Error(`expected 14/14, got ${top?.score}`);
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
