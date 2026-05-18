function tileClass(code) {
  if (/^[1-9]B$/.test(code)) return 'tile bam';
  if (/^[1-9]C$/.test(code)) return 'tile crack';
  if (/^[1-9]D$/.test(code)) return 'tile dot';
  if (code === 'GD') return 'tile dragon-g';
  if (code === 'RD') return 'tile dragon-r';
  if (code === 'WD') return 'tile dragon-w';
  if (code === 'F') return 'tile flower';
  if (code === 'J') return 'tile joker';
  return 'tile';
}

export default function Tile({ code, onClick }) {
  return (
    <button className={tileClass(code)} onClick={onClick} type="button">
      {code}
    </button>
  );
}
