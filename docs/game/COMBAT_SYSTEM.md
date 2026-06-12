# Combat System

Combat code lives mainly in `game/js/world.js` and `game/js/game.js`.

Player actions:

- Light attack.
- Charged heavy attack.
- Dodge with stamina cost and invulnerability window.
- Guard and perfect block.
- Lamp use.
- Skill 1 and skill 2 hooks.

Enemy requirements implemented:

- State machines with chase, windup, strike, tired, and phase behavior.
- Attack anticipation through windup animation and brightness.
- Paper hit particles, ghost visibility reduction, and knockback.
- Off-screen enemy update throttling in `game.js`.

Combat must never become only number exchange; every dangerous action needs visible or audio warning.
