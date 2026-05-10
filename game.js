const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const miniMap = document.getElementById("miniMap");
const miniCtx = miniMap.getContext("2d");

const STORAGE_KEY = "umbral-descent-save-v2";
const TILE_W = 84;
const TILE_H = 42;
const CHUNK_SIZE = 16;
const CHUNK_RADIUS = 3;
const WORLD_SEED = 93217;
const SPRITE_CELL = 128;
const ATLAS_DISPLAY = 322;
const ATLAS_SIZE = 736;
const LOW_HEALTH_FLASH_THRESHOLD = 0.35;
const LOW_HEALTH_FLASH_DURATION = 0.7;

function makeHero(id, name, x, y, stats, equipment, inventory) {
  return {
    id,
    name,
    x,
    y,
    tx: x,
    ty: y,
    hp: stats.hp,
    maxHp: stats.hp,
    mana: stats.mana,
    maxMana: stats.mana,
    stamina: stats.stamina,
    maxStamina: stats.stamina,
    gold: stats.gold || 0,
    runes: 0,
    level: 1,
    xp: 0,
    dir: 1,
    walkT: 0,
    attackT: 0,
    lowHealthHitT: 0,
    equipment,
    inventory
  };
}

const atlasFiles = {
  items: "items.webp",
  weapons: "weapons.png",
  armour: "armour.png",
  ui: "ui.png",
  characters: "characters.png",
  heroes: "heroes.webp",
  enemies: "enemies.webp",
  enemiesCommon: "enemies-common.webp"
};

const atlasDimensions = {
  items: { width: ATLAS_SIZE, height: ATLAS_SIZE },
  weapons: { width: ATLAS_SIZE, height: ATLAS_SIZE },
  armour: { width: ATLAS_SIZE, height: ATLAS_SIZE },
  ui: { width: ATLAS_SIZE, height: ATLAS_SIZE },
  characters: { width: ATLAS_SIZE, height: ATLAS_SIZE },
  heroes: { width: 1140, height: 260 },
  enemies: { width: 1680, height: 700 },
  enemiesCommon: { width: 1680, height: 373 }
};

const fallbackSprites = {
  alaric: ["characters", 0, 0],
  sable: ["characters", 1, 1],
  rowan: ["characters", 1, 2],
  healer: ["characters", 4, 0],
  questKeeper: ["characters", 4, 1],
  merchant: ["characters", 3, 3],
  blacksmith: ["characters", 3, 4],
  skeleton: ["characters", 2, 0],
  emberImp: ["characters", 3, 0],
  frostAcolyte: ["characters", 3, 1],
  cultist: ["characters", 2, 2],
  commonOrc: ["characters", 2, 3],
  commonGoblin: ["characters", 2, 4],
  commonSkeleton: ["characters", 2, 0],
  commonMummy: ["characters", 3, 2],
  commonNecromancer: ["characters", 3, 1],
  redPotion: ["items", 0, 0],
  bluePotion: ["items", 0, 1],
  greenPotion: ["items", 0, 2],
  wildMeat: ["items", 2, 4],
  flameSword: ["weapons", 3, 0],
  crossbow: ["weapons", 1, 4],
  fireOrb: ["items", 1, 2],
  blue: ["items", 1, 1],
  runeShard: ["items", 3, 3],
  coinStack: ["items", 3, 4],
  amulet: ["items", 2, 0],
  helm: ["armour", 0, 0],
  armor: ["armour", 0, 1],
  leatherArmor: ["armour", 0, 2],
  staff: ["weapons", 2, 0],
  bow: ["weapons", 1, 3],
  healthOrb: ["ui", 2, 0],
  manaOrb: ["ui", 2, 1],
  slotFrame: ["ui", 1, 0],
  activeSlot: ["ui", 1, 1]
};

const characterSheetSprites = {
  alaric: { sheet: "heroes", name: "Warrior", x: 29, y: 41, width: 160, height: 178, draw: { x: -36, y: -86, w: 72, h: 80 }, iconScale: 0.36, fullBody: true },
  sable: { sheet: "heroes", name: "Sorceress", x: 263, y: 40, width: 159, height: 195, draw: { x: -33, y: -88, w: 66, h: 82 }, iconScale: 0.36, fullBody: true },
  rowan: { sheet: "heroes", name: "Ranger", x: 732, y: 19, width: 154, height: 221, draw: { x: -32, y: -96, w: 64, h: 92 }, iconScale: 0.36, fullBody: true },
  heroWizard: { sheet: "heroes", name: "Wizard", x: 496, y: 32, width: 162, height: 201, draw: { x: -34, y: -91, w: 68, h: 86 }, fullBody: true },
  heroDwarf: { sheet: "heroes", name: "Dwarf Guardian", x: 961, y: 45, width: 139, height: 190, draw: { x: -31, y: -84, w: 62, h: 78 }, fullBody: true },
  dragon: { sheet: "enemies", name: "Dragon", x: 80, y: 33, width: 300, height: 293, draw: { x: -70, y: -104, w: 140, h: 112 }, keyColor: "white" },
  emberImp: { sheet: "enemies", name: "Demon", x: 460, y: 85, width: 232, height: 229, draw: { x: -36, y: -84, w: 72, h: 76 }, keyColor: "white" },
  goblinRaider: { sheet: "enemies", name: "Goblin Raider", x: 800, y: 92, width: 208, height: 216, draw: { x: -34, y: -82, w: 68, h: 74 }, keyColor: "white" },
  swampHag: { sheet: "enemies", name: "Serpent Hag", x: 1120, y: 47, width: 188, height: 273, draw: { x: -32, y: -94, w: 64, h: 88 }, keyColor: "white" },
  cultist: { sheet: "enemies", name: "Vampire Cultist", x: 1391, y: 66, width: 242, height: 234, draw: { x: -37, y: -84, w: 74, h: 76 }, keyColor: "white" },
  beastWolf: { sheet: "enemies", name: "Werewolf", x: 96, y: 401, width: 247, height: 241, draw: { x: -42, y: -84, w: 84, h: 78 }, keyColor: "white" },
  ogreBrute: { sheet: "enemies", name: "Ogre Brute", x: 457, y: 388, width: 243, height: 261, draw: { x: -40, y: -91, w: 80, h: 86 }, keyColor: "white" },
  spider: { sheet: "enemies", name: "Spider", x: 755, y: 392, width: 265, height: 255, draw: { x: -46, y: -84, w: 92, h: 78 }, keyColor: "white" },
  skeleton: { sheet: "enemies", name: "Wraith", x: 1102, y: 401, width: 217, height: 259, draw: { x: -35, y: -94, w: 70, h: 86 }, keyColor: "white" },
  frostAcolyte: { sheet: "enemies", name: "Frost Wraith", x: 1102, y: 401, width: 217, height: 259, draw: { x: -35, y: -96, w: 70, h: 90 }, keyColor: "white" },
  fireElemental: { sheet: "enemies", name: "Fire Elemental", x: 1408, y: 392, width: 220, height: 288, draw: { x: -34, y: -99, w: 68, h: 92 }, keyColor: "white" },
  commonOrc: { sheet: "enemiesCommon", name: "Orc Brute", x: 80, y: 25, width: 247, height: 294, draw: { x: -39, y: -89, w: 78, h: 84 } },
  commonGoblin: { sheet: "enemiesCommon", name: "Goblin", x: 421, y: 73, width: 220, height: 267, draw: { x: -34, y: -84, w: 68, h: 78 } },
  commonSkeleton: { sheet: "enemiesCommon", name: "Skeleton Warrior", x: 717, y: 43, width: 223, height: 313, draw: { x: -35, y: -96, w: 70, h: 90 } },
  commonMummy: { sheet: "enemiesCommon", name: "Mummy", x: 1053, y: 53, width: 213, height: 295, draw: { x: -34, y: -91, w: 68, h: 84 } },
  commonNecromancer: { sheet: "enemiesCommon", name: "Necromancer", x: 1381, y: 0, width: 241, height: 359, draw: { x: -36, y: -104, w: 72, h: 98 } }
};

const commonEnemyTypes = ["commonOrc", "commonGoblin", "commonSkeleton", "commonMummy", "commonNecromancer"];

const images = {};
const worldAssets = {};
const biomeAssets = {};
const biomeSprites = {};
const spriteLookup = {};
const keyedSpriteCache = {};
let assetsReady = false;

const generatedWorldFiles = {
  temple: "assets/world/temple.png",
  forge: "assets/world/forge.png",
  sanctum: "assets/world/sanctum.png",
  dungeonFloor: "assets/world/dungeon-floor.png",
  ruinProp: "assets/world/ruin-prop.png",
  deadTree: "assets/world/dead-tree.png",
  obelisk: "assets/world/obelisk.png",
  backdrop: "assets/world/backdrop.png"
};

const terrainAssets = {};
const terrainAssetFiles = {
  grassSmall: { src: "assets/terrain/grass-small.png", cols: 5, rows: 5 },
  grassMedium: { src: "assets/terrain/grass-medium.png", cols: 4, rows: 4 },
  grassLarge: { src: "assets/terrain/grass-large.png", cols: 2, rows: 2 },
  forestClusters: { src: "assets/terrain/forest-clusters.png", cols: 2, rows: 2 },
  river: { src: "assets/terrain/river.png", cols: 5, rows: 5 },
  riverEdge: { src: "assets/terrain/river-edge.png", cols: 5, rows: 5 }
};

const starterInventory = [
  { id: "redPotion", qty: 3 },
  { id: "bluePotion", qty: 2 },
  { id: "greenPotion", qty: 2 },
  { id: "runeShard", qty: 1 },
  { id: "crossbow", qty: 1 },
  { id: "leatherArmor", qty: 1 }
];

const state = {
  camera: { x: 0, y: 0, zoom: 1 },
  keys: new Set(),
  mode: "melee",
  selectedItem: null,
  draggedItem: null,
  lastSave: 0,
  inside: null,
  activeHeroId: "alaric",
  heroes: [
    makeHero("alaric", "Alaric", 10, 14, { hp: 120, mana: 80, stamina: 100, gold: 48 }, { weapon: "flameSword", helm: "helm", chest: "armor", gloves: null, boots: null, trinket: "amulet", offhand: null }, starterInventory.map(item => ({ ...item }))),
    makeHero("sable", "Sable", 9.3, 14.8, { hp: 96, mana: 44, stamina: 125, gold: 0 }, { weapon: "shadowDagger", helm: null, chest: "leatherArmor", gloves: null, boots: null, trinket: null, offhand: null }, [{ id: "greenPotion", qty: 1 }, { id: "shadowDagger", qty: 1 }]),
    makeHero("rowan", "Rowan", 10.8, 15.1, { hp: 104, mana: 62, stamina: 115, gold: 0 }, { weapon: "bow", helm: null, chest: "leatherArmor", gloves: null, boots: null, trinket: null, offhand: null }, [{ id: "bluePotion", qty: 1 }, { id: "bow", qty: 1 }])
  ],
  chunks: new Map(),
  chunkOrder: [],
  worldEdits: {},
  enemies: [],
  npcs: [],
  buildings: [],
  loot: [],
  projectiles: [],
  particles: [],
  floating: [],
  blood: [],
  bloodStamp: 0,
  quest: { temple: false, priest: false }
};

Object.defineProperty(state, "player", {
  get() {
    return activeHero();
  }
});

const itemInfo = {
  redPotion: { name: "Blood Vial", type: "potion", text: "Restores 35 health.", use: () => heal("hp", 35) },
  bluePotion: { name: "Moonwater Vial", type: "potion", text: "Restores 30 mana.", use: () => heal("mana", 30) },
  greenPotion: { name: "Bitterleaf Draught", type: "potion", text: "Restores 35 stamina.", use: () => heal("stamina", 35) },
  wildMeat: { name: "Wild Meat", type: "food", text: "Food retrieved from hunted wildlife.", use: () => heal("hp", 18) },
  runeShard: { name: "Rune Shard", type: "quest", text: "A humming fragment used to unlock buried temple doors." },
  flameSword: { name: "Emberbrand", type: "weapon", text: "A close combat blade with fire damage.", slot: "weapon" },
  crossbow: { name: "Gilded Crossbow", type: "weapon", text: "A ranged weapon. Equip it to strengthen ranged attacks.", slot: "weapon" },
  leatherArmor: { name: "Stalker Leathers", type: "armor", text: "Light armor that favors stamina.", slot: "chest" },
  helm: { name: "Spired Helm", type: "armor", text: "A heavy helm etched with warding marks.", slot: "helm" },
  armor: { name: "Stalwart Chainmail", type: "armor", text: "Reliable protection for the Weeping Grove.", slot: "chest" },
  amulet: { name: "Amulet of the Owl", type: "trinket", text: "Keeps old secrets close to the heart.", slot: "trinket" },
  staff: { name: "Graven Staff", type: "weapon", text: "A staff still full of hostile sparks.", slot: "weapon" },
  bow: { name: "Thorn Bow", type: "weapon", text: "A quick bow cut from living blackwood.", slot: "weapon" },
  shadowDagger: { name: "Shadow Dagger", type: "weapon", text: "A quick blade for close combat.", slot: "weapon" },
  coinStack: { name: "Gold", type: "currency", text: "Spend it with merchants, once they trust you." }
};

function spriteCell(sheet, row, column) {
  return {
    sheet,
    row,
    column,
    x: 16 + column * 144,
    y: 16 + row * 144,
    width: 128,
    height: 128
  };
}

async function loadAssets() {
  Object.entries(atlasFiles).forEach(([key, src]) => {
    const image = new Image();
    image.src = src;
    images[key] = image;
  });
  Object.entries(generatedWorldFiles).forEach(([key, src]) => {
    const image = new Image();
    image.src = src;
    worldAssets[key] = image;
  });
  loadTerrainAssets();
  try {
    const res = await fetch("assets/biome/manifest.json");
    const manifest = await res.json();
    for (const file of manifest.files || []) {
      const image = new Image();
      image.src = `assets/biome/${file.file}`;
      biomeAssets[file.file] = image;
    }
    for (const sprite of manifest.sprites || []) {
      biomeSprites[sprite.id] = sprite;
    }
  } catch (error) {
    console.warn("Biome manifest failed, using procedural color props only.", error);
  }

  try {
    const res = await fetch("sprite-lookup.json");
    const json = await res.json();
    Object.assign(spriteLookup, json.sprites);
  } catch (error) {
    console.warn("Sprite lookup failed, using fallback coordinates.", error);
  }

  for (const [id, [sheet, row, column]] of Object.entries(fallbackSprites)) {
    if (!spriteLookup[id]) {
      spriteLookup[id] = { id, name: id, ...spriteCell(sheet, row, column) };
    }
  }
  applyCharacterSheetSprites();

  applySpriteStyles();
  await Promise.all([...Object.values(images), ...Object.values(worldAssets), ...Object.values(biomeAssets), ...Object.values(terrainAssets)].map(img => img.decode().catch(() => undefined)));
  assetsReady = true;
}

function applyCharacterSheetSprites() {
  for (const [id, sprite] of Object.entries(characterSheetSprites)) {
    spriteLookup[id] = {
      id,
      ...sprite,
      fallback: spriteLookup[id]
    };
  }
}

function loadTerrainAssets() {
  Object.entries(terrainAssetFiles).forEach(([key, sheet]) => {
    terrainAssets[key] = makeTerrainImage(sheet.src);
  });
}

function makeTerrainImage(src) {
  const image = new Image();
  image.src = src;
  return image;
}

function applySpriteStyles() {
  document.querySelectorAll("[data-sprite]").forEach(el => {
    const id = el.dataset.sprite;
    const sprite = spriteLookup[id] || spriteLookup.redPotion;
    if (!sprite) return;
    const scale = sprite.iconScale || ATLAS_DISPLAY / ATLAS_SIZE;
    const atlas = atlasDimensions[sprite.sheet] || atlasDimensions.items;
    el.style.setProperty("--sheet", `url("${atlasFiles[sprite.sheet]}")`);
    el.style.setProperty("--x", `${-sprite.x * scale}px`);
    el.style.setProperty("--y", `${-sprite.y * scale}px`);
    el.style.backgroundSize = `${atlas.width * scale}px ${atlas.height * scale}px`;
  });
}

function activeHero() {
  return state.heroes.find(hero => hero.id === state.activeHeroId) || state.heroes[0];
}

function setActiveHero(id) {
  if (!state.heroes.some(hero => hero.id === id)) return;
  state.activeHeroId = id;
  state.selectedItem = null;
  document.querySelectorAll(".party-member").forEach(member => {
    member.classList.toggle("active", member.dataset.hero === id);
  });
  renderHud();
  renderInventory();
  toast(`${activeHero().name} selected.`);
}

function hash2(x, y, seed = WORLD_SEED) {
  let h = seed ^ Math.imul(x, 374761393) ^ Math.imul(y, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

function smoothNoise2(x, y, seed = WORLD_SEED) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const xf = x - x0;
  const yf = y - y0;
  const sx = xf * xf * (3 - 2 * xf);
  const sy = yf * yf * (3 - 2 * yf);
  const n00 = hash2(x0, y0, seed);
  const n10 = hash2(x0 + 1, y0, seed);
  const n01 = hash2(x0, y0 + 1, seed);
  const n11 = hash2(x0 + 1, y0 + 1, seed);
  const nx0 = n00 + (n10 - n00) * sx;
  const nx1 = n01 + (n11 - n01) * sx;
  return nx0 + (nx1 - nx0) * sy;
}

function layeredNoise2(x, y, seed = WORLD_SEED, octaves = 4, scale = 28, persistence = 0.52) {
  let value = 0;
  let amplitude = 1;
  let total = 0;
  let frequency = 1 / scale;
  for (let octave = 0; octave < octaves; octave++) {
    value += smoothNoise2(x * frequency, y * frequency, seed + octave * 101) * amplitude;
    total += amplitude;
    amplitude *= persistence;
    frequency *= 2;
  }
  return total ? value / total : 0;
}

function chunkKey(cx, cy) {
  return `${cx},${cy}`;
}

function worldEditKey(prefix, id) {
  return `${prefix}:${id}`;
}

function getBiome(x, y) {
  const moisture = hash2(Math.floor((x + 3000) / 14), Math.floor(y / 14), WORLD_SEED + 3);
  const age = hash2(Math.floor(x / 22), Math.floor((y - 3000) / 22), WORLD_SEED + 7);
  const shadow = hash2(Math.floor((x - 1000) / 30), Math.floor((y + 1000) / 30), WORLD_SEED + 11);
  if (moisture > 0.78) return "marsh";
  if (age > 0.72) return "ruins";
  if (shadow > 0.74) return "deepwood";
  return "grove";
}

function tileFromSeed(x, y) {
  const biome = getBiome(x, y);
  const river = Math.abs(Math.sin((x + y * 0.42) * 0.105) + (hash2(Math.floor(x / 9), Math.floor(y / 9), WORLD_SEED + 19) - 0.5) * 0.6) < 0.08;
  const road = Math.abs(x - y + 4) < 1.25 || Math.abs(Math.sin((x + y) * 0.055)) < 0.035;
  const propRoll = hash2(x, y, WORLD_SEED + 29);
  const dense = biome === "deepwood" ? 0.86 : biome === "ruins" ? 0.9 : 0.93;
  const water = river && !road;
  return {
    x,
    y,
    biome,
    water,
    road,
    forest: pickForestClusterForTile(biome, x, y, water, road),
    prop: !river && !road && propRoll > dense ? pickPropForTile(biome, x, y) : null
  };
}

function pickForestClusterForTile(biome, x, y, water, road) {
  if (water || road) return null;
  const canopy = layeredNoise2(x, y, WORLD_SEED + 137, 5, 34, 0.56);
  const grove = layeredNoise2(x + 700, y - 300, WORLD_SEED + 151, 3, 92, 0.5);
  const scatter = hash2(x, y, WORLD_SEED + 163);
  const biomeBias = biome === "deepwood" ? 0.13 : biome === "grove" ? 0.06 : biome === "marsh" ? 0.03 : -0.04;
  const threshold = biome === "deepwood" ? 0.54 : biome === "grove" ? 0.6 : biome === "marsh" ? 0.64 : 0.7;
  const score = canopy * 0.7 + grove * 0.3 + biomeBias;
  if (score < threshold || scatter < 0.18) return null;
  const density = clamp(Math.floor((score - threshold) * 18) + 3, 3, 7);
  return {
    variant: Math.floor(hash2(x, y, WORLD_SEED + 167) * 4) % 4,
    density,
    scale: 0.86 + hash2(x, y, WORLD_SEED + 173) * 0.28
  };
}

function pickPropForTile(biome, x, y) {
  const roll = hash2(x, y, WORLD_SEED + 31);
  const forest = ["forest_ancient_dead_pine", "forest_twisted_green_black_tree", "forest_leafless_cursed_tree", "forest_thorn_bush", "forest_berry_bush", "forest_glowing_blue_mushrooms", "forest_mossy_boulder_cluster", "forest_fallen_log", "forest_dark_fern_cluster"];
  const ruins = ["village_broken_wagon", "village_old_stone_well", "village_ruined_cottage_corner", "village_cracked_stone_altar", "village_stacked_crates", "village_barrels_cluster", "building_mossy_stone_foundation"];
  const marsh = ["forest_hollow_log", "forest_moss_roots_patch", "forest_bramble_arch", "forest_red_cap_mushrooms", "forest_jagged_slate_rocks"];
  const pool = biome === "ruins" ? ruins : biome === "marsh" ? marsh : forest;
  return pool[Math.floor(roll * pool.length) % pool.length];
}

function getChunk(cx, cy) {
  const key = chunkKey(cx, cy);
  if (!state.chunks.has(key)) {
    state.chunks.set(key, generateChunk(cx, cy));
    state.chunkOrder.push(key);
    trimChunks();
  }
  return state.chunks.get(key);
}

function getTile(x, y) {
  const tx = Math.floor(x);
  const ty = Math.floor(y);
  const cx = Math.floor(tx / CHUNK_SIZE);
  const cy = Math.floor(ty / CHUNK_SIZE);
  return getChunk(cx, cy).tiles.get(`${tx},${ty}`);
}

function generateChunk(cx, cy) {
  const chunk = { cx, cy, tiles: new Map(), buildings: [], enemies: [], npcs: [], animals: [] };
  const startX = cx * CHUNK_SIZE;
  const startY = cy * CHUNK_SIZE;
  for (let y = startY; y < startY + CHUNK_SIZE; y++) {
    for (let x = startX; x < startX + CHUNK_SIZE; x++) {
      chunk.tiles.set(`${x},${y}`, tileFromSeed(x, y));
    }
  }
  seedChunkEntities(chunk);
  return chunk;
}

function seedChunkEntities(chunk) {
  const { cx, cy } = chunk;
  if (cx === 0 && cy === 0) {
    chunk.buildings.push(
      { id: "temple", name: "Temple Depths", x: 6, y: 6, w: 4, h: 3, open: false, asset: "temple" },
      { id: "forge", name: "Blackened Forge", x: 15, y: 9, w: 3, h: 3, open: true, asset: "forge" },
      { id: "sanctum", name: "Moonlit Sanctum", x: 11, y: 18, w: 4, h: 3, open: true, asset: "sanctum" }
    );
    chunk.npcs.push(
      { id: "questKeeper", name: "Quest Keeper", sprite: "questKeeper", x: 9, y: 13, lines: ["Find the Temple Depths and bring me a Rune Shard.", "The priest listens through the stones. Keep your mana high."] },
      { id: "healer", name: "Healer", sprite: "healer", x: 13, y: 16, lines: ["Stand still a breath and I can mend the worst of it.", "Ask me to heal and I will spend what herbs remain."] },
      { id: "merchant", name: "Merchant", sprite: "merchant", x: 17, y: 12, lines: ["Gold has a memory. Spend it well.", "I saw a crossbow buried near the old water stairs."] },
      { id: "blacksmith", name: "Blacksmith", sprite: "blacksmith", x: 16.5, y: 10.8, lines: ["Blades chip. Armor lies. Boots tell the truth.", "Bring runes and I will wake the metal."] }
    );
    chunk.enemies.push(
      enemy("skeleton", "Skeleton", 4, 12, 56, 8, "coinStack"),
      enemy("skeleton", "Skeleton", 7, 16, 56, 8, "redPotion"),
      enemy("emberImp", "Ember Imp", 15, 15, 44, 10, "fireOrb"),
      enemy("frostAcolyte", "Frost Acolyte", 7, 8, 72, 13, "staff"),
      enemy("cultist", "Cultist", 20, 14, 68, 12, "runeShard")
    );
  }

  const centerX = cx * CHUNK_SIZE + 8;
  const centerY = cy * CHUNK_SIZE + 8;
  const distFromSpawn = Math.hypot(centerX - 10, centerY - 14);
  const biome = getBiome(centerX, centerY);
  const roll = hash2(cx, cy, WORLD_SEED + 41);
  if (distFromSpawn > 18 && roll > 0.78) {
    const assets = biome === "ruins"
      ? ["building_ruined_chapel_wall", "building_collapsed_barn", "building_ruined_village_gate_arch"]
      : ["building_small_hunter_cabin", "village_gloomy_woodland_hut", "building_ruined_blacksmith_shed"];
    chunk.buildings.push({ id: `building-${cx}-${cy}`, name: biome === "ruins" ? "Village Ruin" : "Woodland Shelter", x: centerX - 1.5, y: centerY - 1.5, w: 3, h: 3, open: true, biomeAsset: assets[Math.floor(roll * assets.length) % assets.length] });
  }
  if (distFromSpawn > 8) {
    const commonRoll = hash2(cx, cy, WORLD_SEED + 97);
    if (commonRoll > 0.22) {
      const count = 2 + Math.floor(hash2(cx, cy, WORLD_SEED + 98) * 7);
      for (let i = 0; i < count; i++) {
        const type = commonEnemyTypes[(i + Math.floor(commonRoll * 100)) % commonEnemyTypes.length];
        const spread = hash2(cx + i, cy, WORLD_SEED + 99) * Math.PI * 2;
        const radius = 0.8 + hash2(cx, cy + i, WORLD_SEED + 100) * 2.6;
        const stats = commonEnemyStats(type);
        chunk.enemies.push(enemy(
          type,
          enemyName(type),
          centerX + Math.cos(spread) * radius,
          centerY + Math.sin(spread) * radius,
          stats.hp,
          stats.damage,
          commonRoll > 0.72 ? "coinStack" : "redPotion"
        ));
      }
    }
  }
  if (distFromSpawn > 8 && roll > 0.82) {
    const enemyType = biome === "marsh" ? ["swampHag", "beastWolf"] : biome === "ruins" ? ["skeleton", "cultist"] : ["goblinRaider", "beastWolf", "emberImp"];
    const count = roll > 0.82 ? 3 : 2;
    for (let i = 0; i < count; i++) {
      const type = enemyType[(i + Math.floor(roll * 10)) % enemyType.length];
      chunk.enemies.push(enemy(type, enemyName(type), centerX + i * 1.6 - 1.2, centerY + hash2(cx + i, cy, WORLD_SEED + 53) * 4 - 2, type === "beastWolf" ? 52 : 64, 9 + i * 2, roll > 0.75 ? "coinStack" : "redPotion"));
    }
  }
  if (roll < 0.34) {
    const animals = ["creature_small_rabbit_silhouette", "creature_small_fox_silhouette", "creature_deer_standing_silhouette", "creature_wolf_prowling_silhouette", "creature_boar_silhouette"];
    chunk.animals.push(animal(`animal-${cx}-${cy}`, "Wildlife", animals[Math.floor(roll * animals.length * 10) % animals.length], centerX + 2, centerY - 2));
  }
}

function trimChunks() {
  const hero = activeHero();
  const hcx = Math.floor(hero.x / CHUNK_SIZE);
  const hcy = Math.floor(hero.y / CHUNK_SIZE);
  for (const key of [...state.chunks.keys()]) {
    const [cx, cy] = key.split(",").map(Number);
    if (Math.abs(cx - hcx) > CHUNK_RADIUS + 2 || Math.abs(cy - hcy) > CHUNK_RADIUS + 2) {
      state.chunks.delete(key);
    }
  }
  state.chunkOrder = [...state.chunks.keys()];
}

function refreshActiveWorld() {
  const hero = activeHero();
  const hcx = Math.floor(hero.x / CHUNK_SIZE);
  const hcy = Math.floor(hero.y / CHUNK_SIZE);
  const chunks = [];
  for (let cy = hcy - CHUNK_RADIUS; cy <= hcy + CHUNK_RADIUS; cy++) {
    for (let cx = hcx - CHUNK_RADIUS; cx <= hcx + CHUNK_RADIUS; cx++) {
      chunks.push(getChunk(cx, cy));
    }
  }
  state.enemies = chunks.flatMap(chunk => chunk.enemies).filter(e => !e.dead && !state.worldEdits[worldEditKey("enemy", e.id)]?.dead);
  state.npcs = chunks.flatMap(chunk => chunk.npcs);
  state.buildings = chunks.flatMap(chunk => chunk.buildings);
  state.animals = chunks.flatMap(chunk => chunk.animals || []).filter(a => !a.dead && !state.worldEdits[worldEditKey("animal", a.id)]?.dead);
}

function visibleTileBounds(pad = 4, corners = null) {
  const viewCorners = corners || [
    screenToWorld(0, 0),
    screenToWorld(canvas.clientWidth, 0),
    screenToWorld(0, canvas.clientHeight),
    screenToWorld(canvas.clientWidth, canvas.clientHeight)
  ];
  return {
    minX: Math.floor(Math.min(...viewCorners.map(p => p.x))) - pad,
    maxX: Math.ceil(Math.max(...viewCorners.map(p => p.x))) + pad,
    minY: Math.floor(Math.min(...viewCorners.map(p => p.y))) - pad,
    maxY: Math.ceil(Math.max(...viewCorners.map(p => p.y))) + pad
  };
}

function enemyName(type) {
  return {
    commonOrc: "Orc Brute",
    commonGoblin: "Goblin",
    commonSkeleton: "Skeleton Warrior",
    commonMummy: "Mummy",
    commonNecromancer: "Necromancer",
    beastWolf: "Dread Wolf",
    goblinRaider: "Raider",
    swampHag: "Swamp Hag",
    emberImp: "Ember Imp",
    skeleton: "Skeleton",
    cultist: "Cultist"
  }[type] || "Enemy";
}

function commonEnemyStats(type) {
  return {
    commonOrc: { hp: 68, damage: 11 },
    commonGoblin: { hp: 44, damage: 8 },
    commonSkeleton: { hp: 56, damage: 9 },
    commonMummy: { hp: 62, damage: 10 },
    commonNecromancer: { hp: 58, damage: 12 }
  }[type] || { hp: 52, damage: 9 };
}

function buildWorld() {
  state.chunks.clear();
  state.chunkOrder = [];
  refreshActiveWorld();
}

function enemy(sprite, name, x, y, hp, damage, drop) {
  return {
    id: `${sprite}-${x}-${y}`,
    sprite,
    name,
    x,
    y,
    hp,
    maxHp: hp,
    damage,
    drop,
    speed: sprite === "frostAcolyte" ? 1.15 : 1.45,
    aggro: sprite === "frostAcolyte" ? 6 : 5,
    attackRange: sprite === "frostAcolyte" ? 3.8 : 1.25,
    cooldown: 0,
    dir: 1,
    walkT: 0,
    attackT: 0,
    dead: false
  };
}

function animal(id, name, biomeAsset, x, y, hp = 18) {
  return {
    id,
    name,
    biomeAsset,
    x,
    y,
    hp,
    maxHp: hp,
    drop: "wildMeat",
    walkT: 0,
    dir: 1,
    attackT: 0,
    dead: false,
    kind: "animal"
  };
}

function restoreSave() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;
  try {
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed.heroes)) state.heroes = parsed.heroes;
    else if (parsed.player) Object.assign(state.heroes[0], parsed.player);
    if (parsed.activeHeroId) state.activeHeroId = parsed.activeHeroId;
    if (parsed.worldEdits) state.worldEdits = parsed.worldEdits;
    if (Array.isArray(parsed.loot)) state.loot = parsed.loot;
    if (parsed.camera) Object.assign(state.camera, parsed.camera);
    if (parsed.quest) Object.assign(state.quest, parsed.quest);
    if (typeof parsed.inside === "string" || parsed.inside === null) state.inside = parsed.inside;
  } catch (error) {
    console.warn("Save restore failed.", error);
  }
}

function saveGame(force = false) {
  const now = performance.now();
  if (!force && now - state.lastSave < 1000) return;
  state.lastSave = now;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    heroes: state.heroes,
    activeHeroId: state.activeHeroId,
    worldEdits: state.worldEdits,
    loot: state.loot,
    camera: state.camera,
    quest: state.quest,
    inside: state.inside
  }));
}

function resize() {
  const dpr = Math.max(1, Math.min(devicePixelRatio || 1, 2));
  canvas.width = Math.floor(canvas.clientWidth * dpr);
  canvas.height = Math.floor(canvas.clientHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  updateHudLayout();
}

function updateHudLayout() {
  const shell = document.getElementById("gameShell");
  const hud = document.querySelector(".hud");
  const inventory = document.getElementById("inventoryPanel");
  if (!shell || !hud || !inventory) return;

  const inventoryOpen = !inventory.classList.contains("collapsed");
  shell.classList.toggle("inventory-open", inventoryOpen);
  if (!inventoryOpen) {
    hud.style.removeProperty("--hud-left");
    hud.style.removeProperty("--hud-width");
    hud.style.removeProperty("--hud-orb-size");
    hud.style.removeProperty("--hud-gap");
    return;
  }

  const shellRect = shell.getBoundingClientRect();
  const inventoryRect = inventory.getBoundingClientRect();
  const safeGap = 16;
  const sidePadding = 12;
  const availableWidth = Math.max(480, inventoryRect.left - shellRect.left - safeGap - sidePadding);
  const hudWidth = Math.min(760, availableWidth - sidePadding);
  const compactRatio = clamp((hudWidth - 520) / 240, 0, 1);
  const orbSize = Math.round(112 + compactRatio * 44);
  const gap = Math.round(10 + compactRatio * 4);
  const left = sidePadding + Math.max(0, (availableWidth - hudWidth) / 2);

  hud.style.setProperty("--hud-left", `${left}px`);
  hud.style.setProperty("--hud-width", `${hudWidth}px`);
  hud.style.setProperty("--hud-orb-size", `${orbSize}px`);
  hud.style.setProperty("--hud-gap", `${gap}px`);
}

function worldToScreen(x, y) {
  const centerX = canvas.clientWidth * 0.48;
  const centerY = canvas.clientHeight * 0.38;
  return {
    x: centerX + ((x - state.camera.x) - (y - state.camera.y)) * (TILE_W / 2) * state.camera.zoom,
    y: centerY + ((x - state.camera.x) + (y - state.camera.y)) * (TILE_H / 2) * state.camera.zoom
  };
}

function screenToWorld(sx, sy) {
  const centerX = canvas.clientWidth * 0.48;
  const centerY = canvas.clientHeight * 0.38;
  const xIso = (sx - centerX) / state.camera.zoom;
  const yIso = (sy - centerY) / state.camera.zoom;
  return {
    x: state.camera.x + yIso / TILE_H + xIso / TILE_W,
    y: state.camera.y + yIso / TILE_H - xIso / TILE_W
  };
}

function tileBlocked(x, y) {
  const tx = Math.floor(x);
  const ty = Math.floor(y);
  const tile = getTile(tx, ty);
  if (!tile || tile.water) return true;
  return state.buildings.some(b => tx >= b.x && ty >= b.y && tx < b.x + b.w && ty < b.y + b.h - 1);
}

function update(dt) {
  refreshActiveWorld();
  const player = activeHero();
  let dx = 0;
  let dy = 0;
  if (state.keys.has("w")) dy -= 1;
  if (state.keys.has("s")) dy += 1;
  if (state.keys.has("a")) dx -= 1;
  if (state.keys.has("d")) dx += 1;

  if (dx || dy) {
    const len = Math.hypot(dx, dy);
    dx /= len;
    dy /= len;
    const speed = (state.keys.has("shift") && player.stamina > 2 ? 4.4 : 2.8) * dt;
    if (state.keys.has("shift")) player.stamina = Math.max(0, player.stamina - 18 * dt);
    const nx = player.x + dx * speed;
    const ny = player.y + dy * speed;
    if (!tileBlocked(nx, player.y)) player.x = nx;
    if (!tileBlocked(player.x, ny)) player.y = ny;
    player.dir = dx >= 0 ? 1 : -1;
    player.walkT += dt * 9;
  } else {
    player.stamina = Math.min(player.maxStamina, player.stamina + 14 * dt);
  }

  player.attackT = Math.max(0, player.attackT - dt);
  updateHeroHitEffects(dt);
  state.camera.x += (player.x - state.camera.x) * 0.08;
  state.camera.y += (player.y - state.camera.y) * 0.08;
  updatePartyFollowers(dt);
  updateAnimals(dt);

  updateEnemies(dt);
  updateProjectiles(dt);
  updateParticles(dt);
  updateBlood(dt);
  pickupNearbyLoot();
  updateQuestState();
  saveGame();
  renderHud();
}

function updatePartyFollowers(dt) {
  const leader = activeHero();
  const offsets = {
    alaric: { x: -0.8, y: 0.7 },
    sable: { x: 0.8, y: 0.7 },
    rowan: { x: 0, y: 1.25 }
  };
  for (const hero of state.heroes) {
    if (hero.id === leader.id) continue;
    hero.attackT = Math.max(0, hero.attackT - dt);
    const offset = offsets[hero.id] || { x: 0.8, y: 0.8 };
    const tx = leader.x + offset.x;
    const ty = leader.y + offset.y;
    const dist = Math.hypot(tx - hero.x, ty - hero.y);
    if (dist > 9) {
      hero.x = tx;
      hero.y = ty;
    } else if (dist > 1.15) {
      const speed = 2.55 * dt;
      const nx = hero.x + (tx - hero.x) / dist * speed;
      const ny = hero.y + (ty - hero.y) / dist * speed;
      if (!tileBlocked(nx, hero.y)) hero.x = nx;
      if (!tileBlocked(hero.x, ny)) hero.y = ny;
      hero.dir = tx >= hero.x ? 1 : -1;
      hero.walkT += dt * 8;
    }
  }
}

function updateAnimals(dt) {
  for (const animal of state.animals || []) {
    if (animal.dead) continue;
    const hero = activeHero();
    const dist = distance(animal, hero);
    if (dist < 4) {
      const dx = (animal.x - hero.x) / Math.max(0.1, dist);
      const dy = (animal.y - hero.y) / Math.max(0.1, dist);
      const nx = animal.x + dx * dt * 1.4;
      const ny = animal.y + dy * dt * 1.4;
      if (!tileBlocked(nx, animal.y)) animal.x = nx;
      if (!tileBlocked(animal.x, ny)) animal.y = ny;
      animal.walkT += dt * 5;
      animal.dir = dx >= 0 ? 1 : -1;
    }
  }
}

function updateEnemies(dt) {
  for (const e of state.enemies) {
    if (e.dead) continue;
    e.cooldown = Math.max(0, e.cooldown - dt);
    e.attackT = Math.max(0, e.attackT - dt);
    const targetHero = nearestHero(e);
    const dist = distance(e, targetHero);
    if (dist <= e.aggro || dist <= e.attackRange) {
      e.dir = targetHero.x >= e.x ? 1 : -1;
    }
    if (dist < e.aggro && dist > e.attackRange) {
      const dx = (targetHero.x - e.x) / dist;
      const dy = (targetHero.y - e.y) / dist;
      const nx = e.x + dx * e.speed * dt;
      const ny = e.y + dy * e.speed * dt;
      if (!tileBlocked(nx, e.y)) e.x = nx;
      if (!tileBlocked(e.x, ny)) e.y = ny;
      e.walkT += dt * 8;
    }
    if (dist <= e.attackRange && e.cooldown <= 0) {
      e.cooldown = e.sprite === "frostAcolyte" ? 1.35 : 1.05;
      e.attackT = 0.35;
      damageHero(targetHero, e.damage, e);
      addFloating(`-${e.damage}`, targetHero.x, targetHero.y, "#ff9b7b");
      burst(targetHero.x, targetHero.y, e.sprite === "frostAcolyte" ? "#79d7ff" : "#e14527", 10);
    }
  }
}

function updateHeroHitEffects(dt) {
  for (const hero of state.heroes) {
    hero.lowHealthHitT = Math.max(0, (hero.lowHealthHitT || 0) - dt);
  }
}

function nearestHero(point) {
  return state.heroes
    .filter(hero => hero.hp > 0)
    .map(hero => ({ hero, d: distance(point, hero) }))
    .sort((a, b) => a.d - b.d)[0]?.hero || activeHero();
}

function updateProjectiles(dt) {
  state.projectiles = state.projectiles.filter(p => {
    p.t += dt * p.speed;
    if (p.t >= 1) {
      hitEnemy(p.target, p.damage, p.kind);
      burst(p.target.x, p.target.y, p.kind === "frost" ? "#88dfff" : p.kind === "fire" ? "#ff742d" : "#e8c276", 18);
      return false;
    }
    return p.target && !p.target.dead;
  });
}

function updateParticles(dt) {
  state.particles = state.particles.filter(p => {
    p.life -= dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    return p.life > 0;
  });
  state.floating = state.floating.filter(f => {
    f.life -= dt;
    f.y -= dt * 0.55;
    return f.life > 0;
  });
}

function updateBlood(dt) {
  state.blood = state.blood.filter(stain => {
    stain.age += dt;
    const activeNearbyEnemy = state.enemies.some(enemy => !enemy.dead && distance(enemy, stain) < 5.2);
    const decayRate = stain.fadeFast || !activeNearbyEnemy ? 0.055 : 0.006;
    stain.life -= dt * decayRate;
    return stain.life > 0 && stain.age < 80;
  });
}

function damageHero(hero, amount, source = null) {
  addBlood(hero.x, hero.y, amount, source ? "hero-hit" : "hero");
  hero.hp = Math.max(0, hero.hp - amount);
  if (hero.hp > 0 && hero.hp / hero.maxHp <= LOW_HEALTH_FLASH_THRESHOLD) {
    hero.lowHealthHitT = LOW_HEALTH_FLASH_DURATION;
  }
  if (hero.hp <= 0) {
    addBlood(hero.x, hero.y, amount * 1.3, "hero-down");
    hero.hp = hero.maxHp;
    hero.lowHealthHitT = 0;
    hero.x = activeHero().x + (hash2(hero.x, hero.y) - 0.5) * 2;
    hero.y = activeHero().y + 1.2;
    toast(`${hero.name} was pulled back from the brink.`);
  }
}

function attack(target = nearestEnemy()) {
  if (!target || target.dead) return;
  const player = activeHero();
  const dist = distance(player, target);
  const modes = {
    melee: { range: 1.65, cost: ["stamina", 8], damage: 18, color: "#ffc36a", speed: 4.8 },
    ranged: { range: 6.5, cost: ["stamina", 12], damage: 15, color: "#ffdb8a", speed: 3.7 },
    fire: { range: 7.5, cost: ["mana", 18], damage: 26, color: "#ff642a", speed: 2.8 },
    frost: { range: 7.0, cost: ["mana", 15], damage: 18, color: "#7fdcff", speed: 3.0 }
  };
  const spec = modes[state.mode];
  if (dist > spec.range) {
    toast("Move closer.");
    return;
  }
  const [resource, cost] = spec.cost;
  const key = resource === "mana" ? "mana" : "stamina";
  if (player[key] < cost) {
    toast(`Not enough ${resource}.`);
    return;
  }
  player[key] -= cost;
  player.attackT = 0.32;
  castRing(target.x, target.y, spec.color);
  if (state.mode === "melee") {
    hitEnemy(target, spec.damage, "melee");
    burst(target.x, target.y, spec.color, 12);
  } else {
    state.projectiles.push({
      x: player.x,
      y: player.y,
      target,
      t: 0,
      speed: spec.speed,
      damage: spec.damage,
      kind: state.mode,
      color: spec.color
    });
  }
}

function hitEnemy(target, damage, kind) {
  if (!target || target.dead) return;
  const crit = Math.random() > 0.82;
  const finalDamage = crit ? Math.round(damage * 1.8) : damage;
  target.hp = Math.max(0, target.hp - finalDamage);
  target.attackT = 0.22;
  addBlood(target.x, target.y, finalDamage, kind);
  addFloating(`${crit ? "Crit " : ""}-${finalDamage}`, target.x, target.y, kind === "frost" ? "#b9efff" : "#ffcf75");
  if (target.hp <= 0) {
    target.dead = true;
    addBlood(target.x, target.y, finalDamage * 1.6, "kill", true);
    state.worldEdits[worldEditKey(target.kind === "animal" ? "animal" : "enemy", target.id)] = { dead: true };
    dropLoot(target);
    if (target.kind !== "animal") activeHero().xp += 12;
    toast(`${target.name} defeated.`);
  }
}

function addBlood(x, y, damage, kind = "hit", fadeFast = false) {
  const tile = getTile(x, y);
  if (tile?.water) return;
  const strength = clamp(damage / 28, 0.35, 1.65);
  const count = kind === "kill" ? 4 : kind === "hero-down" ? 3 : 2;
  for (let i = 0; i < count; i++) {
    const stamp = ++state.bloodStamp;
    const angle = hash2(Math.floor(x * 17) + i, Math.floor(y * 19) - i, WORLD_SEED + stamp) * Math.PI * 2;
    const spread = (0.08 + hash2(Math.floor(x * 23) - i, Math.floor(y * 29) + i, WORLD_SEED + stamp + 7) * 0.36) * strength;
    state.blood.push({
      x: x + Math.cos(angle) * spread,
      y: y + Math.sin(angle) * spread,
      size: (0.26 + hash2(stamp, i, WORLD_SEED + 211) * 0.34) * strength,
      seed: stamp,
      age: 0,
      life: 1,
      fadeFast
    });
  }
  if (state.blood.length > 180) state.blood.splice(0, state.blood.length - 180);
}

function dropLoot(enemyState) {
  const drop = enemyState.drop || (Math.random() > 0.5 ? "coinStack" : "redPotion");
  state.loot.push({
    id: drop,
    x: enemyState.x + (Math.random() - 0.5) * 0.5,
    y: enemyState.y + (Math.random() - 0.5) * 0.5,
    qty: drop === "coinStack" ? Math.floor(12 + Math.random() * 28) : 1
  });
}

function pickupNearbyLoot() {
  const hero = activeHero();
  state.loot = state.loot.filter(loot => {
    if (distance(loot, hero) > 0.8) return true;
    if (loot.id === "coinStack") {
      hero.gold += loot.qty;
      toast(`Picked up ${loot.qty} gold.`);
    } else {
      addItem(loot.id, loot.qty, hero);
      toast(`Picked up ${itemName(loot.id)}.`);
    }
    renderInventory();
    return false;
  });
}

function addItem(id, qty = 1, hero = activeHero()) {
  const existing = hero.inventory.find(i => i.id === id);
  if (existing && ["potion", "food"].includes(itemInfo[id]?.type)) existing.qty += qty;
  else hero.inventory.push({ id, qty });
}

function heal(resource, amount, hero = activeHero()) {
  const p = hero;
  if (resource === "hp") p.hp = Math.min(p.maxHp, p.hp + amount);
  if (resource === "mana") p.mana = Math.min(p.maxMana, p.mana + amount);
  if (resource === "stamina") p.stamina = Math.min(p.maxStamina, p.stamina + amount);
  return true;
}

function useItem(id) {
  const item = itemInfo[id];
  const hero = activeHero();
  const inv = hero.inventory.find(i => i.id === id);
  if (!item || !inv) return;
  if (item.slot) {
    hero.equipment[item.slot] = id;
    toast(`Equipped ${item.name}.`);
  } else if (item.use && item.use()) {
    inv.qty -= 1;
    toast(`Used ${item.name}.`);
    if (inv.qty <= 0) hero.inventory = hero.inventory.filter(i => i !== inv);
  }
  renderInventory();
  saveGame(true);
}

function nearestEnemy(range = 8) {
  let best = null;
  let bestDist = range;
  const hero = activeHero();
  const targets = [
    ...state.enemies,
    ...(state.animals || [])
  ];
  for (const e of targets) {
    if (e.dead) continue;
    const d = distance(e, hero);
    if (d < bestDist) {
      best = e;
      bestDist = d;
    }
  }
  return best;
}

function nearestNpc(range = 1.6) {
  const hero = activeHero();
  return state.npcs.find(npc => distance(npc, hero) <= range);
}

function nearestBuilding(range = 1.5) {
  const hero = activeHero();
  return state.buildings.find(b => {
    const door = { x: b.x + b.w / 2, y: b.y + b.h - 0.4 };
    return distance(door, hero) <= range;
  });
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function itemName(id) {
  return itemInfo[id]?.name || id;
}

function openChat(npc = nearestNpc()) {
  if (!npc) return;
  const panel = document.getElementById("chatPanel");
  const log = document.getElementById("chatLog");
  document.getElementById("chatName").textContent = npc.name;
  panel.dataset.npc = npc.id;
  log.innerHTML = "";
  appendChat(npc.name, npc.lines[0]);
  appendChat(npc.name, npc.lines[1] || "The dark listens. Speak softly.");
  panel.classList.add("open");
  document.getElementById("chatInput").focus();
}

function appendChat(who, text) {
  const line = document.createElement("p");
  line.className = "chat-line";
  line.innerHTML = `<b>${who}:</b> ${text}`;
  const log = document.getElementById("chatLog");
  log.appendChild(line);
  log.scrollTop = log.scrollHeight;
}

function npcReply(npc, message) {
  const lower = message.toLowerCase();
  if (lower.includes("heal")) {
    heal("hp", 30);
    heal("mana", 12);
    return "Hold still. There. The wound remembers less now.";
  }
  if (lower.includes("trade") || lower.includes("buy")) return "Trade is coming next. For now, take what the ruins drop.";
  if (lower.includes("temple") || lower.includes("quest")) return "The temple door wakes when a Rune Shard touches the threshold.";
  if (lower.includes("rune")) return "Cultists hoard rune shards. The one to the east reeks of them.";
  return npc.lines[Math.floor(Math.random() * npc.lines.length)];
}

function enterBuilding(building = nearestBuilding()) {
  if (!building) return;
  if (building.id === "temple" && !hasItem("runeShard")) {
    toast("The temple door wants a Rune Shard.");
    return;
  }
  state.inside = state.inside === building.id ? null : building.id;
  toast(state.inside ? `Entered ${building.name}.` : `Left ${building.name}.`);
  if (building.id === "temple") state.quest.temple = true;
}

function hasItem(id) {
  return state.heroes.some(hero => hero.inventory.some(i => i.id === id && i.qty > 0));
}

function updateQuestState() {
  state.quest.temple = state.quest.temple || state.inside === "temple";
  state.quest.priest = state.quest.priest || Object.entries(state.worldEdits).some(([key, edit]) => key.includes("cultist") && edit.dead);
  document.getElementById("questTemple").checked = state.quest.temple;
  document.getElementById("questPriest").checked = state.quest.priest;
}

function render() {
  ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  drawBackdrop();
  drawMap();
  drawBuildings();
  drawEntities();
  drawProjectiles();
  drawParticles();
  drawInteriorOverlay();
  drawMiniMap();
}

function drawBackdrop() {
  if (assetLoaded(worldAssets.backdrop)) {
    ctx.drawImage(worldAssets.backdrop, 0, 0, canvas.clientWidth, canvas.clientHeight);
    ctx.fillStyle = "rgba(0, 0, 0, 0.38)";
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    return;
  }
  const gradient = ctx.createRadialGradient(canvas.clientWidth * 0.5, canvas.clientHeight * 0.45, 40, canvas.clientWidth * 0.5, canvas.clientHeight * 0.5, canvas.clientWidth * 0.65);
  gradient.addColorStop(0, "#152018");
  gradient.addColorStop(0.5, "#071112");
  gradient.addColorStop(1, "#020303");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
}

function drawMap() {
  const view = createMapRenderView();
  const visibleTiles = getVisibleTerrainTiles(view);
  const props = [];
  drawBaseTerrain(visibleTiles);
  drawFloraTerrain(visibleTiles);
  drawForestTerrain(visibleTiles);
  drawWaterTerrain(visibleTiles);
  drawBloodGround(view.bloodBounds);
  for (const entry of visibleTiles) {
    const { tile, x, y, screen } = entry;
    if (tile.prop && !tile.water) {
      const tall = tile.prop.includes("tree") || tile.prop.includes("bramble");
      const width = tall ? 92 : 62;
      const height = tall ? 110 : 68;
      if (isScreenRectVisible(screen.x - width * state.camera.zoom / 2, screen.y - height * state.camera.zoom, width * state.camera.zoom, height * state.camera.zoom + TILE_H * state.camera.zoom)) {
        props.push({ id: tile.prop, x, y, screen, tall });
      }
    }
  }
  props.sort((a, b) => (a.x + a.y) - (b.x + b.y));
  for (const prop of props) {
    if (!drawBiomeSprite(prop.id, prop.screen.x, prop.screen.y, prop.tall ? 92 : 62, prop.tall ? 110 : 68)) {
      ctx.fillStyle = "rgba(97, 153, 69, 0.34)";
      ctx.fillRect(prop.screen.x - 3, prop.screen.y + TILE_H * state.camera.zoom / 2 - 2, 6, 4);
    }
  }
}

function createMapRenderView() {
  const corners = [
    screenToWorld(0, 0),
    screenToWorld(canvas.clientWidth, 0),
    screenToWorld(0, canvas.clientHeight),
    screenToWorld(canvas.clientWidth, canvas.clientHeight)
  ];
  return {
    tileBounds: visibleTileBounds(4, corners),
    bloodBounds: visibleTileBounds(2, corners)
  };
}

function drawBloodGround(bounds) {
  if (!state.blood.length) return;
  const z = state.camera.zoom;
  ctx.save();
  for (const stain of state.blood) {
    if (stain.x < bounds.minX || stain.x > bounds.maxX || stain.y < bounds.minY || stain.y > bounds.maxY) continue;
    const p = worldToScreen(stain.x, stain.y);
    const alpha = clamp(stain.life, 0, 1) * 0.58;
    const base = TILE_W * z * stain.size;
    if (!isScreenRectVisible(p.x - base * 0.45, p.y + TILE_H * z * 0.44 - base * 0.18, base * 0.9, base * 0.36)) continue;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "#8f0909";
    for (let i = 0; i < 3; i++) {
      const ox = (hash2(stain.seed, i, WORLD_SEED + 223) - 0.5) * base * 0.55;
      const oy = (hash2(stain.seed, i, WORLD_SEED + 229) - 0.5) * base * 0.22;
      const rx = base * (0.18 + hash2(stain.seed, i, WORLD_SEED + 233) * 0.16);
      const ry = base * (0.055 + hash2(stain.seed, i, WORLD_SEED + 239) * 0.055);
      ctx.beginPath();
      ctx.ellipse(p.x + ox, p.y + TILE_H * z * 0.55 + oy, rx, ry, -0.4 + hash2(stain.seed, i, WORLD_SEED + 241) * 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

function getVisibleTerrainTiles(view) {
  const bounds = view.tileBounds;
  const tiles = [];
  const tw = TILE_W * state.camera.zoom;
  const th = TILE_H * state.camera.zoom;
  for (let y = bounds.minY; y <= bounds.maxY; y++) {
    for (let x = bounds.minX; x <= bounds.maxX; x++) {
      const screen = worldToScreen(x, y);
      if (!isScreenRectVisible(screen.x - tw / 2, screen.y, tw, th)) continue;
      const tile = getTile(x, y);
      const riverMask = tile.water || (!tile.road && !tile.water) ? riverNeighborMask(x, y) : 0;
      tiles.push({ x, y, tile, screen, tw, th, riverMask });
    }
  }
  return tiles;
}

function drawBaseTerrain(visibleTiles) {
  const fillPaths = new Map();
  const strokePath = new Path2D();
  for (const entry of visibleTiles) {
    const { tile, screen, tw, th } = entry;
    const fillStyle = tile.water ? "#063436" : tile.road ? "#3a3328" : biomeColor(tile.biome);
    let fillPath = fillPaths.get(fillStyle);
    if (!fillPath) {
      fillPath = new Path2D();
      fillPaths.set(fillStyle, fillPath);
    }
    addTileDiamondToPath(fillPath, screen, tw, th);
    addTileDiamondToPath(strokePath, screen, tw, th);
  }
  for (const [fillStyle, path] of fillPaths) {
    ctx.fillStyle = fillStyle;
    ctx.fill(path);
  }
  const dungeonFloorLoaded = assetLoaded(worldAssets.dungeonFloor);
  if (dungeonFloorLoaded) {
    for (const entry of visibleTiles) {
      const { tile, screen, tw, th } = entry;
      if (tile.water) continue;
      drawClippedTerrainImage(worldAssets.dungeonFloor, screen, tw, th, tile.road ? 0.24 : 0.42);
    }
  }
  ctx.strokeStyle = "rgba(176, 119, 45, 0.16)";
  ctx.lineWidth = 1;
  ctx.stroke(strokePath);
}

function drawFloraTerrain(visibleTiles) {
  const grassSheetsLoaded = assetLoaded(terrainAssets.grassSmall) && assetLoaded(terrainAssets.grassMedium) && assetLoaded(terrainAssets.grassLarge);
  const riverEdgeLoaded = assetLoaded(terrainAssets.riverEdge);
  for (const entry of visibleTiles) {
    const { tile, x, y, screen, tw, th, riverMask } = entry;
    if (tile.water || tile.road) continue;
    if (grassSheetsLoaded) {
      const alpha = tile.biome === "ruins" ? 0.34 : tile.biome === "marsh" ? 0.52 : 0.62;
      drawTerrainSheetCell("grassLarge", pickSheetCell("grassLarge", x, y, 83), screen, tw, th, alpha * 0.72);
      drawTerrainSheetCell("grassMedium", pickSheetCell("grassMedium", x, y, 89), screen, tw, th, alpha * 0.88);
      drawTerrainSheetCell("grassSmall", pickSheetCell("grassSmall", x, y, 97), screen, tw, th, alpha);
    } else {
      drawProceduralGrassOverlay(tile, x, y, screen, tw, th);
    }
    if (riverEdgeLoaded && riverMask > 0) {
      drawTerrainSheetCell("riverEdge", riverEdgeCellIndex(riverMask, x, y), screen, tw, th, 0.54);
    }
  }
}

function drawWaterTerrain(visibleTiles) {
  const riverLoaded = assetLoaded(terrainAssets.river);
  const riverEdgeLoaded = assetLoaded(terrainAssets.riverEdge);
  for (const entry of visibleTiles) {
    const { tile, x, y, screen, tw, th, riverMask } = entry;
    if (!tile.water) continue;
    if (riverLoaded) {
      drawTerrainSheetCell("river", pickSheetCell("river", x, y, 101), screen, tw, th, 0.95);
      if (riverEdgeLoaded && riverMask !== 255) {
        drawTerrainSheetCell("riverEdge", riverEdgeCellIndex(riverMask, x, y), screen, tw, th, 0.62);
      }
    } else {
      drawProceduralRiverOverlay(riverMask, screen, tw, th);
    }
  }
}

function drawForestTerrain(visibleTiles) {
  const forestTiles = [];
  for (const entry of visibleTiles) {
    const { tile } = entry;
    if (!tile.forest || tile.water) continue;
    forestTiles.push(entry);
  }
  forestTiles.sort((a, b) => (a.x + a.y) - (b.x + b.y));
  for (const entry of forestTiles) {
    const { tile, x, y, screen, tw, th } = entry;
    if (!isForestClusterVisible(tile.forest, screen, tw, th)) continue;
    if (!drawForestClusterSprite(tile.forest, screen, tw, th)) {
      drawProceduralForestCluster(tile.forest, x, y, screen, tw, th);
    }
  }
}

function drawForestClusterSprite(forest, p, tw, th) {
  const image = terrainAssets.forestClusters;
  const sheet = terrainAssetFiles.forestClusters;
  if (!assetLoaded(image) || !sheet) return false;
  const cell = forest.variant % (sheet.cols * sheet.rows);
  const sx = (cell % sheet.cols) * image.naturalWidth / sheet.cols;
  const sy = Math.floor(cell / sheet.cols) * image.naturalHeight / sheet.rows;
  const sw = image.naturalWidth / sheet.cols;
  const sh = image.naturalHeight / sheet.rows;
  const width = tw * 1.46 * forest.scale;
  const height = th * 2.75 * forest.scale;
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.drawImage(image, sx, sy, sw, sh, p.x - width / 2, p.y + th * 0.68 - height, width, height);
  ctx.restore();
  return true;
}

function drawProceduralForestCluster(forest, x, y, p, tw, th) {
  ctx.save();
  ctx.globalAlpha = 0.86;
  for (let i = 0; i < forest.density; i++) {
    const seed = hash2(x + i * 3, y - i * 5, WORLD_SEED + 181);
    const px = p.x + (seed - 0.5) * tw * 0.74;
    const py = p.y + th * (0.3 + hash2(x - i * 7, y + i * 2, WORLD_SEED + 191) * 0.42);
    const h = th * (1.08 + hash2(x + i, y + i, WORLD_SEED + 197) * 0.82) * forest.scale;
    const crown = h * (0.22 + seed * 0.08);
    ctx.fillStyle = forest.variant % 2 ? "#111c13" : "#172414";
    ctx.beginPath();
    ctx.ellipse(px, py - h * 0.62, crown * 0.85, crown * 1.18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#23351d";
    ctx.beginPath();
    ctx.ellipse(px - crown * 0.22, py - h * 0.72, crown * 0.72, crown * 0.92, -0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#2b1f16";
    ctx.lineWidth = Math.max(1, state.camera.zoom * 2);
    ctx.beginPath();
    ctx.moveTo(px, py - h * 0.5);
    ctx.lineTo(px + (seed - 0.5) * 8 * state.camera.zoom, py);
    ctx.stroke();
  }
  ctx.restore();
}

function isForestClusterVisible(forest, p, tw, th) {
  const width = tw * 1.46 * forest.scale;
  const height = th * 2.75 * forest.scale;
  return isScreenRectVisible(p.x - width / 2, p.y + th * 0.68 - height, width, height);
}

function drawTileDiamond(p, tw, th, fillStyle) {
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.lineTo(p.x + tw / 2, p.y + th / 2);
  ctx.lineTo(p.x, p.y + th);
  ctx.lineTo(p.x - tw / 2, p.y + th / 2);
  ctx.closePath();
  ctx.fillStyle = fillStyle;
  ctx.fill();
}

function addTileDiamondToPath(path, p, tw, th) {
  path.moveTo(p.x, p.y);
  path.lineTo(p.x + tw / 2, p.y + th / 2);
  path.lineTo(p.x, p.y + th);
  path.lineTo(p.x - tw / 2, p.y + th / 2);
  path.closePath();
}

function isScreenRectVisible(x, y, width, height, pad = 0) {
  return x + width >= -pad && x <= canvas.clientWidth + pad && y + height >= -pad && y <= canvas.clientHeight + pad;
}

function strokeTileDiamond(p, tw, th) {
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.lineTo(p.x + tw / 2, p.y + th / 2);
  ctx.lineTo(p.x, p.y + th);
  ctx.lineTo(p.x - tw / 2, p.y + th / 2);
  ctx.closePath();
  ctx.stroke();
}

function drawClippedTerrainImage(image, p, tw, th, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.lineTo(p.x + tw / 2, p.y + th / 2);
  ctx.lineTo(p.x, p.y + th);
  ctx.lineTo(p.x - tw / 2, p.y + th / 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(image, p.x - tw / 2, p.y, tw, th);
  ctx.restore();
}

function drawTerrainSheetCell(sheetKey, index, p, tw, th, alpha = 1) {
  const image = terrainAssets[sheetKey];
  const sheet = terrainAssetFiles[sheetKey];
  if (!assetLoaded(image) || !sheet) return false;
  const total = sheet.cols * sheet.rows;
  const cell = ((index % total) + total) % total;
  const sx = (cell % sheet.cols) * image.naturalWidth / sheet.cols;
  const sy = Math.floor(cell / sheet.cols) * image.naturalHeight / sheet.rows;
  const sw = image.naturalWidth / sheet.cols;
  const sh = image.naturalHeight / sheet.rows;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.lineTo(p.x + tw / 2, p.y + th / 2);
  ctx.lineTo(p.x, p.y + th);
  ctx.lineTo(p.x - tw / 2, p.y + th / 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(image, sx, sy, sw, sh, p.x - tw / 2, p.y, tw, th);
  ctx.restore();
  return true;
}

function pickSheetCell(sheetKey, x, y, salt = 0) {
  const sheet = terrainAssetFiles[sheetKey];
  const total = sheet.cols * sheet.rows;
  return Math.floor(hash2(x, y, WORLD_SEED + salt) * total) % total;
}

function drawProceduralGrassOverlay(tile, x, y, p, tw, th) {
  const roll = hash2(x, y, WORLD_SEED + 71);
  const density = tile.biome === "deepwood" ? 6 : tile.biome === "marsh" ? 5 : tile.biome === "ruins" ? 3 : 4;
  ctx.save();
  ctx.globalAlpha = 0.28;
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.lineTo(p.x + tw / 2, p.y + th / 2);
  ctx.lineTo(p.x, p.y + th);
  ctx.lineTo(p.x - tw / 2, p.y + th / 2);
  ctx.closePath();
  ctx.clip();
  ctx.strokeStyle = tile.biome === "marsh" ? "#4f9b79" : tile.biome === "ruins" ? "#85805f" : "#6fa257";
  ctx.lineWidth = Math.max(1, state.camera.zoom);
  for (let i = 0; i < density; i++) {
    const seed = hash2(x + i, y - i, WORLD_SEED + 73);
    const px = p.x - tw * 0.34 + ((seed + roll) % 1) * tw * 0.68;
    const py = p.y + th * 0.28 + hash2(x - i, y + i, WORLD_SEED + 79) * th * 0.42;
    ctx.beginPath();
    ctx.moveTo(px, py + 2 * state.camera.zoom);
    ctx.lineTo(px + (seed - 0.5) * 10 * state.camera.zoom, py - (3 + seed * 5) * state.camera.zoom);
    ctx.stroke();
  }
  ctx.restore();
}

function riverNeighborMask(x, y) {
  const offsets = [
    [0, -1], [1, -1], [1, 0], [1, 1],
    [0, 1], [-1, 1], [-1, 0], [-1, -1]
  ];
  return offsets.reduce((mask, [dx, dy], index) => {
    const neighbor = getTile(x + dx, y + dy);
    return neighbor && neighbor.water ? mask | (1 << index) : mask;
  }, 0);
}

function riverEdgeCellIndex(mask, x, y) {
  const north = Boolean(mask & 1);
  const northEast = Boolean(mask & 2);
  const east = Boolean(mask & 4);
  const southEast = Boolean(mask & 8);
  const south = Boolean(mask & 16);
  const southWest = Boolean(mask & 32);
  const west = Boolean(mask & 64);
  const northWest = Boolean(mask & 128);
  let col = !west ? 0 : !east ? 4 : 2;
  let row = !north ? 0 : !south ? 4 : 2;

  if (north && east && south && west) {
    if (!northWest) { row = 0; col = 0; }
    else if (!northEast) { row = 0; col = 4; }
    else if (!southEast) { row = 4; col = 4; }
    else if (!southWest) { row = 4; col = 0; }
    else {
      const drift = Math.floor(hash2(x, y, WORLD_SEED + mask) * 5) - 2;
      row = 2;
      col = clamp(2 + drift, 0, 4);
    }
  }

  return row * 5 + col;
}

function drawProceduralRiverOverlay(mask, p, tw, th) {
  drawTileDiamond(p, tw, th, mask === 255 ? "#07515a" : "#064348");
  ctx.save();
  ctx.globalAlpha = mask === 255 ? 0.22 : 0.38;
  ctx.strokeStyle = mask === 255 ? "#5fb9c4" : "#7ba675";
  ctx.lineWidth = Math.max(1, state.camera.zoom);
  if ((mask & 1) === 0) drawTileEdge(p, tw, th, 0);
  if ((mask & 4) === 0) drawTileEdge(p, tw, th, 1);
  if ((mask & 16) === 0) drawTileEdge(p, tw, th, 2);
  if ((mask & 64) === 0) drawTileEdge(p, tw, th, 3);
  ctx.restore();
}

function drawTileEdge(p, tw, th, edge) {
  const points = [
    [p.x, p.y],
    [p.x + tw / 2, p.y + th / 2],
    [p.x, p.y + th],
    [p.x - tw / 2, p.y + th / 2]
  ];
  ctx.beginPath();
  ctx.moveTo(points[edge][0], points[edge][1]);
  ctx.lineTo(points[(edge + 1) % 4][0], points[(edge + 1) % 4][1]);
  ctx.stroke();
}

function biomeColor(biome) {
  return {
    grove: "#1b2119",
    deepwood: "#111b14",
    ruins: "#242521",
    marsh: "#102322"
  }[biome] || "#1b2119";
}

function drawBuildings() {
  for (const b of state.buildings) {
    const base = worldToScreen(b.x + b.w / 2 - 0.5, b.y + b.h - 1);
    const z = state.camera.zoom;
    if (b.biomeAsset && drawBiomeSprite(b.biomeAsset, base.x, base.y + 18 * z, 190, 190)) {
      drawLabel(b.name, base.x, base.y + 52 * z, "#f0c46a");
      continue;
    }
    const generated = worldAssets[b.asset || b.id];
    if (assetLoaded(generated)) {
      const width = b.id === "forge" ? 210 : 250;
      const height = b.id === "forge" ? 190 : 230;
      ctx.save();
      ctx.translate(base.x, base.y);
      ctx.scale(z, z);
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.beginPath();
      ctx.ellipse(0, 24, b.w * 42, b.h * 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.drawImage(generated, -width / 2, -height + 38, width, height);
      if (b.open || state.inside === b.id) {
        ctx.shadowColor = "#56d9ff";
        ctx.shadowBlur = 20;
        ctx.fillStyle = "rgba(86,217,255,0.62)";
        ctx.fillRect(-6, 6, 12, 24);
        ctx.shadowBlur = 0;
      }
      ctx.fillStyle = "#f0c46a";
      ctx.font = "14px Georgia";
      ctx.textAlign = "center";
      ctx.fillText(b.name, 0, b.h * 26 + 18);
      ctx.restore();
      continue;
    }
    ctx.save();
    ctx.translate(base.x, base.y);
    ctx.scale(z, z);
    ctx.fillStyle = "rgba(0,0,0,0.42)";
    ctx.beginPath();
    ctx.ellipse(0, 30, b.w * 40, b.h * 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = b.id === "temple" ? "#262b29" : b.id === "forge" ? "#2d2119" : "#20262c";
    ctx.strokeStyle = "#8b611e";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-b.w * 26, 16);
    ctx.lineTo(0, -b.h * 38);
    ctx.lineTo(b.w * 28, 14);
    ctx.lineTo(b.w * 18, b.h * 22);
    ctx.lineTo(-b.w * 18, b.h * 22);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = b.open || state.inside === b.id ? "#53cdf1" : "#4b2718";
    ctx.fillRect(-10, 0, 20, 38);
    ctx.shadowColor = b.open ? "#56d9ff" : "#8d391d";
    ctx.shadowBlur = 16;
    ctx.fillRect(-4, 8, 8, 18);
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#f0c46a";
    ctx.font = "14px Georgia";
    ctx.textAlign = "center";
    ctx.fillText(b.name, 0, b.h * 26 + 18);
    ctx.restore();
  }
}

function assetLoaded(image) {
  return image && image.complete && image.naturalWidth > 0;
}

function drawBiomeSprite(id, x, y, width, height, dir = 1) {
  const sprite = biomeSprites[id];
  const image = sprite && biomeAssets[sprite.atlas];
  if (!sprite || !assetLoaded(image)) return false;
  const rect = sprite.approxRect;
  const z = state.camera.zoom;
  const dw = width * z;
  const dh = height * z;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir === -1 ? -1 : 1, 1);
  ctx.drawImage(image, rect.x, rect.y, rect.w, rect.h, -dw / 2, -dh * 0.82, dw, dh);
  ctx.restore();
  return true;
}

function drawEntities() {
  const entities = [
    ...state.loot.map(l => ({ ...l, kind: "loot", sortY: l.x + l.y })),
    ...state.npcs.map(n => ({ ...n, kind: "npc", sortY: n.x + n.y })),
    ...(state.animals || []).filter(a => !a.dead).map(a => ({ ...a, kind: "animal", sortY: a.x + a.y })),
    ...state.enemies.filter(e => !e.dead).map(e => ({ ...e, kind: "enemy", sortY: e.x + e.y })),
    ...state.heroes.map(hero => ({ ...hero, kind: "player", sprite: hero.id, sortY: hero.x + hero.y + 0.1 }))
  ].sort((a, b) => a.sortY - b.sortY);

  for (const ent of entities) {
    if (ent.kind === "loot") drawLoot(ent);
    else drawActor(ent);
  }
}

function drawActor(actor) {
  const p = worldToScreen(actor.x, actor.y);
  const z = state.camera.zoom;
  if (actor.kind === "animal" && actor.biomeAsset) {
    drawBiomeSprite(actor.biomeAsset, p.x, p.y + 10 * z, 54, 46, actor.dir);
    return;
  }
  const bob = Math.sin((actor.walkT || 0) * 2.1) * 4;
  const attack = actor.attackT > 0 ? Math.sin(actor.attackT * 24) * 8 : 0;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(z * (actor.dir === -1 ? -1 : 1), z);
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.beginPath();
  ctx.ellipse(0, 17, 25, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  if (actor.kind === "player" && actor.id === state.activeHeroId) {
    ctx.strokeStyle = "#f0c46a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 16, 31, 13, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  const frame = actorSpriteFrame(actor.sprite);
  const redFlash = actor.kind === "player" && actor.lowHealthHitT > 0 && actor.hp / actor.maxHp <= LOW_HEALTH_FLASH_THRESHOLD && Math.floor(performance.now() / 90) % 2 === 0;
  if (redFlash) ctx.filter = "brightness(1.25) sepia(1) saturate(7) hue-rotate(-28deg)";
  drawSprite(actor.sprite, frame.x + attack, frame.y + bob, frame.w, frame.h);
  if (redFlash) ctx.filter = "none";
  if (actor.kind === "player" && !spriteLookup[actor.sprite]?.fullBody) {
    drawSprite(actor.equipment.weapon, 13 + attack, -48 + bob, 36, 56);
  }
  ctx.restore();

  if (actor.kind === "enemy") drawNameplate(actor, p);
  if (actor.kind === "npc") drawLabel(actor.name, p.x, p.y - 72 * z, "#eecb76");
}

function drawNameplate(actor, p) {
  const z = state.camera.zoom;
  const w = 62 * z;
  const h = 6;
  ctx.fillStyle = "rgba(0,0,0,0.65)";
  ctx.fillRect(p.x - w / 2, p.y - 76 * z, w, h);
  ctx.fillStyle = "#ad1d1d";
  ctx.fillRect(p.x - w / 2, p.y - 76 * z, w * (actor.hp / actor.maxHp), h);
  drawLabel(actor.name, p.x, p.y - 88 * z, "#ffb18c");
}

function drawLoot(loot) {
  const p = worldToScreen(loot.x, loot.y);
  const z = state.camera.zoom;
  ctx.save();
  ctx.translate(p.x, p.y + Math.sin(performance.now() / 240) * 3);
  ctx.scale(z, z);
  drawSprite(loot.id, -18, -38, 36, 36);
  ctx.restore();
  drawLabel(itemName(loot.id), p.x, p.y - 44 * z, loot.id === "runeShard" ? "#b16bff" : "#e8c06a");
}

function actorSpriteFrame(id) {
  const sprite = spriteLookup[id];
  return sprite?.draw || { x: -28, y: -76, w: 56, h: 68 };
}

function drawSprite(id, x, y, w, h) {
  const drawable = resolveDrawableSprite(id);
  if (!drawable) {
    ctx.fillStyle = "#c38a2f";
    ctx.fillRect(x, y, w, h);
    return;
  }
  const { sprite, image } = drawable;
  if (sprite.keyColor) {
    const canvas = keyedSpriteCanvas(id, sprite, image);
    ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, x, y, w, h);
    return;
  }
  ctx.drawImage(image, sprite.x, sprite.y, sprite.width || SPRITE_CELL, sprite.height || SPRITE_CELL, x, y, w, h);
}

function resolveDrawableSprite(id) {
  const sprite = spriteLookup[id];
  if (!sprite || !assetsReady) return null;
  const image = images[sprite.sheet];
  if (assetLoaded(image)) return { sprite, image };
  const fallback = sprite.fallback;
  const fallbackImage = images[fallback?.sheet];
  if (fallback && assetLoaded(fallbackImage)) return { sprite: fallback, image: fallbackImage };
  return null;
}

function keyedSpriteCanvas(id, sprite, image) {
  if (keyedSpriteCache[id]) return keyedSpriteCache[id];
  const width = sprite.width || SPRITE_CELL;
  const height = sprite.height || SPRITE_CELL;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const buffer = canvas.getContext("2d", { willReadFrequently: true });
  buffer.drawImage(image, sprite.x, sprite.y, width, height, 0, 0, width, height);
  const pixels = buffer.getImageData(0, 0, width, height);
  for (let i = 0; i < pixels.data.length; i += 4) {
    const r = pixels.data[i];
    const g = pixels.data[i + 1];
    const b = pixels.data[i + 2];
    const nearWhite = r > 238 && g > 238 && b > 238 && Math.max(r, g, b) - Math.min(r, g, b) < 18;
    const nearBlack = r < 8 && g < 8 && b < 8;
    if ((sprite.keyColor === "white" && nearWhite) || (sprite.keyColor === "black" && nearBlack)) {
      pixels.data[i + 3] = 0;
    }
  }
  buffer.putImageData(pixels, 0, 0);
  keyedSpriteCache[id] = canvas;
  return canvas;
}

function drawLabel(text, x, y, color) {
  ctx.save();
  ctx.font = "14px Georgia";
  const width = ctx.measureText(text).width + 14;
  ctx.fillStyle = "rgba(2, 2, 2, 0.72)";
  ctx.fillRect(x - width / 2, y - 15, width, 20);
  ctx.strokeStyle = "rgba(195, 138, 47, 0.7)";
  ctx.strokeRect(x - width / 2, y - 15, width, 20);
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawProjectiles() {
  for (const p of state.projectiles) {
    const x = p.x + (p.target.x - p.x) * p.t;
    const y = p.y + (p.target.y - p.y) * p.t;
    const s = worldToScreen(x, y);
    ctx.save();
    ctx.strokeStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 12;
    ctx.lineWidth = p.kind === "ranged" ? 3 : 5;
    ctx.beginPath();
    ctx.arc(s.x, s.y - 32 * state.camera.zoom, 7 * state.camera.zoom, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

function drawParticles() {
  for (const p of state.particles) {
    const s = worldToScreen(p.x, p.y);
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.color;
    ctx.fillRect(s.x, s.y - 38 * state.camera.zoom, p.size, p.size);
    ctx.globalAlpha = 1;
  }
  for (const f of state.floating) {
    const s = worldToScreen(f.x, f.y);
    ctx.globalAlpha = Math.max(0, f.life / 0.9);
    ctx.fillStyle = f.color;
    ctx.font = "bold 18px Georgia";
    ctx.textAlign = "center";
    ctx.fillText(f.text, s.x, s.y - 76 * state.camera.zoom);
    ctx.globalAlpha = 1;
  }
}

function drawInteriorOverlay() {
  if (!state.inside) return;
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
  ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  ctx.strokeStyle = "#4fd0ff";
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);
  const b = state.buildings.find(item => item.id === state.inside);
  if (!b) {
    ctx.restore();
    return;
  }
  const p = worldToScreen(b.x + b.w / 2 - 0.5, b.y + b.h - 1);
  ctx.strokeRect(p.x - 130 * state.camera.zoom, p.y - 150 * state.camera.zoom, 260 * state.camera.zoom, 170 * state.camera.zoom);
  drawLabel(`Exploring ${b.name}`, p.x, p.y - 170 * state.camera.zoom, "#92eaff");
  ctx.restore();
}

function drawMiniMap() {
  miniCtx.clearRect(0, 0, miniMap.width, miniMap.height);
  miniCtx.fillStyle = "#090b0a";
  miniCtx.fillRect(0, 0, miniMap.width, miniMap.height);
  const hero = activeHero();
  const radiusX = 22;
  const radiusY = 15;
  const sx = miniMap.width / (radiusX * 2 + 1);
  const sy = miniMap.height / (radiusY * 2 + 1);
  const originX = Math.floor(hero.x) - radiusX;
  const originY = Math.floor(hero.y) - radiusY;
  for (let y = 0; y <= radiusY * 2; y++) {
    for (let x = 0; x <= radiusX * 2; x++) {
      const tile = getTile(originX + x, originY + y);
      miniCtx.fillStyle = tile.water ? "#075462" : tile.road ? "#76684b" : tile.biome === "ruins" ? "#4b4a42" : tile.biome === "marsh" ? "#1e5950" : "#303a24";
      miniCtx.fillRect(x * sx, y * sy, sx + 0.5, sy + 0.5);
    }
  }
  miniCtx.fillStyle = "#d8a73a";
  for (const b of state.buildings) miniCtx.fillRect((b.x - originX) * sx, (b.y - originY) * sy, Math.max(3, b.w * sx), Math.max(3, b.h * sy));
  miniCtx.fillStyle = "#df3b2f";
  for (const e of state.enemies) if (!e.dead) miniCtx.fillRect((e.x - originX) * sx - 2, (e.y - originY) * sy - 2, 4, 4);
  miniCtx.fillStyle = "#86a6ff";
  for (const h of state.heroes) miniCtx.fillRect((h.x - originX) * sx - 2, (h.y - originY) * sy - 2, 4, 4);
  miniCtx.fillStyle = "#61d8ff";
  miniCtx.beginPath();
  miniCtx.arc(radiusX * sx, radiusY * sy, 4, 0, Math.PI * 2);
  miniCtx.fill();
}

function castRing(x, y, color) {
  const s = worldToScreen(x, y);
  const ring = document.createElement("i");
  ring.className = "cast-ring";
  ring.style.left = `${s.x}px`;
  ring.style.top = `${s.y - 28 * state.camera.zoom}px`;
  ring.style.color = color;
  document.getElementById("castLayer").appendChild(ring);
  ring.addEventListener("animationend", () => ring.remove());
}

function burst(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    state.particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 2.2,
      vy: (Math.random() - 0.5) * 2.2,
      color,
      size: 2 + Math.random() * 4,
      life: 0.35 + Math.random() * 0.4,
      maxLife: 0.75
    });
  }
}

function addFloating(text, x, y, color) {
  state.floating.push({ text, x, y, color, life: 0.9 });
}

function toast(message) {
  const el = document.getElementById("lootToast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove("show"), 1400);
}

function renderHud() {
  const p = activeHero();
  const healthPercent = clamp(p.hp / p.maxHp * 100, 0, 100);
  const manaPercent = clamp(p.mana / p.maxMana * 100, 0, 100);
  document.querySelector(".health-orb")?.style.setProperty("--orb-fill", `${healthPercent}%`);
  document.querySelector(".mana-orb")?.style.setProperty("--orb-fill", `${manaPercent}%`);
  document.getElementById("healthValue").textContent = `${Math.round(p.hp)} / ${p.maxHp}`;
  document.getElementById("manaValue").textContent = `${Math.round(p.mana)} / ${p.maxMana}`;
  document.getElementById("staminaFill").style.width = `${Math.max(0, p.stamina / p.maxStamina * 100)}%`;
  document.querySelectorAll(".party-member").forEach(member => {
    const hero = state.heroes.find(item => item.id === member.dataset.hero);
    if (!hero) return;
    member.classList.toggle("active", hero.id === state.activeHeroId);
    const health = member.querySelector(".health i");
    const mana = member.querySelector(".mana i");
    const stamina = member.querySelector(".stamina i");
    if (health) health.style.width = `${hero.hp / hero.maxHp * 100}%`;
    if (mana) mana.style.width = `${hero.mana / hero.maxMana * 100}%`;
    if (stamina) stamina.style.width = `${hero.stamina / hero.maxStamina * 100}%`;
  });
}

function renderInventory() {
  const grid = document.getElementById("inventoryGrid");
  const hero = activeHero();
  document.querySelector("#inventoryPanel h2").textContent = `${hero.name} Inventory`;
  grid.innerHTML = "";
  const pageSize = 12;
  const pages = Math.max(1, Math.ceil(hero.inventory.length / pageSize));
  for (let pageIndex = 0; pageIndex < pages; pageIndex++) {
    const page = document.createElement("div");
    page.className = "inventory-page";
    const items = hero.inventory.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize);
    for (let slotIndex = 0; slotIndex < pageSize; slotIndex++) {
      const inv = items[slotIndex];
      const itemIndex = pageIndex * pageSize + slotIndex;
      const button = document.createElement("button");
      button.className = "inventory-slot";
      if (inv) {
        button.dataset.item = inv.id;
        button.dataset.index = itemIndex;
        button.draggable = true;
        button.title = itemName(inv.id);
        if (state.selectedItem === inv.id) button.classList.add("selected");
        button.innerHTML = `<span class="sprite" data-sprite="${inv.id}"></span><small>${inv.qty > 1 ? inv.qty : ""}</small>`;
        button.addEventListener("click", () => selectItem(inv.id));
        button.addEventListener("dblclick", () => useItem(inv.id));
        button.addEventListener("dragstart", event => {
          state.draggedItem = { heroId: hero.id, index: itemIndex, id: inv.id };
          event.dataTransfer.setData("text/plain", JSON.stringify(state.draggedItem));
        });
      } else {
        button.setAttribute("aria-label", "Empty inventory slot");
      }
      button.addEventListener("dragover", event => event.preventDefault());
      button.addEventListener("drop", event => {
        event.preventDefault();
        moveDraggedToInventory(itemIndex);
      });
      page.appendChild(button);
    }
    grid.appendChild(page);
  }
  document.querySelectorAll(".equip-slot").forEach(slot => {
    const id = hero.equipment[slot.dataset.slot];
    const labels = { weapon: "Weapon", helm: "Helm", chest: "Armour", gloves: "Gloves", boots: "Boots", trinket: "Trinket", offhand: "Offhand" };
    const label = labels[slot.dataset.slot] || slot.dataset.slot;
    slot.innerHTML = `<span class="slot-label">${label}</span>${id ? `<span class="sprite" data-sprite="${id}"></span>` : ""}`;
    slot.addEventListener("dragover", event => event.preventDefault());
    slot.addEventListener("drop", event => {
      event.preventDefault();
      equipDraggedItem(slot.dataset.slot);
    });
  });
  document.getElementById("goldCount").textContent = hero.gold;
  document.getElementById("runeCount").textContent = hero.inventory.find(i => i.id === "runeShard")?.qty || 0;
  applySpriteStyles();
}

function moveDraggedToInventory(targetIndex) {
  const drag = state.draggedItem;
  if (!drag) return;
  const hero = state.heroes.find(item => item.id === drag.heroId);
  if (!hero) return;
  const item = hero.inventory[drag.index];
  if (!item) return;
  if (targetIndex >= hero.inventory.length) {
    hero.inventory.splice(drag.index, 1);
    hero.inventory.push(item);
    state.draggedItem = null;
    renderInventory();
    saveGame(true);
    return;
  }
  const target = hero.inventory[targetIndex];
  hero.inventory[targetIndex] = item;
  if (target) hero.inventory[drag.index] = target;
  else hero.inventory.splice(drag.index, 1);
  state.draggedItem = null;
  renderInventory();
  saveGame(true);
}

function equipDraggedItem(slot) {
  const drag = state.draggedItem;
  if (!drag) return;
  const hero = state.heroes.find(item => item.id === drag.heroId);
  const item = hero?.inventory[drag.index];
  if (!hero || !item || itemInfo[item.id]?.slot !== slot) {
    toast("That item does not fit there.");
    return;
  }
  const previous = hero.equipment[slot];
  hero.equipment[slot] = item.id;
  hero.inventory.splice(drag.index, 1);
  if (previous) hero.inventory.push({ id: previous, qty: 1 });
  state.draggedItem = null;
  renderInventory();
  saveGame(true);
}

function selectItem(id) {
  state.selectedItem = id;
  const item = itemInfo[id] || {};
  document.getElementById("itemDetails").innerHTML = `<strong>${itemName(id)}</strong><span>${item.text || "A strange thing from the dark."} ${item.slot ? "Double click to equip." : item.use ? "Double click to use." : ""}</span>`;
  renderInventory();
}

function toggleInventory() {
  document.getElementById("inventoryPanel").classList.toggle("collapsed");
  updateHudLayout();
}

function setMode(mode) {
  state.mode = mode;
  document.querySelectorAll(".skill[data-mode]").forEach(btn => btn.classList.toggle("active", btn.dataset.mode === mode));
}

function handleCanvasClick(event) {
  const rect = canvas.getBoundingClientRect();
  const sx = event.clientX - rect.left;
  const sy = event.clientY - rect.top;
  const world = screenToWorld(sx, sy);
  const target = state.enemies
    .concat(state.animals || [])
    .filter(e => !e.dead)
    .map(e => ({ e, d: Math.hypot(e.x - world.x, e.y - world.y) }))
    .sort((a, b) => a.d - b.d)[0];
  if (target && target.d < 0.9) attack(target.e);
  else if (!tileBlocked(world.x, world.y)) {
    const hero = activeHero();
    hero.x = hero.x + (world.x - hero.x) * 0.12;
    hero.y = hero.y + (world.y - hero.y) * 0.12;
  }
}

function bindEvents() {
  addEventListener("resize", resize);
  addEventListener("keydown", event => {
    const key = event.key.toLowerCase();
    state.keys.add(key);
    if (["1", "2", "3", "4"].includes(key)) setMode(["melee", "ranged", "fire", "frost"][Number(key) - 1]);
    if (["f1", "f2", "f3"].includes(key)) {
      event.preventDefault();
      setActiveHero(state.heroes[Number(key.slice(1)) - 1]?.id);
    }
    if (key === "tab") {
      event.preventDefault();
      const idx = state.heroes.findIndex(hero => hero.id === state.activeHeroId);
      setActiveHero(state.heroes[(idx + 1) % state.heroes.length].id);
    }
    if (key === " ") {
      event.preventDefault();
      attack();
    }
    if (key === "q") useItem("redPotion");
    if (key === "r") useItem("bluePotion");
    if (key === "i") toggleInventory();
    if (key === "e") {
      const npc = nearestNpc();
      if (npc) openChat(npc);
      else enterBuilding();
    }
  });
  addEventListener("keyup", event => state.keys.delete(event.key.toLowerCase()));
  canvas.addEventListener("click", handleCanvasClick);
  canvas.addEventListener("wheel", event => {
    event.preventDefault();
    state.camera.zoom = clamp(state.camera.zoom + (event.deltaY < 0 ? 0.08 : -0.08), 0.72, 1.55);
  }, { passive: false });
  document.getElementById("zoomIn").addEventListener("click", () => state.camera.zoom = clamp(state.camera.zoom + 0.1, 0.72, 1.55));
  document.getElementById("zoomOut").addEventListener("click", () => state.camera.zoom = clamp(state.camera.zoom - 0.1, 0.72, 1.55));
  document.getElementById("centerView").addEventListener("click", () => {
    state.camera.x = activeHero().x;
    state.camera.y = activeHero().y;
  });
  document.getElementById("toggleInventory").addEventListener("click", toggleInventory);
  document.getElementById("inventoryHandle").addEventListener("click", toggleInventory);
  document.getElementById("closeChat").addEventListener("click", () => document.getElementById("chatPanel").classList.remove("open"));
  document.querySelectorAll(".skill[data-mode]").forEach(btn => btn.addEventListener("click", () => setMode(btn.dataset.mode)));
  document.querySelectorAll(".skill[data-use]").forEach(btn => btn.addEventListener("click", () => useItem(btn.dataset.use)));
  document.querySelectorAll(".party-member[data-hero]").forEach(member => member.addEventListener("click", () => setActiveHero(member.dataset.hero)));
  document.getElementById("chatForm").addEventListener("submit", event => {
    event.preventDefault();
    const input = document.getElementById("chatInput");
    const message = input.value.trim();
    if (!message) return;
    const npc = state.npcs.find(n => n.id === document.getElementById("chatPanel").dataset.npc);
    appendChat("You", message);
    appendChat(npc.name, npcReply(npc, message));
    input.value = "";
  });
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;
  update(dt);
  render();
  requestAnimationFrame(loop);
}

async function start() {
  resize();
  buildWorld();
  restoreSave();
  state.camera.x = activeHero().x;
  state.camera.y = activeHero().y;
  refreshActiveWorld();
  bindEvents();
  renderInventory();
  renderHud();
  await loadAssets();
  renderInventory();
  requestAnimationFrame(loop);
}

start();
