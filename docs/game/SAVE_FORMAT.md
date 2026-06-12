# Save Format

Storage: `localStorage`.

Keys:

- `tbt_save_v2_auto`
- `tbt_save_v2_slot_1`
- `tbt_save_v2_slot_2`
- `tbt_save_v2_slot_3`
- Legacy read fallback: `tbt_save_v1`

Saved fields:

- Version.
- Map ID and player position.
- Player stats.
- Money.
- Flags.
- Inventory.
- Equipment.
- Clues.
- Tapes.
- Rules.
- Artifacts.
- Counters.
- Objective.
- Quest log.
- Map visits.
- Respawn point.
- Chapter/campaign state.
- Skills and camp upgrades.
- Tutorials shown.
- Timestamp.
- Boss state when a boss is active.
- Random seed.
- Read-story container.

Reliability:

- Auto save plus three manual slots.
- Previous save is copied to a per-slot backup before overwrite.
- Corrupted primary JSON falls back to backup when possible.
- Legacy `tbt_save_v1` auto-save data migrates to the v2 shape.
- Save slots expose JSON export and JSON import.
