# Technical Architecture

Runtime: static H5 game served from `/game/`.

Main files:

- `index.html`: DOM shell and touch controls.
- `js/main.js`: boot and animation frame.
- `js/engine.js`: assets, input, audio, save, procedural tiles.
- `js/render.js`: camera, lighting, weather, post-processing.
- `js/world.js`: map, entities, player, enemies, bosses.
- `js/game.js`: orchestration, save/load, events, combat, progression.
- `js/ui.js`: DOM HUD and modal UI.
- `js/data_world.js`: map and enemy data.
- `js/data_story.js`: story, interactions, events, clues.

The loop is separated from DOM UI: Canvas handles world drawing; DOM handles low-frequency text and menus.

No per-frame React state is used.
