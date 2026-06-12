# Game Current Audit

Date: 2026-06-12

Actual entry: `game/index.html`, loaded as `/game/`.

Runtime architecture: plain H5 + Canvas 2D + DOM UI. No Godot, no Unity runtime, no React dependency in the game loop.

Current playable flow:

1. Last bus.
2. Abandoned station.
3. Rainy mountain road.
4. Chen old house.
5. Cellar / unnamed family tomb.
6. Chapter 1 village and chapters 2-9 campaign maps.

Completed in this pass:

- Added bus and abandoned station prologue maps.
- Moved new game start to the last bus.
- Added bus box, station phone, station clock, old-house bowls, recorder, paper effigy, cellar hatch, artisan name wall, and stone beast interactions.
- Added Canvas vector protagonist and enemy silhouettes.
- Added quest log persistence and journal tab.
- Added auto save plus three manual save slots.
- Added mobile touch labels.
- Added asset manifest and license notes.
- Expanded `game/tools/audit_game.mjs` to 181 checks.
- Added `game/tools/system_tests.mjs` with 12 behavior/system tests.
- Added `game/tools/quality_score.mjs` with a 98/100 scoring gate.

Verification run:

- `node --check` on main JS modules: passed.
- `node game/tools/audit_game.mjs`: passed, 181 checks.
- `node game/tools/system_tests.mjs`: passed, 12 tests.
- `node game/tools/quality_score.mjs`: passed, score 98/100.
- Local browser desktop smoke test: title, new game, skip intro, playable state, no console errors.
- Local browser mobile landscape smoke test: playable controls in bounds, no console errors.
- Deployed to `https://yaokai.me/game/` and verified online with Nginx static serving.
- Online desktop browser smoke test: title, new game, skip intro, quest tracker, location card, no console errors.
- Online mobile landscape smoke test at 844x390: controls and HUD in bounds, no console errors.
- HTTP/HTTPS routing verified: `http://yaokai.me/game/` redirects to HTTPS, `https://yaokai.me/game` redirects to `/game/`, and `/game/` returns 200.
- Server fix completed: restored Nginx 443 SSL listener and added direct `/game/` static location while preserving the Next.js proxy.

Remaining production polish:

- Formal hand-painted final art can replace current SVG/Canvas assets using the stable asset IDs.
- More authored side quests can be added inside the unnamed family tomb.
- JSON save import/export, backup fallback, and v1-to-v2 migration are implemented for the browser storage layer.
