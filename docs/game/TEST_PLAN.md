# Test Plan

Automated checks:

- `node --check game/js/data_world.js`
- `node --check game/js/data_story.js`
- `node --check game/js/game.js`
- `node --check game/js/world.js`
- `node --check game/js/ui.js`
- `node --check game/js/engine.js`
- `node game/tools/audit_game.mjs`
- `node game/tools/system_tests.mjs`
- `node game/tools/quality_score.mjs`

Audit coverage currently includes:

- Required maps.
- Required prologue props.
- Required interactions.
- Required clues and events.
- Asset existence.
- Asset manifest.
- Player/enemy vector rendering hooks.
- Quest log and manual save exposure.
- Save JSON import/export, backup, migration, seed, and boss state fields.
- Campaign chapters 2-9.
- Skill tree, endings, equipment minimums.

System test coverage:

- Fixed timestep.
- Diagonal input speed.
- Clamp boundaries.
- Seeded RNG determinism.
- Weapon generation determinism.
- Drop roll determinism.
- Equipment aggregation.
- Save migration.
- Prologue interactions/events.
- Once-trigger IDs.
- Enemy telegraph data.
- Mobile/save UI exposure.
- 98-point quality scoring gate.

Manual checks completed locally:

- Desktop browser title and new-game flow.
- Playable state after skipping intro.
- Mobile landscape playable controls.
- Console error/warning check.

Recommended pre-release manual checks:

- Desktop Chrome.
- Desktop Safari.
- iOS Safari landscape.
- Android Chrome landscape.
- Refresh and continue from auto save.
- Save/load each manual slot.
- Slow-network first load.
