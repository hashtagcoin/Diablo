# Umbral Descent HTML ARPG - Progress Handoff

## Project

Workspace: `D:\codex-projects\Diablo`

Run locally:

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

Open:

```text
http://127.0.0.1:8765/index.html
```

The current preview server was started during development on port `8765`.

## Current State

This is now a playable single-page HTML/Canvas dark-fantasy ARPG MVP. It has:

- Isometric canvas world.
- Generated gothic UI and environment assets.
- Active party/squad control.
- Per-hero inventory/equipment rendering.
- Drag reorder and drag-to-equip inventory interactions.
- Melee, ranged, fire, and frost attacks.
- Enemy AI, loot drops, NPC chat, buildings, minimap, and localStorage save.
- Deterministic chunked procedural world generation around the player.

## Main Files

- `index.html`: UI shell, party cards, quest panel, minimap, inventory panel, chat panel, HUD, controls hint.
- `styles.css`: All layout and visual styling, including generated UI frame/orbs, fixed inventory layout, HUD, party cards.
- `game.js`: Main game loop, rendering, procedural world, squad control, combat, inventory, persistence.
- `MVP_PLAN.md`: Original MVP implementation plan.
- `INVENTORY_FRAME_PLAN.md`: Inventory panel/frame architecture plan.
- `PROGRESS.md`: This handoff file.

## Asset Files

Original/generated sprite sheets already in root:

- `items.png`
- `weapons.png`
- `armour.png`
- `characters.png`
- `ui.png`
- `sprite-lookup.json`

Generated UI assets:

- `assets/ui/inventory-panel-frame.png`
- `assets/ui/health-orb.png`
- `assets/ui/mana-orb.png`
- `assets/ui/hud-bar.png`
- `assets/ui/skill-slot.png`
- `assets/ui/minimap-frame.png`
- `assets/ui/quest-panel.png`
- `assets/ui/button-gold.png`
- `assets/ui/manifest.json`

Generated world assets:

- `assets/world/temple.png`
- `assets/world/forge.png`
- `assets/world/sanctum.png`
- `assets/world/dungeon-floor.png`
- `assets/world/ruin-prop.png`
- `assets/world/dead-tree.png`
- `assets/world/obelisk.png`
- `assets/world/backdrop.png`
- `assets/world/manifest.json`

Generated biome atlases:

- `assets/biome/biome-forest-atlas.png`
- `assets/biome/biome-village-atlas.png`
- `assets/biome/biome-creatures-buildings-atlas.png`
- `assets/biome/manifest.json`

The biome manifest contains sprite ids, atlas names, approximate 4x4 cell coordinates, and prompt summaries.

## Controls

- `WASD`: move active hero.
- `Tab`: cycle active hero.
- `F1`, `F2`, `F3`: select Alaric, Sable, Rowan.
- Click party card: select hero.
- Mouse wheel: zoom.
- Click enemy: attack target.
- `Space`: attack nearest enemy.
- `1`: melee.
- `2`: ranged.
- `3`: fire spell.
- `4`: frost spell.
- `Q`: use health potion.
- `R`: use mana potion.
- `E`: talk to nearby NPC or enter nearby building.
- `I`: toggle inventory.
- Drag inventory item: reorder.
- Drag inventory item onto equipment slot: equip if compatible.

## Implemented Systems

### Procedural World

`game.js` now uses a deterministic chunk model:

- `WORLD_SEED`
- `CHUNK_SIZE`
- `CHUNK_RADIUS`
- `state.chunks`
- `state.chunkOrder`
- `state.worldEdits`

Important helpers:

- `hash2()`
- `getBiome()`
- `tileFromSeed()`
- `pickPropForTile()`
- `getChunk()`
- `getTile()`
- `generateChunk()`
- `seedChunkEntities()`
- `trimChunks()`
- `refreshActiveWorld()`
- `visibleTileBounds()`

The map is not saved directly. It is regenerated deterministically and only world edits are saved.

### Biomes And Props

Current biomes:

- `grove`
- `deepwood`
- `ruins`
- `marsh`

The procedural generator places:

- Forest props: trees, bushes, mushrooms, rocks, logs, ferns.
- Village/ruin props: wells, broken wagons, signposts, campfires, fences, shrines, crates, barrels.
- Building variants from biome atlas.
- Passive animals from biome atlas.
- Enemies based on biome/distance from spawn.

### Squad Control

The old single `state.player` model was migrated to:

- `state.heroes`
- `state.activeHeroId`
- `activeHero()`
- `setActiveHero()`

Compatibility note: `state.player` is implemented as a getter returning `activeHero()`, so some older code paths still work while newer code uses `activeHero()` directly.

Heroes currently:

- Alaric: fire/melee starter.
- Sable: stamina/shadow starter.
- Rowan: ranger starter.

Non-active heroes follow the active hero via `updatePartyFollowers(dt)`.

### Inventory

Inventory is per active hero.

The panel was redesigned to avoid artwork/layout collisions:

- Generated frame is only a decorative outer frame/backing.
- HTML/CSS equipment slots and item slots are separate.
- Top area: weapon plus helm, armour, gloves, boots, trinket, offhand.
- Bag area: fixed 4x3 viewport with horizontal pages.
- Empty slots no longer use the fiery skill-slot art.

Important helpers:

- `renderInventory()`
- `selectItem()`
- `useItem()`
- `moveDraggedToInventory()`
- `equipDraggedItem()`

Known limitation: inventory still uses compact item arrays, not true fixed slot arrays. Drag/drop works for reorder/equip, but a future pass should convert hero inventory to fixed slot arrays for more robust empty-slot moves and shared inventory.

### Combat

Combat supports:

- Melee.
- Ranged.
- Fire spell.
- Frost spell.
- Enemy aggro/follow/attack.
- Projectiles and spell rings.
- Floating damage.
- Loot drops.

Enemies target nearest living hero via `nearestHero()`.

### NPCs And Buildings

Story NPCs and buildings remain seeded near spawn in chunk `0,0`:

- Temple Depths.
- Blackened Forge.
- Moonlit Sanctum.
- Quest Keeper.
- Healer.
- Merchant.
- Blacksmith.

Additional generated buildings appear in distant chunks.

## localStorage

Save key:

```js
umbral-descent-save-v2
```

Saved:

- `heroes`
- `activeHeroId`
- `worldEdits`
- `loot`
- `camera`
- `quest`
- `inside`

Because the save key was bumped from v1 to v2, older localStorage saves are ignored by default.

## Verification Done

Commands/checks used:

```powershell
node --check game.js
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8765/index.html
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8765/assets/biome/biome-forest-atlas.png
npx playwright screenshot --wait-for-timeout=2000 http://127.0.0.1:8765/index.html C:\tmp\diablo-smoke-2.png
```

Latest checks passed:

- JavaScript syntax check passed.
- Page served HTTP 200.
- Biome atlas served HTTP 200.
- Playwright screenshot smoke test succeeded.

## Recent Visual Fixes

Fixed:

- Red/blue HUD orbs were bad crops and no longer fit. They were re-cropped as clean alpha PNGs.
- Inventory panel had overlapping baked grid art. It was replaced with `inventory-panel-frame.png`, a gridless frame/backing.
- HUD orb layer was overlapping inventory. Inventory z-index was raised.
- Empty item/equipment slots were using fiery skill artwork. They now use simple dark slot styling.
- Procedural props were too repetitive/clustered. Density was reduced and prop selection now uses a separate hash.

## Known Issues / Fragile Areas

- `game.js` is large and monolithic. It works, but future work should split systems when practical.
- Drag/drop is usable but should be rebuilt around fixed slot arrays for long-term correctness.
- There is no shared party stash yet, despite some planning for it.
- Generated biome sprite atlas coordinates are approximate. Some sprites may have uneven padding because the assets are atlas cells, not individually trimmed files.
- Passive animals flee only very simply; they do not have robust wandering or lifecycle behavior yet.
- Enemy persistence is based on `worldEdits`; enemies in unloaded chunks regenerate unless marked dead. This is intentional, but more world edits may be needed for opened chests/harvested resources later.
- Minimap is local/player-centered, not an explored world map.
- Buildings generated from biome atlas are visual only; most random buildings are not fully explorable yet.
- `state.player` remains as a compatibility getter. Eventually replace remaining `state.player` references with `activeHero()`.

## Suggested Next Steps

1. Convert hero inventories to fixed slot arrays.
2. Add a shared stash/currency model for party loot.
3. Add drag from equipment slot back into bag.
4. Add click-to-move target instead of the current small click nudge.
5. Make generated random buildings interactable/explorable.
6. Add biome-specific enemy tables with better balancing.
7. Add chest/resource harvesting and persist those via `worldEdits`.
8. Add animal wandering/fleeing behaviors with despawn rules.
9. Split `game.js` into modules once systems stabilize.
10. Add a debug overlay for chunk coordinates, biome, FPS, and entity counts.

## Best Handoff Prompt

Use this prompt in a new chat:

```text
Continue work in D:\codex-projects\Diablo. Read PROGRESS.md first. The game runs at http://127.0.0.1:8765/index.html. Focus on the next step from the handoff notes, preserving the existing playable state. Do not revert generated assets or unrelated changes.
```
