# Art Bible

Visual direction: late-1990s rainy southern Chinese county horror, ink-dark palette, wet wood, mud, brick, tomb stone, cinnabar red, weak warm lamp light.

Current asset strategy:

- Runtime props are crisp SVG under `game/assets/art/`.
- Player and enemy readability is upgraded through Canvas vector silhouettes in `game/js/world.js`.
- Tile materials are procedural Canvas textures in `game/js/engine.js`.
- Mobile UI is DOM/CSS and should remain sharp at high DPI.

Palette anchors:

- Ink black: `#06070a`
- Old paper: `#d8cfb8`
- Bone subtitle: `#e8e0cc`
- Cinnabar red: `#8e2a35`
- Lamp gold: `#c9a45c`

Replacement rule:

Final hand-painted assets must preserve stable IDs, anchors, collision assumptions, and silhouette readability.
