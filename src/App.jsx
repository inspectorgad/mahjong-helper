import { useState, useMemo, useEffect } from 'react';
import { TILE_GROUPS } from './data/tiles.js';
import { HANDS } from './data/cards.js';
import { rankHands } from './lib/suggestEngine.js';
import Tile from './components/Tile.jsx';
import HandDisplay from './components/HandDisplay.jsx';
import Suggestion from './components/Suggestion.jsx';

const STORAGE_KEY = 'mahjong-hand-v1';

export default function App() {
  const [hand, setHand] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return new Map(JSON.parse(saved));
    } catch {}
    return new Map();
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...hand.entries()]));
  }, [hand]);

  const totalTiles = useMemo(
    () => [...hand.values()].reduce((a, b) => a + b, 0),
    [hand]
  );

  const ranked = useMemo(() => {
    if (totalTiles === 0) return [];
    return rankHands(HANDS, hand);
  }, [hand, totalTiles]);

  const addTile = (t) => {
    setHand((h) => {
      const next = new Map(h);
      next.set(t, (next.get(t) || 0) + 1);
      return next;
    });
  };

  const removeTile = (t) => {
    setHand((h) => {
      const next = new Map(h);
      const c = next.get(t) || 0;
      if (c <= 1) next.delete(t);
      else next.set(t, c - 1);
      return next;
    });
  };

  const clear = () => setHand(new Map());

  const loadSample = () => {
    setHand(new Map([
      ['2B', 2], ['2C', 1], ['6B', 2], ['6C', 2],
      ['F', 2], ['WD', 1], ['GD', 1], ['J', 2], ['N', 1],
    ]));
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Mahjong Helper</h1>
        <p className="app-sub">2026 the card card</p>
      </header>

      <section className="section">
        <h2 className="section-title">Your hand</h2>
        <HandDisplay hand={hand} onRemove={removeTile} />
        <div className="hand-meta">
          <span>{totalTiles} of 13 tiles</span>
          <div className="actions">
            <button onClick={loadSample}>Sample</button>
            <button onClick={clear}>Clear</button>
          </div>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Add tiles</h2>
        {TILE_GROUPS.map((g) => (
          <div key={g.label} className="tile-group">
            <div className="tile-group-label">{g.label}</div>
            <div className="tile-grid">
              {g.tiles.map((t) => (
                <Tile key={t} code={t} onClick={() => addTile(t)} />
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="section">
        <h2 className="section-title">Suggestions</h2>
        {ranked.length === 0 ? (
          <p className="empty">Add tiles to see hand suggestions.</p>
        ) : (
          ranked.slice(0, 10).map((r) => (
            <Suggestion key={r.hand.id} result={r} />
          ))
        )}
      </section>

      <footer className="app-footer">
        <p>Personal use only. the card card © the card publisher.</p>
      </footer>
    </div>
  );
}
