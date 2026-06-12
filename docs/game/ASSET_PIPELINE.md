# Asset Pipeline

Current pipeline:

1. Add stable asset IDs to `ART_LIST` in `game/js/data_world.js`.
2. Add or update drawing templates in `game/tools/generate_art_assets.mjs`.
3. Run `node game/tools/generate_art_assets.mjs`.
4. Verify generated SVG files exist under `game/assets/art/`.
5. Register props in map data and interaction data.
6. Run `node game/tools/audit_game.mjs`.

Runtime loading:

- `Assets` loads SVG/PNG files from `assets/art/`.
- Canvas vector renderers in `world.js` are used for readable player and enemy silhouettes.
- Tile textures are generated in `engine.js`.

Replacement policy:

- Preserve filename and asset ID.
- Preserve transparent background.
- Preserve readable silhouette at 32-80 px in-game scale.
- Update license notes if external resources are introduced.
