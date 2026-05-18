import Tile from './Tile.jsx';

export default function HandDisplay({ hand, onRemove }) {
  const tiles = [];
  for (const [code, count] of hand.entries()) {
    for (let i = 0; i < count; i++) tiles.push(code);
  }

  if (tiles.length === 0) {
    return <div className="hand empty">No tiles yet</div>;
  }

  // Sort for stable display
  tiles.sort();

  return (
    <div className="hand">
      {tiles.map((code, idx) => (
        <Tile key={`${code}-${idx}`} code={code} onClick={() => onRemove(code)} />
      ))}
    </div>
  );
}
