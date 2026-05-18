import { HANDS, SECTION_ORDER } from '../src/data/cards.js';
import { rankHands, scoreHand } from '../src/lib/suggestEngine.js';
import { parseNotation, expandHand } from '../src/lib/cardParser.js';

let passed = 0, failed = 0;
const test = (name, fn) => {
  try { fn(); console.log('  ✓', name); passed++; }
  catch (e) { console.log('  ✗', name, '\n   ', e.message); failed++; }
};

console.log('Full card tests:');
test('55 hands present', () => {
  if (HANDS.length !== 55) throw new Error(`got ${HANDS.length}`);
});

test('all sections represented', () => {
  const sections = new Set(HANDS.map(h => h.section));
  for (const s of SECTION_ORDER) {
    if (!sections.has(s)) throw new Error(`missing section: ${s}`);
  }
});

test('all hands total 14 tiles', () => {
  for (const h of HANDS) {
    const parsed = parseNotation(h.notation);
    const total = parsed.reduce((s, g) => s + g.count, 0);
    if (total !== 14) throw new Error(`${h.id} (${h.notation}) has ${total} tiles`);
  }
});

test('bracket grouping: sp-2 has 3 chunks not 9', () => {
  const h = HANDS.find(x => x.id === 'sp-2');
  const parsed = parseNotation(h.notation);
  const chunks = [...new Set(parsed.filter(g => g.kind === 'value' || g.kind === 'dragon').map(g => g._chunk))];
  if (chunks.length !== 3) throw new Error(`expected 3 chunks, got ${chunks.length}`);
});

test('bracket grouping: sp-5 has 2 chunks', () => {
  const h = HANDS.find(x => x.id === 'sp-5');
  const parsed = parseNotation(h.notation);
  const chunks = [...new Set(parsed.filter(g => g.kind === 'value' || g.kind === 'dragon').map(g => g._chunk))];
  if (chunks.length !== 2) throw new Error(`expected 2 chunks, got ${chunks.length}`);
});

test('opposite dragon: quint-3 expects RD when suit=B', () => {
  const h = HANDS.find(x => x.id === 'quint-3');
  const parsed = parseNotation(h.notation);
  const cands = expandHand(parsed, h);
  // For suit=B, opp dragon should be RD; for suit=C, opp should be GD
  const hasOppForBams = cands.some(c => c.get('1B') === 5 && c.get('4B') === 5 && c.get('RD') === 4);
  if (!hasOppForBams) throw new Error('no candidate with B suit + RD opp dragon');
});

test('all hands rank without throwing', () => {
  const player = new Map([
    ['1B', 1], ['2B', 2], ['3C', 2], ['5D', 1],
    ['F', 2], ['GD', 1], ['J', 3], ['N', 2],
  ]);
  const ranked = rankHands(HANDS, player);
  if (ranked.length !== HANDS.length) throw new Error(`expected ${HANDS.length}, got ${ranked.length}`);
});

test('engine performance: ranks 50 hands in under 200ms', () => {
  const player = new Map([['1B', 1], ['2B', 2], ['3C', 2], ['F', 2], ['J', 3]]);
  const start = Date.now();
  for (let i = 0; i < 10; i++) rankHands(HANDS, player);
  const elapsed = Date.now() - start;
  const avg = elapsed / 10;
  console.log(`     (avg ${avg.toFixed(1)}ms per ranking)`);
  if (avg > 200) throw new Error(`too slow: ${avg}ms`);
});

test('full-match sanity: tiles for 2468-3 score 14/14', () => {
  // EE 22 444 666 88 WW in B
  const player = new Map([['E',2],['2B',2],['4B',3],['6B',3],['8B',2],['W',2]]);
  const ranked = rankHands(HANDS, player);
  const top = ranked.find(r => r.hand.id === '2468-3');
  if (top.score !== 14) throw new Error(`got ${top.score}`);
});

test('full-match: NEWS hand (sp-1 has NN EE WW SS 1D 1D 1D)', () => {
  // For "Any 3 suits, like # w matching dragon": 1B+GD, 1C+RD, 1D+WD
  // sp-1 needs: NN EE WW SS [1B GD][1C RD][1D WD]
  const player = new Map([
    ['N',2],['E',2],['W',2],['S',2],
    ['1B',1],['GD',1],['1C',1],['RD',1],['1D',1],['WD',1]
  ]);
  const ranked = rankHands(HANDS, player);
  const top = ranked.find(r => r.hand.id === 'sp-1');
  if (top.score !== 14) throw new Error(`got ${top.score}/14, need: ${[...top.needBreakdown.entries()]}`);
});

test('dragonsDistinct: wd-2 candidates use 3 different dragons', () => {
  const h = HANDS.find(x => x.id === 'wd-2');
  const parsed = parseNotation(h.notation);
  const cands = expandHand(parsed, h);
  // Each candidate should have exactly 3 distinct dragon types
  // 1234 DDD DDD DDDD = singles + 3 dragon kongs/pungs
  for (const c of cands) {
    const dragonTypes = ['GD','RD','WD'].filter(d => c.has(d));
    if (dragonTypes.length !== 3) {
      throw new Error(`expected 3 distinct dragons, got ${dragonTypes.join(',')}`);
    }
  }
});

test('dragonsDistinct: wd-7 has 2 distinct dragons per candidate', () => {
  const h = HANDS.find(x => x.id === 'wd-7');
  const parsed = parseNotation(h.notation);
  const cands = expandHand(parsed, h);
  for (const c of cands) {
    const dragonTypes = ['GD','RD','WD'].filter(d => c.has(d));
    if (dragonTypes.length !== 2) {
      throw new Error(`expected 2 distinct dragons, got ${dragonTypes.join(',')}`);
    }
  }
});

test('anyDragon single-group: alike-3 has 3 candidate dragon options', () => {
  // FF 1111 11 1111 DD has one DD group; anyDragon should try all 3 dragons
  const h = HANDS.find(x => x.id === 'alike-3');
  const parsed = parseNotation(h.notation);
  const cands = expandHand(parsed, h);
  // Count unique dragon choices across candidates
  const dragonsSeen = new Set();
  for (const c of cands) {
    for (const d of ['GD','RD','WD']) {
      if (c.has(d)) dragonsSeen.add(d);
    }
  }
  if (dragonsSeen.size !== 3) {
    throw new Error(`expected all 3 dragons across candidates, got ${[...dragonsSeen].join(',')}`);
  }
});

test('wd-2 perfect match scores 14/14', () => {
  // 1234 in suit B, then GD+GD+GD, RD+RD+RD, WD+WD+WD+WD
  const player = new Map([
    ['1B',1],['2B',1],['3B',1],['4B',1],
    ['GD',3],['RD',3],['WD',4]
  ]);
  const ranked = rankHands(HANDS, player);
  const top = ranked.find(r => r.hand.id === 'wd-2');
  if (top.score !== 14) throw new Error(`got ${top.score}/14`);
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
