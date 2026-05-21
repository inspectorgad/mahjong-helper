import { useState, useMemo } from 'react';
import { HANDS, SECTION_ORDER } from '../data/cards.js';

function renderNotation(notation, suits) {
  let chunkId = 0;
  let inGroup = false;
  let currentChunk = null;
  const colorClass = (chunk) => {
    if (suits === 0 || suits === 1) return 'chunk-x';
    return `chunk-${chunk % 3}`;
  };
  const tokens = notation
    .replace(/\[/g, ' [ ')
    .replace(/\]/g, ' ] ')
    .split(/\s+/)
    .filter(Boolean);

  const parts = [];
  let key = 0;
  for (const tok of tokens) {
    if (tok === '[') { inGroup = true; currentChunk = chunkId++; continue; }
    if (tok === ']') { inGroup = false; currentChunk = null; continue; }
    const nextChunk = () => (inGroup ? currentChunk : chunkId++);

    let i = 0;
    while (i < tok.length) {
      const ch = tok[i];
      let j = i + 1;
      while (j < tok.length && tok[j] === ch) j++;
      const count = j - i;
      const text = tok.substring(i, j);

      if (/[0-9]/.test(ch)) {
        if (count === 1 && j < tok.length && /[0-9]/.test(tok[j])) {
          let k = i;
          let mt = '';
          while (k < tok.length && /[0-9]/.test(tok[k])) {
            mt += tok[k];
            k++;
          }
          const chunk = nextChunk();
          parts.push(<span key={key++} className={colorClass(chunk)}>{mt}</span>);
          i = k;
          continue;
        }
        const chunk = nextChunk();
        parts.push(<span key={key++} className={colorClass(chunk)}>{text}</span>);
      } else if (ch === 'D') {
        const chunk = nextChunk();
        parts.push(<span key={key++} className={colorClass(chunk)}>{text}</span>);
      } else if ('FNEWS'.includes(ch)) {
        parts.push(<span key={key++} className="chunk-x">{text}</span>);
      } else {
        parts.push(text);
      }
      i = j;
    }
    parts.push(' ');
  }
  return parts;
}

export default function CardReference() {
  const [filter, setFilter] = useState('');

  const grouped = useMemo(() => {
    const f = filter.toLowerCase().trim();
    const result = {};
    for (const s of SECTION_ORDER) result[s] = [];
    for (const h of HANDS) {
      const matches =
        !f ||
        h.section.toLowerCase().includes(f) ||
        h.notation.toLowerCase().includes(f) ||
        (h.note || '').toLowerCase().includes(f);
      if (matches) result[h.section].push(h);
    }
    return result;
  }, [filter]);

  const hasAny = Object.values(grouped).some((arr) => arr.length > 0);

  return (
    <div className="card-ref">
      <input
        type="text"
        className="ref-filter"
        placeholder="Filter by section, pattern, or note…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        autoComplete="off"
      />

      <div className="ref-legend">
        <div className="ref-legend-item"><span className="ref-dot ref-c0"></span>1st suit</div>
        <div className="ref-legend-item"><span className="ref-dot ref-c1"></span>2nd suit</div>
        <div className="ref-legend-item"><span className="ref-dot ref-c2"></span>3rd suit</div>
        <div className="ref-legend-item"><span className="ref-dot ref-cx"></span>Agnostic / winds</div>
      </div>

      {!hasAny && <div className="ref-empty">No hands match that filter.</div>}

      {SECTION_ORDER.map((section) => {
        const items = grouped[section];
        if (items.length === 0) return null;
        return (
          <div key={section} className="ref-section">
            <div className="ref-section-header">{section}</div>
            {items.map((h) => (
              <div key={h.id} className="ref-hand">
                <div className="ref-notation">{renderNotation(h.notation, h.suits)}</div>
                <div className="ref-meta">
                  <div className="ref-meta-left">{h.note || ''}</div>
                  <div>
                    <span className="ref-value">
                      {h.concealed ? 'C' : 'x'} {h.value}
                    </span>
                    {h.concealed && <span className="ref-conc">concealed</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
