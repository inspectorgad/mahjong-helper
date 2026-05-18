export default function Suggestion({ result }) {
  const { hand, score, jokersUsed, needBreakdown, achievable } = result;
  const pct = Math.round((score / 14) * 100);
  const needStr = [...needBreakdown.entries()]
    .map(([t, c]) => `${t}×${c}`)
    .join(' ');

  return (
    <div className="suggestion">
      <div className="sug-top">
        <div>
          <div className="sug-notation">{hand.notation}</div>
          <div className="sug-meta">
            {hand.section} · {hand.value} pts
            {hand.concealed && ' · concealed'}
          </div>
        </div>
        <div className="sug-score">
          <div className="sug-score-num">{score}/14</div>
          {jokersUsed > 0 && <div className="sug-jokers">{jokersUsed} jokers</div>}
        </div>
      </div>
      <div className="sug-bar">
        <div className="sug-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      {achievable ? (
        <div className="sug-complete">Complete hand!</div>
      ) : (
        <div className="sug-need">Need: {needStr}</div>
      )}
      {hand.note && <div className="sug-note">{hand.note}</div>}
    </div>
  );
}
