# Equipment System

Equipment data lives in `game/js/data_items.js`.

Current systems:

- 16 equipment slots.
- Weapon templates.
- Gear bases.
- Charms.
- Lamps.
- Consumables.
- Artifacts and repair bonuses.
- Rarity colors and item descriptions.
- Loot drops and equipment comparison in the inventory UI.

Save format stores plain item objects, not class instances.

Future extension:

The third-stage unnamed family tomb can add more affix conflicts, set bonuses, and named unique gear while preserving current item object shape.
