# Mahjong Hand Helper

Personal helper American Mahjong tiles you've entered and ranks hands from the card by how close you are to completing each one.

Built as a React PWA — installable to iPhone home screen, works offline once installed.

## Status

**v2 (current):** Full 2026 card transcription — 55 hands across all 9 sections. Tile picker, hand display, suggestion engine with optimal joker usage, opposite-dragon and any-dragon handling, bracket-based suit-slot grouping, PWA shell, local storage. 16 passing tests.

**v3 (planned):** Computer vision for photo-based tile detection. Approach: small custom YOLO/classification model fine-tuned on photos of your tile set, running in-browser via ONNX Runtime Web. See `docs/cv-roadmap.md` (TODO).

## Usage

```bash
npm install
npm run dev          # local dev server
npm run build        # production build to ./dist
npm run preview      # serve the built version
```

Deploy `./dist` to any static host (GitHub Pages, Netlify, Vercel, your own server).

## Installing on iPhone

1. Open the deployed URL in Safari.
2. Tap the Share button.
3. Tap "Add to Home Screen".
4. The app opens fullscreen with no browser chrome.

## Architecture

```
src/
  data/
    tiles.js          Tile type definitions, picker grouping
    cards.js          2026 NMJL hand list (notation strings + metadata)
  lib/
    cardParser.js     Parses card shorthand (e.g. "FFF 2026 222 6666")
                      into structured groups with suit slots
    suggestEngine.js  Scores each hand against player's tiles,
                      handles optimal joker placement, ranks results
  components/
    Tile.jsx          Single tile button
    HandDisplay.jsx   Player's current hand
    Suggestion.jsx    Scored hand card
  App.jsx             Main app, state, layout
  main.jsx            React entrypoint
  styles.css          App styles
```

## Hand notation reference

The card uses shorthand like:

- `222` → pung of 2s (three of a kind)
- `2222` → kong of 2s (four of a kind)
- `11111` → quint of 1s (five of a kind, requires jokers)
- `22` → pair of 2s
- `2026` → single 2, single 0, single 2, single 6 (a sequence)
- `0` → White Dragon used as zero
- `FF` → pair of flowers; `FFFFF` → quint of flowers
- `D` → dragon (the suit depends on the hand's modifier — "matching dragon" follows the suit assigned to that group)
- `N`, `E`, `W`, `S` → winds (repeats like `NN`, `NNNN` work the same)
- `[...]` → bracket grouping: tokens inside share one suit slot. Used for hands like Singles & Pairs #2 (`[2 4 66 88] [2 4 66 88] [88]`) where the visual structure on the card spans multiple space-separated tokens.

Each hand has metadata:
- `value`: point value when achieved
- `suits`: how many distinct suits the hand uses (0, 1, 2, or 3)
- `concealed`: must be self-drawn
- `dragonMatchesSuit`: dragons follow their suit assignment (default behavior)
- `anyDragon`: any dragon works regardless of suit
- `oppDragon`: dragon is the *opposite* of the assigned suit (e.g., Quints #3)

## Joker rules

The engine applies the common American Mahjong joker rules:
- Jokers may substitute in any group of 3 or more (pung, kong, quint).
- Jokers may **not** substitute in pairs or singles.
- The engine uses jokers greedily to maximize match score, then minimizes joker usage among equally-good matches.

## Legal note

The NMJL card is copyrighted by the National Mah Jongg League. This app is for **personal use only** — for the maintainer's own use of their own purchased card on their own device. Do not distribute, publish, or share the encoded card data.

## License

Not licensed for redistribution. Source code is personal.
