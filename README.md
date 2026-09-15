# Around Home

An interactive neighbourhood map for central Sofia: browse the shops, pharmacies, cafés,
clinics, cinemas and other public places around a chosen home location, and keep your own
notes and tags on top of them.

## Features

- **Map** — Leaflet + OpenStreetMap tiles, marker clustering, zoom up to street level.
- **~4,650 real places** across 14 categories, pre-loaded from OpenStreetMap.
- **Search & filter** by name, address, type, category, or your own tags.
- **Your own data** — add places, edit or delete existing ones, attach notes.
- **Custom tags** — create tags, apply them to any place, filter by them, rename one everywhere.
- **Set your home** by address lookup or by clicking the map; places are sorted by distance from it.

Everything you add or change is stored in your browser's local storage. There is no backend
and no data leaves your machine — the home location you set is never committed or uploaded.

## Development

```bash
npm install
npm run dev
```

## Data

Place data is derived from [OpenStreetMap](https://www.openstreetmap.org/) via the Overpass
API, © OpenStreetMap contributors, licensed under the
[Open Database License (ODbL)](https://opendatacommons.org/licenses/odbl/). Address lookups
use OSM's [Nominatim](https://nominatim.org/) geocoder.
