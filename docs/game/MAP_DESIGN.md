# Map Design

Maps are data objects in `game/js/data_world.js`.

Required map fields:

- `name`
- `grid`
- `tiles`
- `dark`
- `ambient`
- `spawns`
- `props`
- `triggers`
- `exits`

Prologue sequence:

- `bus`: small interior, box and passenger unease.
- `station`: abandoned public space, phone and clock clues.
- `shanlu`: narrow rainy road, paper person event.
- `laozhai`: readable old house with rooms, bowls, recorder, mother room, workbench, cellar hatch.
- `dijiao`: cellar/tomb transition, first fight, artisan name wall.

Design rule:

Every important map needs at least one landmark, one interaction, one lighting decision, and one objective change.
