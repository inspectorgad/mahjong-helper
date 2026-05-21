# Mahjong Hand Helper

Personal helper for the 2026 American Mahjong card. Takes a set of tiles you've entered and ranks hands by how close you are to completing each one.

React PWA — installable to iPhone home screen, works offline once installed.

## Usage

    npm install
    npm run dev          # local dev server
    npm run build        # production build to ./dist
    npm test             # run tests

## Architecture

    src/
      data/         Tile definitions, encoded card hands
      lib/          Notation parser, suggestion engine
      components/   React components
      App.jsx       Main app

## Personal use only

Built for the maintainer's own use. Not licensed for redistribution.