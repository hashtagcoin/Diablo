# Diablo-like HTML MVP Plan

## MVP Goal

Build a single-page HTML/Canvas MVP that proves the core loop: explore a small dark-fantasy map, fight nearby enemies, talk to one NPC, collect loot, manage a tiny inventory, and persist progress with `localStorage`.

## Existing Assets

- Use `sprite-lookup.json` as the source of truth for sprite sheet coordinates.
- Sprite sheets are 5x5 grids with 128px cells and 16px spacing: `characters.png`, `items.png`, `weapons.png`, `armour.png`, `ui.png`.
- Treat current art as portrait/icon assets. For the first MVP, use them for HUD panels, NPC/enemy portraits, loot icons, equipment, buttons, map markers, and dialogue faces.
- Do not block gameplay on full walk-cycle sprites. Represent world actors with simple canvas silhouettes, circles, or cropped character portraits until animation sheets exist.

## Gameplay Loop

1. Spawn the player in a small town edge area.
2. Player moves around a bounded map, discovers enemies and one NPC.
3. Enemy enters combat range, attacks on cooldown, and can be defeated.
4. Defeated enemies drop gold or one item icon from `items.png`, `weapons.png`, or `armour.png`.
5. Player clicks or walks over loot to collect it.
6. Inventory updates immediately and saves to `localStorage`.
7. NPC offers a short dialogue and one simple task: defeat 3 enemies or collect 3 items.
8. Completing the task grants gold or a starter weapon and updates the saved state.

## Controls

- `WASD` / arrow keys: move player.
- Mouse click on map: optional click-to-move target.
- Left click enemy: select/attack target.
- `Space`: basic attack selected/nearest enemy.
- `E`: interact with nearby NPC, chest, or loot.
- `I`: toggle inventory.
- `M`: toggle minimap or map overlay.
- `Esc`: close open panel, then clear target.
- Mouse wheel or `+` / `-`: zoom map camera.

Keep controls forgiving: if no enemy is selected, `Space` attacks the nearest enemy in range; if no interactable is focused, `E` picks the nearest valid object.

## Map And Zoom

- Use a canvas world larger than the viewport, for example `2400x1600`.
- Start with a handcrafted map data object: collision rectangles, spawn points, NPC location, enemy zones, and loot positions.
- Camera follows the player with clamped bounds.
- Support zoom levels `0.75`, `1`, `1.25`, and `1.5`.
- Render order:
  1. ground/background tiles or procedural dark floor
  2. props/collision hints
  3. loot
  4. enemies/NPC/player
  5. selection rings, damage numbers, interaction prompts
  6. HUD panels
- Add a small minimap using simplified rectangles/dots before attempting a detailed map texture.

## Combat

- Use deterministic, readable stats:
  - Player: HP, max HP, attack, defense, attack cooldown, gold.
  - Enemy: HP, attack, aggro radius, attack range, move speed, loot table.
- MVP enemies:
  - Ghoul: weak melee enemy.
  - Brute: slower, more HP.
  - Wraith: fragile but higher damage.
- Combat flow:
  1. Enemy detects player inside aggro radius.
  2. Enemy approaches until attack range.
  3. Both sides attack on cooldown if in range.
  4. Damage is `max(1, attacker.attack - defender.defense)`.
  5. On enemy death, spawn loot and increment quest progress.
  6. On player death, respawn at town with full HP and keep inventory for MVP simplicity.
- Add hit flashes, floating damage numbers, and HP bars as the minimum feedback layer.

## NPC Chat

- Add one NPC near spawn with a character portrait from `characters.png`.
- Use a modal or bottom dialogue panel styled with `ui.png` frame/panel sprites.
- Dialogue state:
  - greeting
  - quest offered
  - quest in progress
  - quest complete
  - reward claimed
- Data shape should be plain JSON-like objects so more NPCs can be added without rewriting UI code.
- Keep text short and skippable. The chat panel needs: portrait, speaker name, dialogue line, next/accept/close buttons.

## Inventory And localStorage

- Inventory MVP:
  - 20 slots.
  - Stackable gold/items where useful.
  - Equipment slots: weapon, armour, trinket.
  - Item tooltip with name, type, rarity, and stat changes.
- Persist one save key, for example `diabloMvpSave`.
- Save:
  - player stats
  - position
  - inventory
  - equipped item ids
  - gold
  - quest state
  - defeated enemy count
  - settings such as zoom
- Load defensively: if save data is missing, invalid, or has an older schema version, start from defaults.
- Include `New Game` / `Reset Save` in a small settings menu for development.

## Asset Strategy

- Build a `SpriteAtlas` helper that loads `sprite-lookup.json`, maps sprite ids to sheet images, and exposes `drawSprite(ctx, id, x, y, size)`.
- Prefer sprite ids over hardcoded coordinates everywhere.
- Use `ui.png` for inventory frames, buttons, map markers, health/mana orbs, checkboxes, and panel textures.
- Use `characters.png` for NPC/enemy portraits and possible actor billboards.
- Use `items.png`, `weapons.png`, and `armour.png` for loot drops, inventory icons, and equipment rewards.
- Add a missing-sprite fallback rectangle with the requested id printed in debug mode.
- Keep generated future assets in the same lookup format so the renderer does not need to change.

## Implementation Slices

1. Canvas boot, asset loader, sprite atlas, main loop.
2. Player movement, camera follow, collision bounds.
3. Map entities: NPC, enemies, loot, interactable markers.
4. Combat targeting, cooldown attacks, HP bars, enemy death.
5. Loot drops, inventory panel, item tooltips.
6. `localStorage` save/load/reset.
7. NPC dialogue and simple quest reward.
8. Zoom controls, minimap, UI polish, audio placeholders.

Each slice should remain playable before moving to the next.

## Verification Checklist

- App loads with no console errors after a hard refresh.
- All sprite sheets load, and missing sprite ids fail visibly in debug mode.
- Player moves with keyboard and cannot leave map bounds.
- Camera follows player and clamps correctly at all zoom levels.
- Enemy aggro, attacks, damage, death, and loot drops work repeatedly.
- Player death respawns cleanly without corrupting inventory.
- NPC dialogue opens/closes and quest state advances.
- Inventory opens with `I`, shows collected loot, equips allowed items, and updates stats.
- Save persists after refresh: position, inventory, gold, equipment, quest state, and zoom.
- Reset save returns to the default state.
- UI remains usable at common desktop sizes and a narrow mobile-width browser.
- No HTML/CSS/JS files are changed while this planning document is being added.
