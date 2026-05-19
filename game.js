const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const miniMap = document.getElementById("miniMap");
const miniCtx = miniMap.getContext("2d");

const STORAGE_KEY = "umbral-descent-save-v2";
const TILE_W = 84;
const TILE_H = 42;
const CAMERA_ANCHOR_X = 0.5;
const CAMERA_ANCHOR_Y = 0.5;
const CHUNK_SIZE = 16;
const CHUNK_RADIUS = 3;
const WORLD_SEED = 93217;
const SPRITE_CELL = 128;
const ATLAS_DISPLAY = 322;
const ATLAS_SIZE = 736;
const ITEM_ATLAS_WIDTH = 499;
const ITEM_ATLAS_HEIGHT = 602;
const LOW_HEALTH_FLASH_THRESHOLD = 0.35;
const LOW_HEALTH_FLASH_DURATION = 0.7;
const ENEMY_DRAW_SCALE = 0.75;
const WORLD_ITEM_DRAW_SCALE = 1.3;
const FOREST_TEXTURE_WIDTH_SCALE = 4;
const FOREST_TEXTURE_HEIGHT_SCALE = 4;
const FOREST_RENDER_TILE_PAD = 24;
const PLAYER_ENEMY_SPRITE_Y_OFFSET = 25;
const CAMERA_MIN_ZOOM = 0.035;
const CAMERA_MAX_ZOOM = 8;
const CAMERA_ZOOM_SMOOTHING = 18;
const CAMERA_FOLLOW_SMOOTHING = 8;
const MAX_TERRAIN_DRAWS = 1250;
const MAX_FOREST_DRAWS = 520;
const MAX_PROP_DRAWS = 360;
const DETAIL_TEXTURE_MIN_ZOOM = 0.34;
const TERRAIN_LOD_MIN_ZOOM = 0.22;
const FOREST_MIN_ZOOM = 0.1;
const FOREST_FULL_ZOOM = 0.24;
const PROP_MIN_ZOOM = 0.12;
const PROP_FULL_ZOOM = 0.3;
const DECAL_MIN_ZOOM = 0.08;
const DECAL_FULL_ZOOM = 0.2;
const FAR_PROP_MIN_RENDER_ZOOM = 0.38;
const SURFACE_GRASS_MIN_ZOOM = 0.46;
const SURFACE_GRASS_FULL_ZOOM = 0.62;
const SURFACE_GRASS_WORLD_WIDTH = 240;
const AMBIENT_MUSIC_SRC = "assets/Music/Blackened Catacombs.mp3";
const COMBAT_MUSIC_SRC = "assets/Music/Blood Sigil Chase.mp3";
const AMBIENT_MUSIC_VOLUME = 0.56;
const COMBAT_MUSIC_VOLUME = 0.68;
const MUSIC_FADE_SECONDS = 4.2;
const MUSIC_COMBAT_ENTER_RANGE = 7.5;
const MUSIC_COMBAT_EXIT_RANGE = 9.5;
const MONSTER_VOICE_COUNT = 11;
const MONSTER_VOICE_VOLUME = 0.64;
const MONSTER_VOICE_COOLDOWN = 2.4;
const STRIKE_SFX_VOLUME_MIN = 0.28;
const STRIKE_SFX_VOLUME_MAX = 0.74;
const STRIKE_SFX_MIN_GAP_MS = 85;
const WEAPON_ATTACK_SFX_VOLUME_MIN = 0.34;
const WEAPON_ATTACK_SFX_VOLUME_MAX = 0.66;
const MAGIC_ATTACK_SFX_VOLUME_MIN = 0.38;
const MAGIC_ATTACK_SFX_VOLUME_MAX = 0.72;
const REVEAL_SFX_VOLUME_MIN = 0.44;
const REVEAL_SFX_VOLUME_MAX = 0.78;
const WOLF_SFX_VOLUME_MIN = 0.22;
const WOLF_SFX_VOLUME_MAX = 0.42;
const WOLF_SFX_DELAY_MIN_MS = 18000;
const WOLF_SFX_DELAY_MAX_MS = 42000;
const MINIMAP_FRAME_MS = 120;
const HUD_FRAME_MS = 90;
const SURFACE_GRASS_DECAL_KEYS = ["surfaceGrass1", "surfaceGrass2", "surfaceGrass3", "surfaceGrass4"];
const STRIKE_SFX_SOURCES = ["bones1", "bones2", "bones3"].map(name => `assets/sfx/${name}.mp3`);
const WEAPON_ATTACK_SFX_SOURCES = ["sword1", "sword2", "sword3", "sword4", "sword5"].map(name => `assets/sfx/${name}.mp3`);
const MAGIC_ATTACK_SFX_SOURCES = ["magic1", "magic2", "magic3", "magic4", "magic5", "magic6", "magic7"].map(name => `assets/sfx/${name}.mp3`);
const REVEAL_SFX_SOURCES = ["reveal1", "reveal2", "reveal3", "reveal5"].map(name => `assets/sfx/${name}.mp3`);
const WOLF_SFX_SOURCES = ["wolf1", "wolf2", "wolf3"].map(name => `assets/sfx/${name}.mp3`);
const OBJECT_COLLISION_RADIUS = 0.46;
const PROP_COLLISION_RADII = {
  village_old_stone_well: 0.62,
  village_broken_wagon: 0.68,
  village_ruined_cottage_corner: 0.74,
  village_cracked_stone_altar: 0.58,
  village_stacked_crates: 0.54,
  village_barrels_cluster: 0.56,
  village2_roofed_stone_well: 0.62,
  village2_siege_ballista: 0.7,
  village2_hanging_cage_gibbet: 0.5,
  village2_hanging_cage_post: 0.5,
  village3_statue_fountain: 0.64,
  village3_blue_brazier_pedestal: 0.48,
  village3_graveyard_cluster: 0.62,
  village4_roofed_well: 0.62,
  building_mossy_stone_foundation: 0.78,
  forest_fallen_log: 0.62,
  forest_hollow_log: 0.58,
  forest_mossy_boulder_cluster: 0.62,
  forest_jagged_slate_rocks: 0.58,
  forest_bramble_arch: 0.54,
  rubble_mossy_low_wall: 0.5,
  rubble_mossy_boulder_outcrop: 0.58,
  rubble_gray_boulder_cluster: 0.5,
  rubble_jagged_rock_spire: 0.62,
  rubble2_large_boulder_cluster: 0.58,
  rubble2_mossy_rock_cluster: 0.5,
  rubble2_moss_covered_rocks: 0.52
};
const NON_SOLID_PROP_PARTS = ["mushroom", "fern", "roots_patch", "wildflower", "grass", "ground", "path", "patch", "scrub", "thistle"];
const NAV_GRID_STEP = 0.5;
const NAV_DIRECT_SAMPLE_STEP = 0.18;
const NAV_REPATH_INTERVAL_MS = 180;
const NAV_GOAL_REFRESH_DISTANCE = 0.75;
const NAV_MAX_SEARCH_NODES = 720;
const NAV_MAX_DISTANCE = 16;
const NAV_DIRECTION_LOOKAHEAD = 5.5;
const NAV_STUCK_REPATH_SECONDS = 0.18;
const entityNavigation = new WeakMap();
const ENEMY_DENSITY_SCALE = 0.25;
const LANDMARK_ENEMY_RADIUS = 4.2;
const LANDMARK_ENEMY_CHANCE = 0.82;
const DESTRUCTIBLE_PROP_PARTS = ["barrel"];
const EDITOR_SCALE_MIN = 0.25;
const EDITOR_SCALE_MAX = 4;
const EDITOR_PREFAB_RANDOM_RADIUS = 3.8;
const EDITOR_LAYERS = ["ground", "building", "vegetation"];
const DEFAULT_EDITOR_LAYER_VISIBILITY = { ground: true, building: true, vegetation: true };
const WALL_ATLAS_FILE = "wall1.png";
const WALL_ATLAS_WIDTH = 166;
const WALL_ATLAS_HEIGHT = 97;
const WALL_CELL_WIDTH = WALL_ATLAS_WIDTH / 2;
const WALL_CELL_HEIGHT = WALL_ATLAS_HEIGHT;
const WALL_SPRITES = {
  segment: "stonewall_segment",
  gate: "stonewall_gate"
};
const DEFAULT_WALL_SPRITE_DEFS = [
  { id: WALL_SPRITES.segment, name: "Stone Wall Segment", role: "segment", col: 0, row: 0, kind: "wall" },
  { id: WALL_SPRITES.gate, name: "Stone Wall Gate", role: "gate", col: 1, row: 0, kind: "gate" }
];
const PLAN_GRID_SIZE = 12;
const PLAN_WALL_COUNT_DEFAULT = 48;
const PLAN_WALL_COUNT_MIN = 1;
const PLAN_WALL_COUNT_MAX = 96;
const PLAN_WALL_SPACING_DEFAULT = 1;
const PLAN_WALL_SPACING_MIN = 0.5;
const PLAN_WALL_SPACING_MAX = 3;
const PLAN_WALL_SPREAD_DEFAULT = 1;
const PLAN_WALL_SPREAD_MIN = 0.6;
const PLAN_WALL_SPREAD_MAX = 1.8;
const PLAN_RUINS_TILESET_CHANCE = 0.16;
const PLAN_BUILDING_SPAWN_CHANCE = 0.7;
const PLAN_RUINS_BUILDING_SPAWN_CHANCE = 0.25;
const PLAN_TILESET_DEFS = {
  village: { label: "Village", file: "village.png", wallFile: "villagewalls.png" },
  ruins: { label: "Ruins", file: "ruins.png", wallFile: "ruinswalls.png" },
  castle: { label: "Castle", file: "castle.png", wallFile: "castlewalls.png" },
  graveyard: { label: "Graveyard", file: "graveyard.png", wallFile: "graveyardwalls.png" },
  dungeon: { label: "Dungeon", file: "dungeon.png", wallFile: "dungeonwalls.png" },
  undead: { label: "Undead", file: "undead.png", wallFile: "undeadwalls.png" }
};
const PLAN_BRUSHES = [
  { id: "wall", label: "Walls", color: "#b7b9b0" },
  { id: "house", label: "Houses", color: "#d99a42" },
  { id: "tower", label: "Towers", color: "#8f7cc8" },
  { id: "building", label: "Buildings", color: "#c85f47" },
  { id: "grave", label: "Graves", color: "#d7d2bf" },
  { id: "path", label: "Paths", color: "#80796c" },
  { id: "prop", label: "Props", color: "#6ea867" },
  { id: "erase", label: "Erase", color: "#1c1712" }
];
const PLAN_BRUSH_BY_ID = Object.fromEntries(PLAN_BRUSHES.map(brush => [brush.id, brush]));
const PLAN_TILESET_ROLE_ROWS = {
  walls: ["wall", "wall", "wall", "wall"],
  main: ["house", "tower", "building", "prop"]
};
const PLAN_NUMBERED_ASSET_LIMIT = 24;
const PLAN_FILE_ROLE_PREFIXES = {
  house: ["house"],
  building: ["buildings", "building", "buildigns"],
  tower: ["towers", "tower"],
  prop: ["biome"]
};

function makeHero(id, name, x, y, stats, equipment, inventory) {
  const progression = window.ProgressionSystem?.createHeroProgression({
    hp: stats.hp,
    maxHp: stats.hp,
    mana: stats.mana,
    maxMana: stats.mana,
    stamina: stats.stamina,
    maxStamina: stats.stamina
  });
  const knownSkills = window.ProgressionSystem?.starterSkillsForHero({ id }) || ["cleave"];
  const skillBar = window.ProgressionSystem?.defaultBarForHero({ id }) || ["cleave", "redPotion", null, null, null, null];
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
    progression,
    dir: 1,
    walkT: 0,
    attackT: 0,
    lowHealthHitT: 0,
    equipment,
    inventory,
    skills: {
      known: knownSkills,
      ranks: knownSkills.reduce((all, skillId) => {
        all[skillId] = 1;
        return all;
      }, {}),
      bar: skillBar
    }
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
  enemiesCommon: "enemies-common.webp",
  cyclops: "cyclops.webp",
  goblinEmperor: "goblinemporer.webp",
  skills: "skills.png",
  spells: "spells.png",
  mummyAnimation: "animations/mummy.webp"
};

const atlasDimensions = {
  items: { width: ITEM_ATLAS_WIDTH, height: ITEM_ATLAS_HEIGHT },
  weapons: { width: 640, height: 700 },
  armour: { width: ATLAS_SIZE, height: ATLAS_SIZE },
  ui: { width: ATLAS_SIZE, height: ATLAS_SIZE },
  characters: { width: ATLAS_SIZE, height: ATLAS_SIZE },
  heroes: { width: 1140, height: 260 },
  enemies: { width: 1680, height: 700 },
  enemiesCommon: { width: 1680, height: 373 },
  cyclops: { width: 440, height: 356 },
  goblinEmperor: { width: 440, height: 356 },
  skills: { width: 1120, height: 1120 },
  spells: { width: 1081, height: 902 }
};

const atlasGrids = {
  items: { cols: 5, rows: 5 },
  weapons: { cols: 5, rows: 5 },
  skills: { cols: 5, rows: 5 },
  spells: { cols: 6, rows: 5 }
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
  cyclops: { sheet: "cyclops", name: "Cyclops", x: 0, y: 0, width: 440, height: 356, draw: { x: -123, y: -219, w: 246, h: 198 }, keyColor: "black" },
  goblinEmperor: { sheet: "goblinEmperor", name: "Goblin Emperor", x: 0, y: 0, width: 440, height: 356, draw: { x: -172, y: -300, w: 344, h: 272 }, keyColor: "black" },
  commonOrc: { sheet: "enemiesCommon", name: "Orc Brute", x: 80, y: 25, width: 247, height: 294, draw: { x: -39, y: -89, w: 78, h: 84 } },
  commonGoblin: { sheet: "enemiesCommon", name: "Goblin", x: 421, y: 73, width: 220, height: 267, draw: { x: -34, y: -84, w: 68, h: 78 } },
  commonSkeleton: { sheet: "enemiesCommon", name: "Skeleton Warrior", x: 717, y: 43, width: 223, height: 313, draw: { x: -35, y: -96, w: 70, h: 90 } },
  commonMummy: { sheet: "enemiesCommon", name: "Mummy", x: 1053, y: 53, width: 213, height: 295, draw: { x: -34, y: -91, w: 68, h: 84 } },
  commonNecromancer: { sheet: "enemiesCommon", name: "Necromancer", x: 1381, y: 0, width: 241, height: 359, draw: { x: -36, y: -104, w: 72, h: 98 } }
};

const commonEnemyTypes = ["commonOrc", "commonGoblin", "commonSkeleton", "commonMummy", "commonNecromancer"];
const animatedActorSprites = {
  commonMummy: {
    sheet: "mummyAnimation",
    cols: 9,
    rows: 9,
    playableRows: 8,
    frameCount: 72,
    fps: 10,
    draw: { x: -59, y: -87, h: 118 }
  }
};
const CYCLOPS_SPAWN_MIN_ROLL = 0.93;
const GOBLIN_EMPEROR_SPAWN_MIN_ROLL = 0.965;
const RARE_ENEMY_PROFILES = {
  cyclops: {
    title: "Ancient",
    hpMultiplier: 2.35,
    damageMultiplier: 1.22,
    xpMultiplier: 1.7,
    goldMultiplier: 3.2,
    lootRolls: 3,
    bonusDrops: ["greenPotion", "redPotion"]
  },
  goblinEmperor: {
    title: "Crowned",
    hpMultiplier: 3.1,
    damageMultiplier: 1.34,
    xpMultiplier: 2.2,
    goldMultiplier: 4.5,
    lootRolls: 4,
    bonusDrops: ["runeShard", "bluePotion", "greenPotion"]
  }
};

const images = {};
const worldAssets = {};
const biomeAssets = {};
const biomeSprites = {};
const spriteLookup = {};
const keyedSpriteCache = {};
const planTilesetStatus = {};
let assetsReady = false;

const generatedWorldFiles = {
  temple: "assets/world/temple.png",
  forge: "assets/world/forge.png",
  sanctum: "assets/world/sanctum.png",
  dungeonFloor: "assets/world/dungeon-floor.png",
  ruinProp: "assets/world/ruin-prop.png",
  deadTree: "assets/world/dead-tree.png",
  obelisk: "assets/world/obelisk.png",
  backdrop: "assets/world/backdrop.png",
  ruinedVillage: "ruinedvillage.webp"
};

const ruinedVillageDecals = [
  { id: "ruinedVillage", name: "Ruined Village", x: 30, y: 24, width: 1260, depth: 54, alpha: 0.96 },
  { id: "ruinedVillage", name: "Ruined Hamlet", x: -34, y: 42, width: 1040, depth: 48, alpha: 0.92 },
  { id: "ruinedVillage", name: "Collapsed Village", x: 58, y: -28, width: 1120, depth: 50, alpha: 0.94 },
  { id: "ruinedVillage", name: "Burned Outpost", x: -52, y: -36, width: 980, depth: 46, alpha: 0.9 }
];

const terrainAssets = {};
const terrainAssetFiles = {
  grassSmall: { src: "assets/terrain/grass-small.png", cols: 5, rows: 5 },
  grassMedium: { src: "assets/terrain/grass-medium.png", cols: 4, rows: 4 },
  grassLarge: { src: "assets/terrain/grass-large.png", cols: 2, rows: 2 },
  forestClusters: { src: "assets/terrain/forest-clusters.png", cols: 2, rows: 2 },
  river: { src: "assets/terrain/river.png", cols: 5, rows: 5 },
  riverEdge: { src: "assets/terrain/river-edge.png", cols: 5, rows: 5 },
  surfaceGrass1: { src: "grass1.webp" },
  surfaceGrass2: { src: "grass2.webp" },
  surfaceGrass3: { src: "grass3.webp" },
  surfaceGrass4: { src: "grass4.webp" }
};

const gameMusic = {
  ambient: null,
  combat: null,
  started: false,
  trying: false,
  combatActive: false,
  combatMix: 0
};

let lastStrikeSfxAt = 0;
let nextWolfSfxAt = 0;
const activeSfx = new Set();
const recentSfxByGroup = {};

const starterInventory = [
  { id: "redPotion", qty: 3 },
  { id: "bluePotion", qty: 2 },
  { id: "greenPotion", qty: 2 },
  { id: "runeShard", qty: 1 },
  { id: "crossbow", qty: 1 },
  { id: "leatherArmor", qty: 1 }
];

const state = {
  camera: { x: 0, y: 0, targetX: 0, targetY: 0, zoom: 1, targetZoom: 1, mode: "follow" },
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
  spellEffects: [],
  particles: [],
  floating: [],
  blood: [],
  bloodStamp: 0,
  selectedSkill: null,
  draggedSkill: null,
  screenFlash: 0,
  screenShake: 0,
  renderShake: { x: 0, y: 0 },
  quest: { temple: false, priest: false },
  editor: {
    open: false,
    selected: null,
    selectedDraftIndexes: [],
    movingDraftItem: null,
    activeLayer: "building",
    layerVisibility: { ...DEFAULT_EDITOR_LAYER_VISIBILITY },
    scales: {},
    prefabs: [],
    plans: [],
    draft: { name: "New Set", occurrence: 4, anchor: null, items: [] },
    planDraft: { name: "New Plan", occurrence: 4, tileset: "village", width: PLAN_GRID_SIZE, height: PLAN_GRID_SIZE, activeBrush: "wall", cells: {}, wallCount: PLAN_WALL_COUNT_DEFAULT, wallSpacing: PLAN_WALL_SPACING_DEFAULT, wallSpread: PLAN_WALL_SPREAD_DEFAULT },
    planModal: { x: null, y: null, width: 540, height: 620 },
    planTilesetSources: {},
    placingPrefabId: null,
    placements: [],
    lineMode: false,
    planView: false,
    lineCategory: "village",
    lineShape: "straight",
    brushDensity: 4,
    contextTarget: null
  }
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

const DEFAULT_KNOWN_SKILLS = ["cleave", "piercingShot", "firebolt", "frostShard", "lightningArc", "stormChain", "arcaneWard", "bloodHex"];
const DEFAULT_SKILL_BAR = ["cleave", "piercingShot", "firebolt", "frostShard", "lightningArc", "redPotion"];

const skillInfo = {
  cleave: { name: "Cleave", icon: "skillCleave", sheet: "skills", row: 0, column: 0, type: "melee", resource: "stamina", cost: 8, range: 1.75, damage: 22, color: "#ffc36a", buff: "+10% wound chance", text: "A heavy close strike that opens enemies for bleeding." },
  piercingShot: { name: "Piercing Shot", icon: "skillPiercingShot", sheet: "skills", row: 0, column: 1, type: "projectile", resource: "stamina", cost: 12, range: 7, damage: 16, speed: 3.9, color: "#ffdb8a", buff: "+15% ranged precision", text: "A disciplined shot with a bright trail and armor-punching force." },
  firebolt: { name: "Firebolt", icon: "spellFirebolt", sheet: "spells", row: 0, column: 0, type: "projectile", resource: "mana", cost: 18, range: 7.5, damage: 28, speed: 2.8, color: "#ff642a", buff: "Ignites for burst damage", text: "Throws a burning orb that bursts against the target." },
  frostShard: { name: "Frost Shard", icon: "spellFrostShard", sheet: "spells", row: 0, column: 1, type: "projectile", resource: "mana", cost: 15, range: 7, damage: 20, speed: 3, color: "#7fdcff", buff: "Chills enemy movement", text: "Launches a cold shard wrapped in pale mist." },
  lightningArc: { name: "Lightning Arc", icon: "spellLightningArc", sheet: "spells", row: 0, column: 2, type: "beam", resource: "mana", cost: 20, range: 7.5, damage: 9, duration: 0.54, tickRate: 0.18, color: "#f8fbff", secondaryColor: "#4ed8ff", buff: "Shocks and shakes targets", text: "A jagged bolt that lashes a single enemy several times." },
  stormChain: { name: "Storm Chain", icon: "spellStormChain", sheet: "spells", row: 0, column: 3, type: "chain", resource: "mana", cost: 34, range: 8, damage: 8, duration: 1.05, tickRate: 0.22, maxTargets: 3, color: "#ffffff", secondaryColor: "#8b7cff", buff: "Chains up to three enemies", text: "Sustains lightning through multiple enemies at once." },
  arcaneWard: { name: "Arcane Ward", icon: "spellArcaneWard", sheet: "spells", row: 1, column: 0, type: "self", resource: "mana", cost: 14, range: 0, damage: 0, color: "#b16bff", buff: "+20 mana and defensive flash", text: "Focuses a protective pulse around the active hero." },
  bloodHex: { name: "Blood Hex", icon: "spellBloodHex", sheet: "spells", row: 1, column: 1, type: "beam", resource: "mana", cost: 22, range: 6.5, damage: 11, duration: 0.72, tickRate: 0.24, color: "#12040c", secondaryColor: "#ff2f76", buff: "Occult beam drains vitality", text: "A dark tether that makes the target flicker under pressure." }
};

function spriteCell(sheet, row, column) {
  if (atlasGrids[sheet]) return gridAtlasCell(sheet, row, column);
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

function skillAtlasCell(sheet, row, column) {
  const grid = atlasGrids[sheet] || { cols: 5, rows: 5 };
  const cellWidth = atlasDimensions[sheet].width / grid.cols;
  const cellHeight = atlasDimensions[sheet].height / grid.rows;
  return {
    sheet,
    row,
    column,
    x: column * cellWidth,
    y: row * cellHeight,
    width: cellWidth,
    height: cellHeight,
    iconScaleX: 56 / cellWidth,
    iconScaleY: 56 / cellHeight
  };
}

function gridAtlasCell(sheet, row, column) {
  const grid = atlasGrids[sheet];
  const cellWidth = atlasDimensions[sheet].width / grid.cols;
  const cellHeight = atlasDimensions[sheet].height / grid.rows;
  return {
    sheet,
    row,
    column,
    x: column * cellWidth,
    y: row * cellHeight,
    width: cellWidth,
    height: cellHeight
  };
}

function normalizeGridSheetSprites(sheet) {
  if (!atlasGrids[sheet]) return;
  for (const sprite of Object.values(spriteLookup)) {
    if (sprite.sheet !== sheet || !Number.isFinite(sprite.row) || !Number.isFinite(sprite.column)) continue;
    Object.assign(sprite, gridAtlasCell(sheet, sprite.row, sprite.column));
    if (sheet === "items" || sheet === "weapons") {
      sprite.iconScaleX = 56 / sprite.width;
      sprite.iconScaleY = 56 / sprite.height;
    }
  }
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
  await loadBiomeWallAssets();
  await loadPlanTilesetAssets();
  await loadPlanPathTileset();

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
  normalizeGridSheetSprites("items");
  normalizeGridSheetSprites("weapons");
  const flameSwordCell = gridAtlasCell("weapons", 3, 0);
  spriteLookup.flameSword = {
    id: "flameSword",
    name: "Emberbrand",
    ...flameSwordCell,
    iconScaleX: 56 / flameSwordCell.width,
    iconScaleY: 56 / flameSwordCell.height
  };
  for (const skill of Object.values(skillInfo)) {
    spriteLookup[skill.icon] = {
      id: skill.icon,
      name: skill.name,
      ...skillAtlasCell(skill.sheet, skill.row, skill.column)
    };
  }
  applyCharacterSheetSprites();

  applySpriteStyles();
  await Promise.all([...Object.values(images), ...Object.values(worldAssets), ...Object.values(biomeAssets), ...Object.values(terrainAssets)].map(img => img.decode().catch(() => undefined)));
  assetsReady = true;
  prewarmSpriteCaches();
}

function prewarmSpriteCaches() {
  for (const [id, sprite] of Object.entries(spriteLookup)) {
    if (!sprite.keyColor) continue;
    const image = images[sprite.sheet];
    if (assetLoaded(image)) keyedSpriteCanvas(id, sprite, image);
  }
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

async function loadBiomeWallAssets() {
  let image = biomeAssets[WALL_ATLAS_FILE];
  if (!image) {
    image = new Image();
    image.src = `assets/biome/${WALL_ATLAS_FILE}`;
    biomeAssets[WALL_ATLAS_FILE] = image;
  }
  await image.decode().catch(() => undefined);
  registerDefaultWallSprites(image);
}

function registerDefaultWallSprites(image) {
  const atlasWidth = image?.naturalWidth || WALL_ATLAS_WIDTH;
  const atlasHeight = image?.naturalHeight || WALL_ATLAS_HEIGHT;
  const cellWidth = atlasWidth / 2;
  const cellHeight = atlasHeight;
  for (const def of DEFAULT_WALL_SPRITE_DEFS) {
    biomeSprites[def.id] = {
      id: def.id,
      name: def.name,
      kind: def.kind,
      wallRole: def.role,
      atlas: WALL_ATLAS_FILE,
      cell: { col: def.col, row: def.row, w: cellWidth, h: cellHeight },
      approxRect: {
        x: def.col * cellWidth,
        y: def.row * cellHeight,
        w: cellWidth,
        h: cellHeight
      },
      promptSummary: `${def.name}, modular stone wall sprite`
    };
  }
}

async function loadPlanTilesetAssets() {
  await loadPlanNumberedAssets();
  for (const tilesetId of Object.keys(PLAN_TILESET_DEFS)) {
    await loadPlanTilesetKind(tilesetId, "main");
    await loadPlanTilesetKind(tilesetId, "walls");
  }
  for (const [key, dataUrl] of Object.entries(state.editor?.planTilesetSources || {})) {
    const [tilesetId, kind] = key.split(":");
    if (PLAN_TILESET_DEFS[tilesetId] && (kind === "main" || kind === "walls")) {
      await registerPlanTilesetSource(tilesetId, kind, dataUrl, true);
    }
  }
}

async function loadPlanNumberedAssets() {
  await loadPlanWallAtlases();
  for (const [role, prefixes] of Object.entries(PLAN_FILE_ROLE_PREFIXES)) {
    await loadNumberedPlanRole(role, prefixes, PLAN_NUMBERED_ASSET_LIMIT);
  }
}

async function loadPlanWallAtlases() {
  for (let index = 1; index <= PLAN_NUMBERED_ASSET_LIMIT; index++) {
    const files = [`wall${index}.png`, `Wall${index}.png`, `walls${index}.png`, `Walls${index}.png`];
    const candidates = files.flatMap(file => [file, `assets/biome/${file}`]);
    const image = await loadFirstExistingImage(candidates);
    if (!image) continue;
    registerPlanWallAtlasSprites(index, image.image, image.source);
  }
}

async function loadNumberedPlanRole(role, prefixes, limit) {
  for (let index = 1; index <= limit; index++) {
    for (const prefix of prefixes) {
      const file = `${prefix}${index}.png`;
      const capitalized = `${prefix.charAt(0).toUpperCase()}${prefix.slice(1)}${index}.png`;
      const image = await loadFirstExistingImage([file, capitalized, `assets/biome/${file}`, `assets/biome/${capitalized}`]);
      if (!image) continue;
      registerPlanFileSprite(role, index, image.image, image.source);
      break;
    }
  }
}

async function loadFirstExistingImage(candidates) {
  for (const candidate of candidates) {
    const image = await loadOptionalImage(candidate);
    if (image) return { image, source: candidate };
  }
  return null;
}

function registerPlanWallAtlasSprites(index, image, source) {
  const atlasKey = `plan:file:walls:${index}`;
  biomeAssets[atlasKey] = image;
  const cellW = image.naturalWidth / 2;
  const cellH = image.naturalHeight;
  [
    { role: "wall", cell: 0 },
    { role: "door", cell: 1 }
  ].forEach(def => {
    const id = `plan_file_${def.role}_${index}`;
    biomeSprites[id] = {
      id,
      name: `${def.role} ${index}`,
      kind: "wall",
      planTileset: "file",
      planRole: def.role,
      atlas: atlasKey,
      approxRect: { x: def.cell * cellW, y: 0, w: cellW, h: cellH },
      promptSummary: `Plan view ${def.role} from ${source}`
    };
  });
}

function registerPlanFileSprite(role, index, image, source) {
  const resolvedRole = role === "wall" && index === 2 ? "door" : role;
  const atlasKey = `plan:file:${role}:${index}`;
  const id = `plan_file_${role}_${index}`;
  biomeAssets[atlasKey] = image;
  biomeSprites[id] = {
    id,
    name: `${resolvedRole} ${index}`,
    kind: resolvedRole === "house" ? "house" : resolvedRole === "tower" ? "tower" : resolvedRole === "building" ? "building" : resolvedRole === "wall" || resolvedRole === "door" ? "wall" : "container",
    planTileset: "file",
    planRole: resolvedRole,
    atlas: atlasKey,
    approxRect: { x: 0, y: 0, w: image.naturalWidth, h: image.naturalHeight },
    promptSummary: `Plan view ${resolvedRole} from ${source}`
  };
}

async function loadPlanPathTileset() {
  const image = await loadFirstExistingImage(["paths1.png", "Paths1.png", "assets/biome/paths1.png", "assets/biome/Paths1.png"]);
  if (image) {
    registerPlanPathTilesetImage(image.image, image.source);
    return;
  }
  registerGeneratedPlanPathTileset();
}

function registerPlanPathTilesetImage(image, source) {
  const tileW = image.naturalWidth / 4;
  const tileH = image.naturalHeight / 4;
  const atlasKey = "plan:path:stone";
  biomeAssets[atlasKey] = image;
  for (let mask = 0; mask < 16; mask++) {
    const id = `plan_path_mask_${mask}`;
    biomeSprites[id] = {
      id,
      name: `Stone Path ${mask}`,
      kind: "path",
      planTileset: "generated",
      planRole: "path",
      atlas: atlasKey,
      approxRect: {
        x: (mask % 4) * tileW,
        y: Math.floor(mask / 4) * tileH,
        w: tileW,
        h: tileH
      },
      promptSummary: `Plan view seamless stone path tile from ${source}`
    };
  }
}

function registerGeneratedPlanPathTileset() {
  const tileW = 160;
  const tileH = 96;
  const cols = 4;
  const rows = 4;
  const canvasEl = document.createElement("canvas");
  canvasEl.width = tileW * cols;
  canvasEl.height = tileH * rows;
  const pathCtx = canvasEl.getContext("2d");
  for (let mask = 0; mask < 16; mask++) {
    drawGeneratedPathTile(pathCtx, mask, (mask % cols) * tileW, Math.floor(mask / cols) * tileH, tileW, tileH);
  }
  const image = new Image();
  image.src = canvasEl.toDataURL("image/png");
  registerPlanPathTilesetImage(image, "generated runtime atlas");
}

function drawGeneratedPathTile(pathCtx, mask, ox, oy, tileW, tileH) {
  const cx = ox + tileW / 2;
  const cy = oy + tileH / 2;
  const diamond = [
    [cx, oy + 6],
    [ox + tileW - 8, cy],
    [cx, oy + tileH - 6],
    [ox + 8, cy]
  ];
  pathCtx.save();
  pathCtx.beginPath();
  pathCtx.moveTo(diamond[0][0], diamond[0][1]);
  for (let i = 1; i < diamond.length; i++) pathCtx.lineTo(diamond[i][0], diamond[i][1]);
  pathCtx.closePath();
  pathCtx.clip();
  pathCtx.fillStyle = "rgba(0,0,0,0)";
  pathCtx.clearRect(ox, oy, tileW, tileH);
  pathCtx.fillStyle = "rgba(42, 36, 29, 0.18)";
  pathCtx.fillRect(ox, oy, tileW, tileH);
  drawPathSegment(pathCtx, cx, cy, (diamond[0][0] + diamond[1][0]) / 2, (diamond[0][1] + diamond[1][1]) / 2, mask & 1);
  drawPathSegment(pathCtx, cx, cy, (diamond[1][0] + diamond[2][0]) / 2, (diamond[1][1] + diamond[2][1]) / 2, mask & 2);
  drawPathSegment(pathCtx, cx, cy, (diamond[2][0] + diamond[3][0]) / 2, (diamond[2][1] + diamond[3][1]) / 2, mask & 4);
  drawPathSegment(pathCtx, cx, cy, (diamond[3][0] + diamond[0][0]) / 2, (diamond[3][1] + diamond[0][1]) / 2, mask & 8);
  pathCtx.fillStyle = "#6f695d";
  pathCtx.strokeStyle = "#2b261f";
  pathCtx.lineWidth = 2;
  pathCtx.beginPath();
  pathCtx.ellipse(cx, cy, 32, 18, 0, 0, Math.PI * 2);
  pathCtx.fill();
  pathCtx.stroke();
  for (let i = 0; i < 9; i++) {
    const angle = i * 2.399 + mask * 0.37;
    const rx = cx + Math.cos(angle) * (8 + (i % 4) * 5);
    const ry = cy + Math.sin(angle) * (5 + (i % 3) * 3);
    pathCtx.fillStyle = i % 2 ? "#817a6c" : "#585248";
    pathCtx.beginPath();
    pathCtx.ellipse(rx, ry, 5 + (i % 3), 3 + (i % 2), angle * 0.4, 0, Math.PI * 2);
    pathCtx.fill();
  }
  pathCtx.restore();
}

function drawPathSegment(pathCtx, cx, cy, tx, ty, connected) {
  if (!connected) return;
  pathCtx.strokeStyle = "#6f695d";
  pathCtx.lineWidth = 30;
  pathCtx.lineCap = "round";
  pathCtx.beginPath();
  pathCtx.moveTo(cx, cy);
  pathCtx.lineTo(tx, ty);
  pathCtx.stroke();
  pathCtx.strokeStyle = "#817a6c";
  pathCtx.lineWidth = 18;
  pathCtx.beginPath();
  pathCtx.moveTo(cx, cy);
  pathCtx.lineTo(tx, ty);
  pathCtx.stroke();
  pathCtx.strokeStyle = "#2b261f";
  pathCtx.lineWidth = 2;
  pathCtx.beginPath();
  pathCtx.moveTo(cx, cy);
  pathCtx.lineTo(tx, ty);
  pathCtx.stroke();
}

async function loadPlanTilesetKind(tilesetId, kind) {
  const def = PLAN_TILESET_DEFS[tilesetId];
  const file = kind === "walls" ? def.wallFile : def.file;
  const candidates = [file, `assets/biome/${file}`];
  planTilesetStatus[`${tilesetId}:${kind}`] = { loaded: false, source: file, missing: true };
  for (const candidate of candidates) {
    const image = await loadOptionalImage(candidate);
    if (!image) continue;
    registerPlanTilesetImage(tilesetId, kind, image, candidate);
    return true;
  }
  return false;
}

function loadOptionalImage(src) {
  return new Promise(resolve => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

async function registerPlanTilesetSource(tilesetId, kind, src, persist = false) {
  const image = await loadOptionalImage(src);
  if (!image) {
    planTilesetStatus[`${tilesetId}:${kind}`] = { loaded: false, source: src, missing: true };
    return false;
  }
  registerPlanTilesetImage(tilesetId, kind, image, src);
  if (persist) state.editor.planTilesetSources[`${tilesetId}:${kind}`] = src;
  return true;
}

function registerPlanTilesetImage(tilesetId, kind, image, source) {
  const atlasKey = `plan:${tilesetId}:${kind}`;
  biomeAssets[atlasKey] = image;
  planTilesetStatus[`${tilesetId}:${kind}`] = { loaded: true, source, missing: false };
  const cols = 4;
  const rows = 4;
  const cellW = image.naturalWidth / cols;
  const cellH = image.naturalHeight / rows;
  const roleRows = PLAN_TILESET_ROLE_ROWS[kind] || PLAN_TILESET_ROLE_ROWS.main;
  for (let row = 0; row < rows; row++) {
    const role = roleRows[row] || "prop";
    for (let col = 0; col < cols; col++) {
      const index = row * cols + col;
      const resolvedRole = kind === "walls" && index === 1 ? "door" : role;
      const id = `plan_${tilesetId}_${kind}_${role}_${index}`;
      biomeSprites[id] = {
        id,
        name: `${PLAN_TILESET_DEFS[tilesetId].label} ${resolvedRole} ${index + 1}`,
        kind: resolvedRole === "house" ? "house" : resolvedRole === "tower" ? "tower" : resolvedRole === "building" ? "building" : resolvedRole === "wall" || resolvedRole === "door" ? "wall" : resolvedRole === "grave" ? "grave" : "container",
        planTileset: tilesetId,
        planRole: resolvedRole,
        atlas: atlasKey,
        approxRect: { x: col * cellW, y: row * cellH, w: cellW, h: cellH },
        promptSummary: `${PLAN_TILESET_DEFS[tilesetId].label} plan-view ${resolvedRole} sprite`
      };
    }
  }
}

function applySpriteStyles() {
  document.querySelectorAll("[data-sprite]").forEach(el => {
    const id = el.dataset.sprite;
    const sprite = spriteLookup[id] || spriteLookup.redPotion;
    if (!sprite) return;
    const spriteWidth = sprite.width || SPRITE_CELL;
    const spriteHeight = sprite.height || SPRITE_CELL;
    const targetSize = Number.parseFloat(getComputedStyle(el).getPropertyValue("--sprite-size")) || el.clientWidth || 56;
    const scale = sprite.iconScale || targetSize / Math.max(spriteWidth, spriteHeight);
    const atlas = atlasDimensions[sprite.sheet] || atlasDimensions.items;
    el.style.setProperty("--sheet", `url("${atlasFiles[sprite.sheet]}")`);
    el.style.setProperty("--x", `${-sprite.x * scale + (targetSize - spriteWidth * scale) / 2}px`);
    el.style.setProperty("--y", `${-sprite.y * scale + (targetSize - spriteHeight * scale) / 2}px`);
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
  state.selectedSkill = null;
  if (state.camera.mode !== "free") enableFollowCamera();
  document.querySelectorAll(".party-member").forEach(member => {
    member.classList.toggle("active", member.dataset.hero === id);
  });
  renderHud();
  renderInventory();
  renderProgression();
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

function propWorldId(propId, x, y) {
  return `${propId}-${Math.floor(x)}-${Math.floor(y)}`;
}

function isDestructiblePropId(propId) {
  return Boolean(propId) && DESTRUCTIBLE_PROP_PARTS.some(part => propId.includes(part));
}

function isDestroyedProp(propId, x, y) {
  return Boolean(state.worldEdits[worldEditKey("prop", propWorldId(propId, x, y))]?.dead);
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
  const forest = ["forest_ancient_dead_pine", "forest_twisted_green_black_tree", "forest_leafless_cursed_tree", "forest_thorn_bush", "forest_berry_bush", "forest_wildflower_clump", "forest_glowing_blue_mushrooms", "forest_red_cap_mushrooms", "forest_mossy_boulder_cluster", "forest_jagged_slate_rocks", "forest_fallen_log", "forest_hollow_log", "forest_moss_roots_patch", "forest_bramble_arch", "forest_dark_fern_cluster", "rubble_fern_rock_cluster", "rubble_leafy_bramble_patch", "rubble2_thorny_bramble_thicket"];
  const ruins = ["village_broken_wagon", "village_old_stone_well", "village_ruined_cottage_corner", "village_cracked_stone_altar", "village_stacked_crates", "village_barrels_cluster", "village2_broken_hay_wagon", "village2_hanging_cage_gibbet", "village2_hanging_cage_post", "village2_siege_ballista", "village3_collapsed_wagon_wreck", "village3_notice_board", "village3_blue_brazier_pedestal", "village3_spiked_wall_segment", "village3_palisade_stakes", "village3_graveyard_cluster", "village3_armory_supplies", "village3_treasure_supply_hoard", "building_mossy_stone_foundation", "rubble_mossy_low_wall", "rubble_loose_cobble_cluster", "rubble_gray_boulder_cluster", "rubble_jagged_rock_spire", "rubble2_large_boulder_cluster", "rubble2_mossy_rock_cluster", "rubble2_moss_covered_rocks"];
  const marsh = ["forest_hollow_log", "forest_moss_roots_patch", "forest_bramble_arch", "forest_red_cap_mushrooms", "forest_jagged_slate_rocks", "rubble_stony_grass_patch", "rubble_dry_grass_patch", "rubble_overgrown_grass_mound", "rubble_dirt_path_patch", "rubble_tall_dry_grass_rocks", "rubble_leafy_ground_patch", "rubble2_sparse_dirt_grass_patch", "rubble2_dense_grass_patch", "rubble2_dry_scrub_patch", "rubble2_flowering_thistle_rocks", "rubble2_shrub_rock_patch", "rubble2_rocky_ground_patch"];
  const pool = biome === "ruins" ? ruins : biome === "marsh" ? marsh : forest;
  return pool[Math.floor(roll * pool.length) % pool.length];
}

function getChunk(cx, cy) {
  const key = chunkKey(cx, cy);
  if (!state.chunks.has(key)) {
    state.chunks.set(key, generateChunk(cx, cy));
    state.chunkOrder.push(key);
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
    addEnemyClusterAroundLandmark(chunk, chunk.buildings[0], "ruins", WORLD_SEED + 5, 2);
  }

  const centerX = cx * CHUNK_SIZE + 8;
  const centerY = cy * CHUNK_SIZE + 8;
  const distFromSpawn = Math.hypot(centerX - 10, centerY - 14);
  const biome = getBiome(centerX, centerY);
  const roll = hash2(cx, cy, WORLD_SEED + 41);
  if (distFromSpawn > 18 && roll > 0.78) {
    const assets = biome === "ruins"
      ? ["building_ruined_chapel_wall", "building_collapsed_barn", "building_ruined_village_gate_arch", "village2_ruined_gate_arch", "village2_barricaded_tower_gate", "village3_lit_crypt_door", "village3_barricaded_watchtower"]
      : ["building_small_hunter_cabin", "village_gloomy_woodland_hut", "building_ruined_blacksmith_shed", "village2_alchemist_market_tent", "village2_thatched_livestock_shed", "village2_wooden_watchtower", "village3_blacksmith_forge_house", "village4_timber_cottage", "village4_round_thatched_hut", "village4_stone_chapel", "village4_bannered_guildhall"];
    const landmark = { id: `building-${cx}-${cy}`, name: biome === "ruins" ? "Village Ruin" : "Woodland Shelter", x: centerX - 1.5, y: centerY - 1.5, w: 3, h: 3, open: true, biomeAsset: assets[Math.floor(roll * assets.length) % assets.length] };
    chunk.buildings.push(landmark);
    if (hash2(cx, cy, WORLD_SEED + 211) < LANDMARK_ENEMY_CHANCE) {
      addEnemyClusterAroundLandmark(chunk, landmark, biome, WORLD_SEED + 217, 3);
    }
  }
  if (distFromSpawn > 8) {
    const commonRoll = hash2(cx, cy, WORLD_SEED + 97);
    if (commonRoll > 0.35) {
      const count = Math.max(1, Math.floor((2 + Math.floor(hash2(cx, cy, WORLD_SEED + 98) * 7)) * ENEMY_DENSITY_SCALE));
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
  if (distFromSpawn > 14) {
    const cyclopsRoll = hash2(cx, cy, WORLD_SEED + 149);
    if (cyclopsRoll > CYCLOPS_SPAWN_MIN_ROLL) {
      const spread = hash2(cx, cy, WORLD_SEED + 150) * Math.PI * 2;
      const radius = 1.2 + hash2(cx, cy, WORLD_SEED + 151) * 2.2;
      chunk.enemies.push(enemy(
        "cyclops",
        enemyName("cyclops"),
        centerX + Math.cos(spread) * radius,
        centerY + Math.sin(spread) * radius,
        156,
        23,
        cyclopsRoll > 0.985 ? "runeShard" : "coinStack",
        rareEnemyOptions("cyclops", cyclopsRoll)
      ));
    }
  }
  if (distFromSpawn > 22) {
    const emperorRoll = hash2(cx, cy, WORLD_SEED + 173);
    if (emperorRoll > GOBLIN_EMPEROR_SPAWN_MIN_ROLL) {
      const spread = hash2(cx, cy, WORLD_SEED + 174) * Math.PI * 2;
      const radius = 1 + hash2(cx, cy, WORLD_SEED + 175) * 2;
      chunk.enemies.push(enemy(
        "goblinEmperor",
        enemyName("goblinEmperor"),
        centerX + Math.cos(spread) * radius,
        centerY + Math.sin(spread) * radius,
        196,
        28,
        emperorRoll > 0.99 ? "runeShard" : "coinStack",
        rareEnemyOptions("goblinEmperor", emperorRoll)
      ));
    }
  }
  if (distFromSpawn > 8 && roll > 0.95) {
    const enemyType = biome === "marsh" ? ["swampHag", "beastWolf"] : biome === "ruins" ? ["skeleton", "cultist"] : ["goblinRaider", "beastWolf", "emberImp"];
    const count = 1;
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
  const cameraBounds = state.camera.zoom >= DETAIL_TEXTURE_MIN_ZOOM ? visibleTileBounds(8) : null;
  const cameraChunks = cameraBounds && {
    minX: Math.floor(cameraBounds.minX / CHUNK_SIZE) - 1,
    maxX: Math.floor(cameraBounds.maxX / CHUNK_SIZE) + 1,
    minY: Math.floor(cameraBounds.minY / CHUNK_SIZE) - 1,
    maxY: Math.floor(cameraBounds.maxY / CHUNK_SIZE) + 1
  };
  for (const key of [...state.chunks.keys()]) {
    const [cx, cy] = key.split(",").map(Number);
    const nearHero = Math.abs(cx - hcx) <= CHUNK_RADIUS + 2 && Math.abs(cy - hcy) <= CHUNK_RADIUS + 2;
    const nearCamera = cameraChunks
      && cx >= cameraChunks.minX
      && cx <= cameraChunks.maxX
      && cy >= cameraChunks.minY
      && cy <= cameraChunks.maxY;
    if (!nearHero && !nearCamera) {
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

function addEnemyClusterAroundLandmark(chunk, landmark, biome, seed, maxCount = 3) {
  if (!landmark) return;
  const roll = hash2(Math.floor(landmark.x), Math.floor(landmark.y), seed);
  const pool = landmark.id === "temple"
    ? ["skeleton", "frostAcolyte", "cultist"]
    : biome === "marsh"
      ? ["swampHag", "beastWolf"]
      : biome === "ruins"
        ? ["skeleton", "cultist", "commonMummy"]
        : ["goblinRaider", "beastWolf", "emberImp"];
  const count = Math.max(1, Math.min(maxCount, Math.round((2 + roll * 4) * ENEMY_DENSITY_SCALE)));
  const cx = landmark.x + landmark.w / 2;
  const cy = landmark.y + landmark.h / 2;

  for (let i = 0; i < count; i++) {
    const type = pool[(i + Math.floor(roll * 100)) % pool.length];
    const angle = hash2(cx + i, cy - i, seed + 13) * Math.PI * 2;
    const radius = 1.9 + hash2(cx - i, cy + i, seed + 17) * LANDMARK_ENEMY_RADIUS;
    const stats = commonEnemyStats(type);
    const ex = cx + Math.cos(angle) * radius;
    const ey = cy + Math.sin(angle) * radius;
    if (spawnPointBlockedBySeed(ex, ey, landmark)) continue;
    chunk.enemies.push(enemy(
      type,
      enemyName(type),
      ex,
      ey,
      stats.hp,
      stats.damage,
      roll > 0.66 ? "coinStack" : "redPotion"
    ));
  }
}

function spawnPointBlockedBySeed(x, y, landmark = null) {
  const tile = tileFromSeed(Math.floor(x), Math.floor(y));
  if (!tile || tile.water) return true;
  if (landmark && x >= landmark.x && y >= landmark.y && x < landmark.x + landmark.w && y < landmark.y + landmark.h) return true;
  return false;
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
    cultist: "Cultist",
    cyclops: "Cyclops",
    goblinEmperor: "Goblin Emperor"
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

function rareEnemyOptions(sprite, roll = 0) {
  const profile = RARE_ENEMY_PROFILES[sprite];
  if (!profile) return {};
  const exalted = roll > 0.992;
  return {
    rarity: exalted ? "legendary" : "rare",
    title: exalted ? "Exalted" : profile.title,
    hpMultiplier: profile.hpMultiplier * (exalted ? 1.22 : 1),
    damageMultiplier: profile.damageMultiplier * (exalted ? 1.12 : 1),
    xpMultiplier: profile.xpMultiplier * (exalted ? 1.25 : 1),
    goldMultiplier: profile.goldMultiplier * (exalted ? 1.35 : 1),
    lootRolls: profile.lootRolls + (exalted ? 1 : 0),
    bonusDrops: profile.bonusDrops
  };
}

function enemy(sprite, name, x, y, hp, damage, drop, options = {}) {
  const caster = enemySpellProfile(sprite);
  const melee = enemyMeleeProfile(sprite);
  const maxHp = Math.round(hp * (options.hpMultiplier || 1));
  const finalDamage = Math.round(damage * (options.damageMultiplier || 1));
  return {
    id: `${sprite}-${x}-${y}`,
    sprite,
    name: options.title ? `${options.title} ${name}` : name,
    x,
    y,
    hp: maxHp,
    maxHp,
    damage: finalDamage,
    drop,
    rarity: options.rarity || "common",
    lootRolls: options.lootRolls || 1,
    goldMultiplier: options.goldMultiplier || 1,
    xpMultiplier: options.xpMultiplier || 1,
    bonusDrops: options.bonusDrops || [],
    speed: caster?.speed || melee?.speed || (sprite === "frostAcolyte" ? 1.15 : 1.45),
    aggro: caster?.aggro || melee?.aggro || (sprite === "frostAcolyte" ? 6 : 5),
    attackRange: caster?.range || melee?.attackRange || (sprite === "frostAcolyte" ? 3.8 : 1.25),
    attackCooldown: melee?.attackCooldown || null,
    spellKind: caster?.kind || null,
    cooldown: 0,
    dir: 1,
    walkT: 0,
    animT: 0,
    attackT: 0,
    voiceSrc: monsterVoicePath(sprite, x, y),
    voiceAudio: null,
    voiceReadyAt: 0,
    voiceAlerted: false,
    dead: false
  };
}

function enemySpellProfile(sprite) {
  return {
    cultist: { kind: "bloodHex", aggro: 7, range: 5.8 },
    commonNecromancer: { kind: "stormChain", aggro: 8, range: 7 },
    frostAcolyte: { kind: "frostShard", aggro: 6, range: 3.8 }
  }[sprite] || null;
}

function enemyMeleeProfile(sprite) {
  return {
    cyclops: { speed: 0.82, aggro: 6.4, attackRange: 1.55, attackCooldown: 1.55 },
    goblinEmperor: { speed: 0.74, aggro: 7.2, attackRange: 1.7, attackCooldown: 1.75 }
  }[sprite] || null;
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
  if (!saved) {
    normalizeHeroSkills();
    normalizeEditorState();
    normalizeCamera();
    return;
  }
  try {
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed.heroes)) state.heroes = parsed.heroes;
    else if (parsed.player) Object.assign(state.heroes[0], parsed.player);
    if (parsed.activeHeroId) state.activeHeroId = parsed.activeHeroId;
    if (parsed.worldEdits) state.worldEdits = parsed.worldEdits;
    if (Array.isArray(parsed.loot)) state.loot = parsed.loot;
    if (parsed.editor) restoreEditorState(parsed.editor);
    if (parsed.camera) Object.assign(state.camera, parsed.camera);
    if (parsed.quest) Object.assign(state.quest, parsed.quest);
    if (typeof parsed.inside === "string" || parsed.inside === null) state.inside = parsed.inside;
  } catch (error) {
    console.warn("Save restore failed.", error);
  }
  normalizeHeroSkills();
  normalizeEditorState();
  normalizeCamera();
}

function restoreEditorState(editor) {
  state.editor.scales = editor.scales && typeof editor.scales === "object" ? editor.scales : {};
  state.editor.prefabs = Array.isArray(editor.prefabs) ? editor.prefabs : [];
  state.editor.plans = Array.isArray(editor.plans) ? editor.plans : [];
  state.editor.placements = Array.isArray(editor.placements) ? editor.placements : [];
  state.editor.planTilesetSources = editor.planTilesetSources && typeof editor.planTilesetSources === "object" ? editor.planTilesetSources : {};
  state.editor.activeLayer = normalizeEditorLayer(editor.activeLayer || "building");
  state.editor.layerVisibility = { ...DEFAULT_EDITOR_LAYER_VISIBILITY, ...(editor.layerVisibility || {}) };
  state.editor.lineCategory = editor.lineCategory || "village";
  state.editor.lineShape = editor.lineShape || "straight";
  state.editor.brushDensity = editor.brushDensity || 4;
  state.editor.planView = Boolean(editor.planView);
  state.editor.planDraft = editor.planDraft && typeof editor.planDraft === "object"
    ? editor.planDraft
    : { name: "New Plan", occurrence: 4, tileset: "village", width: PLAN_GRID_SIZE, height: PLAN_GRID_SIZE, activeBrush: "wall", cells: {}, wallCount: PLAN_WALL_COUNT_DEFAULT, wallSpacing: PLAN_WALL_SPACING_DEFAULT, wallSpread: PLAN_WALL_SPREAD_DEFAULT };
  state.editor.planModal = editor.planModal && typeof editor.planModal === "object"
    ? editor.planModal
    : { x: null, y: null, width: 540, height: 620 };
  state.editor.draft = editor.draft && typeof editor.draft === "object"
    ? editor.draft
    : { name: "New Set", occurrence: 4, items: [] };
}

function normalizeEditorLayer(layer) {
  if (layer === "buildings") return "building";
  if (layer === "overlay") return "vegetation";
  return EDITOR_LAYERS.includes(layer) ? layer : "building";
}

function normalizeEditorItemLayers(items) {
  if (!Array.isArray(items)) return [];
  return items.map(item => ({ ...item, layer: normalizeEditorLayer(item.layer) }));
}

function normalizeEditorPrefabLayers() {
  state.editor.draft.items = normalizeEditorItemLayers(state.editor.draft.items);
  state.editor.prefabs = state.editor.prefabs.map(prefab => ({
    ...prefab,
    items: normalizeEditorItemLayers(prefab.items)
  }));
}

function editorLayerVisible(layer) {
  return state.editor.layerVisibility?.[normalizeEditorLayer(layer)] !== false;
}

function normalizeEditorState() {
  state.editor.scales ||= {};
  state.editor.prefabs = Array.isArray(state.editor.prefabs) ? state.editor.prefabs : [];
  state.editor.plans = Array.isArray(state.editor.plans) ? state.editor.plans.map(normalizePlanSpawn).filter(Boolean) : [];
  state.editor.placements = Array.isArray(state.editor.placements) ? state.editor.placements : [];
  state.editor.planTilesetSources = state.editor.planTilesetSources && typeof state.editor.planTilesetSources === "object" ? state.editor.planTilesetSources : {};
  state.editor.layerVisibility = { ...DEFAULT_EDITOR_LAYER_VISIBILITY, ...(state.editor.layerVisibility || {}) };
  state.editor.draft ||= { name: "New Set", occurrence: 4, items: [] };
  state.editor.draft.name ||= "New Set";
  state.editor.draft.occurrence = clamp(Number(state.editor.draft.occurrence) || 4, 1, 10);
  state.editor.draft.items = Array.isArray(state.editor.draft.items) ? state.editor.draft.items : [];
  state.editor.draft.anchor = state.editor.draft.anchor && Number.isFinite(state.editor.draft.anchor.x) && Number.isFinite(state.editor.draft.anchor.y)
    ? state.editor.draft.anchor
    : null;
  normalizeEditorPrefabLayers();
  state.editor.activeLayer = normalizeEditorLayer(state.editor.activeLayer);
  state.editor.open = false;
  state.editor.selected = null;
  state.editor.selectedDraftIndexes = [];
  state.editor.movingDraftItem = null;
  state.editor.placingPrefabId = null;
  state.editor.lineMode = Boolean(state.editor.lineMode);
  state.editor.planView = Boolean(state.editor.planView);
  state.editor.planDraft = normalizePlanDraft(state.editor.planDraft);
  state.editor.planModal = normalizePlanModal(state.editor.planModal);
  state.editor.lineCategory = ["village", "ruins", "forest", "rubble", "biome", "mixed"].includes(state.editor.lineCategory) ? state.editor.lineCategory : "village";
  state.editor.lineShape = ["straight", "curved", "circle", "wall"].includes(state.editor.lineShape) ? state.editor.lineShape : "straight";
  state.editor.brushDensity = clamp(Number(state.editor.brushDensity) || 4, 1, 10);
  state.editor.contextTarget = null;
}

function normalizePlanModal(modal = {}) {
  return {
    x: Number.isFinite(modal.x) ? modal.x : null,
    y: Number.isFinite(modal.y) ? modal.y : null,
    width: clamp(Number(modal.width) || 540, 360, 920),
    height: clamp(Number(modal.height) || 620, 420, 860)
  };
}

function normalizePlanDraft(plan = {}) {
  const normalized = normalizePlanSpawn({
    id: plan.id || "draft-plan",
    name: plan.name || "New Plan",
    occurrence: plan.occurrence || 4,
    tileset: plan.tileset || "village",
    width: plan.width || PLAN_GRID_SIZE,
    height: plan.height || PLAN_GRID_SIZE,
    activeBrush: plan.activeBrush || "wall",
    cells: plan.cells || {},
    wallCount: plan.wallCount,
    wallSpacing: plan.wallSpacing,
    wallSpread: plan.wallSpread
  }) || { id: "draft-plan", name: "New Plan", occurrence: 4, tileset: "village", width: PLAN_GRID_SIZE, height: PLAN_GRID_SIZE, activeBrush: "wall", cells: {}, wallCount: PLAN_WALL_COUNT_DEFAULT, wallSpacing: PLAN_WALL_SPACING_DEFAULT, wallSpread: PLAN_WALL_SPREAD_DEFAULT };
  if (typeof plan.sourcePlanId === "string") normalized.sourcePlanId = plan.sourcePlanId;
  if (plan.anchor && Number.isFinite(plan.anchor.x) && Number.isFinite(plan.anchor.y)) {
    normalized.anchor = { x: plan.anchor.x, y: plan.anchor.y };
  }
  return normalized;
}

function normalizePlanSpawn(plan) {
  if (!plan || typeof plan !== "object") return null;
  const width = clamp(Math.round(Number(plan.width) || PLAN_GRID_SIZE), 4, 24);
  const height = clamp(Math.round(Number(plan.height) || PLAN_GRID_SIZE), 4, 24);
  const cells = {};
  for (const [key, brush] of Object.entries(plan.cells || {})) {
    if (!PLAN_BRUSH_BY_ID[brush] || brush === "erase") continue;
    const [x, y] = key.split(",").map(Number);
    if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || y < 0 || x >= width || y >= height) continue;
    cells[`${x},${y}`] = brush;
  }
  const normalized = {
    id: plan.id || `plan-${Date.now()}`,
    name: String(plan.name || "Plan Spawn").slice(0, 32),
    occurrence: clamp(Number(plan.occurrence) || 4, 1, 10),
    tileset: PLAN_TILESET_DEFS[plan.tileset] ? plan.tileset : "village",
    width,
    height,
    activeBrush: PLAN_BRUSH_BY_ID[plan.activeBrush] ? plan.activeBrush : "wall",
    cells,
    wallCount: clamp(Math.round(Number(plan.wallCount) || PLAN_WALL_COUNT_DEFAULT), PLAN_WALL_COUNT_MIN, PLAN_WALL_COUNT_MAX),
    wallSpacing: clamp(Number(plan.wallSpacing) || PLAN_WALL_SPACING_DEFAULT, PLAN_WALL_SPACING_MIN, PLAN_WALL_SPACING_MAX),
    wallSpread: clamp(Number(plan.wallSpread) || PLAN_WALL_SPREAD_DEFAULT, PLAN_WALL_SPREAD_MIN, PLAN_WALL_SPREAD_MAX)
  };
  if (plan.anchor && Number.isFinite(plan.anchor.x) && Number.isFinite(plan.anchor.y)) {
    normalized.anchor = { x: plan.anchor.x, y: plan.anchor.y };
  }
  return normalized;
}

function editorScaleKey(type, id) {
  return `${type}:${id}`;
}

function editorScaleFor(type, id) {
  const value = Number(state.editor?.scales?.[editorScaleKey(type, id)]);
  return Number.isFinite(value) ? clamp(value, EDITOR_SCALE_MIN, EDITOR_SCALE_MAX) : 1;
}

function setEditorScale(type, id, scale) {
  if (!type || !id) return;
  state.editor.scales[editorScaleKey(type, id)] = clamp(Number(scale) || 1, EDITOR_SCALE_MIN, EDITOR_SCALE_MAX);
  updateEditorSelectedUi();
  saveGame(true);
}

function editorAssetName(asset) {
  if (!asset) return "Unknown";
  if (asset.type === "biome") return biomeSprites[asset.id]?.name || biomeSprites[asset.id]?.promptSummary?.split(",")[0] || asset.id.replaceAll("_", " ");
  if (asset.type === "enemy") return enemyName(asset.id);
  if (asset.type === "item") return itemName(asset.id);
  if (asset.type === "forest") return "Forest cluster";
  return asset.id;
}

function editorLayerDepth(layer) {
  return { ground: -10000, building: 0, vegetation: 10000 }[normalizeEditorLayer(layer)] || 0;
}

function editorDrawThumb(canvasEl, asset) {
  const thumb = canvasEl.getContext("2d");
  const inset = 3;
  const size = canvasEl.width - inset * 2;
  thumb.clearRect(0, 0, canvasEl.width, canvasEl.height);
  thumb.fillStyle = "rgba(0,0,0,0.24)";
  thumb.fillRect(0, 0, canvasEl.width, canvasEl.height);

  if (asset.type === "biome") {
    const sprite = biomeSprites[asset.id];
    const image = sprite && biomeAssets[sprite.atlas];
    if (image && !assetLoaded(image)) image.addEventListener("load", () => editorDrawThumb(canvasEl, asset), { once: true });
    if (sprite && assetLoaded(image)) {
      const r = sprite.approxRect;
      drawImageContainedOn(thumb, image, r.x, r.y, r.w, r.h, inset, inset, size, size);
      return;
    }
  } else if (asset.type === "enemy" || asset.type === "item") {
    const sprite = spriteLookup[asset.id];
    const image = sprite && images[sprite.sheet];
    if (image && !assetLoaded(image)) image.addEventListener("load", () => editorDrawThumb(canvasEl, asset), { once: true });
    if (sprite && assetLoaded(image)) {
      drawImageContainedOn(thumb, image, sprite.x, sprite.y, sprite.width || SPRITE_CELL, sprite.height || SPRITE_CELL, inset, inset, size, size);
      return;
    }
  } else if (asset.type === "forest" && assetLoaded(terrainAssets.forestClusters)) {
    const image = terrainAssets.forestClusters;
    drawImageContainedOn(thumb, image, 0, 0, image.naturalWidth / 4, image.naturalHeight / 4, inset, inset, size, size);
    return;
  } else if (asset.type === "forest" && terrainAssets.forestClusters) {
    terrainAssets.forestClusters.addEventListener("load", () => editorDrawThumb(canvasEl, asset), { once: true });
  }

  thumb.fillStyle = "#f0c46a";
  thumb.font = "bold 22px Georgia";
  thumb.textAlign = "center";
  thumb.fillText(asset.type[0]?.toUpperCase() || "?", canvasEl.width / 2, canvasEl.height / 2 + 8);
}

function editorPrefabById(id) {
  return state.editor.prefabs.find(prefab => prefab.id === id);
}

function editorBiomeIdsBy(predicate) {
  return Object.entries(biomeSprites)
    .filter(([, sprite]) => predicate(sprite))
    .map(([id]) => id);
}

function editorLineAssetPool(category = state.editor.lineCategory) {
  if (category === "biome") {
    const anchor = state.editor.draft.anchor || activeHero();
    category = editorCategoryForBiome(anchor.x, anchor.y);
  }
  const villageKinds = ["building", "house", "shop", "tower", "church", "stable", "forge", "hut", "cabin", "barn", "well", "container", "wagon", "campfire", "signpost"];
  const ruinKinds = ["ruin", "wall", "gate", "arch", "bridge", "shrine", "altar", "statue", "portal", "siege", "gibbet", "rubble"];
  const forestKinds = ["tree", "bush", "flower", "mushroom", "fern", "foliage", "bramble", "log", "stump", "ground_prop"];
  const rubbleKinds = ["rock", "boulder", "rubble", "ground_cover", "path", "road", "grass"];
  const biome = kinds => editorBiomeIdsBy(sprite => kinds.includes(sprite.kind)).map(id => ({ type: "biome", id }));
  const pools = {
    village: biome(villageKinds),
    ruins: biome(ruinKinds),
    forest: [{ type: "forest", id: "cluster" }, ...biome(forestKinds)],
    rubble: biome(rubbleKinds)
  };
  pools.mixed = [...pools.village, ...pools.ruins, ...pools.forest, ...pools.rubble];
  return pools[category]?.length ? pools[category] : pools.mixed;
}

function editorCategoryForBiome(x, y) {
  const biome = getBiome(x, y);
  if (biome === "ruins") return "ruins";
  if (biome === "marsh") return "rubble";
  if (biome === "deepwood" || biome === "grove") return "forest";
  return "mixed";
}

function editorLineSpacingFor(category = state.editor.lineCategory) {
  const base = { village: 1.45, ruins: 1.15, forest: 0.92, rubble: 0.72, biome: 1.02, mixed: 1.05 }[category] || 1;
  return base / Math.sqrt(clamp(Number(state.editor.brushDensity) || 4, 1, 10) / 4);
}

function editorLayerForAsset(asset) {
  if (asset.type !== "biome") return asset.type === "forest" ? "vegetation" : normalizeEditorLayer(state.editor.activeLayer);
  const kind = biomeSprites[asset.id]?.kind || "";
  if (["ground_prop", "ground_cover", "path", "road", "grass", "flower", "fern", "mushroom", "foliage"].includes(kind)) return "ground";
  if (["tree", "bramble", "log", "stump", "bush"].includes(kind)) return "vegetation";
  return "building";
}

function editorVariationFor(x, y, index, strength = 1) {
  const scaleRoll = hash2(Math.floor(x * 43) + index * 5, Math.floor(y * 43), WORLD_SEED + 1423);
  const rotationRoll = hash2(Math.floor(x * 47), Math.floor(y * 47) + index * 11, WORLD_SEED + 1439);
  return {
    itemScale: 1 + (scaleRoll - 0.5) * 0.36 * strength,
    rotation: (rotationRoll - 0.5) * 0.34 * strength
  };
}

function editorCategoryKeepsVertical(category) {
  return category === "village" || category === "ruins";
}

function editorAssetKeepsVertical(asset) {
  if (!asset) return false;
  if (asset.type === "forest") return false;
  if (asset.type !== "biome") return true;
  const kind = biomeSprites[asset.id]?.kind || "";
  return ["building", "house", "shop", "tower", "church", "stable", "forge", "hut", "cabin", "barn", "well", "container", "wagon", "campfire", "signpost", "ruin", "wall", "gate", "arch", "bridge", "shrine", "altar", "statue", "portal", "siege", "gibbet"].includes(kind);
}

function editorVariationForAsset(asset, category, x, y, index, strength = 1) {
  const variation = editorVariationFor(x, y, index, strength);
  const resolvedCategory = category === "biome" ? editorCategoryForBiome(x, y) : category;
  if (editorCategoryKeepsVertical(resolvedCategory) || editorAssetKeepsVertical(asset)) variation.rotation = 0;
  return variation;
}

function wallRoleForSprite(id) {
  const sprite = biomeSprites[id];
  if (sprite?.wallRole) return sprite.wallRole;
  if (id === WALL_SPRITES.segment) return "segment";
  if (id === WALL_SPRITES.gate) return "gate";
  return null;
}

function isWallEditorItem(item) {
  if (!item || item.type !== "biome") return false;
  const kind = biomeSprites[item.id]?.kind;
  return Boolean(item.wallGroupId) && (kind === "wall" || kind === "gate" || wallRoleForSprite(item.id));
}

function editorWallGroupIndexes(groupId) {
  if (!groupId) return [];
  return state.editor.draft.items
    .map((item, index) => isWallEditorItem(item) && item.wallGroupId === groupId ? index : -1)
    .filter(index => index >= 0);
}

function editorWallSideIndexes(groupId, wallSide) {
  if (!groupId || !wallSide) return [];
  return state.editor.draft.items
    .map((item, index) => isWallEditorItem(item) && item.wallGroupId === groupId && item.wallSide === wallSide ? index : -1)
    .filter(index => index >= 0);
}

function wallVariantIdsForItem(item) {
  if (item?.wallSide === "front" || item?.wallSide === "gate") return [WALL_SPRITES.segment, WALL_SPRITES.gate];
  return item?.id === WALL_SPRITES.gate ? [WALL_SPRITES.segment, WALL_SPRITES.gate] : [WALL_SPRITES.segment];
}

function wallSelectionIndexes(target = state.editor.selected) {
  const selected = [...new Set(state.editor.selectedDraftIndexes || [])]
    .filter(index => isWallEditorItem(state.editor.draft.items[index]));
  if (selected.length) return selected;
  if (Number.isInteger(target?.draftIndex) && isWallEditorItem(state.editor.draft.items[target.draftIndex])) return [target.draftIndex];
  return [];
}

function cycleWallVariantIndexes(indexes, direction = 1) {
  const targets = [...new Set(indexes)].filter(index => isWallEditorItem(state.editor.draft.items[index]));
  if (!targets.length) return false;
  if (targets.length > 1) return false;
  for (const index of targets) {
    const item = state.editor.draft.items[index];
    const variants = wallVariantIdsForItem(item);
    if (variants.length < 2) continue;
    const current = Math.max(0, variants.indexOf(item.id));
    const nextId = variants[(current + direction + variants.length) % variants.length];
    item.id = nextId;
    item.wallRole = wallRoleForSprite(item.id) || item.wallRole;
    if (nextId === WALL_SPRITES.gate) {
      item.wallSide = "gate";
      item.itemScale = item.itemScale || 1;
      item.flipX = false;
    } else if (item.wallSide === "gate") {
      item.wallSide = "front";
      item.itemScale = item.itemScale || 1;
      item.flipX = false;
    }
  }
  renderEditorDraft();
  updateEditorSelectedUi();
  saveGame(true);
  return true;
}

function selectWallGroupFromTarget(target = state.editor.contextTarget || state.editor.selected) {
  const item = Number.isInteger(target?.draftIndex) ? state.editor.draft.items[target.draftIndex] : null;
  if (!isWallEditorItem(item)) return false;
  const indexes = editorWallGroupIndexes(item.wallGroupId);
  state.editor.selectedDraftIndexes = indexes;
  state.editor.selected = indexes.length === 1 ? editorDraftSelection(indexes[0]) : null;
  updateEditorSelectedUi();
  hideEditorContextMenu();
  toast(`Selected wall group (${indexes.length} pieces).`);
  return true;
}

function selectWallSideFromTarget(target = state.editor.contextTarget || state.editor.selected) {
  const item = Number.isInteger(target?.draftIndex) ? state.editor.draft.items[target.draftIndex] : null;
  if (!isWallEditorItem(item)) return false;
  const indexes = editorWallSideIndexes(item.wallGroupId, item.wallSide);
  state.editor.selectedDraftIndexes = indexes;
  state.editor.selected = indexes.length === 1 ? editorDraftSelection(indexes[0]) : null;
  updateEditorSelectedUi();
  hideEditorContextMenu();
  toast(`Selected ${item.wallSide} wall run (${indexes.length} pieces).`);
  return true;
}

function cycleWallTarget(target = state.editor.contextTarget || state.editor.selected, direction = 1) {
  const indexes = Number.isInteger(target?.draftIndex) && isWallEditorItem(state.editor.draft.items[target.draftIndex])
    ? [target.draftIndex]
    : wallSelectionIndexes(target);
  if (!indexes.length) return false;
  const ok = cycleWallVariantIndexes(indexes, direction);
  if (ok) toast(`Swapped ${indexes.length} wall tile${indexes.length === 1 ? "" : "s"}.`);
  return ok;
}

function wallGroupBounds(groupId) {
  const anchor = state.editor.draft.anchor;
  const indexes = editorWallGroupIndexes(groupId);
  if (!anchor || !indexes.length) return null;
  return indexes.reduce((bounds, index) => {
    const item = state.editor.draft.items[index];
    const x = Math.round(anchor.x + (item.dx || 0));
    const y = Math.round(anchor.y + (item.dy || 0));
    return {
      minX: Math.min(bounds.minX, x),
      maxX: Math.max(bounds.maxX, x),
      minY: Math.min(bounds.minY, y),
      maxY: Math.max(bounds.maxY, y)
    };
  }, { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity });
}

function wallGroupSpacing(groupId) {
  const index = editorWallGroupIndexes(groupId)[0];
  const spacing = Number(state.editor.draft.items[index]?.wallSpacing);
  return clamp(Number.isFinite(spacing) ? Math.round(spacing) : 1, 1, 6);
}

function wallGroupScale(groupId) {
  const index = editorWallGroupIndexes(groupId)[0];
  const scale = Number(state.editor.draft.items[index]?.itemScale);
  return Number.isFinite(scale) ? clamp(scale, EDITOR_SCALE_MIN, EDITOR_SCALE_MAX) : 1;
}

function replaceWallGroup(groupId, bounds, spacing = wallGroupSpacing(groupId)) {
  const anchor = state.editor.draft.anchor;
  const indexes = editorWallGroupIndexes(groupId);
  if (!anchor || !indexes.length) return false;
  const wallSpacing = clamp(Math.round(spacing) || 1, 1, 6);
  const groupScale = wallGroupScale(groupId);
  const items = editorWallItemsForRect({ x: bounds.minX, y: bounds.minY }, { x: bounds.maxX, y: bounds.maxY }, wallSpacing);
  const insertAt = Math.min(...indexes);
  indexes.sort((a, b) => b - a).forEach(index => state.editor.draft.items.splice(index, 1));
  const nextItems = items.map(item => ({
    type: item.asset.type,
    id: item.asset.id,
    layer: normalizeEditorLayer(item.layer),
    dx: item.point.x - anchor.x,
    dy: item.point.y - anchor.y,
    itemScale: groupScale,
    rotation: item.rotation,
    flipX: item.flipX,
    wallGroupId: groupId,
    wallSide: item.wallSide,
    wallRole: item.wallRole,
    wallSpacing
  }));
  state.editor.draft.items.splice(insertAt, 0, ...nextItems);
  state.editor.selectedDraftIndexes = nextItems.map((_, offset) => insertAt + offset);
  state.editor.selected = null;
  renderEditorDraft();
  updateEditorSelectedUi();
  saveGame(true);
  return true;
}

function resizeWallGroup(groupId, direction) {
  const bounds = wallGroupBounds(groupId);
  if (!bounds) return false;
  const grow = direction > 0;
  const next = grow
    ? { minX: bounds.minX - 1, maxX: bounds.maxX + 1, minY: bounds.minY - 1, maxY: bounds.maxY + 1 }
    : { minX: bounds.minX + 1, maxX: bounds.maxX - 1, minY: bounds.minY + 1, maxY: bounds.maxY - 1 };
  if (next.maxX - next.minX < 2 || next.maxY - next.minY < 2) {
    toast("Wall is already at minimum size.");
    return true;
  }
  return replaceWallGroup(groupId, next);
}

function adjustWallGroupSpacing(groupId, direction) {
  const bounds = wallGroupBounds(groupId);
  if (!bounds) return false;
  const current = wallGroupSpacing(groupId);
  const next = clamp(current + direction, 1, 6);
  if (next === current) {
    toast(direction > 0 ? "Wall spacing is already at maximum." : "Wall spacing is already one tile.");
    return true;
  }
  return replaceWallGroup(groupId, bounds, next);
}

function activeWallGroupId() {
  const indexes = wallSelectionIndexes();
  if (indexes.length) return state.editor.draft.items[indexes[0]]?.wallGroupId || null;
  const selectedIndex = state.editor.selected?.draftIndex;
  if (Number.isInteger(selectedIndex) && isWallEditorItem(state.editor.draft.items[selectedIndex])) {
    return state.editor.draft.items[selectedIndex].wallGroupId;
  }
  return null;
}

function resizeWallGroupFromMenu(target = state.editor.contextTarget || state.editor.selected) {
  const item = Number.isInteger(target?.draftIndex) ? state.editor.draft.items[target.draftIndex] : null;
  if (!isWallEditorItem(item)) return false;
  const current = wallGroupScale(item.wallGroupId);
  const raw = window.prompt("Wall group scale", current.toFixed(2));
  if (raw === null) return false;
  const scale = clamp(Number(raw) || current, EDITOR_SCALE_MIN, EDITOR_SCALE_MAX);
  const indexes = editorWallGroupIndexes(item.wallGroupId);
  for (const index of indexes) {
    state.editor.draft.items[index].itemScale = scale;
  }
  state.editor.selectedDraftIndexes = indexes;
  state.editor.selected = null;
  renderEditorDraft();
  updateEditorSelectedUi();
  saveGame(true);
  hideEditorContextMenu();
  toast(`Wall group scale set to ${scale.toFixed(2)}.`);
  return true;
}

function randomLineAsset(category, x, y, index) {
  const pool = editorLineAssetPool(category);
  const roll = hash2(Math.floor(x * 17) + index * 13, Math.floor(y * 17) - index * 7, WORLD_SEED + 1301 + category.length * 19);
  return pool[Math.floor(roll * pool.length) % pool.length];
}

function createEditorAssetList() {
  const biome = Object.keys(biomeSprites).map(id => ({ type: "biome", id }));
  const enemies = [...new Set([...commonEnemyTypes, "skeleton", "cultist", "emberImp", "frostAcolyte", "goblinRaider", "beastWolf", "swampHag", "cyclops", "goblinEmperor"])]
    .map(id => ({ type: "enemy", id }));
  const items = Object.keys(itemInfo).map(id => ({ type: "item", id }));
  return [{ type: "forest", id: "cluster" }, ...biome, ...enemies, ...items];
}

function renderEditorPanel() {
  const panel = document.getElementById("editorPanel");
  if (!panel) return;
  panel.classList.toggle("collapsed", !state.editor.open);
  panel.classList.toggle("plan-view-active", state.editor.planView);
  renderEditorPalette();
  renderEditorDraft();
  renderEditorPlanTools();
  renderSavedPrefabs();
  updateEditorSelectedUi();
}

function renderEditorPalette() {
  const palette = document.getElementById("editorPalette");
  if (!palette) return;
  palette.innerHTML = "";
  for (const asset of createEditorAssetList()) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "editor-asset";
    button.draggable = true;
    const thumb = document.createElement("canvas");
    thumb.width = 58;
    thumb.height = 58;
    const label = document.createElement("span");
    label.textContent = editorAssetName(asset);
    button.append(thumb, label);
    editorDrawThumb(thumb, asset);
    button.title = `${asset.type}: ${asset.id}`;
    button.addEventListener("dragstart", event => {
      event.dataTransfer.setData("application/json", JSON.stringify(asset));
      event.dataTransfer.effectAllowed = "copy";
    });
    button.addEventListener("click", () => addAssetToDraft(asset));
    palette.appendChild(button);
  }
}

function renderEditorDraft() {
  const name = document.getElementById("editorPrefabName");
  const occurrence = document.getElementById("editorOccurrence");
  const occurrenceValue = document.getElementById("editorOccurrenceValue");
  const list = document.getElementById("editorDraftItems");
  if (!list) return;
  const activeDraft = state.editor.planView ? state.editor.planDraft : state.editor.draft;
  if (name) name.value = activeDraft.name;
  if (occurrence) occurrence.value = activeDraft.occurrence;
  if (occurrenceValue) occurrenceValue.textContent = activeDraft.occurrence;
  const layer = document.getElementById("editorLayer");
  if (layer) layer.value = state.editor.activeLayer;
  document.querySelectorAll("[data-editor-layer-visible]").forEach(input => {
    input.checked = editorLayerVisible(input.dataset.editorLayerVisible);
  });
  list.innerHTML = "";
  if (state.editor.planView) {
    const plan = state.editor.planDraft;
    const row = document.createElement("span");
    row.innerHTML = `<b>${Object.keys(plan.cells).length} painted cells - ${PLAN_TILESET_DEFS[plan.tileset].label}</b><button type="button" title="Clear">X</button>`;
    row.querySelector("button").addEventListener("click", clearEditorPlanDraft);
    list.appendChild(row);
    return;
  }
  state.editor.draft.items.forEach((item, index) => {
    const row = document.createElement("span");
    const itemLayer = normalizeEditorLayer(item.layer);
    row.classList.toggle("layer-hidden", !editorLayerVisible(itemLayer));
    const groupLabel = isWallEditorItem(item) ? ` - ${item.wallSide || "wall"}` : "";
    row.innerHTML = `<b>${editorAssetName(item)}${groupLabel} - ${itemLayer}</b><button type="button" title="Remove">X</button>`;
    row.querySelector("button").addEventListener("click", () => {
      removeDraftItems([index]);
    });
    list.appendChild(row);
  });
}

function renderSavedPrefabs() {
  const list = document.getElementById("savedPrefabs");
  if (!list) return;
  list.innerHTML = "";
  for (const plan of state.editor.plans) {
    const row = document.createElement("div");
    row.className = "prefab-row plan-row";
    row.innerHTML = `<span>${plan.name} plan (${PLAN_TILESET_DEFS[plan.tileset].label}, ${plan.occurrence}/10)</span><button type="button">Load</button>`;
    row.querySelector("button").addEventListener("click", () => loadPlanIntoDraft(plan.id));
    row.addEventListener("click", event => {
      if (event.target.tagName === "BUTTON") return;
      loadPlanIntoDraft(plan.id);
    });
    list.appendChild(row);
  }
  for (const prefab of state.editor.prefabs) {
    const row = document.createElement("div");
    row.className = "prefab-row";
    row.innerHTML = `<span>${prefab.name} (${prefab.occurrence}/10)</span><button type="button">Place</button>`;
    row.querySelector("button").addEventListener("click", () => {
      state.editor.placingPrefabId = prefab.id;
      toast(`Click the map to place ${prefab.name}.`);
    });
    row.addEventListener("click", event => {
      if (event.target.tagName === "BUTTON") return;
      loadPrefabIntoDraft(prefab.id);
    });
    list.appendChild(row);
  }
}

function renderEditorPlanTools() {
  const tools = document.getElementById("editorPlanTools");
  if (tools) tools.hidden = !state.editor.planView;
  const modal = document.getElementById("editorPlanModal");
  if (modal) {
    modal.hidden = !state.editor.planView;
    if (state.editor.planView) applyPlanModalLayout();
  }
  const toggle = document.getElementById("editorPlanViewToggle");
  if (toggle) {
    toggle.classList.toggle("active", state.editor.planView);
    toggle.setAttribute("aria-pressed", state.editor.planView ? "true" : "false");
    toggle.textContent = state.editor.planView ? "Plan View On" : "Plan View";
  }
  const tileset = document.getElementById("editorPlanTileset");
  if (tileset) tileset.value = state.editor.planDraft.tileset;
  const widthInput = document.getElementById("editorPlanWidth");
  const heightInput = document.getElementById("editorPlanHeight");
  if (widthInput) widthInput.value = state.editor.planDraft.width;
  if (heightInput) heightInput.value = state.editor.planDraft.height;
  updatePlanWallControlValues();
  const brushGrid = document.getElementById("editorPlanBrushes");
  if (brushGrid) {
    brushGrid.innerHTML = "";
    for (const brush of PLAN_BRUSHES) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "plan-brush";
      button.classList.toggle("active", state.editor.planDraft.activeBrush === brush.id);
      button.style.setProperty("--brush-color", brush.color);
      button.textContent = brush.label;
      button.addEventListener("click", () => {
        state.editor.planDraft.activeBrush = brush.id;
        renderEditorPlanTools();
      });
      brushGrid.appendChild(button);
    }
  }
  drawPlanCanvas();
  renderSavedPlanViews();
  updatePlanLoadSelect();
  updatePlanTilesetStatus();
}

function updatePlanWallControlValues() {
  const plan = state.editor.planDraft;
  const count = document.getElementById("editorPlanWallCount");
  const spacing = document.getElementById("editorPlanWallSpacing");
  const spread = document.getElementById("editorPlanWallSpread");
  const countValue = document.getElementById("editorPlanWallCountValue");
  const spacingValue = document.getElementById("editorPlanWallSpacingValue");
  const spreadValue = document.getElementById("editorPlanWallSpreadValue");
  if (count) count.value = plan.wallCount;
  if (spacing) spacing.value = plan.wallSpacing;
  if (spread) spread.value = plan.wallSpread;
  if (countValue) countValue.textContent = plan.wallCount;
  if (spacingValue) spacingValue.textContent = Number(plan.wallSpacing).toFixed(1);
  if (spreadValue) spreadValue.textContent = Number(plan.wallSpread).toFixed(2);
}

function bindPlanWallSlider(id, property, normalize) {
  const input = document.getElementById(id);
  if (!input) return;
  const update = persist => {
    state.editor.planDraft[property] = normalize(input.value);
    updatePlanWallControlValues();
    drawPlanCanvas();
    if (state.editor.planDraft.anchor) requestAnimationFrame(render);
    if (persist) saveGame(true);
  };
  input.addEventListener("input", () => update(false));
  input.addEventListener("change", () => update(true));
}

function applyPlanModalLayout() {
  const modal = document.getElementById("editorPlanModal");
  if (!modal) return;
  const next = normalizePlanModal(state.editor.planModal);
  if (!Number.isFinite(next.x) || !Number.isFinite(next.y)) {
    next.x = Math.max(14, Math.round((window.innerWidth - next.width) / 2));
    next.y = Math.max(14, Math.round((window.innerHeight - next.height) / 2));
  }
  next.x = clamp(next.x, 8, Math.max(8, window.innerWidth - 80));
  next.y = clamp(next.y, 8, Math.max(8, window.innerHeight - 80));
  state.editor.planModal = next;
  modal.style.left = `${next.x}px`;
  modal.style.top = `${next.y}px`;
  modal.style.width = `${next.width}px`;
  modal.style.height = `${next.height}px`;
}

function syncPlanModalSize() {
  const modal = document.getElementById("editorPlanModal");
  if (!modal || modal.hidden) return;
  const rect = modal.getBoundingClientRect();
  state.editor.planModal = normalizePlanModal({
    ...state.editor.planModal,
    width: rect.width,
    height: rect.height
  });
}

function renderSavedPlanViews() {
  const list = document.getElementById("savedPlanViews");
  if (!list) return;
  list.innerHTML = "";
  if (!state.editor.plans.length) {
    const empty = document.createElement("div");
    empty.className = "plan-row";
    empty.textContent = "No saved plans yet.";
    list.appendChild(empty);
    return;
  }
  for (const plan of state.editor.plans) {
    const row = document.createElement("div");
    row.className = "plan-row";
    row.innerHTML = `<span>${plan.name} (${plan.width}x${plan.height}, ${PLAN_TILESET_DEFS[plan.tileset].label})</span><div class="plan-row-actions"><button type="button" data-plan-action="load">Load</button><button type="button" data-plan-action="delete">Delete</button></div>`;
    row.querySelector('[data-plan-action="load"]').addEventListener("click", () => loadPlanIntoDraft(plan.id));
    row.querySelector('[data-plan-action="delete"]').addEventListener("click", event => {
      event.stopPropagation();
      deleteSavedPlanView(plan.id);
    });
    row.addEventListener("click", event => {
      if (event.target.tagName === "BUTTON") return;
      loadPlanIntoDraft(plan.id);
    });
    list.appendChild(row);
  }
}

function deleteSavedPlanView(id) {
  const plan = state.editor.plans.find(entry => entry.id === id);
  state.editor.plans = state.editor.plans.filter(entry => entry.id !== id);
  if (state.editor.planDraft.sourcePlanId === id) delete state.editor.planDraft.sourcePlanId;
  saveGame(true);
  renderEditorPanel();
  if (plan) toast(`${plan.name} deleted.`);
}

function updatePlanLoadSelect() {
  const select = document.getElementById("editorPlanLoadSelect");
  if (!select) return;
  select.innerHTML = "";
  const empty = document.createElement("option");
  empty.value = "";
  empty.textContent = state.editor.plans.length ? "Load saved plan" : "No saved plans";
  select.appendChild(empty);
  for (const plan of state.editor.plans) {
    const option = document.createElement("option");
    option.value = plan.id;
    option.textContent = `${plan.name} (${plan.width}x${plan.height})`;
    select.appendChild(option);
  }
  select.value = state.editor.planDraft.sourcePlanId || "";
}

function updatePlanTilesetStatus() {
  const status = document.getElementById("editorPlanStatus");
  if (!status) return;
  const tilesetId = state.editor.planDraft.tileset;
  const main = planTilesetStatus[`${tilesetId}:main`];
  const walls = planTilesetStatus[`${tilesetId}:walls`];
  const missing = [];
  if (!main?.loaded) missing.push(PLAN_TILESET_DEFS[tilesetId].file);
  if (!walls?.loaded) missing.push(PLAN_TILESET_DEFS[tilesetId].wallFile);
  const markerText = state.editor.planDraft.anchor
    ? "Marker placed; painting updates the map preview."
    : "Click the game map to place the plan center marker.";
  status.textContent = missing.length
    ? `${markerText} Missing ${missing.join(" and ")}. Assign image${missing.length > 1 ? "s" : ""} to use custom ${PLAN_TILESET_DEFS[tilesetId].label} art.`
    : `${markerText} Right-click grid cells to erase.`;
}

function drawPlanCanvas() {
  const canvasEl = document.getElementById("editorPlanCanvas");
  if (!canvasEl) return;
  const plan = state.editor.planDraft;
  const rect = canvasEl.getBoundingClientRect();
  const dpr = Math.max(1, Math.min(devicePixelRatio || 1, 2));
  const pixelWidth = Math.max(240, Math.floor(rect.width * dpr));
  const pixelHeight = Math.max(240, Math.floor(rect.height * dpr));
  if (canvasEl.width !== pixelWidth || canvasEl.height !== pixelHeight) {
    canvasEl.width = pixelWidth;
    canvasEl.height = pixelHeight;
  }
  const planCtx = canvasEl.getContext("2d");
  const cellW = canvasEl.width / plan.width;
  const cellH = canvasEl.height / plan.height;
  planCtx.clearRect(0, 0, canvasEl.width, canvasEl.height);
  planCtx.fillStyle = "#0b0908";
  planCtx.fillRect(0, 0, canvasEl.width, canvasEl.height);
  for (const [key, brushId] of Object.entries(plan.cells)) {
    const brush = PLAN_BRUSH_BY_ID[brushId];
    if (!brush) continue;
    const [x, y] = key.split(",").map(Number);
    planCtx.fillStyle = brushId === "wall" ? "rgba(183, 185, 176, 0.24)" : brush.color;
    planCtx.fillRect(x * cellW + 1, y * cellH + 1, cellW - 2, cellH - 2);
  }
  for (const segment of planWallSegments(plan)) {
    const cx = (segment.cellX + 0.5) * cellW;
    const cy = (segment.cellY + 0.5) * cellH;
    const size = Math.max(5, Math.min(cellW, cellH) * 0.42);
    planCtx.fillStyle = segment.role === "door" ? "#d99a42" : PLAN_BRUSH_BY_ID.wall.color;
    planCtx.strokeStyle = "rgba(0, 0, 0, 0.65)";
    planCtx.lineWidth = Math.max(1, Math.round(size * 0.12));
    planCtx.beginPath();
    planCtx.rect(cx - size / 2, cy - size / 2, size, size);
    planCtx.fill();
    planCtx.stroke();
  }
  planCtx.strokeStyle = "rgba(217, 154, 66, 0.22)";
  planCtx.lineWidth = 1;
  for (let x = 0; x <= plan.width; x++) {
    planCtx.beginPath();
    planCtx.moveTo(Math.round(x * cellW) + 0.5, 0);
    planCtx.lineTo(Math.round(x * cellW) + 0.5, canvasEl.height);
    planCtx.stroke();
  }
  for (let y = 0; y <= plan.height; y++) {
    planCtx.beginPath();
    planCtx.moveTo(0, Math.round(y * cellH) + 0.5);
    planCtx.lineTo(canvasEl.width, Math.round(y * cellH) + 0.5);
    planCtx.stroke();
  }
}

function applyPlanGridSize() {
  const widthInput = document.getElementById("editorPlanWidth");
  const heightInput = document.getElementById("editorPlanHeight");
  const width = clamp(Math.round(Number(widthInput?.value) || state.editor.planDraft.width), 4, 24);
  const height = clamp(Math.round(Number(heightInput?.value) || state.editor.planDraft.height), 4, 24);
  resizePlanDraftGrid(width, height);
}

function resizePlanDraftGrid(width, height) {
  const plan = state.editor.planDraft;
  const cells = {};
  for (const [key, brush] of Object.entries(plan.cells || {})) {
    const [x, y] = key.split(",").map(Number);
    if (Number.isInteger(x) && Number.isInteger(y) && x < width && y < height) cells[key] = brush;
  }
  plan.width = width;
  plan.height = height;
  plan.cells = cells;
  renderEditorDraft();
  renderEditorPlanTools();
  saveGame(true);
}

function drawPlanViewMarker() {
  const anchor = state.editor.planDraft?.anchor;
  if (!anchor) return;
  const p = worldToScreen(anchor.x, anchor.y);
  const z = state.camera.zoom;
  const radius = Math.max(7, 13 * z);
  ctx.save();
  ctx.strokeStyle = "rgba(123, 223, 242, 0.95)";
  ctx.fillStyle = "rgba(123, 223, 242, 0.18)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(p.x - radius - 7, p.y);
  ctx.lineTo(p.x + radius + 7, p.y);
  ctx.moveTo(p.x, p.y - radius - 7);
  ctx.lineTo(p.x, p.y + radius + 7);
  ctx.stroke();
  const plan = state.editor.planDraft;
  const spread = clamp(Number(plan.wallSpread) || PLAN_WALL_SPREAD_DEFAULT, PLAN_WALL_SPREAD_MIN, PLAN_WALL_SPREAD_MAX);
  const w = plan.width * 0.96 * spread;
  const h = plan.height * 0.96 * spread;
  const a = worldToScreen(anchor.x - w / 2, anchor.y - h / 2);
  const b = worldToScreen(anchor.x + w / 2, anchor.y - h / 2);
  const c = worldToScreen(anchor.x + w / 2, anchor.y + h / 2);
  const d = worldToScreen(anchor.x - w / 2, anchor.y + h / 2);
  ctx.setLineDash([6, 5]);
  ctx.strokeStyle = "rgba(240, 196, 106, 0.82)";
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.lineTo(c.x, c.y);
  ctx.lineTo(d.x, d.y);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function updateEditorSelectedUi() {
  const label = document.getElementById("editorSelectedName");
  const input = document.getElementById("editorScaleInput");
  const lineButton = document.getElementById("editorLineModeToggle");
  const planButton = document.getElementById("editorPlanViewToggle");
  const lineCategory = document.getElementById("editorLineCategory");
  const lineShape = document.getElementById("editorLineShape");
  const brushDensity = document.getElementById("editorBrushDensity");
  const brushDensityValue = document.getElementById("editorBrushDensityValue");
  const lineStatus = document.getElementById("editorLineStatus");
  const selected = state.editor.selected;
  if (lineButton) {
    lineButton.classList.toggle("active", state.editor.lineMode);
    lineButton.setAttribute("aria-pressed", state.editor.lineMode ? "true" : "false");
    lineButton.textContent = state.editor.lineMode ? "Line Mode On" : "Line Mode";
  }
  if (planButton) {
    planButton.classList.toggle("active", state.editor.planView);
    planButton.setAttribute("aria-pressed", state.editor.planView ? "true" : "false");
    planButton.textContent = state.editor.planView ? "Plan View On" : "Plan View";
  }
  if (lineCategory) lineCategory.value = state.editor.lineCategory;
  if (lineShape) lineShape.value = state.editor.lineShape;
  if (brushDensity) brushDensity.value = state.editor.brushDensity;
  if (brushDensityValue) brushDensityValue.textContent = state.editor.brushDensity;
  if (lineStatus) {
    const pool = editorLineAssetPool(state.editor.lineCategory);
    lineStatus.textContent = state.editor.lineMode
      ? state.editor.lineShape === "wall"
        ? "Drag a wall footprint. Corners, straight walls, and one front gate are placed on the building layer."
        : `Draw ${state.editor.lineShape} ${state.editor.lineCategory} paths at density ${state.editor.brushDensity} (${pool.length} choices).`
      : "Line mode off. Select items or drag from the palette.";
  }
  if (!label || !input) return;
  if (state.editor.planView) {
    label.textContent = state.editor.planDraft.anchor ? "Plan marker placed - painting updates map" : "Click map to place plan center marker";
    input.value = "1";
    return;
  }
  const selectedDraftIndexes = state.editor.selectedDraftIndexes || [];
  if (selectedDraftIndexes.length > 1) {
    const wallItems = selectedDraftIndexes.map(index => state.editor.draft.items[index]).filter(isWallEditorItem);
    if (wallItems.length === selectedDraftIndexes.length) {
      const groupCount = new Set(wallItems.map(item => item.wallGroupId)).size;
      const sideCount = new Set(wallItems.map(item => item.wallSide)).size;
      label.textContent = sideCount === 1 && groupCount === 1
        ? `${wallItems[0].wallSide} wall run (${selectedDraftIndexes.length})`
        : `Wall group (${selectedDraftIndexes.length} pieces)`;
    } else {
      label.textContent = `${selectedDraftIndexes.length} items selected`;
    }
    input.value = "1";
    return;
  }
  if (!selected) {
    label.textContent = state.editor.placingPrefabId ? "Click map to place set" : "Select an object on the map";
    input.value = "1";
    return;
  }
  label.textContent = `${editorAssetName(selected)} (${selected.type})`;
  input.value = editorScaleFor(selected.type, selected.id).toFixed(2);
  const layer = document.getElementById("editorLayer");
  if (layer && Number.isInteger(selected.draftIndex)) {
    layer.value = normalizeEditorLayer(state.editor.draft.items[selected.draftIndex]?.layer || state.editor.activeLayer);
  }
}

function addAssetToDraft(asset, world = null, options = {}) {
  if (!asset) return;
  if (world && !state.editor.draft.anchor) {
    state.editor.draft.anchor = { x: world.x, y: world.y };
  }
  const anchor = state.editor.draft.anchor;
  const count = state.editor.draft.items.length;
  const angle = count * 2.399;
  const radius = 0.35 + Math.floor(count / 4) * 0.35;
  state.editor.draft.items.push({
    type: asset.type,
    id: asset.id,
    layer: normalizeEditorLayer(options.layer || state.editor.activeLayer),
    dx: world && anchor ? world.x - anchor.x : Math.cos(angle) * radius,
    dy: world && anchor ? world.y - anchor.y : Math.sin(angle) * radius,
    itemScale: options.itemScale,
    rotation: options.rotation,
    flipX: Boolean(options.flipX),
    wallGroupId: options.wallGroupId,
    wallSide: options.wallSide,
    wallRole: options.wallRole,
    wallSpacing: options.wallSpacing
  });
  if (options.render !== false) renderEditorDraft();
}

function removeDraftItems(indexes) {
  const unique = [...new Set(indexes)].filter(index => Number.isInteger(index) && state.editor.draft.items[index]);
  if (!unique.length) return false;
  unique.sort((a, b) => b - a).forEach(index => state.editor.draft.items.splice(index, 1));
  state.editor.selected = null;
  state.editor.selectedDraftIndexes = [];
  renderEditorDraft();
  updateEditorSelectedUi();
  saveGame(true);
  return true;
}

function saveCurrentPrefab() {
  const draft = state.editor.draft;
  if (!draft.items.length) {
    toast("Drop assets into the set first.");
    return;
  }
  const prefab = {
    id: `prefab-${Date.now()}`,
    name: draft.name?.trim() || "Prefab Set",
    occurrence: clamp(Number(draft.occurrence) || 4, 1, 10),
    items: draft.items.map(item => ({ ...item }))
  };
  state.editor.prefabs.push(prefab);
  saveGame(true);
  renderSavedPrefabs();
  toast(`${prefab.name} saved.`);
}

function saveSelectionPrefab() {
  const draft = state.editor.draft;
  const selectedIndexes = [...new Set(state.editor.selectedDraftIndexes || [])]
    .filter(index => Number.isInteger(index) && draft.items[index]);
  if (!selectedIndexes.length && Number.isInteger(state.editor.selected?.draftIndex) && draft.items[state.editor.selected.draftIndex]) {
    selectedIndexes.push(state.editor.selected.draftIndex);
  }
  if (!selectedIndexes.length || !draft.anchor) {
    toast("Select items with the rectangle first.");
    return;
  }

  const selectedItems = selectedIndexes.map(index => {
    const item = draft.items[index];
    return {
      item,
      x: draft.anchor.x + (item.dx || 0),
      y: draft.anchor.y + (item.dy || 0)
    };
  });
  const center = selectedItems.reduce((sum, entry) => ({
    x: sum.x + entry.x / selectedItems.length,
    y: sum.y + entry.y / selectedItems.length
  }), { x: 0, y: 0 });
  const prefab = {
    id: `prefab-${Date.now()}`,
    name: draft.name?.trim() || "Selection Set",
    occurrence: clamp(Number(draft.occurrence) || 4, 1, 10),
    items: selectedItems.map(entry => ({
      ...entry.item,
      dx: entry.x - center.x,
      dy: entry.y - center.y
    }))
  };
  state.editor.prefabs.push(prefab);
  saveGame(true);
  renderSavedPrefabs();
  toast(`${prefab.name} saved from selection.`);
}

function loadPrefabIntoDraft(id) {
  const prefab = editorPrefabById(id);
  if (!prefab) return;
  const hero = activeHero();
  state.editor.draft = {
    name: prefab.name,
    occurrence: prefab.occurrence,
    anchor: { x: hero.x + 1.8, y: hero.y + 1.8 },
    items: prefab.items.map(item => ({ ...item }))
  };
  state.editor.selected = null;
  state.editor.selectedDraftIndexes = [];
  renderEditorDraft();
}

function clearEditorDraft() {
  state.editor.draft = { name: "New Set", occurrence: 4, anchor: null, items: [] };
  state.editor.selected = null;
  state.editor.selectedDraftIndexes = [];
  renderEditorDraft();
  updateEditorSelectedUi();
}

function clearEditorPlanDraft() {
  state.editor.planDraft.cells = {};
  renderEditorDraft();
  renderEditorPlanTools();
  saveGame(true);
}

function newPlanDraft() {
  const anchor = state.editor.planDraft.anchor;
  state.editor.planDraft = {
    name: "New Plan",
    occurrence: 4,
    tileset: state.editor.planDraft.tileset || "village",
    width: PLAN_GRID_SIZE,
    height: PLAN_GRID_SIZE,
    activeBrush: state.editor.planDraft.activeBrush || "wall",
    wallCount: state.editor.planDraft.wallCount || PLAN_WALL_COUNT_DEFAULT,
    wallSpacing: state.editor.planDraft.wallSpacing || PLAN_WALL_SPACING_DEFAULT,
    wallSpread: state.editor.planDraft.wallSpread || PLAN_WALL_SPREAD_DEFAULT,
    cells: {},
    anchor
  };
  renderEditorPanel();
  saveGame(true);
}

function saveCurrentPlan() {
  const plan = normalizePlanDraft(state.editor.planDraft);
  if (!Object.keys(plan.cells).length) {
    toast("Paint a plan grid first.");
    return;
  }
  const existingId = state.editor.planDraft.sourcePlanId;
  const existingIndex = state.editor.plans.findIndex(entry => entry.id === existingId);
  if (existingIndex >= 0) {
    const updated = {
      ...plan,
      id: existingId,
      name: plan.name?.trim() || "Plan Spawn",
      occurrence: clamp(Number(plan.occurrence) || 4, 1, 10)
    };
    state.editor.plans[existingIndex] = updated;
    state.editor.planDraft = { ...updated, id: "draft-plan", sourcePlanId: existingId, cells: { ...updated.cells } };
    saveGame(true);
    renderEditorPanel();
    toast(`${updated.name} updated.`);
    return;
  }
  const saved = {
    ...plan,
    id: `plan-${Date.now()}`,
    name: plan.name?.trim() || "Plan Spawn",
    occurrence: clamp(Number(plan.occurrence) || 4, 1, 10)
  };
  state.editor.plans.push(saved);
  state.editor.planDraft = { ...saved, id: "draft-plan", sourcePlanId: saved.id, cells: { ...saved.cells } };
  saveGame(true);
  renderEditorPanel();
  toast(`${saved.name} saved as plan spawn.`);
}

function loadPlanIntoDraft(id) {
  const plan = state.editor.plans.find(entry => entry.id === id);
  if (!plan) return;
  state.editor.planView = true;
  state.editor.lineMode = false;
  state.editor.planDraft = { ...normalizePlanDraft(plan), id: "draft-plan", sourcePlanId: plan.id, cells: { ...plan.cells } };
  state.editor.selected = null;
  state.editor.selectedDraftIndexes = [];
  renderEditorPanel();
}

function loadSelectedPlanView() {
  const select = document.getElementById("editorPlanLoadSelect");
  if (select?.value) loadPlanIntoDraft(select.value);
}

function paintPlanFromEvent(event) {
  const canvasEl = document.getElementById("editorPlanCanvas");
  if (!canvasEl) return;
  const rect = canvasEl.getBoundingClientRect();
  const plan = state.editor.planDraft;
  const x = Math.floor((event.clientX - rect.left) / rect.width * plan.width);
  const y = Math.floor((event.clientY - rect.top) / rect.height * plan.height);
  if (x < 0 || y < 0 || x >= plan.width || y >= plan.height) return;
  const key = `${x},${y}`;
  if (plan.activeBrush === "erase") delete plan.cells[key];
  else plan.cells[key] = plan.activeBrush;
  drawPlanCanvas();
  renderEditorDraft();
}

function erasePlanCellFromEvent(event) {
  const canvasEl = document.getElementById("editorPlanCanvas");
  if (!canvasEl) return;
  const rect = canvasEl.getBoundingClientRect();
  const plan = state.editor.planDraft;
  const x = Math.floor((event.clientX - rect.left) / rect.width * plan.width);
  const y = Math.floor((event.clientY - rect.top) / rect.height * plan.height);
  if (x < 0 || y < 0 || x >= plan.width || y >= plan.height) return;
  delete plan.cells[`${x},${y}`];
  drawPlanCanvas();
  renderEditorDraft();
  saveGame(true);
}

async function handlePlanTilesetUpload(input, kind) {
  const file = input.files?.[0];
  if (!file) return;
  const tilesetId = state.editor.planDraft.tileset;
  const dataUrl = await readFileAsDataUrl(file);
  const ok = await registerPlanTilesetSource(tilesetId, kind, dataUrl, true);
  input.value = "";
  if (ok) {
    saveGame(true);
    renderEditorPalette();
    renderEditorPlanTools();
    toast(`${PLAN_TILESET_DEFS[tilesetId].label} ${kind === "walls" ? "walls" : "tileset"} image assigned.`);
  } else {
    toast("That image could not be loaded.");
  }
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function placeEditorPrefab(id, x, y) {
  const prefab = editorPrefabById(id);
  if (!prefab) return;
  state.editor.placements.push({ id: `placement-${Date.now()}`, prefabId: id, x, y });
  state.editor.placingPrefabId = null;
  saveGame(true);
  renderEditorPanel();
  toast(`${prefab.name} placed.`);
}

function editorPrefabRandomChance(occurrence) {
  return Math.min(0.22, Math.pow(clamp(occurrence, 1, 10), 2) / 560);
}

function editorOnceChunk(prefab) {
  const seed = [...prefab.id].reduce((sum, ch) => sum + ch.charCodeAt(0), WORLD_SEED + 701);
  return {
    cx: Math.floor(hash2(seed, 1, WORLD_SEED + 703) * 17) - 8,
    cy: Math.floor(hash2(seed, 2, WORLD_SEED + 709) * 17) - 8
  };
}

function getEditorPrefabInstances(bounds) {
  const instances = [];
  for (const placement of state.editor.placements) {
    const prefab = editorPrefabById(placement.prefabId);
    if (prefab && placement.x >= bounds.minX - 6 && placement.x <= bounds.maxX + 6 && placement.y >= bounds.minY - 6 && placement.y <= bounds.maxY + 6) {
      instances.push({ prefab, x: placement.x, y: placement.y, manual: true, placementId: placement.id, deletedItems: placement.deletedItems || [] });
    }
  }

  const minCx = Math.floor(bounds.minX / CHUNK_SIZE) - 1;
  const maxCx = Math.floor(bounds.maxX / CHUNK_SIZE) + 1;
  const minCy = Math.floor(bounds.minY / CHUNK_SIZE) - 1;
  const maxCy = Math.floor(bounds.maxY / CHUNK_SIZE) + 1;
  for (const prefab of state.editor.prefabs) {
    if (prefab.occurrence <= 1) {
      const once = editorOnceChunk(prefab);
      if (once.cx < minCx || once.cx > maxCx || once.cy < minCy || once.cy > maxCy) continue;
      instances.push({ prefab, x: once.cx * CHUNK_SIZE + 8, y: once.cy * CHUNK_SIZE + 8, manual: false });
      continue;
    }
    const chance = editorPrefabRandomChance(prefab.occurrence);
    for (let cy = minCy; cy <= maxCy; cy++) {
      for (let cx = minCx; cx <= maxCx; cx++) {
        const roll = hash2(cx, cy, WORLD_SEED + prefab.id.length * 31);
        if (roll > chance) continue;
        const ox = (hash2(cx, cy, WORLD_SEED + 761) - 0.5) * EDITOR_PREFAB_RANDOM_RADIUS;
        const oy = (hash2(cx, cy, WORLD_SEED + 769) - 0.5) * EDITOR_PREFAB_RANDOM_RADIUS;
        instances.push({ prefab, x: cx * CHUNK_SIZE + 8 + ox, y: cy * CHUNK_SIZE + 8 + oy, manual: false });
      }
    }
  }
  return [...instances, ...getEditorPlanInstances(bounds)];
}

function getEditorPlanInstances(bounds) {
  const instances = [];
  const minCx = Math.floor(bounds.minX / CHUNK_SIZE) - 1;
  const maxCx = Math.floor(bounds.maxX / CHUNK_SIZE) + 1;
  const minCy = Math.floor(bounds.minY / CHUNK_SIZE) - 1;
  const maxCy = Math.floor(bounds.maxY / CHUNK_SIZE) + 1;
  for (const plan of state.editor.plans) {
    if (plan.occurrence <= 1) {
      const once = editorOnceChunk(plan);
      if (once.cx < minCx || once.cx > maxCx || once.cy < minCy || once.cy > maxCy) continue;
      instances.push(planInstanceForChunk(plan, once.cx, once.cy));
      continue;
    }
    const chance = editorPrefabRandomChance(plan.occurrence);
    for (let cy = minCy; cy <= maxCy; cy++) {
      for (let cx = minCx; cx <= maxCx; cx++) {
        const roll = hash2(cx, cy, WORLD_SEED + plan.id.length * 43 + 1901);
        if (roll > chance) continue;
        instances.push(planInstanceForChunk(plan, cx, cy));
      }
    }
  }
  return instances;
}

function planInstanceForChunk(plan, cx, cy) {
  const seed = planSeed(plan, cx, cy);
  const ox = (hash2(cx, cy, seed + 11) - 0.5) * EDITOR_PREFAB_RANDOM_RADIUS;
  const oy = (hash2(cx, cy, seed + 17) - 0.5) * EDITOR_PREFAB_RANDOM_RADIUS;
  const x = cx * CHUNK_SIZE + 8 + ox;
  const y = cy * CHUNK_SIZE + 8 + oy;
  return { prefab: planToPrefab(plan, seed), x, y, manual: false, planSpawn: true };
}

function planSeed(plan, cx, cy) {
  return [...plan.id].reduce((sum, ch) => sum + ch.charCodeAt(0), WORLD_SEED + 1701 + cx * 23 - cy * 31);
}

function planToPrefab(plan, seed, options = {}) {
  const useRuins = !options.preview && plan.tileset !== "ruins" && hash2(seed, plan.width, WORLD_SEED + 1777) < PLAN_RUINS_TILESET_CHANCE;
  const tileset = useRuins ? "ruins" : plan.tileset;
  const items = [];
  const centerX = (plan.width - 1) / 2;
  const centerY = (plan.height - 1) / 2;
  const wallSegments = planWallSegments(plan);
  const wallSpread = clamp(Number(plan.wallSpread) || PLAN_WALL_SPREAD_DEFAULT, PLAN_WALL_SPREAD_MIN, PLAN_WALL_SPREAD_MAX);
  let index = 0;
  for (const segment of wallSegments) {
    const asset = randomPlanAsset(tileset, "wall", seed, segment.cellX, segment.cellY, index, segment.role);
    if (!asset) {
      index++;
      continue;
    }
    items.push({
      type: asset.type,
      id: asset.id,
      layer: planLayerForBrush("wall"),
      dx: (segment.cellX - centerX) * 0.96 * wallSpread,
      dy: (segment.cellY - centerY) * 0.96 * wallSpread,
      itemScale: 0.82,
      rotation: 0,
      flipX: segment.side === "left" || segment.side === "right"
    });
    index++;
  }
  for (const [key, brush] of Object.entries(plan.cells || {})) {
    if (brush === "wall") continue;
    const [cellX, cellY] = key.split(",").map(Number);
    if (!Number.isFinite(cellX) || !Number.isFinite(cellY)) continue;
    const spawnRoll = hash2(seed + cellX * 13, seed - cellY * 17, WORLD_SEED + 1801 + index);
    if (!options.preview && ["house", "tower", "building"].includes(brush)) {
      const chance = tileset === "ruins" ? PLAN_RUINS_BUILDING_SPAWN_CHANCE : PLAN_BUILDING_SPAWN_CHANCE;
      if (spawnRoll > chance) {
        index++;
        continue;
      }
    }
    const asset = brush === "path"
      ? planPathAsset(plan, cellX, cellY)
      : randomPlanAsset(tileset, brush, seed, cellX, cellY, index);
    if (!asset) {
      index++;
      continue;
    }
    const variation = editorVariationForAsset(asset, tileset, cellX + seed, cellY - seed, index, brush === "prop" ? 1 : 0.45);
    items.push({
      type: asset.type,
      id: asset.id,
      layer: planLayerForBrush(brush),
      dx: (cellX - centerX) * 0.96,
      dy: (cellY - centerY) * 0.96,
      itemScale: brush === "path" ? 1 : clamp(variation.itemScale, 0.78, 1.22),
      rotation: ["house", "tower", "building", "wall"].includes(brush) ? 0 : variation.rotation,
      flipX: hash2(seed + cellX, seed + cellY, WORLD_SEED + 1811) > 0.5
    });
    index++;
  }
  return {
    id: `${plan.id}:${seed}`,
    name: `${plan.name}${useRuins ? " Ruins" : ""}`,
    occurrence: plan.occurrence,
    items
  };
}

function planWallMeta(plan) {
  const wallCells = Object.entries(plan.cells || {})
    .filter(([, brush]) => brush === "wall")
    .map(([key]) => key.split(",").map(Number))
    .filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
  if (!wallCells.length) return { minX: 0, maxX: 0, topY: 0, bottomY: 0, doorX: 0, hasDoor: false, hasWall: false };
  const minX = Math.min(...wallCells.map(([x]) => x));
  const maxX = Math.max(...wallCells.map(([x]) => x));
  const topY = Math.min(...wallCells.map(([, y]) => y));
  const bottomY = Math.max(...wallCells.map(([, y]) => y));
  const bottomWallXs = wallCells.filter(([, y]) => y === bottomY).map(([x]) => x);
  const center = (minX + maxX) / 2;
  const doorX = bottomWallXs.length
    ? bottomWallXs.sort((a, b) => Math.abs(a - center) - Math.abs(b - center) || a - b)[0]
    : Math.round(center);
  const hasDoor = bottomWallXs.length >= 3 && maxX > minX && bottomY > topY;
  return { minX, maxX, topY, bottomY, doorX, hasDoor, hasWall: true };
}

function planWallSegments(plan) {
  const meta = planWallMeta(plan);
  if (!meta.hasWall) return [];
  const spacing = clamp(Number(plan.wallSpacing) || PLAN_WALL_SPACING_DEFAULT, PLAN_WALL_SPACING_MIN, PLAN_WALL_SPACING_MAX);
  const count = clamp(Math.round(Number(plan.wallCount) || PLAN_WALL_COUNT_DEFAULT), PLAN_WALL_COUNT_MIN, PLAN_WALL_COUNT_MAX);
  const candidates = planWallPerimeterCandidates(meta, spacing);
  const sampled = samplePlanWallCandidates(candidates, count);
  const doorIndex = sampled
    .map((segment, index) => ({ index, score: segment.side === "bottom" ? Math.abs(segment.cellX - meta.doorX) : Infinity }))
    .sort((a, b) => a.score - b.score)[0]?.index;
  return sampled.map((segment, index) => ({
    ...segment,
    role: meta.hasDoor && index === doorIndex ? "door" : "wall"
  }));
}

function planWallPerimeterCandidates(meta, spacing) {
  const candidates = [];
  const push = (cellX, cellY, side) => {
    if (!candidates.some(segment => Math.abs(segment.cellX - cellX) < 0.001 && Math.abs(segment.cellY - cellY) < 0.001)) {
      candidates.push({ cellX, cellY, side });
    }
  };
  const step = Math.max(0.01, spacing);
  for (let x = meta.minX; x <= meta.maxX + 0.001; x += step) push(Math.min(x, meta.maxX), meta.topY, "top");
  for (let y = meta.topY + step; y <= meta.bottomY + 0.001; y += step) push(meta.maxX, Math.min(y, meta.bottomY), "right");
  for (let x = meta.maxX - step; x >= meta.minX - 0.001; x -= step) push(Math.max(x, meta.minX), meta.bottomY, "bottom");
  for (let y = meta.bottomY - step; y > meta.topY + 0.001; y -= step) push(meta.minX, Math.max(y, meta.topY), "left");
  return candidates;
}

function samplePlanWallCandidates(candidates, count) {
  if (candidates.length <= count) return candidates;
  const sampled = [];
  const last = candidates.length - 1;
  for (let i = 0; i < count; i++) {
    const sourceIndex = Math.round(i * last / Math.max(1, count - 1));
    const candidate = candidates[sourceIndex];
    if (candidate && sampled[sampled.length - 1] !== candidate) sampled.push(candidate);
  }
  return sampled;
}

function planLayerForBrush(brush) {
  return brush === "prop" || brush === "grave" || brush === "path" ? "ground" : "building";
}

function planPathAsset(plan, x, y) {
  const cells = plan.cells || {};
  const has = (nx, ny) => cells[`${nx},${ny}`] === "path";
  const mask = (has(x, y - 1) ? 1 : 0)
    | (has(x + 1, y) ? 2 : 0)
    | (has(x, y + 1) ? 4 : 0)
    | (has(x - 1, y) ? 8 : 0);
  return { type: "planPath", id: `plan_path_mask_${mask}` };
}

function randomPlanAsset(tileset, brush, seed, x, y, index, wallRole = "wall") {
  const pool = planAssetPool(tileset, brush, wallRole);
  if (!pool.length) return null;
  const roll = hash2(seed + x * 29 + index * 7, seed - y * 31, WORLD_SEED + brush.length * 97);
  return pool[Math.floor(roll * pool.length) % pool.length];
}

function planAssetPool(tileset, brush, wallRole = "wall") {
  if (brush === "wall") {
    const fileWall = Object.values(biomeSprites)
      .filter(sprite => sprite.planTileset === "file" && sprite.planRole === wallRole)
      .map(sprite => ({ type: "biome", id: sprite.id }));
    if (fileWall.length) return fileWall;
    if (wallRole === "door") {
      return biomeSprites[WALL_SPRITES.gate] ? [{ type: "biome", id: WALL_SPRITES.gate }] : [];
    }
    return biomeSprites[WALL_SPRITES.segment] ? [{ type: "biome", id: WALL_SPRITES.segment }] : [];
  }
  const fileRole = brush === "house" ? "house" : brush === "tower" ? "tower" : brush === "building" ? "building" : brush === "prop" || brush === "grave" ? "prop" : null;
  if (fileRole) {
    const fileAssets = Object.values(biomeSprites)
      .filter(sprite => sprite.planTileset === "file" && sprite.planRole === fileRole)
      .map(sprite => ({ type: "biome", id: sprite.id }));
    if (fileAssets.length) return fileAssets;
  }
  const wallTileset = tileset === "ruins" ? "ruins" : tileset;
  const loadedTileset = brush === "wall" ? wallTileset : tileset;
  const loaded = Object.values(biomeSprites)
    .filter(sprite => sprite.planTileset === loadedTileset && planRoleMatchesBrush(sprite.planRole, brush, wallRole))
    .map(sprite => ({ type: "biome", id: sprite.id }));
  if (loaded.length) return loaded;
  if (brush === "wall") return [];
  return fallbackPlanAssetPool(tileset, brush);
}

function planRoleMatchesBrush(role, brush, wallRole = "wall") {
  if (brush === "wall") return role === wallRole || (wallRole === "door" ? false : role === "wall");
  if (brush === "house") return role === "house" || role === "building";
  if (brush === "tower") return role === "tower";
  if (brush === "building") return role === "building" || role === "house";
  if (brush === "grave") return role === "grave" || role === "prop";
  if (brush === "prop") return role === "prop" || role === "building";
  return false;
}

function fallbackPlanAssetPool(tileset, brush) {
  const ids = Object.entries(biomeSprites)
    .filter(([id, sprite]) => fallbackPlanSpriteMatch(id, sprite, tileset, brush))
    .map(([id]) => ({ type: "biome", id }));
  if (ids.length) return ids;
  if (brush === "wall") return [WALL_SPRITES.segment, WALL_SPRITES.gate].filter(id => biomeSprites[id]).map(id => ({ type: "biome", id }));
  return editorLineAssetPool(tileset === "ruins" ? "ruins" : "village").filter(asset => asset.type === "biome");
}

function fallbackPlanSpriteMatch(id, sprite, tileset, brush) {
  const kind = sprite.kind || "";
  const text = `${id} ${sprite.name || ""} ${sprite.promptSummary || ""}`.toLowerCase();
  if (tileset === "ruins" && ["house", "tower", "building"].includes(brush)) {
    return ["ruin", "gate", "arch", "shrine"].includes(kind) || /ruin|collapsed|crypt|grave|broken/.test(text);
  }
  if (brush === "wall") {
    if (tileset === "ruins") return kind === "wall" && /ruin|broken|palisade|spiked|stone|rubble/.test(text);
    return kind === "wall" || id === WALL_SPRITES.segment || id === WALL_SPRITES.gate;
  }
  if (brush === "house") return ["house", "shop", "stable", "cabin", "hut"].includes(kind) || /cottage|cabin|hut|house|shop|tent/.test(text);
  if (brush === "tower") return kind === "tower" || /tower|watchtower|gate/.test(text);
  if (brush === "building") return ["building", "church", "forge", "barn", "gate", "arch", "bridge"].includes(kind);
  if (brush === "grave") return ["grave", "statue", "shrine"].includes(kind) || /grave|crypt|tomb|statue|chapel/.test(text);
  if (brush === "prop") return ["container", "wagon", "campfire", "signpost", "altar", "well", "rubble"].includes(kind);
  return false;
}

function normalizeCamera() {
  const hero = activeHero();
  const camera = state.camera || {};
  const x = Number.isFinite(camera.x) ? camera.x : hero.x;
  const y = Number.isFinite(camera.y) ? camera.y : hero.y;
  const targetX = Number.isFinite(camera.targetX) ? camera.targetX : x;
  const targetY = Number.isFinite(camera.targetY) ? camera.targetY : y;
  const zoom = clamp(Number.isFinite(camera.zoom) ? camera.zoom : 1, CAMERA_MIN_ZOOM, CAMERA_MAX_ZOOM);
  const targetZoom = clamp(Number.isFinite(camera.targetZoom) ? camera.targetZoom : zoom, CAMERA_MIN_ZOOM, CAMERA_MAX_ZOOM);
  state.camera = {
    x,
    y,
    targetX,
    targetY,
    zoom,
    targetZoom,
    mode: camera.mode === "free" ? "free" : "follow"
  };
  if (state.camera.mode !== "free") enableFollowCamera();
}

function normalizeHeroSkills() {
  for (const hero of state.heroes) {
    window.ProgressionSystem?.normalizeHero(hero, skillInfo);
  }
  const hero = activeHero();
  if (!skillInfo[state.mode] || !hero.skills.known.includes(state.mode)) {
    state.mode = hero.skills.bar.find(id => skillInfo[id]) || "cleave";
  }
}

function saveGame(force = false) {
  const now = performance.now();
  if (!force && now - state.lastSave < 1000) return;
  state.lastSave = now;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      heroes: state.heroes,
      activeHeroId: state.activeHeroId,
      worldEdits: state.worldEdits,
      loot: state.loot,
      editor: {
        scales: state.editor.scales,
        prefabs: state.editor.prefabs,
        plans: state.editor.plans,
        placements: state.editor.placements,
        planDraft: state.editor.planDraft,
        planModal: state.editor.planModal,
        planTilesetSources: state.editor.planTilesetSources,
        activeLayer: state.editor.activeLayer,
        layerVisibility: state.editor.layerVisibility,
        lineCategory: state.editor.lineCategory,
        lineShape: state.editor.lineShape,
        brushDensity: state.editor.brushDensity,
        planView: state.editor.planView,
        draft: state.editor.draft
      },
      camera: state.camera,
      quest: state.quest,
      inside: state.inside
    }));
  } catch (error) {
    console.warn("Save failed.", error);
    toast("Save failed. Try a smaller tileset image.");
  }
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
  const centerX = canvas.clientWidth * CAMERA_ANCHOR_X;
  const centerY = canvas.clientHeight * CAMERA_ANCHOR_Y;
  const shake = state.renderShake || { x: 0, y: 0 };
  return {
    x: centerX + ((x - state.camera.x) - (y - state.camera.y)) * (TILE_W / 2) * state.camera.zoom + shake.x,
    y: centerY + ((x - state.camera.x) + (y - state.camera.y)) * (TILE_H / 2) * state.camera.zoom + shake.y
  };
}

function screenToWorld(sx, sy) {
  const centerX = canvas.clientWidth * CAMERA_ANCHOR_X;
  const centerY = canvas.clientHeight * CAMERA_ANCHOR_Y;
  const xIso = (sx - centerX) / state.camera.zoom;
  const yIso = (sy - centerY) / state.camera.zoom;
  return {
    x: state.camera.x + yIso / TILE_H + xIso / TILE_W,
    y: state.camera.y + yIso / TILE_H - xIso / TILE_W
  };
}

function powerOfTwoCeil(value) {
  let step = 1;
  while (step < value) step *= 2;
  return step;
}

function terrainStepForBounds(bounds) {
  if (state.camera.zoom >= TERRAIN_LOD_MIN_ZOOM) return 1;
  const width = Math.max(1, bounds.maxX - bounds.minX + 1);
  const height = Math.max(1, bounds.maxY - bounds.minY + 1);
  const idealStep = Math.sqrt(width * height / MAX_TERRAIN_DRAWS);
  return Math.max(1, powerOfTwoCeil(idealStep));
}

function decorStepForBounds(bounds, maxDraws, minZoomForFullDetail) {
  if (state.camera.zoom >= minZoomForFullDetail) return 1;
  const width = Math.max(1, bounds.maxX - bounds.minX + 1);
  const height = Math.max(1, bounds.maxY - bounds.minY + 1);
  const idealStep = Math.sqrt(width * height / maxDraws);
  return Math.max(1, powerOfTwoCeil(idealStep));
}

function smoothstep(edge0, edge1, value) {
  if (edge0 === edge1) return value >= edge1 ? 1 : 0;
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function zoomFade(minZoom, fullZoom) {
  return smoothstep(minZoom, fullZoom, state.camera.zoom);
}

function visualDetailLevel() {
  const z = state.camera.zoom;
  if (z < 0.12) return "extreme";
  if (z < 0.22) return "far";
  if (z < DETAIL_TEXTURE_MIN_ZOOM) return "mid";
  return "close";
}

function setCameraTargetZoom(nextZoom, sx = canvas.clientWidth * 0.5, sy = canvas.clientHeight * 0.5) {
  const mode = state.camera.mode;
  const before = screenToWorld(sx, sy);
  state.camera.targetZoom = clamp(nextZoom, CAMERA_MIN_ZOOM, CAMERA_MAX_ZOOM);
  const oldZoom = state.camera.zoom;
  state.camera.zoom = state.camera.targetZoom;
  const after = screenToWorld(sx, sy);
  state.camera.zoom = oldZoom;
  const dx = before.x - after.x;
  const dy = before.y - after.y;
  state.camera.x += dx;
  state.camera.y += dy;
  if (mode === "free") {
    state.camera.targetX += dx;
    state.camera.targetY += dy;
  } else {
    enableFollowCamera();
  }
}

function zoomCameraBy(factor, sx, sy) {
  setCameraTargetZoom(state.camera.targetZoom * factor, sx, sy);
}

function updateCamera(dt) {
  const player = activeHero();
  if (state.camera.mode !== "free") {
    state.camera.targetX = player.x;
    state.camera.targetY = player.y;
    state.camera.x = player.x;
    state.camera.y = player.y;
  } else {
    const followAlpha = 1 - Math.exp(-CAMERA_FOLLOW_SMOOTHING * dt);
    state.camera.x += (state.camera.targetX - state.camera.x) * followAlpha;
    state.camera.y += (state.camera.targetY - state.camera.y) * followAlpha;
  }
  const zoomAlpha = 1 - Math.exp(-CAMERA_ZOOM_SMOOTHING * dt);
  state.camera.zoom += (state.camera.targetZoom - state.camera.zoom) * zoomAlpha;
  state.camera.zoom = clamp(state.camera.zoom, CAMERA_MIN_ZOOM, CAMERA_MAX_ZOOM);
}

function enableFollowCamera(snap = false) {
  const hero = activeHero();
  state.camera.mode = "follow";
  state.camera.targetX = hero.x;
  state.camera.targetY = hero.y;
  if (snap) {
    state.camera.x = hero.x;
    state.camera.y = hero.y;
  }
}

function tileBlocked(x, y) {
  const tx = Math.floor(x);
  const ty = Math.floor(y);
  const tile = getTile(tx, ty);
  if (!tile) return true;
  return buildingBlocksPosition(tx, ty) || propBlocksPosition(x, y);
}

function buildingBlocksPosition(tx, ty) {
  return state.buildings.some(b => tx >= b.x && ty >= b.y && tx < b.x + b.w && ty < b.y + b.h - 1);
}

function propBlocksPosition(x, y) {
  const tx = Math.floor(x);
  const ty = Math.floor(y);
  for (let py = ty - 1; py <= ty + 1; py++) {
    for (let px = tx - 1; px <= tx + 1; px++) {
      const tile = getTile(px, py);
      if (!tile?.prop || tile.water) continue;
      if (isDestroyedProp(tile.prop, px, py)) continue;
      const radius = propCollisionRadius(tile.prop);
      if (radius <= 0) continue;
      if (Math.hypot(x - px, y - py) < radius) return true;
    }
  }
  return false;
}

function propCollisionRadius(propId) {
  if (PROP_COLLISION_RADII[propId]) return PROP_COLLISION_RADII[propId];
  const kind = biomeSprites[propId]?.kind || "";
  if (["ground_prop", "ground_cover", "path", "road", "grass", "flower", "mushroom", "fern", "foliage"].includes(kind)) return 0;
  if (["building", "house", "shop", "tower", "church", "stable", "forge", "hut", "cabin", "barn", "bridge", "gate", "arch", "wall", "shrine", "statue", "ruin"].includes(kind)) return 0.72;
  if (["rock", "rubble", "boulder", "wagon", "container", "well", "altar", "siege", "gibbet"].includes(kind)) return 0.5;
  if (NON_SOLID_PROP_PARTS.some(part => propId.includes(part))) return 0;
  if (propId.includes("tree")) return 0.48;
  if (propId.includes("bush")) return 0.32;
  return OBJECT_COLLISION_RADIUS;
}

function collisionMoveEntity(entity, nx, ny) {
  const ox = entity.x;
  const oy = entity.y;
  if (!tileBlocked(nx, entity.y)) entity.x = nx;
  if (!tileBlocked(entity.x, ny)) entity.y = ny;
  return Math.hypot(entity.x - ox, entity.y - oy);
}

function moveEntityWithCollision(entity, nx, ny) {
  return collisionMoveEntity(entity, nx, ny);
}

function navigationForEntity(entity) {
  let nav = entityNavigation.get(entity);
  if (!nav) {
    nav = { path: [], index: 0, goalX: null, goalY: null, plannedAt: 0, stuckT: 0 };
    entityNavigation.set(entity, nav);
  }
  return nav;
}

function clearEntityNavigation(entity) {
  const nav = entityNavigation.get(entity);
  if (!nav) return;
  nav.path = [];
  nav.index = 0;
  nav.goalX = null;
  nav.goalY = null;
  nav.stuckT = 0;
}

function navigationCell(value) {
  return Math.round(value / NAV_GRID_STEP);
}

function navigationWorld(cell) {
  return cell * NAV_GRID_STEP;
}

function navigationCellKey(x, y) {
  return `${x},${y}`;
}

function navigationCellBlocked(x, y) {
  return tileBlocked(navigationWorld(x), navigationWorld(y));
}

function nearestOpenNavigationCell(x, y, radius = 8) {
  if (!navigationCellBlocked(x, y)) return { x, y };
  for (let r = 1; r <= radius; r++) {
    let best = null;
    let bestD = Infinity;
    for (let cy = y - r; cy <= y + r; cy++) {
      for (let cx = x - r; cx <= x + r; cx++) {
        if (Math.abs(cx - x) !== r && Math.abs(cy - y) !== r) continue;
        if (navigationCellBlocked(cx, cy)) continue;
        const d = Math.hypot(cx - x, cy - y);
        if (d < bestD) {
          bestD = d;
          best = { x: cx, y: cy };
        }
      }
    }
    if (best) return best;
  }
  return null;
}

function hasDirectNavigationLine(ax, ay, bx, by) {
  const dist = Math.hypot(bx - ax, by - ay);
  const samples = Math.max(1, Math.ceil(dist / NAV_DIRECT_SAMPLE_STEP));
  for (let i = 1; i <= samples; i++) {
    const t = i / samples;
    if (tileBlocked(ax + (bx - ax) * t, ay + (by - ay) * t)) return false;
  }
  return true;
}

function reconstructNavigationPath(node) {
  const path = [];
  let current = node;
  while (current) {
    path.push({ x: navigationWorld(current.x), y: navigationWorld(current.y) });
    current = current.parent;
  }
  path.reverse();
  return simplifyNavigationPath(path);
}

function simplifyNavigationPath(path) {
  if (path.length <= 2) return path;
  const simplified = [path[0]];
  let anchor = 0;
  while (anchor < path.length - 1) {
    let next = anchor + 1;
    for (let i = path.length - 1; i > anchor + 1; i--) {
      if (hasDirectNavigationLine(path[anchor].x, path[anchor].y, path[i].x, path[i].y)) {
        next = i;
        break;
      }
    }
    simplified.push(path[next]);
    anchor = next;
  }
  return simplified;
}

function findNavigationPath(sx, sy, gx, gy, maxDistance = NAV_MAX_DISTANCE) {
  const start = nearestOpenNavigationCell(navigationCell(sx), navigationCell(sy), 6);
  if (!start) return null;

  let goalX = gx;
  let goalY = gy;
  const goalDistance = Math.hypot(goalX - sx, goalY - sy);
  if (goalDistance > maxDistance) {
    const scale = maxDistance / goalDistance;
    goalX = sx + (goalX - sx) * scale;
    goalY = sy + (goalY - sy) * scale;
  }

  const goal = nearestOpenNavigationCell(navigationCell(goalX), navigationCell(goalY), 10);
  if (!goal) return null;

  const startKey = navigationCellKey(start.x, start.y);
  const goalKey = navigationCellKey(goal.x, goal.y);
  const open = [];
  const nodes = new Map();
  const startNode = { x: start.x, y: start.y, g: 0, h: Math.hypot(goal.x - start.x, goal.y - start.y), parent: null };
  startNode.f = startNode.h;
  open.push(startNode);
  nodes.set(startKey, startNode);

  const dirs = [
    [1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1],
    [1, 1, Math.SQRT2], [1, -1, Math.SQRT2], [-1, 1, Math.SQRT2], [-1, -1, Math.SQRT2]
  ];
  let visited = 0;
  let closest = startNode;

  while (open.length && visited < NAV_MAX_SEARCH_NODES) {
    let bestIndex = 0;
    for (let i = 1; i < open.length; i++) {
      if (open[i].f < open[bestIndex].f) bestIndex = i;
    }
    const current = open.splice(bestIndex, 1)[0];
    if (current.closed) continue;
    current.closed = true;
    visited++;

    if (current.h < closest.h) closest = current;
    if (navigationCellKey(current.x, current.y) === goalKey) return reconstructNavigationPath(current);

    for (const [dx, dy, cost] of dirs) {
      const nx = current.x + dx;
      const ny = current.y + dy;
      if (Math.hypot(nx - start.x, ny - start.y) * NAV_GRID_STEP > maxDistance) continue;
      if (navigationCellBlocked(nx, ny)) continue;
      if (dx && dy && (navigationCellBlocked(current.x + dx, current.y) || navigationCellBlocked(current.x, current.y + dy))) continue;
      const key = navigationCellKey(nx, ny);
      const nextG = current.g + cost;
      let node = nodes.get(key);
      if (!node) {
        node = { x: nx, y: ny, g: nextG, h: Math.hypot(goal.x - nx, goal.y - ny), parent: current };
        node.f = node.g + node.h;
        nodes.set(key, node);
        open.push(node);
      } else if (!node.closed && nextG < node.g) {
        node.g = nextG;
        node.f = nextG + node.h;
        node.parent = current;
      }
    }
  }

  return closest !== startNode ? reconstructNavigationPath(closest) : null;
}

function shouldRefreshNavigation(nav, tx, ty) {
  const now = performance.now();
  if (!nav.path.length) return true;
  if (now - nav.plannedAt > NAV_REPATH_INTERVAL_MS && Math.hypot(tx - nav.goalX, ty - nav.goalY) > NAV_GOAL_REFRESH_DISTANCE) return true;
  if (nav.stuckT > NAV_STUCK_REPATH_SECONDS && now - nav.plannedAt > NAV_REPATH_INTERVAL_MS) return true;
  return false;
}

function setNavigationPath(nav, path, tx, ty) {
  nav.path = path || [];
  nav.index = nav.path.length > 1 ? 1 : 0;
  nav.goalX = tx;
  nav.goalY = ty;
  nav.plannedAt = performance.now();
  nav.stuckT = 0;
}

function steerAroundObstacle(entity, dx, dy, maxStep) {
  const len = Math.hypot(dx, dy);
  if (!len) return 0;
  const ux = dx / len;
  const uy = dy / len;
  const candidates = [0, 0.45, -0.45, 0.85, -0.85, 1.35, -1.35, Math.PI];
  let best = null;
  let bestScore = -Infinity;
  for (const angle of candidates) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const vx = ux * cos - uy * sin;
    const vy = ux * sin + uy * cos;
    const tx = entity.x + vx * maxStep;
    const ty = entity.y + vy * maxStep;
    if (tileBlocked(tx, ty)) continue;
    const score = vx * ux + vy * uy;
    if (score > bestScore) {
      bestScore = score;
      best = { x: tx, y: ty };
    }
  }
  return best ? collisionMoveEntity(entity, best.x, best.y) : 0;
}

function moveEntityToward(entity, tx, ty, maxStep, options = {}) {
  if (!entity || maxStep <= 0) return 0;
  const arriveDistance = options.arriveDistance || 0.08;
  const dist = Math.hypot(tx - entity.x, ty - entity.y);
  if (dist <= arriveDistance) {
    clearEntityNavigation(entity);
    return 0;
  }

  const nav = navigationForEntity(entity);
  if (hasDirectNavigationLine(entity.x, entity.y, tx, ty)) {
    clearEntityNavigation(entity);
    const step = Math.min(maxStep, Math.max(0, dist - arriveDistance));
    return collisionMoveEntity(entity, entity.x + (tx - entity.x) / dist * step, entity.y + (ty - entity.y) / dist * step);
  }

  if (shouldRefreshNavigation(nav, tx, ty)) {
    setNavigationPath(nav, findNavigationPath(entity.x, entity.y, tx, ty, options.maxDistance || NAV_MAX_DISTANCE), tx, ty);
  }

  while (nav.index < nav.path.length && Math.hypot(nav.path[nav.index].x - entity.x, nav.path[nav.index].y - entity.y) < 0.18) {
    nav.index++;
  }

  let waypoint = nav.path[nav.index];
  if (!waypoint && performance.now() - nav.plannedAt > NAV_REPATH_INTERVAL_MS) {
    setNavigationPath(nav, findNavigationPath(entity.x, entity.y, tx, ty, options.maxDistance || NAV_MAX_DISTANCE), tx, ty);
    waypoint = nav.path[nav.index];
  }
  if (!waypoint) {
    const moved = steerAroundObstacle(entity, tx - entity.x, ty - entity.y, maxStep);
    nav.stuckT = moved < 0.01 ? nav.stuckT + 1 / 60 : 0;
    return moved;
  }

  const wdist = Math.hypot(waypoint.x - entity.x, waypoint.y - entity.y);
  const step = Math.min(maxStep, wdist);
  const moved = collisionMoveEntity(entity, entity.x + (waypoint.x - entity.x) / wdist * step, entity.y + (waypoint.y - entity.y) / wdist * step);
  nav.stuckT = moved < 0.01 ? nav.stuckT + 1 / 60 : 0;
  return moved;
}

function moveEntityInDirection(entity, dx, dy, maxStep, options = {}) {
  const len = Math.hypot(dx, dy);
  if (!len) {
    clearEntityNavigation(entity);
    return 0;
  }
  const ux = dx / len;
  const uy = dy / len;
  const lookahead = options.lookahead || NAV_DIRECTION_LOOKAHEAD;
  return moveEntityToward(entity, entity.x + ux * lookahead, entity.y + uy * lookahead, maxStep, { maxDistance: lookahead + 3 });
}

function update(dt) {
  refreshActiveWorld();
  const player = activeHero();
  const playerStats = window.ProgressionSystem?.derivedStats(player) || { moveSpeed: 2.8, sprintSpeed: 4.4, sprintCost: 18, staminaRegen: 14 };
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
    const sprinting = state.keys.has("shift") && player.stamina > 2;
    const speed = (sprinting ? playerStats.sprintSpeed : playerStats.moveSpeed) * dt;
    if (sprinting) player.stamina = Math.max(0, player.stamina - playerStats.sprintCost * dt);
    moveEntityInDirection(player, dx, dy, speed, { lookahead: sprinting ? 6.5 : NAV_DIRECTION_LOOKAHEAD });
    player.dir = dx >= 0 ? 1 : -1;
    player.walkT += dt * 9;
  } else {
    clearEntityNavigation(player);
    player.stamina = Math.min(player.maxStamina, player.stamina + playerStats.staminaRegen * dt);
  }

  player.attackT = Math.max(0, player.attackT - dt);
  updateHeroHitEffects(dt);
  updateCamera(dt);
  updatePartyFollowers(dt);
  updateAnimals(dt);

  updateEnemies(dt);
  updateGameMusic(dt);
  updateProjectiles(dt);
  updateSpellEffects(dt);
  updateParticles(dt);
  updateBlood(dt);
  updateScreenEffects(dt);
  pickupNearbyLoot();
  updateQuestState();
  trimChunks();
  saveGame();
  const now = performance.now();
  if (now - lastHudRender > HUD_FRAME_MS) {
    renderHud();
    lastHudRender = now;
  }
}

function createLoopingTrack(src, volume = 0) {
  const track = new Audio(src);
  track.loop = true;
  track.preload = "auto";
  track.volume = volume;
  return track;
}

function initGameMusic() {
  if (gameMusic.ambient && gameMusic.combat) return;
  gameMusic.ambient = createLoopingTrack(AMBIENT_MUSIC_SRC, 0);
  gameMusic.combat = createLoopingTrack(COMBAT_MUSIC_SRC, 0);
}

function requestGameMusicStart() {
  initGameMusic();
  if (gameMusic.started || gameMusic.trying) return;
  gameMusic.trying = true;
  Promise.all([
    gameMusic.ambient.play(),
    gameMusic.combat.play()
  ]).then(() => {
    gameMusic.started = true;
    gameMusic.trying = false;
  }).catch(() => {
    gameMusic.trying = false;
  });
}

function hasNearbyCombatPressure() {
  const heroes = state.heroes.filter(hero => hero.hp > 0);
  if (!heroes.length) return false;

  const activeRange = gameMusic.combatMix > 0.02 ? MUSIC_COMBAT_EXIT_RANGE : MUSIC_COMBAT_ENTER_RANGE;
  return state.enemies.some(enemyState => {
    if (enemyState.dead || enemyState.hp <= 0) return false;
    return heroes.some(hero => distance(enemyState, hero) <= activeRange);
  });
}

function updateGameMusic(dt) {
  if (!gameMusic.ambient || !gameMusic.combat) return;

  const combatActive = hasNearbyCombatPressure();
  if (combatActive && !gameMusic.combatActive) {
    gameMusic.combat.currentTime = 0;
  }
  gameMusic.combatActive = combatActive;

  const targetMix = combatActive ? 1 : 0;
  const step = dt / MUSIC_FADE_SECONDS;
  if (gameMusic.combatMix < targetMix) {
    gameMusic.combatMix = Math.min(targetMix, gameMusic.combatMix + step);
  } else if (gameMusic.combatMix > targetMix) {
    gameMusic.combatMix = Math.max(targetMix, gameMusic.combatMix - step);
  }

  gameMusic.ambient.volume = clamp((1 - gameMusic.combatMix) * AMBIENT_MUSIC_VOLUME, 0, 1);
  gameMusic.combat.volume = clamp(gameMusic.combatMix * COMBAT_MUSIC_VOLUME, 0, 1);
  updateAmbientWolfSfx(combatActive);
}

function playOneShotSfx(src, volume = 1, playbackRate = 1) {
  const clip = new Audio(src);
  clip.volume = clamp(volume, 0, 1);
  clip.playbackRate = clamp(playbackRate, 0.7, 1.35);
  clip.preload = "auto";
  activeSfx.add(clip);
  const cleanup = () => {
    activeSfx.delete(clip);
    clip.remove();
  };
  clip.addEventListener("ended", cleanup, { once: true });
  clip.addEventListener("error", cleanup, { once: true });
  clip.play().catch(cleanup);
  return clip;
}

function pickVariedSfx(sources, group) {
  if (!sources.length) return null;
  let src = sources[Math.floor(Math.random() * sources.length)];
  if (sources.length > 1 && src === recentSfxByGroup[group]) {
    const alternatives = sources.filter(candidate => candidate !== src);
    src = alternatives[Math.floor(Math.random() * alternatives.length)];
  }
  recentSfxByGroup[group] = src;
  return src;
}

function playVariedSfx(sources, group, minVolume, maxVolume, minRate = 0.96, maxRate = 1.05) {
  const src = pickVariedSfx(sources, group);
  if (!src) return null;
  const volume = minVolume + Math.random() * (maxVolume - minVolume);
  const playbackRate = minRate + Math.random() * (maxRate - minRate);
  return playOneShotSfx(src, volume, playbackRate);
}

function randomWolfSfxDelay() {
  return WOLF_SFX_DELAY_MIN_MS + Math.random() * (WOLF_SFX_DELAY_MAX_MS - WOLF_SFX_DELAY_MIN_MS);
}

function updateAmbientWolfSfx(combatActive) {
  if (!gameMusic.started) return;

  const now = performance.now();
  if (combatActive || gameMusic.combatMix > 0.01) {
    nextWolfSfxAt = now + randomWolfSfxDelay();
    return;
  }

  if (!nextWolfSfxAt) nextWolfSfxAt = now + randomWolfSfxDelay();
  if (now < nextWolfSfxAt) return;

  playVariedSfx(WOLF_SFX_SOURCES, "wolf", WOLF_SFX_VOLUME_MIN, WOLF_SFX_VOLUME_MAX, 0.96, 1.04);
  nextWolfSfxAt = now + randomWolfSfxDelay();
}

function playStrikeSfx() {
  const now = performance.now();
  if (now - lastStrikeSfxAt < STRIKE_SFX_MIN_GAP_MS) return;
  lastStrikeSfxAt = now;

  playVariedSfx(STRIKE_SFX_SOURCES, "strike", STRIKE_SFX_VOLUME_MIN, STRIKE_SFX_VOLUME_MAX, 0.95, 1.08);
}

function playWeaponAttackSfx() {
  playVariedSfx(WEAPON_ATTACK_SFX_SOURCES, "weapon", WEAPON_ATTACK_SFX_VOLUME_MIN, WEAPON_ATTACK_SFX_VOLUME_MAX, 0.93, 1.08);
}

function playMagicAttackSfx() {
  playVariedSfx(MAGIC_ATTACK_SFX_SOURCES, "magic", MAGIC_ATTACK_SFX_VOLUME_MIN, MAGIC_ATTACK_SFX_VOLUME_MAX, 0.92, 1.08);
}

function playRevealSfx() {
  playVariedSfx(REVEAL_SFX_SOURCES, "reveal", REVEAL_SFX_VOLUME_MIN, REVEAL_SFX_VOLUME_MAX, 0.96, 1.05);
}

function monsterVoicePath(sprite, x, y) {
  const roll = hash2(Math.floor(x * 17), Math.floor(y * 19), WORLD_SEED + sprite.length);
  const voiceIndex = 1 + Math.floor(roll * MONSTER_VOICE_COUNT);
  return `assets/sfx/monster${voiceIndex}.mp3`;
}

function playMonsterVoice(enemyState, chance = 1) {
  if (!enemyState || enemyState.kind === "animal" || enemyState.dead || Math.random() > chance) return;
  const now = performance.now();
  if (now < (enemyState.voiceReadyAt || 0)) return;
  enemyState.voiceReadyAt = now + MONSTER_VOICE_COOLDOWN * 1000;

  stopMonsterVoice(enemyState);
  enemyState.voiceAudio = playOneShotSfx(enemyState.voiceSrc, MONSTER_VOICE_VOLUME);
  enemyState.voiceAudio.addEventListener("ended", () => {
    if (enemyState.voiceAudio?.ended) enemyState.voiceAudio = null;
  }, { once: true });
}

function stopMonsterVoice(enemyState) {
  if (!enemyState?.voiceAudio) return;
  enemyState.voiceAudio.pause();
  enemyState.voiceAudio.removeAttribute("src");
  enemyState.voiceAudio.load();
  activeSfx.delete(enemyState.voiceAudio);
  enemyState.voiceAudio = null;
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
      clearEntityNavigation(hero);
    } else if (dist > 1.15) {
      const speed = 2.55 * dt;
      moveEntityToward(hero, tx, ty, speed, { arriveDistance: 0.35, maxDistance: 8 });
      hero.dir = tx >= hero.x ? 1 : -1;
      hero.walkT += dt * 8;
    } else {
      clearEntityNavigation(hero);
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
      moveEntityInDirection(animal, dx, dy, dt * 1.4, { lookahead: 3 });
      animal.walkT += dt * 5;
      animal.dir = dx >= 0 ? 1 : -1;
    } else {
      clearEntityNavigation(animal);
    }
  }
}

function updateEnemies(dt) {
  for (const e of state.enemies) {
    if (e.dead) continue;
    e.moving = false;
    e.alertT = Math.max(0, (e.alertT || 0) - dt);
    e.cooldown = Math.max(0, e.cooldown - dt);
    e.attackT = Math.max(0, e.attackT - dt);
    const targetHero = nearestHero(e);
    const dist = distance(e, targetHero);
    const isAlerted = e.alertT > 0 || dist < e.aggro;
    if (isAlerted && !e.voiceAlerted) {
      e.voiceAlerted = true;
      playMonsterVoice(e, 0.86);
    } else if (dist > MUSIC_COMBAT_EXIT_RANGE) {
      e.voiceAlerted = false;
    }
    if (isAlerted || dist <= e.attackRange) {
      e.dir = targetHero.x >= e.x ? 1 : -1;
    }
    if (isAlerted && dist > e.attackRange) {
      moveEntityToward(e, targetHero.x, targetHero.y, e.speed * dt, { arriveDistance: Math.max(0.55, e.attackRange * 0.72), maxDistance: Math.max(8, e.aggro + 4) });
      e.walkT += dt * 8;
      e.animT = (e.animT || 0) + dt;
      e.moving = true;
    } else {
      clearEntityNavigation(e);
    }
    if (e.spellKind && e.spellKind !== "frostShard" && dist <= e.attackRange && e.cooldown <= 0) {
      const spec = skillInfo[e.spellKind];
      e.cooldown = e.spellKind === "stormChain" ? 2.8 : 2.1;
      e.attackT = 0.55;
      playMonsterVoice(e, 0.72);
      playMagicAttackSfx();
      const targets = e.spellKind === "stormChain" ? nearestHeroes(e, spec.maxTargets || 3, spec.range) : [targetHero];
      startSpellEffect(e, targets, spec, { hostile: true });
    } else if (dist <= e.attackRange && e.cooldown <= 0) {
      e.cooldown = e.attackCooldown || (e.sprite === "frostAcolyte" ? 1.35 : 1.05);
      e.attackT = 0.35;
      playMonsterVoice(e, 0.72);
      if (e.spellKind) playMagicAttackSfx();
      else playWeaponAttackSfx();
      const dealt = damageHero(targetHero, e.damage, e);
      addFloating(`-${dealt}`, targetHero.x, targetHero.y, "#ff9b7b");
      burst(targetHero.x, targetHero.y, e.sprite === "frostAcolyte" ? "#79d7ff" : "#e14527", 10);
    }
  }
}

function nearestHeroes(point, count = 3, range = 8) {
  return state.heroes
    .filter(hero => hero.hp > 0 && distance(point, hero) <= range)
    .map(hero => ({ hero, d: distance(point, hero) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, count)
    .map(item => item.hero);
}

function updateHeroHitEffects(dt) {
  for (const hero of state.heroes) {
    hero.lowHealthHitT = Math.max(0, (hero.lowHealthHitT || 0) - dt);
    hero.flashT = Math.max(0, (hero.flashT || 0) - dt);
    hero.shakeT = Math.max(0, (hero.shakeT || 0) - dt);
  }
  for (const enemy of state.enemies) {
    enemy.flashT = Math.max(0, (enemy.flashT || 0) - dt);
    enemy.shakeT = Math.max(0, (enemy.shakeT || 0) - dt);
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
      hitTarget(p.target, p.damage, p.kind, p.caster);
      burst(p.target.x, p.target.y, p.color || "#e8c276", 18);
      return false;
    }
    return p.target && !p.target.dead;
  });
}

function startSpellEffect(caster, targets, spec, options = {}) {
  const liveTargets = targets.filter(target => target && !target.dead && target.hp > 0);
  if (!liveTargets.length) return;
  castRing(caster.x, caster.y, spec.color);
  for (const target of liveTargets) applyMagicImpact(target, spec.secondaryColor || spec.color, 0.3, 0.35);
  state.spellEffects.push({
    caster,
    targets: liveTargets,
    hostile: Boolean(options.hostile),
    kind: spec.type === "chain" ? "lightning" : spec.icon?.includes("Blood") || spec.name.includes("Hex") ? "bloodHex" : spec.name.toLowerCase().includes("frost") ? "frost" : "lightning",
    life: spec.duration || 0.55,
    maxLife: spec.duration || 0.55,
    tick: 0,
    tickRate: spec.tickRate || 0.2,
    damage: spec.damage,
    color: spec.color,
    secondaryColor: spec.secondaryColor || spec.color,
    seed: Math.random() * 10000
  });
  burst(caster.x, caster.y, spec.secondaryColor || spec.color, 14);
}

function updateSpellEffects(dt) {
  state.spellEffects = state.spellEffects.filter(effect => {
    effect.life -= dt;
    effect.tick -= dt;
    effect.targets = effect.targets.filter(target => target && !target.dead && target.hp > 0);
    if (!effect.targets.length) return false;
    if (effect.tick <= 0) {
      effect.tick = effect.tickRate;
      for (const target of effect.targets) {
        if (effect.hostile) {
          const dealt = damageHero(target, effect.damage, { spellKind: effect.kind });
          addFloating(`-${dealt}`, target.x, target.y, effect.secondaryColor);
        } else {
          hitTarget(target, effect.damage, effect.kind, effect.caster);
        }
        magicBurst(target.x, target.y, effect.secondaryColor, 10);
      }
    }
    for (const target of effect.targets) {
      if (Math.random() < 0.45) {
        state.particles.push({
          x: target.x + (Math.random() - 0.5) * 0.45,
          y: target.y + (Math.random() - 0.5) * 0.45,
          vx: (Math.random() - 0.5) * 1.3,
          vy: (Math.random() - 0.5) * 1.3,
          color: effect.secondaryColor,
          size: 2 + Math.random() * 5,
          life: 0.22 + Math.random() * 0.22,
          maxLife: 0.44,
          shape: "spark"
        });
      }
    }
    return effect.life > 0;
  });
}

function updateScreenEffects(dt) {
  state.screenFlash = Math.max(0, state.screenFlash - dt);
  state.screenShake = Math.max(0, state.screenShake - dt);
  const shake = state.screenShake > 0 ? state.screenShake / 0.5 : 0;
  state.renderShake = {
    x: (Math.random() - 0.5) * 10 * shake,
    y: (Math.random() - 0.5) * 8 * shake
  };
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
  const finalAmount = source ? (window.ProgressionSystem?.incomingDamage(hero, amount) || amount) : Math.round(amount);
  playStrikeSfx();
  addBlood(hero.x, hero.y, finalAmount, source ? "hero-hit" : "hero");
  hero.hp = Math.max(0, hero.hp - finalAmount);
  applyMagicImpact(hero, source?.spellKind ? "#f8fbff" : "#ff9b7b", 0.28, 0.45);
  if (hero.hp > 0 && hero.hp / hero.maxHp <= LOW_HEALTH_FLASH_THRESHOLD) {
    hero.lowHealthHitT = LOW_HEALTH_FLASH_DURATION;
  }
  if (hero.hp <= 0) {
    addBlood(hero.x, hero.y, finalAmount * 1.3, "hero-down");
    hero.hp = hero.maxHp;
    hero.lowHealthHitT = 0;
    hero.x = activeHero().x + (hash2(hero.x, hero.y) - 0.5) * 2;
    hero.y = activeHero().y + 1.2;
    toast(`${hero.name} was pulled back from the brink.`);
  }
  return finalAmount;
}

function applyMagicImpact(actor, color = "#ffffff", flash = 0.24, shake = 0.28) {
  if (!actor) return;
  actor.flashT = Math.max(actor.flashT || 0, flash);
  actor.flashColor = color;
  actor.shakeT = Math.max(actor.shakeT || 0, shake);
}

function triggerScreenHit(flash = 0.18, shake = 0.28) {
  state.screenFlash = Math.max(state.screenFlash, flash);
  state.screenShake = Math.max(state.screenShake, shake);
}

function attack(target = nearestEnemy()) {
  const player = activeHero();
  const skillId = skillInfo[state.mode] ? state.mode : player.skills?.bar?.find(id => skillInfo[id]) || "cleave";
  const spec = window.ProgressionSystem?.effectiveSkillSpec(player, skillId, skillInfo) || skillInfo[skillId] || skillInfo.cleave;
  if (spec.type !== "self" && (!target || target.dead)) return;
  const dist = target ? distance(player, target) : 0;
  if (target && dist > spec.range) {
    toast("Move closer.");
    return;
  }
  const key = spec.resource === "mana" ? "mana" : "stamina";
  if (player[key] < spec.cost) {
    toast(`Not enough ${spec.resource}.`);
    return;
  }
  player[key] -= spec.cost;
  player.attackT = 0.32;
  if (spec.type === "self") {
    playMagicAttackSfx();
    player.mana = Math.min(player.maxMana, player.mana + 18 + (spec.rank || 1) * 4);
    applyMagicImpact(player, spec.color, 0.45, 0.5);
    castRing(player.x, player.y, spec.color);
    burst(player.x, player.y, spec.color, 22);
    toast(`${spec.name} active.`);
  } else if (spec.type === "melee") {
    playWeaponAttackSfx();
    hitTarget(target, spec.damage, "melee", player);
    burst(target.x, target.y, spec.color, 12);
    castRing(target.x, target.y, spec.color);
  } else if (spec.type === "beam" || spec.type === "chain") {
    playMagicAttackSfx();
    const targets = spec.type === "chain" ? nearestEnemies(spec.range, spec.maxTargets || 3, target) : [target];
    startSpellEffect(player, targets, spec, { hostile: false });
  } else {
    if (spec.resource === "mana") playMagicAttackSfx();
    else playWeaponAttackSfx();
    state.projectiles.push({
      x: player.x,
      y: player.y,
      target,
      t: 0,
      speed: spec.speed,
      damage: spec.damage,
      kind: skillId,
      caster: player,
      color: spec.color
    });
    castRing(target.x, target.y, spec.color);
  }
}

function nearestEnemies(range = 8, count = 1, preferred = null) {
  const hero = activeHero();
  const targets = [
    ...state.enemies,
    ...(state.animals || []),
    ...destructiblePropTargetsNear(hero, range)
  ]
    .filter(e => !e.dead && distance(e, hero) <= range)
    .map(e => ({ e, d: distance(e, hero) }))
    .sort((a, b) => (a.e === preferred ? -1 : b.e === preferred ? 1 : a.d - b.d));
  return targets.slice(0, count).map(item => item.e);
}

function hitTarget(target, damage, kind, attacker = activeHero()) {
  if (target?.kind === "destructibleProp") {
    hitDestructibleProp(target, damage, kind);
  } else {
    hitEnemy(target, damage, kind, attacker);
  }
}

function hitDestructibleProp(target, damage, kind) {
  if (!target || target.dead) return;
  playStrikeSfx();
  target.dead = true;
  state.worldEdits[worldEditKey("prop", target.id)] = { dead: true };
  applyMagicImpact(target, damageColorForKind(kind), 0.18, 0.24);
  burst(target.x, target.y, "#c18a42", 16);
  burst(target.x, target.y, "#f0c46a", 12);
  addFloating("Smashed", target.x, target.y, "#ffcf75");
  dropLoot(target);
  toast(`${target.name} smashed.`);
  saveGame(true);
}

function hitEnemy(target, damage, kind, attacker = activeHero()) {
  if (!target || target.dead) return;
  playStrikeSfx();
  const attackerStats = attacker?.progression ? window.ProgressionSystem?.derivedStats(attacker) : null;
  const critChance = attackerStats?.critChance ?? 0.18;
  const critMultiplier = attackerStats?.critMultiplier ?? 1.8;
  const crit = Math.random() < critChance;
  const finalDamage = crit ? Math.round(damage * critMultiplier) : damage;
  target.hp = Math.max(0, target.hp - finalDamage);
  if (target.kind !== "animal") {
    target.alertT = Math.max(target.alertT || 0, 7);
    target.aggro = Math.max(target.aggro || 0, 8.5);
  }
  target.attackT = 0.22;
  applyMagicImpact(target, damageColorForKind(kind), 0.24, 0.36);
  addBlood(target.x, target.y, finalDamage, kind);
  addFloating(`${crit ? "Crit " : ""}-${finalDamage}`, target.x, target.y, kind === "frost" ? "#b9efff" : "#ffcf75");
  if (target.hp <= 0) {
    target.dead = true;
    stopMonsterVoice(target);
    addBlood(target.x, target.y, finalDamage * 1.6, "kill", true);
    state.worldEdits[worldEditKey(target.kind === "animal" ? "animal" : "enemy", target.id)] = { dead: true };
    dropLoot(target);
    if (target.kind !== "animal") {
      const baseXp = window.ProgressionSystem?.enemyXp(target) || 12;
      const xp = Math.round(baseXp * (target.xpMultiplier || 1));
      const result = window.ProgressionSystem?.awardXp(attacker, xp);
      addFloating(`+${xp} XP`, target.x, target.y, "#92eaff");
      if (result?.levelsGained) toast(`${attacker.name} reached level ${result.level}.`);
      else toast(`${target.name} defeated. +${xp} XP.`);
      renderProgression();
      renderHud();
      saveGame(true);
    } else {
      toast(`${target.name} defeated.`);
    }
  }
}

function damageColorForKind(kind) {
  if (kind === "lightning" || kind === "stormChain" || kind === "lightningArc") return "#ffffff";
  if (kind === "frost" || kind === "frostShard") return "#b9efff";
  if (kind === "bloodHex") return "#ff2f76";
  if (kind === "firebolt") return "#ff742d";
  return "#ffcf75";
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
  const rolls = Math.max(1, enemyState.lootRolls || 1);
  for (let i = 0; i < rolls; i++) {
    const id = i === 0 ? drop : pickBonusLoot(enemyState, i);
    state.loot.push(makeLootDrop(enemyState, id, i));
  }
  for (const id of enemyState.bonusDrops || []) {
    if (Math.random() < (enemyState.rarity === "legendary" ? 0.72 : 0.48)) {
      state.loot.push(makeLootDrop(enemyState, id, rolls + state.loot.length));
    }
  }
  playRevealSfx();
}

function pickBonusLoot(enemyState, index) {
  if (enemyState.rarity === "legendary" && index === 1) return "runeShard";
  if (Math.random() < 0.62) return "coinStack";
  const pool = enemyState.bonusDrops?.length ? enemyState.bonusDrops : ["redPotion", "bluePotion", "greenPotion"];
  return pool[Math.floor(Math.random() * pool.length)];
}

function makeLootDrop(enemyState, id, index = 0) {
  const angle = hash2(Math.floor(enemyState.x * 19) + index, Math.floor(enemyState.y * 23) - index, WORLD_SEED + 313) * Math.PI * 2;
  const radius = 0.18 + index * 0.16;
  return {
    id,
    x: enemyState.x + Math.cos(angle) * radius + (Math.random() - 0.5) * 0.18,
    y: enemyState.y + Math.sin(angle) * radius + (Math.random() - 0.5) * 0.18,
    qty: id === "coinStack"
      ? Math.floor((12 + Math.random() * 28) * (enemyState.goldMultiplier || 1))
      : 1
  };
}

function makeDestructiblePropTarget(propId, x, y) {
  return {
    id: propWorldId(propId, x, y),
    name: "Barrels",
    kind: "destructibleProp",
    sprite: propId,
    x,
    y,
    hp: 26,
    maxHp: 26,
    drop: hash2(x, y, WORLD_SEED + 509) > 0.45 ? "coinStack" : "redPotion",
    lootRolls: hash2(x, y, WORLD_SEED + 523) > 0.82 ? 2 : 1,
    goldMultiplier: 0.55,
    dead: false
  };
}

function destructiblePropTargetsNear(point, range = 8) {
  const targets = [];
  const minX = Math.floor(point.x - range);
  const maxX = Math.ceil(point.x + range);
  const minY = Math.floor(point.y - range);
  const maxY = Math.ceil(point.y + range);
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const tile = tileFromSeed(x, y);
      if (!tile.prop || !isDestructiblePropId(tile.prop) || isDestroyedProp(tile.prop, x, y)) continue;
      const target = makeDestructiblePropTarget(tile.prop, x, y);
      if (distance(target, point) <= range) targets.push(target);
    }
  }
  return targets;
}

function nearestDestructibleProp(point, range = 0.9) {
  return destructiblePropTargetsNear(point, range)
    .map(target => ({ target, d: distance(target, point) }))
    .sort((a, b) => a.d - b.d)[0] || null;
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
    ...(state.animals || []),
    ...destructiblePropTargetsNear(hero, range)
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
  const temple = document.getElementById("questTemple");
  const priest = document.getElementById("questPriest");
  if (temple.checked !== state.quest.temple) temple.checked = state.quest.temple;
  if (priest.checked !== state.quest.priest) priest.checked = state.quest.priest;
}

function render() {
  ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  drawBackdrop();
  const worldItems = drawMap();
  drawDepthSortedWorld(worldItems);
  drawSpellEffects();
  drawProjectiles();
  drawParticles();
  drawScreenEffects();
  drawInteriorOverlay();
  drawEditorSelection();
  drawMiniMapThrottled();
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
  const detail = visualDetailLevel();
  const visibleForestTiles = getVisibleForestTiles(view);
  const props = getVisibleProps(view, detail);
  drawBaseTerrain(visibleTiles);
  if (detail === "close") {
    drawFloraTerrain(visibleTiles);
    drawSurfaceGrassDecals(visibleTiles, view);
    drawWaterTerrain(visibleTiles);
  }
  if (detail !== "extreme") drawBloodGround(view.bloodBounds);
  props.sort((a, b) => (a.x + a.y) - (b.x + b.y));
  for (const prop of props) {
    prop.depth = prop.x + prop.y + 0.7;
  }
  return { props, forests: visibleForestTiles, bounds: view.tileBounds };
}

function createMapRenderView() {
  const corners = [
    screenToWorld(0, 0),
    screenToWorld(canvas.clientWidth, 0),
    screenToWorld(0, canvas.clientHeight),
    screenToWorld(canvas.clientWidth, canvas.clientHeight)
  ];
  const tileBounds = visibleTileBounds(4, corners);
  const forestBounds = visibleTileBounds(state.camera.zoom < 0.42 ? 8 : FOREST_RENDER_TILE_PAD, corners);
  return {
    tileBounds,
    forestBounds,
    bloodBounds: visibleTileBounds(2, corners),
    terrainStep: terrainStepForBounds(tileBounds)
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
  const step = view.terrainStep || 1;
  const tw = TILE_W * state.camera.zoom * step;
  const th = TILE_H * state.camera.zoom * step;
  const startX = Math.floor(bounds.minX / step) * step;
  const startY = Math.floor(bounds.minY / step) * step;
  for (let y = startY; y <= bounds.maxY; y += step) {
    for (let x = startX; x <= bounds.maxX; x += step) {
      const screen = worldToScreen(x, y);
      if (!isScreenRectVisible(screen.x - tw / 2, screen.y, tw, th)) continue;
      const tile = step > 1 ? tileFromSeed(x, y) : getTile(x, y);
      const riverMask = step === 1 && (tile.water || (!tile.road && !tile.water)) ? riverNeighborMask(x, y) : 0;
      tiles.push({ x, y, tile, screen, tw, th, riverMask, step });
    }
  }
  return tiles;
}

function getVisibleForestTiles(view) {
  const alpha = zoomFade(FOREST_MIN_ZOOM, FOREST_FULL_ZOOM);
  if (alpha <= 0) return [];
  const bounds = view.forestBounds;
  const tiles = [];
  const step = decorStepForBounds(bounds, MAX_FOREST_DRAWS, FOREST_FULL_ZOOM);
  const tw = TILE_W * state.camera.zoom;
  const th = TILE_H * state.camera.zoom;
  const startX = Math.floor(bounds.minX / step) * step;
  const startY = Math.floor(bounds.minY / step) * step;
  for (let y = startY; y <= bounds.maxY; y += step) {
    for (let x = startX; x <= bounds.maxX; x += step) {
      const tile = tileFromSeed(x, y);
      if (!tile?.forest || tile.water) continue;
      const screen = worldToScreen(x, y);
      if (!isForestClusterVisible(tile.forest, screen, tw, th)) continue;
      tiles.push({ x, y, tile, screen, tw, th, depth: x + y + 0.68, alpha });
    }
  }
  return tiles;
}

function getVisibleProps(view, detail) {
  const alpha = zoomFade(PROP_MIN_ZOOM, PROP_FULL_ZOOM);
  if (alpha <= 0 || detail === "extreme") return [];
  const bounds = view.tileBounds;
  const props = [];
  const step = decorStepForBounds(bounds, MAX_PROP_DRAWS, PROP_FULL_ZOOM);
  const startX = Math.floor(bounds.minX / step) * step;
  const startY = Math.floor(bounds.minY / step) * step;
  for (let y = startY; y <= bounds.maxY; y += step) {
    for (let x = startX; x <= bounds.maxX; x += step) {
      const tile = tileFromSeed(x, y);
      if (!tile.prop || tile.water) continue;
      if (isDestroyedProp(tile.prop, x, y)) continue;
      const screen = worldToScreen(x, y);
      const size = biomeSpriteDisplaySize(tile.prop);
      const width = size.width;
      const height = size.height;
      const scaledWidth = width * WORLD_ITEM_DRAW_SCALE;
      const scaledHeight = height * WORLD_ITEM_DRAW_SCALE;
      if (!isScreenRectVisible(screen.x - scaledWidth * state.camera.zoom / 2, screen.y - scaledHeight * state.camera.zoom, scaledWidth * state.camera.zoom, scaledHeight * state.camera.zoom + TILE_H * state.camera.zoom)) continue;
      props.push({ id: tile.prop, x, y, screen, alpha });
    }
  }
  return props;
}

function drawBaseTerrain(visibleTiles) {
  const fillPaths = new Map();
  const strokePath = new Path2D();
  const detailedTerrain = state.camera.zoom >= DETAIL_TEXTURE_MIN_ZOOM && (visibleTiles[0]?.step || 1) === 1;
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
  if (detailedTerrain && dungeonFloorLoaded) {
    for (const entry of visibleTiles) {
      const { tile, screen, tw, th } = entry;
      if (tile.water) continue;
      drawClippedTerrainImage(worldAssets.dungeonFloor, screen, tw, th, tile.road ? 0.24 : 0.42);
    }
  }
  if (detailedTerrain) {
    ctx.strokeStyle = "rgba(176, 119, 45, 0.16)";
    ctx.lineWidth = 1;
    ctx.stroke(strokePath);
  }
}

function drawFloraTerrain(visibleTiles) {
  const riverEdgeLoaded = assetLoaded(terrainAssets.riverEdge);
  for (const entry of visibleTiles) {
    const { tile, x, y, screen, tw, th, riverMask } = entry;
    if (tile.water || tile.road) continue;
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

function drawSurfaceGrassDecals(visibleTiles, view) {
  if ((view.terrainStep || 1) !== 1) return;
  const alpha = zoomFade(SURFACE_GRASS_MIN_ZOOM, SURFACE_GRASS_FULL_ZOOM);
  if (alpha <= 0 || !SURFACE_GRASS_DECAL_KEYS.every(key => assetLoaded(terrainAssets[key]))) return;

  ctx.save();
  for (const entry of visibleTiles) {
    const { tile, x, y, screen, tw, th, riverMask } = entry;
    if (tile.water || tile.road || riverMask > 0) continue;
    const densityRoll = hash2(x, y, WORLD_SEED + 401);
    if (densityRoll < 0.42) continue;
    const count = densityRoll > 0.88 ? 3 : densityRoll > 0.66 ? 2 : 1;
    for (let i = 0; i < count; i++) {
      drawSurfaceGrassDecal(x, y, i, screen, tw, th, alpha);
    }
  }
  ctx.restore();
}

function drawSurfaceGrassDecal(x, y, index, screen, tw, th, alpha) {
  const spriteRoll = hash2(x + index * 11, y - index * 13, WORLD_SEED + 409);
  const key = SURFACE_GRASS_DECAL_KEYS[Math.floor(spriteRoll * SURFACE_GRASS_DECAL_KEYS.length) % SURFACE_GRASS_DECAL_KEYS.length];
  const image = terrainAssets[key];
  if (!assetLoaded(image)) return;

  const offsetA = hash2(x + index * 17, y, WORLD_SEED + 419) - 0.5;
  const offsetB = hash2(x, y - index * 19, WORLD_SEED + 421) - 0.5;
  const px = screen.x + offsetA * tw * 0.98;
  const py = screen.y + th * (0.5 + offsetB * 0.92);
  const scale = (SURFACE_GRASS_WORLD_WIDTH / image.naturalWidth) * state.camera.zoom;

  ctx.save();
  ctx.translate(px, py);
  ctx.scale(scale, scale);
  ctx.globalAlpha = alpha * (0.38 + hash2(x - index * 7, y + index * 5, WORLD_SEED + 443) * 0.34);
  ctx.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);
  ctx.restore();
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

function drawForestClusterSprite(forest, p, tw, th, alpha = 1) {
  const image = terrainAssets.forestClusters;
  const sheet = terrainAssetFiles.forestClusters;
  if (!assetLoaded(image) || !sheet) return false;
  const cell = forest.variant % (sheet.cols * sheet.rows);
  const sx = (cell % sheet.cols) * image.naturalWidth / sheet.cols;
  const sy = Math.floor(cell / sheet.cols) * image.naturalHeight / sheet.rows;
  const sw = image.naturalWidth / sheet.cols;
  const sh = image.naturalHeight / sheet.rows;
  const rect = getForestClusterScreenRect(forest, p, tw, th);
  ctx.save();
  ctx.globalAlpha = 0.9 * alpha;
  ctx.drawImage(image, sx, sy, sw, sh, rect.x, rect.y, rect.width, rect.height);
  ctx.restore();
  return true;
}

function drawProceduralForestCluster(forest, x, y, p, tw, th, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = 0.86 * alpha;
  const editorScale = editorScaleFor("forest", "cluster");
  for (let i = 0; i < forest.density; i++) {
    const seed = hash2(x + i * 3, y - i * 5, WORLD_SEED + 181);
    const px = p.x + (seed - 0.5) * tw * 0.74;
    const py = p.y + th * (0.3 + hash2(x - i * 7, y + i * 2, WORLD_SEED + 191) * 0.42);
    const h = th * (1.08 + hash2(x + i, y + i, WORLD_SEED + 197) * 0.82) * forest.scale * WORLD_ITEM_DRAW_SCALE * FOREST_TEXTURE_HEIGHT_SCALE * editorScale;
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
  const rect = getForestClusterScreenRect(forest, p, tw, th);
  return isScreenRectVisible(rect.x, rect.y, rect.width, rect.height);
}

function getForestClusterScreenRect(forest, p, tw, th) {
  const editorScale = editorScaleFor("forest", "cluster");
  const width = tw * 1.46 * forest.scale * WORLD_ITEM_DRAW_SCALE * FOREST_TEXTURE_WIDTH_SCALE * editorScale;
  const height = th * 2.75 * forest.scale * WORLD_ITEM_DRAW_SCALE * FOREST_TEXTURE_HEIGHT_SCALE * editorScale;
  return {
    x: p.x - width / 2,
    y: p.y + th * 0.68 - height,
    width,
    height
  };
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

function getEditorPrefabRenderItems(bounds) {
  const draftInstances = state.editor.open && state.editor.draft.anchor && state.editor.draft.items.length
    ? [{ prefab: { name: state.editor.draft.name, items: state.editor.draft.items }, x: state.editor.draft.anchor.x, y: state.editor.draft.anchor.y, draft: true }]
    : [];
  const planDraftInstance = getPlanDraftPreviewInstance(bounds);
  return [...getEditorPrefabInstances(bounds), ...draftInstances, ...planDraftInstance].flatMap(instance => instance.prefab.items.flatMap((item, index) => {
    if (instance.deletedItems?.includes(index)) return [];
    if (!editorLayerVisible(item.layer)) return [];
    const x = instance.x + (item.dx || 0);
    const y = instance.y + (item.dy || 0);
    return {
      kind: "editorPrefabItem",
      depth: x + y + editorLayerDepth(item.layer) + index * 0.01,
      data: { ...item, x, y, prefabName: instance.prefab.name, manual: instance.manual, placementId: instance.placementId, draft: instance.draft, draftIndex: index, itemIndex: index }
    };
  }));
}

function getPlanDraftPreviewInstance(bounds) {
  const plan = state.editor.planDraft;
  if (!state.editor.open || !state.editor.planView || !plan?.anchor || !Object.keys(plan.cells || {}).length) return [];
  if (plan.anchor.x < bounds.minX - 12 || plan.anchor.x > bounds.maxX + 12 || plan.anchor.y < bounds.minY - 12 || plan.anchor.y > bounds.maxY + 12) return [];
  const seed = planPreviewSeed(plan);
  return [{ prefab: planToPrefab(plan, seed, { preview: true }), x: plan.anchor.x, y: plan.anchor.y, draft: true, planDraft: true }];
}

function planPreviewSeed(plan) {
  const key = plan.sourcePlanId || plan.name || "draft-plan";
  return [...key].reduce((sum, ch) => sum + ch.charCodeAt(0), WORLD_SEED + 2203 + plan.width * 17 + plan.height * 19);
}

function drawEditorPrefabItem(item) {
  const p = worldToScreen(item.x, item.y);
  const itemScale = Number.isFinite(item.itemScale) ? item.itemScale : 1;
  const rotation = Number.isFinite(item.rotation) ? item.rotation : 0;
  if (item.type === "biome") {
    if (isWallEditorItem(item)) {
      drawWallSpriteItem(item, p);
      return;
    }
    const size = editorBiomeSpriteSize(item.id);
    drawBiomeSprite(item.id, p.x, p.y + size.yOffset * state.camera.zoom, size.width, size.height, item.flipX ? -1 : 1, FAR_PROP_MIN_RENDER_ZOOM, itemScale, rotation);
  } else if (item.type === "enemy") {
    drawActor({ id: item.id, sprite: item.id, name: enemyName(item.id), kind: "enemy", x: item.x, y: item.y, hp: 1, maxHp: 1, dir: 1, walkT: 0, attackT: 0 });
  } else if (item.type === "item") {
    drawLoot({ id: item.id, x: item.x, y: item.y, qty: 1 });
  } else if (item.type === "planPath") {
    drawPlanPathTile(item);
  } else if (item.type === "forest") {
    const z = state.camera.zoom;
    const forest = { variant: Math.floor(Math.abs(rotation) * 1000) % 4, scale: itemScale, density: 4 };
    drawForestClusterSprite(forest, p, TILE_W * z, TILE_H * z, 0.92) || drawProceduralForestCluster(forest, Math.floor(item.x), Math.floor(item.y), p, TILE_W * z, TILE_H * z, 0.92);
  }
}

function drawPlanPathTile(item) {
  const sprite = biomeSprites[item.id];
  const image = sprite && biomeAssets[sprite.atlas];
  if (!sprite || !assetLoaded(image)) return;
  const rect = sprite.approxRect;
  const p = worldToScreen(item.x, item.y);
  const z = Math.max(state.camera.zoom, FAR_PROP_MIN_RENDER_ZOOM);
  const tw = TILE_W * z * 1.04;
  const th = TILE_H * z * 1.18;
  ctx.save();
  ctx.globalAlpha = item.draft ? 0.92 : 1;
  ctx.drawImage(image, rect.x, rect.y, rect.w, rect.h, p.x - tw / 2, p.y - th * 0.08, tw, th);
  ctx.restore();
}

function editorBiomeSpriteSize(id) {
  return biomeSpriteDisplaySize(id);
}

function biomeSpriteDisplaySize(id) {
  const sprite = biomeSprites[id];
  if (id === WALL_SPRITES.segment || id === WALL_SPRITES.gate) {
    const rect = sprite?.approxRect || {};
    return { width: rect.w || WALL_CELL_WIDTH, height: rect.h || WALL_CELL_HEIGHT, yOffset: 0 };
  }
  const kind = sprite?.kind || "";
  if (["building", "house", "shop", "tower", "church", "stable", "forge", "hut", "cabin", "barn", "gate", "arch", "bridge"].includes(kind)) return { width: 190, height: 190, yOffset: 18 };
  if (["shrine", "altar", "statue", "well", "portal", "siege", "gibbet", "wall", "ruin"].includes(kind)) return { width: 126, height: 126, yOffset: 4 };
  if (["container", "wagon"].includes(kind)) return { width: 82, height: 82, yOffset: 0 };
  if (["rock", "boulder", "rubble"].includes(kind)) return { width: 76, height: 76, yOffset: 0 };
  if (["ground_prop", "ground_cover", "path", "road", "grass", "foliage", "flower", "fern", "mushroom"].includes(kind)) return { width: 78, height: 78, yOffset: 0 };
  if (kind === "animal") return { width: 54, height: 54, yOffset: 0 };
  const tall = id.includes("tree") || id.includes("bramble");
  return { width: tall ? 110 : 68, height: tall ? 110 : 68, yOffset: 0 };
}

function drawWallSpriteItem(item, p) {
  const sprite = biomeSprites[item.id];
  const image = sprite && biomeAssets[sprite.atlas];
  if (!sprite || !assetLoaded(image)) return false;
  const rect = sprite.approxRect;
  const z = Math.max(state.camera.zoom, FAR_PROP_MIN_RENDER_ZOOM);
  const scale = Number.isFinite(item.itemScale) ? item.itemScale : 1;
  const dw = rect.w * z * scale;
  const dh = rect.h * z * scale;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(item.flipX ? -1 : 1, 1);
  ctx.drawImage(image, rect.x, rect.y, rect.w, rect.h, -dw / 2, -dh * 0.82, dw, dh);
  ctx.restore();
  return true;
}

function drawDepthSortedWorld(worldItems) {
  const actors = [
    ...state.loot.map(l => ({ kind: "loot", depth: l.x + l.y - 0.05, data: l })),
    ...state.npcs.map(n => ({ kind: "actor", depth: n.x + n.y, data: { ...n, kind: "npc" } })),
    ...(state.animals || []).filter(a => !a.dead).map(a => ({ kind: "actor", depth: a.x + a.y, data: { ...a, kind: "animal" } })),
    ...state.enemies.filter(e => !e.dead).map(e => ({ kind: "actor", depth: e.x + e.y, data: { ...e, kind: "enemy" } })),
    ...state.heroes.map(hero => ({ kind: "actor", depth: hero.x + hero.y + 0.1, data: { ...hero, kind: "player", sprite: hero.id } }))
  ];
  const buildings = state.buildings.map(b => ({
    kind: "building",
    depth: b.x + b.w / 2 - 0.5 + b.y + b.h - 1,
    data: b
  }));
  const decals = getWorldDecals().map(decal => ({ kind: "decal", depth: decal.x + decal.y + 0.85, data: decal }));
  const forests = (worldItems?.forests || []).map(entry => ({ kind: "forest", depth: entry.depth, data: entry }));
  const props = (worldItems?.props || []).map(prop => ({ kind: "prop", depth: prop.depth, data: prop }));
  const editorItems = getEditorPrefabRenderItems(worldItems?.bounds || createMapRenderView().tileBounds);
  const items = [...decals, ...forests, ...props, ...editorItems, ...buildings, ...actors].sort((a, b) => a.depth - b.depth);

  for (const item of items) {
    if (item.kind === "decal") drawRuinedVillageDecal(item.data);
    else if (item.kind === "forest") drawForestEntry(item.data);
    else if (item.kind === "prop") drawProp(item.data);
    else if (item.kind === "building") drawBuilding(item.data);
    else if (item.kind === "editorPrefabItem") drawEditorPrefabItem(item.data);
    else if (item.kind === "loot") drawLoot(item.data);
    else drawActor(item.data);
  }
}

function getWorldDecals() {
  const image = worldAssets.ruinedVillage;
  if (!assetLoaded(image)) return [];
  const z = state.camera.zoom;
  const alpha = zoomFade(DECAL_MIN_ZOOM, DECAL_FULL_ZOOM);
  if (alpha <= 0) return [];
  return ruinedVillageDecals.flatMap(decal => {
    const p = worldToScreen(decal.x, decal.y);
    const width = decal.width * z;
    const height = width * (image.naturalHeight / image.naturalWidth);
    const x = p.x - width / 2;
    const y = p.y - height + decal.depth * z;
    if (!isScreenRectVisible(x, y, width, height, 160 * z)) return [];
    return [{ ...decal, alpha: decal.alpha * alpha, screen: { x, y, width, height } }];
  });
}

function drawRuinedVillageDecal(decal) {
  const image = worldAssets[decal.id];
  if (!assetLoaded(image)) return;
  ctx.save();
  ctx.globalAlpha = decal.alpha;
  ctx.drawImage(image, decal.screen.x, decal.screen.y, decal.screen.width, decal.screen.height);
  ctx.restore();
}

function drawForestEntry(entry) {
  const { tile, x, y, screen, tw, th, alpha = 1 } = entry;
  if (!drawForestClusterSprite(tile.forest, screen, tw, th, alpha)) {
    drawProceduralForestCluster(tile.forest, x, y, screen, tw, th, alpha);
  }
}

function drawProp(prop) {
  ctx.save();
  ctx.globalAlpha = prop.alpha ?? 1;
  const size = biomeSpriteDisplaySize(prop.id);
  if (!drawBiomeSprite(prop.id, prop.screen.x, prop.screen.y + size.yOffset * state.camera.zoom, size.width, size.height, 1, FAR_PROP_MIN_RENDER_ZOOM)) {
    ctx.fillStyle = "rgba(97, 153, 69, 0.34)";
    ctx.fillRect(prop.screen.x - 3, prop.screen.y + TILE_H * state.camera.zoom / 2 - 2, 6, 4);
  }
  ctx.restore();
}

function drawBuildings() {
  for (const b of state.buildings) {
    drawBuilding(b);
  }
}

function drawBuilding(b) {
    const base = worldToScreen(b.x + b.w / 2 - 0.5, b.y + b.h - 1);
    const z = state.camera.zoom;
    if (b.biomeAsset && drawBiomeSprite(b.biomeAsset, base.x, base.y + 18 * z, 190, 190)) {
      drawLabel(b.name, base.x, base.y + 52 * z, "#f0c46a");
      return;
    }
    const generated = worldAssets[b.asset || b.id];
    if (assetLoaded(generated)) {
      const size = (b.id === "forge" ? 210 : 250) * WORLD_ITEM_DRAW_SCALE;
      ctx.save();
      ctx.translate(base.x, base.y);
      ctx.scale(z, z);
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.beginPath();
      ctx.ellipse(0, 24, b.w * 42 * WORLD_ITEM_DRAW_SCALE, b.h * 18 * WORLD_ITEM_DRAW_SCALE, 0, 0, Math.PI * 2);
      ctx.fill();
      drawImageContained(generated, 0, 0, generated.naturalWidth, generated.naturalHeight, -size / 2, -size + 38, size, size, 0.5, 1);
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
      return;
    }
    ctx.save();
    ctx.translate(base.x, base.y);
    ctx.scale(z * WORLD_ITEM_DRAW_SCALE, z * WORLD_ITEM_DRAW_SCALE);
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

function assetLoaded(image) {
  return image && image.complete && image.naturalWidth > 0;
}

function drawImageContainedOn(targetCtx, image, sx, sy, sw, sh, dx, dy, dw, dh, alignX = 0.5, alignY = 0.5) {
  if (!sw || !sh || !dw || !dh) return;
  const scale = Math.min(dw / sw, dh / sh);
  const width = sw * scale;
  const height = sh * scale;
  const x = dx + (dw - width) * alignX;
  const y = dy + (dh - height) * alignY;
  targetCtx.drawImage(image, sx, sy, sw, sh, x, y, width, height);
}

function drawImageContained(image, sx, sy, sw, sh, dx, dy, dw, dh, alignX = 0.5, alignY = 0.5) {
  drawImageContainedOn(ctx, image, sx, sy, sw, sh, dx, dy, dw, dh, alignX, alignY);
}

function drawBiomeSprite(id, x, y, width, height, dir = 1, minZoom = 0, itemScale = 1, rotation = 0) {
  const sprite = biomeSprites[id];
  const image = sprite && biomeAssets[sprite.atlas];
  if (!sprite || !assetLoaded(image)) return false;
  const rect = sprite.approxRect;
  const z = Math.max(state.camera.zoom, minZoom);
  const editorScale = editorScaleFor("biome", id);
  const box = Math.max(width, height) * z * WORLD_ITEM_DRAW_SCALE * editorScale * itemScale;
  ctx.save();
  ctx.translate(x, y);
  if (rotation) ctx.rotate(rotation);
  ctx.scale(dir === -1 ? -1 : 1, 1);
  drawImageContained(image, rect.x, rect.y, rect.w, rect.h, -box / 2, -box * 0.82, box, box, 0.5, 1);
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
  const shake = actor.shakeT > 0 ? {
    x: (Math.random() - 0.5) * 9 * (actor.kind === "enemy" ? ENEMY_DRAW_SCALE : 1),
    y: (Math.random() - 0.5) * 7 * (actor.kind === "enemy" ? ENEMY_DRAW_SCALE : 1)
  } : { x: 0, y: 0 };
  ctx.save();
  ctx.translate(p.x + shake.x, p.y + shake.y);
  const editorActorScale = actor.kind === "enemy" ? editorScaleFor("enemy", actor.sprite) : 1;
  ctx.scale(z * editorActorScale * (actor.dir === -1 ? -1 : 1), z * editorActorScale);
  const actorScale = actor.kind === "enemy" ? ENEMY_DRAW_SCALE : 1;
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.beginPath();
  ctx.ellipse(0, 17, 25 * actorScale, 10 * actorScale, 0, 0, Math.PI * 2);
  ctx.fill();
  if (actor.kind === "player" && actor.id === state.activeHeroId) {
    ctx.strokeStyle = "#f0c46a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 16, 31, 13, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  const frame = actorSpriteFrame(actor.sprite);
  const hurtPulse = actor.kind === "player" && actor.lowHealthHitT > 0 && actor.hp / actor.maxHp <= LOW_HEALTH_FLASH_THRESHOLD;
  const impactPulse = actor.flashT > 0;
  if (hurtPulse) {
    ctx.filter = "brightness(1.18) sepia(0.55) saturate(1.8) hue-rotate(-18deg)";
  } else if (impactPulse) {
    ctx.filter = actor.flashColor === "#12040c"
      ? "brightness(1.22) contrast(1.22) saturate(0.82)"
      : "brightness(1.28) saturate(1.18)";
  }
  const spriteYOffset = actor.kind === "player" || actor.kind === "enemy" ? PLAYER_ENEMY_SPRITE_Y_OFFSET : 0;
  if (!drawAnimatedActorSprite(actor, actorScale, attack, bob, spriteYOffset)) {
    drawSprite(
      actor.sprite,
      frame.x * actorScale + attack * actorScale,
      frame.y * actorScale + bob * actorScale + spriteYOffset,
      frame.w * actorScale,
      frame.h * actorScale
    );
  }
  if (actor.kind === "player" && !spriteLookup[actor.sprite]?.fullBody) {
    drawSprite(actor.equipment.weapon, 13 + attack, -48 + bob + spriteYOffset, 36, 56);
  }
  if (hurtPulse || impactPulse) {
    const pulseAlpha = clamp(Math.max(actor.lowHealthHitT || 0, actor.flashT || 0) * 2.4, 0.08, 0.32);
    ctx.globalAlpha = pulseAlpha;
    ctx.fillStyle = actor.flashColor === "#12040c" ? "#2a0618" : actor.kind === "player" ? "#ff6f4f" : "#fff0b0";
    ctx.beginPath();
    ctx.ellipse(0, 16, 34 * actorScale, 16 * actorScale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.filter = "none";
  }
  ctx.restore();

  if (actor.kind === "enemy") drawNameplate(actor, p);
  if (actor.kind === "npc") drawLabel(actor.name, p.x, p.y - 72 * z, "#eecb76");
}

function drawNameplate(actor, p) {
  const z = state.camera.zoom;
  if (z < 0.3) return;
  const actorScale = actor.kind === "enemy" ? ENEMY_DRAW_SCALE : 1;
  const w = 62 * z * actorScale;
  const h = 6;
  ctx.fillStyle = "rgba(0,0,0,0.65)";
  ctx.fillRect(p.x - w / 2, p.y - 76 * z * actorScale, w, h);
  ctx.fillStyle = actor.rarity === "legendary" ? "#b16bff" : actor.rarity === "rare" ? "#d89b32" : "#ad1d1d";
  ctx.fillRect(p.x - w / 2, p.y - 76 * z * actorScale, w * (actor.hp / actor.maxHp), h);
  drawLabel(actor.name, p.x, p.y - 88 * z * actorScale, actor.rarity === "legendary" ? "#d9b4ff" : actor.rarity === "rare" ? "#ffd37a" : "#ffb18c");
}

function drawLoot(loot) {
  const p = worldToScreen(loot.x, loot.y);
  const z = state.camera.zoom;
  const editorScale = editorScaleFor("item", loot.id);
  ctx.save();
  ctx.translate(p.x, p.y + Math.sin(performance.now() / 240) * 3);
  ctx.scale(z * editorScale, z * editorScale);
  drawSprite(loot.id, -18 * WORLD_ITEM_DRAW_SCALE, -38 * WORLD_ITEM_DRAW_SCALE, 36 * WORLD_ITEM_DRAW_SCALE, 36 * WORLD_ITEM_DRAW_SCALE, true);
  ctx.restore();
  drawLabel(itemName(loot.id), p.x, p.y - 44 * z * WORLD_ITEM_DRAW_SCALE * editorScale, loot.id === "runeShard" ? "#b16bff" : "#e8c06a");
}

function actorSpriteFrame(id) {
  const sprite = spriteLookup[id];
  return sprite?.draw || { x: -28, y: -76, w: 56, h: 68 };
}

function drawAnimatedActorSprite(actor, actorScale, attack, bob, spriteYOffset) {
  const animation = animatedActorSprites[actor.sprite];
  if (!animation || !assetsReady) return false;
  const image = images[animation.sheet];
  if (!assetLoaded(image)) return false;
  const cellW = image.naturalWidth / animation.cols;
  const cellH = image.naturalHeight / animation.rows;
  const playableFrames = animation.cols * (animation.playableRows || animation.rows);
  const frameCount = Math.min(animation.frameCount || playableFrames, playableFrames);
  const frameIndex = actor.moving ? Math.floor((actor.animT || 0) * animation.fps) % frameCount : 0;
  const sx = (frameIndex % animation.cols) * cellW;
  const sy = Math.floor(frameIndex / animation.cols) * cellH;
  const draw = animation.draw || actorSpriteFrame(actor.sprite);
  const drawH = draw.h * actorScale;
  const drawW = (draw.w || draw.h * (cellW / cellH)) * actorScale;
  const drawBob = actor.moving ? bob * actorScale : 0;
  ctx.drawImage(
    image,
    sx,
    sy,
    cellW,
    cellH,
    draw.x * actorScale + attack * actorScale,
    draw.y * actorScale + drawBob + spriteYOffset,
    drawW,
    drawH
  );
  return true;
}

function drawSprite(id, x, y, w, h, preserveAspect = false) {
  const drawable = resolveDrawableSprite(id);
  if (!drawable) {
    ctx.fillStyle = "#c38a2f";
    ctx.fillRect(x, y, w, h);
    return;
  }
  const { sprite, image } = drawable;
  if (sprite.keyColor) {
    const canvas = keyedSpriteCanvas(id, sprite, image);
    if (preserveAspect) {
      drawImageContained(canvas, 0, 0, canvas.width, canvas.height, x, y, w, h);
      return;
    }
    ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, x, y, w, h);
    return;
  }
  if (preserveAspect) {
    drawImageContained(image, sprite.x, sprite.y, sprite.width || SPRITE_CELL, sprite.height || SPRITE_CELL, x, y, w, h);
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

function makeCanvasBuffer(width, height) {
  const buffer = typeof OffscreenCanvas === "function"
    ? new OffscreenCanvas(width, height)
    : document.createElement("canvas");
  buffer.width = width;
  buffer.height = height;
  return { canvas: buffer, ctx: buffer.getContext("2d", { willReadFrequently: true }) };
}

function keyedSpriteCanvas(id, sprite, image) {
  if (keyedSpriteCache[id]) return keyedSpriteCache[id];
  const width = sprite.width || SPRITE_CELL;
  const height = sprite.height || SPRITE_CELL;
  const { canvas, ctx: buffer } = makeCanvasBuffer(width, height);
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
  if (state.camera.zoom < 0.24) return;
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

function drawSpellEffects() {
  const now = performance.now() / 80;
  for (const effect of state.spellEffects) {
    const casterPoint = worldToScreen(effect.caster.x, effect.caster.y);
    const age = 1 - clamp(effect.life / effect.maxLife, 0, 1);
    const travel = 1 - Math.pow(1 - clamp(age * 1.75, 0, 1), 3);
    for (let index = 0; index < effect.targets.length; index++) {
      const target = effect.targets[index];
      const targetPoint = worldToScreen(target.x, target.y);
      const from = { x: casterPoint.x, y: casterPoint.y - 54 * state.camera.zoom };
      const to = { x: targetPoint.x, y: targetPoint.y - 52 * state.camera.zoom };
      const movingTo = {
        x: from.x + (to.x - from.x) * travel,
        y: from.y + (to.y - from.y) * travel
      };
      drawFractalMagicBolt(from, movingTo, effect, now + index * 7, travel);
      if (travel > 0.78) drawLightningImpact(to, effect, now + index * 11, travel);
    }
  }
}

function lightningNoise(effect, phase, level, index, channel = 0) {
  const seed = Math.floor(effect.seed || 1);
  const stable = hash2(seed + level * 131 + channel * 977, index * 197 + channel * 431, WORLD_SEED + channel * 53);
  const animated = Math.sin(phase * (0.75 + channel * 0.17) + stable * Math.PI * 2 + level * 1.9 + index * 0.73);
  return (stable - 0.5) * 1.35 + animated * 0.42;
}

function buildFractalLightningPoints(from, to, effect, phase, depth = 5, strength = 1) {
  let points = [from, to];
  for (let level = 0; level < depth; level++) {
    const next = [points[0]];
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i];
      const b = points[i + 1];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.max(1, Math.hypot(dx, dy));
      const nx = -dy / len;
      const ny = dx / len;
      const t = (i + 0.5) / Math.max(1, points.length - 1);
      const taper = Math.sin(Math.PI * t);
      const maxJolt = (effect.kind === "bloodHex" ? 18 : 34) * state.camera.zoom * strength;
      const amplitude = Math.min(len * 0.55, maxJolt) * Math.pow(0.58, level) * (0.35 + taper * 0.85);
      const side = lightningNoise(effect, phase, level, i, 0) * amplitude;
      const along = lightningNoise(effect, phase, level, i, 1) * amplitude * 0.18;
      next.push({
        x: (a.x + b.x) * 0.5 + nx * side + (dx / len) * along,
        y: (a.y + b.y) * 0.5 + ny * side + (dy / len) * along
      });
      next.push(b);
    }
    points = next;
  }
  return points;
}

function drawBoltPath(points) {
  ctx.beginPath();
  points.forEach((point, i) => i ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
  ctx.stroke();
}

function drawFractalMagicBolt(from, to, effect, phase, travel = 1) {
  const isBlood = effect.kind === "bloodHex";
  const points = buildFractalLightningPoints(from, to, effect, phase, isBlood ? 4 : 5, isBlood ? 0.72 : 1);
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.max(1, Math.hypot(dx, dy));
  const pulse = 0.78 + Math.sin(phase * 1.7 + effect.seed) * 0.22;
  const alpha = clamp(effect.life / effect.maxLife, 0.25, 1) * clamp(travel * 1.7, 0.3, 1);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowColor = effect.secondaryColor;
  ctx.shadowBlur = isBlood ? 16 : 30;
  ctx.strokeStyle = effect.color;
  ctx.lineWidth = (isBlood ? 4.5 : 8) * state.camera.zoom * pulse;
  drawBoltPath(points);
  ctx.strokeStyle = effect.secondaryColor;
  ctx.lineWidth = (isBlood ? 1.8 : 2.4) * state.camera.zoom;
  drawBoltPath(points);

  if (effect.kind === "lightning" || isBlood) {
    ctx.strokeStyle = "rgba(255,255,255,0.82)";
    ctx.lineWidth = 1.1 * state.camera.zoom;
    const forkStep = isBlood ? 9 : 7;
    for (let i = 3; i < points.length - 3; i += forkStep) {
      if (hash2(Math.floor(effect.seed) + i, Math.floor(phase * 10), WORLD_SEED + i) < 0.32) continue;
      const point = points[i];
      const prev = points[i - 1];
      const next = points[i + 1];
      const tx = next.x - prev.x;
      const ty = next.y - prev.y;
      const tLen = Math.max(1, Math.hypot(tx, ty));
      const branchSide = lightningNoise(effect, phase, 7, i, 2) < 0 ? -1 : 1;
      const branchLength = Math.min(len * 0.18, (isBlood ? 34 : 52) * state.camera.zoom) * (0.55 + Math.abs(lightningNoise(effect, phase, 8, i, 3)) * 0.45);
      const end = {
        x: point.x + ((-ty / tLen) * branchSide + tx / tLen * 0.28) * branchLength,
        y: point.y + ((tx / tLen) * branchSide + ty / tLen * 0.28) * branchLength
      };
      const branch = buildFractalLightningPoints(point, end, effect, phase + i * 0.37, 2, 0.45);
      drawBoltPath(branch);
    }
  }
  ctx.restore();
}

function drawLightningImpact(point, effect, phase, travel) {
  const hitAlpha = clamp((travel - 0.78) / 0.22, 0, 1) * clamp(effect.life / effect.maxLife, 0.25, 1);
  const radius = (18 + Math.sin(phase * 1.4) * 4) * state.camera.zoom;
  ctx.save();
  ctx.globalAlpha = hitAlpha;
  ctx.strokeStyle = effect.secondaryColor;
  ctx.shadowColor = effect.secondaryColor;
  ctx.shadowBlur = 18;
  ctx.lineWidth = 2 * state.camera.zoom;
  ctx.beginPath();
  ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = effect.kind === "bloodHex" ? "rgba(130, 8, 54, 0.22)" : "rgba(113, 224, 255, 0.2)";
  ctx.beginPath();
  ctx.arc(point.x, point.y, radius * 0.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawParticles() {
  for (const p of state.particles) {
    const s = worldToScreen(p.x, p.y);
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.color;
    if (p.shape === "spark") {
      ctx.save();
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(s.x, s.y - 38 * state.camera.zoom, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else {
      ctx.fillRect(s.x, s.y - 38 * state.camera.zoom, p.size, p.size);
    }
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

function drawScreenEffects() {
  if (state.screenFlash <= 0) return;
  const alpha = clamp(state.screenFlash / 0.5, 0, 0.24);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#5b0d0d";
  ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  ctx.restore();
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
  const mapScale = 0.11 * state.camera.zoom;
  const cellX = (TILE_W / 2) * mapScale;
  const cellY = (TILE_H / 2) * mapScale;
  const centerX = miniMap.width / 2;
  const centerY = miniMap.height / 2;
  const bounds = visibleTileBounds(3);
  const tileCount = Math.max(1, (bounds.maxX - bounds.minX + 1) * (bounds.maxY - bounds.minY + 1));
  const step = Math.max(1, powerOfTwoCeil(Math.sqrt(tileCount / 1800)));
  const toMini = (x, y) => ({
    x: centerX + ((x - hero.x) - (y - hero.y)) * cellX,
    y: centerY + ((x - hero.x) + (y - hero.y)) * cellY
  });

  for (let y = Math.floor(bounds.minY / step) * step; y <= bounds.maxY; y += step) {
    for (let x = Math.floor(bounds.minX / step) * step; x <= bounds.maxX; x += step) {
      const tile = getTile(x, y);
      const p = toMini(x + step * 0.5, y + step * 0.5);
      miniCtx.fillStyle = tile.water ? "#075462" : tile.road ? "#76684b" : tile.biome === "ruins" ? "#4b4a42" : tile.biome === "marsh" ? "#1e5950" : "#303a24";
      miniCtx.beginPath();
      miniCtx.moveTo(p.x, p.y - cellY * step);
      miniCtx.lineTo(p.x + cellX * step, p.y);
      miniCtx.lineTo(p.x, p.y + cellY * step);
      miniCtx.lineTo(p.x - cellX * step, p.y);
      miniCtx.closePath();
      miniCtx.fill();
    }
  }
  miniCtx.fillStyle = "#d8a73a";
  for (const b of state.buildings) {
    if (b.x > bounds.maxX || b.x + b.w < bounds.minX || b.y > bounds.maxY || b.y + b.h < bounds.minY) continue;
    const p = toMini(b.x + b.w / 2, b.y + b.h / 2);
    miniCtx.fillRect(p.x - 3, p.y - 3, 6, 6);
  }
  miniCtx.fillStyle = "#df3b2f";
  for (const e of state.enemies) {
    if (e.dead || e.x < bounds.minX || e.x > bounds.maxX || e.y < bounds.minY || e.y > bounds.maxY) continue;
    const p = toMini(e.x, e.y);
    miniCtx.fillRect(p.x - 2, p.y - 2, 4, 4);
  }
  miniCtx.fillStyle = "#86a6ff";
  for (const h of state.heroes) {
    if (h.x < bounds.minX || h.x > bounds.maxX || h.y < bounds.minY || h.y > bounds.maxY) continue;
    const p = toMini(h.x, h.y);
    miniCtx.fillRect(p.x - 2, p.y - 2, 4, 4);
  }
  miniCtx.fillStyle = "#61d8ff";
  miniCtx.beginPath();
  miniCtx.arc(centerX, centerY, 4, 0, Math.PI * 2);
  miniCtx.fill();
  document.getElementById("miniMapZoom").textContent = `${Math.round(state.camera.zoom * 100)}%`;
}

function drawMiniMapThrottled(force = false) {
  const now = performance.now();
  const hero = activeHero();
  const key = `${Math.floor(hero.x)},${Math.floor(hero.y)},${state.camera.zoom.toFixed(2)},${state.enemies.length},${state.buildings.length}`;
  if (!force && key === lastMiniMapKey && now - lastMiniMapRender < MINIMAP_FRAME_MS) return;
  lastMiniMapKey = key;
  lastMiniMapRender = now;
  drawMiniMap();
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

function magicBurst(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    state.particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 2.8,
      vy: (Math.random() - 0.5) * 2.8,
      color,
      size: 2 + Math.random() * 5,
      life: 0.25 + Math.random() * 0.45,
      maxLife: 0.7,
      shape: "spark"
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
  window.ProgressionSystem?.applyDerivedStats(p);
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

function renderProgression() {
  const panel = document.getElementById("progressionPanel");
  if (!panel || !window.ProgressionSystem) return;
  const hero = activeHero();
  ProgressionSystem.normalizeHero(hero, skillInfo);
  const nextXp = ProgressionSystem.xpToNext(hero.level);
  const xpPercent = clamp(hero.xp / nextXp * 100, 0, 100);
  document.getElementById("progressionTitle").textContent = `${hero.name} Progression`;
  document.getElementById("heroLevel").textContent = hero.level;
  document.getElementById("attributePoints").textContent = hero.progression.attributePoints;
  document.getElementById("skillPoints").textContent = hero.progression.skillPoints;
  document.getElementById("xpText").textContent = `${hero.xp} / ${nextXp} XP`;
  document.getElementById("xpFill").style.width = `${xpPercent}%`;

  const attributeGrid = document.getElementById("attributeGrid");
  attributeGrid.innerHTML = "";
  for (const attr of ProgressionSystem.ATTRIBUTE_DEFS) {
    const value = hero.progression.attributes[attr.id] || 0;
    const row = document.createElement("div");
    row.className = "attribute-row";
    row.title = `${attr.name}: ${attr.perPoint}`;
    row.innerHTML = `
      <b>${attr.short}</b>
      <span>${attr.name}<small>${value} points</small></span>
      <button type="button" title="Spend attribute point" ${hero.progression.attributePoints <= 0 ? "disabled" : ""}>+</button>
    `;
    row.querySelector("button").addEventListener("click", () => spendAttribute(attr.id));
    attributeGrid.appendChild(row);
  }

  const skillTree = document.getElementById("skillTree");
  skillTree.innerHTML = "";
  for (const node of ProgressionSystem.skillNodes()) {
    const skill = skillInfo[node.id];
    if (!skill) continue;
    const known = hero.skills.known.includes(node.id);
    const rank = hero.skills.ranks[node.id] || 0;
    const check = ProgressionSystem.canSpendSkillPoint(hero, node.id, skillInfo);
    const card = document.createElement("div");
    card.className = `skill-node ${known ? "unlocked" : "locked"} ${rank >= ProgressionSystem.MAX_SKILL_RANK ? "maxed" : ""}`;
    const status = known ? `Rank ${rank}/${ProgressionSystem.MAX_SKILL_RANK}` : `Level ${node.level}`;
    const action = known ? "+" : "+";
    card.title = known
      ? `${skill.name}: ${skill.text}`
      : `${skill.name}: ${check.reason || "Locked"}`;
    card.innerHTML = `
      <span class="sprite" data-sprite="${skill.icon}"></span>
      <strong>${skill.name}</strong>
      <small>${node.branch} - ${status}</small>
      <button type="button" title="${check.ok ? "Spend skill point" : check.reason}" ${check.ok ? "" : "disabled"}>${action}</button>
    `;
    card.querySelector("button").addEventListener("click", () => spendSkill(node.id));
    skillTree.appendChild(card);
  }
  applySpriteStyles();
}

function spendAttribute(attrId) {
  const hero = activeHero();
  if (!window.ProgressionSystem?.spendAttributePoint(hero, attrId)) return;
  const attr = ProgressionSystem.ATTRIBUTE_DEFS.find(item => item.id === attrId);
  renderProgression();
  renderHud();
  saveGame(true);
  toast(`${attr?.name || "Attribute"} improved.`);
}

function spendSkill(skillId) {
  const hero = activeHero();
  const result = window.ProgressionSystem?.spendSkillPoint(hero, skillId, skillInfo);
  if (!result?.ok) {
    toast(result?.reason || "Skill locked.");
    return;
  }
  if (!hero.skills.bar.includes(skillId)) {
    const empty = hero.skills.bar.findIndex(slot => !slot);
    if (empty >= 0) hero.skills.bar[empty] = skillId;
  }
  state.selectedSkill = skillId;
  state.mode = skillId;
  renderProgression();
  renderInventory();
  renderHud();
  saveGame(true);
  toast(`${skillInfo[skillId].name} ${result.action === "unlock" ? "unlocked" : `rank ${result.rank}`}.`);
}

function toggleProgression(forceOpen = null) {
  const panel = document.getElementById("progressionPanel");
  if (!panel) return;
  const open = forceOpen ?? panel.classList.contains("collapsed");
  panel.classList.toggle("collapsed", !open);
  if (open) renderProgression();
}

function renderInventory() {
  const grid = document.getElementById("inventoryGrid");
  const hero = activeHero();
  document.querySelector("#inventoryPanel h2").textContent = `${hero.name} Inventory`;
  grid.innerHTML = "";
  const pageSize = 8;
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
        if (itemInfo[inv.id]?.type === "weapon") button.classList.add("weapon-slot");
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
    slot.classList.toggle("weapon-slot", itemInfo[id]?.type === "weapon");
    slot.innerHTML = `<span class="slot-label">${label}</span>${id ? `<span class="sprite" data-sprite="${id}"></span>` : ""}`;
    slot.ondragover = event => event.preventDefault();
    slot.ondrop = event => {
      event.preventDefault();
      equipDraggedItem(slot.dataset.slot);
    };
  });
  document.getElementById("goldCount").textContent = hero.gold;
  document.getElementById("runeCount").textContent = hero.inventory.find(i => i.id === "runeShard")?.qty || 0;
  renderSkills();
  applySpriteStyles();
}

function renderSkills() {
  const hero = activeHero();
  normalizeHeroSkills();
  const skillBar = document.getElementById("skillBar");
  const knownGrid = document.getElementById("knownSkillGrid");
  if (!skillBar || !knownGrid) return;
  const keys = ["1", "2", "3", "4", "5", "6"];
  skillBar.innerHTML = "";
  hero.skills.bar.forEach((id, index) => {
    const skill = skillInfo[id];
    const item = itemInfo[id];
    const effective = skill ? window.ProgressionSystem?.effectiveSkillSpec(hero, id, skillInfo) : null;
    const button = document.createElement("button");
    button.className = "skill";
    button.dataset.slot = index;
    button.title = skill ? `${skill.name} rank ${effective?.rank || 1} - ${skill.buff}` : item ? item.name : "Empty skill slot";
    if (skill && state.mode === id) button.classList.add("active");
    if (id) button.dataset.action = id;
    const icon = skill?.icon || id;
    button.innerHTML = id ? `<span class="sprite" data-sprite="${icon}"></span>` : "";
    button.addEventListener("click", () => activateHotbarSlot(index));
    button.addEventListener("dragover", event => event.preventDefault());
    button.addEventListener("drop", event => {
      event.preventDefault();
      assignDraggedSkill(index);
    });
    skillBar.appendChild(button);
  });

  knownGrid.innerHTML = "";
  for (const id of hero.skills.known) {
    const skill = skillInfo[id];
    if (!skill) continue;
    const effective = window.ProgressionSystem?.effectiveSkillSpec(hero, id, skillInfo);
    const button = document.createElement("button");
    button.className = "inventory-slot";
    if (state.selectedSkill === id) button.classList.add("selected");
    button.dataset.skill = id;
    button.draggable = true;
    button.title = `${skill.name} rank ${effective?.rank || 1} - ${skill.buff}`;
    button.innerHTML = `<span class="sprite" data-sprite="${skill.icon}"></span>`;
    button.addEventListener("click", () => selectSkill(id));
    button.addEventListener("dblclick", () => {
      const empty = hero.skills.bar.findIndex(slot => !slot);
      hero.skills.bar[empty >= 0 ? empty : 0] = id;
      state.mode = id;
      renderSkills();
      saveGame(true);
    });
    button.addEventListener("dragstart", event => {
      state.draggedSkill = id;
      event.dataTransfer.setData("text/plain", id);
    });
    knownGrid.appendChild(button);
  }
  applySpriteStyles();
}

function activateHotbarSlot(index) {
  const id = activeHero().skills.bar[index];
  if (!id) return;
  if (skillInfo[id]) {
    setMode(id);
    selectSkill(id);
  } else if (itemInfo[id]) {
    useItem(id);
  }
}

function assignDraggedSkill(index) {
  const id = state.draggedSkill;
  if (!id || !skillInfo[id]) return;
  activeHero().skills.bar[index] = id;
  state.mode = id;
  state.draggedSkill = null;
  renderSkills();
  saveGame(true);
}

function selectSkill(id) {
  const skill = skillInfo[id];
  if (!skill) return;
  const hero = activeHero();
  const effective = window.ProgressionSystem?.effectiveSkillSpec(hero, id, skillInfo) || skill;
  const rankText = effective.rank ? `Rank ${effective.rank}. ` : "";
  state.selectedSkill = id;
  state.selectedItem = null;
  document.getElementById("itemDetails").innerHTML = `<strong>${skill.name}</strong><span>${rankText}${skill.text} Buff: ${skill.buff}. Damage: ${effective.damage}. Cost: ${effective.cost} ${skill.resource}. Drag this skill onto the hotbar.</span>`;
  renderSkills();
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
  state.selectedSkill = null;
  const item = itemInfo[id] || {};
  document.getElementById("itemDetails").innerHTML = `<strong>${itemName(id)}</strong><span>${item.text || "A strange thing from the dark."} ${item.slot ? "Double click to equip." : item.use ? "Double click to use." : ""}</span>`;
  renderInventory();
}

function toggleInventory() {
  document.getElementById("inventoryPanel").classList.toggle("collapsed");
  updateHudLayout();
}

function restartGame() {
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
}

function setMode(mode) {
  if (!skillInfo[mode]) return;
  state.mode = mode;
  document.querySelectorAll(".skill[data-action]").forEach(btn => btn.classList.toggle("active", btn.dataset.action === mode));
  renderSkills();
}

let cameraDrag = null;
let suppressNextCanvasClick = false;
let editorResizeDrag = null;
let editorDraftMoveDrag = null;
let editorRectSelectDrag = null;
let editorLineDrag = null;
let editorPlanPainting = false;
let editorPlanModalDrag = null;
const CAMERA_DRAG_THRESHOLD = 4;

function editorSelectionBox(selection = state.editor.selected) {
  if (!selection) return null;
  const p = worldToScreen(selection.x, selection.y);
  const scale = editorScaleFor(selection.type, selection.id);
  const itemScale = Number.isFinite(selection.itemScale) ? selection.itemScale : 1;
  const z = state.camera.zoom;
  const base = {
    biome: selection.type === "biome"
      ? { w: editorBiomeSpriteSize(selection.id).width * WORLD_ITEM_DRAW_SCALE, h: editorBiomeSpriteSize(selection.id).height * WORLD_ITEM_DRAW_SCALE }
      : { w: 78, h: 86 },
    enemy: { w: 82, h: 96 },
    item: { w: 36 * WORLD_ITEM_DRAW_SCALE, h: 36 * WORLD_ITEM_DRAW_SCALE },
    forest: { w: 132, h: 132 }
  }[selection.type] || { w: 70, h: 70 };
  const width = base.w * z * scale * itemScale;
  const height = base.h * z * scale * itemScale;
  return { x: p.x - width / 2, y: p.y - height * 0.82, width, height, handle: { x: p.x + width / 2, y: p.y - height * 0.82 + height } };
}

function editorHandleHit(sx, sy) {
  const box = editorSelectionBox();
  if (!box) return false;
  return Math.hypot(sx - box.handle.x, sy - box.handle.y) <= 12;
}

function editorLineSamplePoints(start, end, category) {
  if (state.editor.lineShape === "circle") return editorCircleSamplePoints(start, end, category);
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy);
  const spacing = editorLineSpacingFor(category);
  const count = clamp(Math.floor(length / spacing) + 1, 1, 120);
  const normalX = length ? -dy / length : 0;
  const normalY = length ? dx / length : 0;
  const curve = state.editor.lineShape === "curved" ? length * 0.28 : 0;
  const curveSide = hash2(Math.floor(start.x * 11), Math.floor(start.y * 11), WORLD_SEED + 1487) > 0.5 ? 1 : -1;
  const points = [];
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0 : i / (count - 1);
    const curveOffset = Math.sin(t * Math.PI) * curve * curveSide;
    const x = start.x + dx * t + normalX * curveOffset;
    const y = start.y + dy * t + normalY * curveOffset;
    const jitter = (hash2(Math.floor(x * 31), Math.floor(y * 31), WORLD_SEED + i * 17) - 0.5) * spacing * 0.42;
    points.push({ x: x + normalX * jitter, y: y + normalY * jitter });
  }
  return points;
}

function editorCircleSamplePoints(center, edge, category) {
  const radius = Math.hypot(edge.x - center.x, edge.y - center.y);
  if (radius <= 0.05) return [{ x: center.x, y: center.y }];
  const spacing = editorLineSpacingFor(category);
  const count = clamp(Math.round((Math.PI * 2 * radius) / spacing), 8, 160);
  const points = [];
  for (let i = 0; i < count; i++) {
    const angle = -Math.PI / 2 + (i / count) * Math.PI * 2;
    points.push({
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius
    });
  }
  return points;
}

function editorWallBounds(start, end) {
  let minX = Math.floor(Math.min(start.x, end.x));
  let maxX = Math.ceil(Math.max(start.x, end.x));
  let minY = Math.floor(Math.min(start.y, end.y));
  let maxY = Math.ceil(Math.max(start.y, end.y));
  if (maxX - minX < 2) {
    const centerX = Math.round((minX + maxX) / 2);
    minX = centerX - 1;
    maxX = centerX + 1;
  }
  if (maxY - minY < 2) {
    const centerY = Math.round((minY + maxY) / 2);
    minY = centerY - 1;
    maxY = centerY + 1;
  }
  return { minX, maxX, minY, maxY };
}

function wallTileSequence(min, max, spacing) {
  const step = clamp(Math.round(spacing) || 1, 1, 6);
  const values = [];
  for (let value = min; value <= max; value += step) values.push(value);
  if (!values.includes(max)) values.push(max);
  return values;
}

function editorWallItemsForRect(start, end, spacing = 1) {
  const bounds = editorWallBounds(start, end);
  const wallSpacing = clamp(Math.round(spacing) || 1, 1, 6);
  const gateX = Math.round((bounds.minX + bounds.maxX) / 2);
  const items = [];
  const usedTiles = new Set();
  const push = (id, x, y, wallSide, wallRole, itemScale = 1, flipX = false) => {
    const tileX = Math.round(x);
    const tileY = Math.round(y);
    const key = `${tileX},${tileY}`;
    if (usedTiles.has(key)) return;
    usedTiles.add(key);
    items.push({
      asset: { type: "biome", id },
      point: { x: tileX, y: tileY },
      layer: "building",
      itemScale,
      rotation: 0,
      flipX,
      wallSide,
      wallRole,
      wallSpacing
    });
  };

  for (const x of wallTileSequence(bounds.minX, bounds.maxX, wallSpacing)) {
    push(WALL_SPRITES.segment, x, bounds.minY, "back", "segment", 1, false);
    if (x !== gateX) push(WALL_SPRITES.segment, x, bounds.maxY, "front", "segment", 1, false);
  }
  for (const y of wallTileSequence(bounds.minY, bounds.maxY, wallSpacing)) {
    if (y <= bounds.minY || y >= bounds.maxY) continue;
    push(WALL_SPRITES.segment, bounds.minX, y, "top", "segment", 1, true);
    push(WALL_SPRITES.segment, bounds.maxX, y, "bottom", "segment", 1, true);
  }
  push(WALL_SPRITES.gate, gateX, bounds.maxY, "gate", "gate", 1, false);
  return items;
}

function commitEditorLine(start, end) {
  const category = state.editor.lineCategory;
  if (!editorLineAssetPool(category).length) {
    toast("Biome assets are still loading.");
    return;
  }
  const points = editorLineSamplePoints(start, end, category);
  if (!points.length) return;
  for (const [index, point] of points.entries()) {
    const assetCategory = category === "biome" ? editorCategoryForBiome(point.x, point.y) : category;
    const asset = randomLineAsset(assetCategory, point.x, point.y, index);
    addAssetToDraft(asset, point, { render: false, layer: editorLayerForAsset(asset), ...editorVariationForAsset(asset, assetCategory, point.x, point.y, index, 0.8) });
  }
  renderEditorDraft();
  updateEditorSelectedUi();
  saveGame(true);
  toast(`Added ${points.length} ${category} item${points.length === 1 ? "" : "s"}.`);
}

function commitEditorWall(start, end) {
  if (!biomeSprites[WALL_SPRITES.gate]) {
    toast("Wall assets are still loading.");
    return;
  }
  const items = editorWallItemsForRect(start, end);
  const wallGroupId = `wall-${Date.now()}-${Math.floor(hash2(Math.floor(start.x * 10), Math.floor(start.y * 10), WORLD_SEED + 1663) * 100000)}`;
  for (const item of items) {
    addAssetToDraft(item.asset, item.point, {
      render: false,
      layer: item.layer,
      itemScale: item.itemScale,
      rotation: item.rotation,
      flipX: item.flipX,
      wallGroupId,
      wallSide: item.wallSide,
      wallRole: item.wallRole,
      wallSpacing: item.wallSpacing
    });
  }
  renderEditorDraft();
  updateEditorSelectedUi();
  saveGame(true);
  toast(`Added tile-spaced wall with ${items.length} pieces and one front gate.`);
}

function scatterFillEditorDraft() {
  const center = state.editor.draft.anchor || activeHero();
  const density = clamp(Number(state.editor.brushDensity) || 4, 1, 10);
  const radius = 2.2 + density * 0.32;
  const count = Math.round(8 + density * 5);
  const category = state.editor.lineCategory === "biome" ? editorCategoryForBiome(center.x, center.y) : state.editor.lineCategory;
  if (!state.editor.draft.anchor) state.editor.draft.anchor = { x: center.x, y: center.y };
  for (let i = 0; i < count; i++) {
    const angle = hash2(i, Math.floor(center.x * 19), WORLD_SEED + 1501) * Math.PI * 2;
    const dist = Math.sqrt(hash2(i, Math.floor(center.y * 19), WORLD_SEED + 1511)) * radius;
    const point = {
      x: center.x + Math.cos(angle) * dist,
      y: center.y + Math.sin(angle) * dist * 0.72
    };
    const assetCategory = state.editor.lineCategory === "biome" ? editorCategoryForBiome(point.x, point.y) : category;
    const asset = randomLineAsset(assetCategory, point.x, point.y, i);
    addAssetToDraft(asset, point, { render: false, layer: editorLayerForAsset(asset), ...editorVariationForAsset(asset, assetCategory, point.x, point.y, i, 1) });
  }
  renderEditorDraft();
  updateEditorSelectedUi();
  saveGame(true);
  toast(`Scatter-filled ${count} ${category} items.`);
}

function saveVariantFromSelection() {
  const draft = state.editor.draft;
  const selected = [...new Set(state.editor.selectedDraftIndexes || [])].filter(index => Number.isInteger(index) && draft.items[index]);
  const indexes = selected.length ? selected : draft.items.map((_, index) => index);
  if (!indexes.length || !draft.anchor) {
    toast("Select or draw a cluster first.");
    return;
  }
  const entries = indexes.map(index => {
    const item = draft.items[index];
    return {
      item,
      x: draft.anchor.x + (item.dx || 0),
      y: draft.anchor.y + (item.dy || 0)
    };
  });
  const center = entries.reduce((sum, entry) => ({
    x: sum.x + entry.x / entries.length,
    y: sum.y + entry.y / entries.length
  }), { x: 0, y: 0 });
  const variantSeed = Date.now() % 100000;
  const prefab = {
    id: `prefab-${Date.now()}`,
    name: `${draft.name?.trim() || "Cluster"} Variant`,
    occurrence: clamp(Number(draft.occurrence) || 4, 1, 10),
    items: entries.map((entry, index) => {
      const spacing = 0.82 + hash2(index, variantSeed, WORLD_SEED + 1523) * 0.42;
      const jitter = (hash2(index, variantSeed, WORLD_SEED + 1531) - 0.5) * 0.42;
      const variation = editorVariationFor(entry.x + variantSeed, entry.y - variantSeed, index, 1.25);
      return {
        ...entry.item,
        dx: (entry.x - center.x) * spacing + jitter,
        dy: (entry.y - center.y) * spacing - jitter * 0.6,
        itemScale: clamp((entry.item.itemScale || 1) * variation.itemScale, 0.65, 1.45),
        rotation: (entry.item.rotation || 0) + variation.rotation
      };
    })
  };
  state.editor.prefabs.push(prefab);
  saveGame(true);
  renderSavedPrefabs();
  toast(`${prefab.name} saved.`);
}

function drawEditorSelection() {
  if (!state.editor.open) return;
  ctx.save();
  if (state.editor.planView) drawPlanViewMarker();
  const selectedDraftIndexes = state.editor.selectedDraftIndexes || [];
  if (selectedDraftIndexes.length > 1) {
    for (const index of selectedDraftIndexes) {
      const selection = editorDraftSelection(index);
      const box = editorSelectionBox(selection);
      if (!box) continue;
      ctx.strokeStyle = "#7bdff2";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(box.x, box.y, box.width, box.height);
    }
  } else {
    const box = editorSelectionBox();
    if (box) {
      ctx.strokeStyle = "#f0c46a";
      ctx.lineWidth = 2;
      ctx.setLineDash([7, 5]);
      ctx.strokeRect(box.x, box.y, box.width, box.height);
      ctx.setLineDash([]);
      ctx.fillStyle = "#10100d";
      ctx.strokeStyle = "#ffe2a0";
      ctx.fillRect(box.handle.x - 6, box.handle.y - 6, 12, 12);
      ctx.strokeRect(box.handle.x - 6, box.handle.y - 6, 12, 12);
    }
  }
  const rect = editorDragRect();
  if (rect) {
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(123, 223, 242, 0.14)";
    ctx.strokeStyle = "rgba(123, 223, 242, 0.9)";
    ctx.lineWidth = 1.5;
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
  }
  if (editorLineDrag) {
    ctx.setLineDash([10, 7]);
    ctx.strokeStyle = "#f0c46a";
    ctx.lineWidth = 2;
    const lineShape = state.editor.lineShape;
    if (lineShape === "circle") {
      const points = editorLineSamplePoints(editorLineDrag.startWorld, editorLineDrag.currentWorld, state.editor.lineCategory);
      ctx.beginPath();
      points.forEach((point, index) => {
        const p = worldToScreen(point.x, point.y);
        if (index === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.stroke();
    } else if (lineShape === "wall") {
      const bounds = editorWallBounds(editorLineDrag.startWorld, editorLineDrag.currentWorld);
      const corners = [
        worldToScreen(bounds.minX, bounds.minY),
        worldToScreen(bounds.maxX, bounds.minY),
        worldToScreen(bounds.maxX, bounds.maxY),
        worldToScreen(bounds.minX, bounds.maxY)
      ];
      ctx.beginPath();
      corners.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.closePath();
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(editorLineDrag.startScreen.x, editorLineDrag.startScreen.y);
      ctx.lineTo(editorLineDrag.x, editorLineDrag.y);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(240, 196, 106, 0.9)";
    const previewPoints = lineShape === "wall"
      ? editorWallItemsForRect(editorLineDrag.startWorld, editorLineDrag.currentWorld).map(item => ({ ...item.point, gate: item.asset.id === WALL_SPRITES.gate }))
      : editorLineSamplePoints(editorLineDrag.startWorld, editorLineDrag.currentWorld, state.editor.lineCategory);
    for (const point of previewPoints) {
      const p = worldToScreen(point.x, point.y);
      ctx.fillStyle = point.gate ? "rgba(123, 223, 242, 0.95)" : "rgba(240, 196, 106, 0.9)";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function editorPickObject(world) {
  const candidates = [];
  const add = (type, id, x, y, name, radius = 1) => {
    const d = Math.hypot(world.x - x, world.y - y);
    if (d <= radius) candidates.push({ type, id, x, y, name, d });
  };

  for (const enemyState of state.enemies) if (!enemyState.dead) add("enemy", enemyState.sprite, enemyState.x, enemyState.y, enemyState.name, 1.1);
  for (const loot of state.loot) add("item", loot.id, loot.x, loot.y, itemName(loot.id), 0.9);
  for (const instance of getEditorPrefabInstances(visibleTileBounds(4))) {
    for (const [index, item] of instance.prefab.items.entries()) {
      if (instance.deletedItems?.includes(index)) continue;
      if (!editorLayerVisible(item.layer)) continue;
      const before = candidates.length;
      add(item.type, item.id, instance.x + (item.dx || 0), instance.y + (item.dy || 0), editorAssetName(item), 0.65);
      if (candidates.length > before) {
        Object.assign(candidates[candidates.length - 1], {
          placementId: instance.placementId,
          itemIndex: index,
          manual: instance.manual
        });
      }
    }
  }
  if (state.editor.draft.anchor) {
    for (const [index, item] of state.editor.draft.items.entries()) {
      if (!editorLayerVisible(item.layer)) continue;
      const before = candidates.length;
      add(item.type, item.id, state.editor.draft.anchor.x + (item.dx || 0), state.editor.draft.anchor.y + (item.dy || 0), editorAssetName(item), 0.65);
      if (candidates.length > before) candidates[candidates.length - 1].draftIndex = index;
    }
  }
  for (const building of state.buildings) {
    if (building.biomeAsset) add("biome", building.biomeAsset, building.x + building.w / 2, building.y + building.h / 2, building.name, 2.2);
  }

  const minX = Math.floor(world.x - 2);
  const maxX = Math.ceil(world.x + 2);
  const minY = Math.floor(world.y - 2);
  const maxY = Math.ceil(world.y + 2);
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const tile = tileFromSeed(x, y);
      if (tile?.prop && !isDestroyedProp(tile.prop, x, y)) {
        const before = candidates.length;
        add("biome", tile.prop, x, y, tile.prop.replaceAll("_", " "), 0.95);
        if (candidates.length > before) Object.assign(candidates[candidates.length - 1], { generatedProp: true, propX: x, propY: y });
      }
      if (tile?.forest && !tile.water) add("forest", "cluster", x, y, "Forest cluster", 1.2);
    }
  }

  return candidates.sort((a, b) => a.d - b.d)[0] || null;
}

function editorPickDraftItem(world) {
  const anchor = state.editor.draft.anchor;
  if (!anchor) return null;
  return state.editor.draft.items
    .map((item, index) => ({
      item,
      index,
      x: anchor.x + (item.dx || 0),
      y: anchor.y + (item.dy || 0),
      d: Math.hypot(world.x - (anchor.x + (item.dx || 0)), world.y - (anchor.y + (item.dy || 0)))
    }))
    .filter(candidate => candidate.d <= 1.1)
    .sort((a, b) => b.index - a.index || a.d - b.d)[0] || null;
}

function editorDraftSelection(index) {
  const item = state.editor.draft.items[index];
  const anchor = state.editor.draft.anchor;
  if (!item || !anchor) return null;
  return {
    type: item.type,
    id: item.id,
    x: anchor.x + (item.dx || 0),
    y: anchor.y + (item.dy || 0),
    itemScale: item.itemScale,
    rotation: item.rotation,
    flipX: item.flipX,
    wallGroupId: item.wallGroupId,
    wallSide: item.wallSide,
    wallRole: item.wallRole,
    wallSpacing: item.wallSpacing,
    draftIndex: index
  };
}

function editorDragRect() {
  if (!editorRectSelectDrag) return null;
  const x = Math.min(editorRectSelectDrag.startX, editorRectSelectDrag.x);
  const y = Math.min(editorRectSelectDrag.startY, editorRectSelectDrag.y);
  return {
    x,
    y,
    width: Math.abs(editorRectSelectDrag.x - editorRectSelectDrag.startX),
    height: Math.abs(editorRectSelectDrag.y - editorRectSelectDrag.startY)
  };
}

function editorSelectDraftItemsInRect(rect) {
  const anchor = state.editor.draft.anchor;
  const items = state.editor.draft.items || [];
  if (!anchor || !items.length) {
    state.editor.selectedDraftIndexes = [];
    state.editor.selected = null;
    updateEditorSelectedUi();
    return;
  }
  const indexes = [];
  items.forEach((item, index) => {
    const p = worldToScreen(anchor.x + (item.dx || 0), anchor.y + (item.dy || 0));
    if (p.x >= rect.x && p.x <= rect.x + rect.width && p.y >= rect.y && p.y <= rect.y + rect.height) {
      indexes.push(index);
    }
  });
  state.editor.selectedDraftIndexes = indexes;
  state.editor.selected = indexes.length === 1 ? editorDraftSelection(indexes[0]) : null;
  updateEditorSelectedUi();
  if (indexes.length) toast(`${indexes.length} item${indexes.length === 1 ? "" : "s"} selected.`);
}

function handleEditorPointerDown(event) {
  if (!state.editor.open) return;
  const rect = canvas.getBoundingClientRect();
  const sx = event.clientX - rect.left;
  const sy = event.clientY - rect.top;
  const world = screenToWorld(sx, sy);
  if (state.editor.planView) {
    if (event.button !== 0) return;
    placePlanViewMarker(world);
    suppressNextCanvasClick = true;
    event.preventDefault();
    event.stopImmediatePropagation();
    return;
  }

  if (state.editor.placingPrefabId) {
    if (event.button !== 0) return;
    placeEditorPrefab(state.editor.placingPrefabId, world.x, world.y);
    state.editor.selectedDraftIndexes = [];
    suppressNextCanvasClick = true;
    event.preventDefault();
    event.stopImmediatePropagation();
    return;
  }

  if (event.button === 2) {
    event.preventDefault();
    event.stopImmediatePropagation();
    return;
  }
  if (event.button !== 0) return;

  if (state.editor.lineMode) {
    editorLineDrag = {
      pointerId: event.pointerId,
      startWorld: world,
      currentWorld: world,
      startScreen: { x: sx, y: sy },
      x: sx,
      y: sy
    };
    state.editor.selected = null;
    state.editor.selectedDraftIndexes = [];
    hideEditorContextMenu();
    updateEditorSelectedUi();
    canvas.setPointerCapture?.(event.pointerId);
    suppressNextCanvasClick = true;
    event.preventDefault();
    event.stopImmediatePropagation();
    return;
  }

  if (editorHandleHit(sx, sy)) {
    const selected = state.editor.selected;
    editorResizeDrag = {
      pointerId: event.pointerId,
      type: selected.type,
      id: selected.id,
      startX: event.clientX,
      startY: event.clientY,
      startScale: editorScaleFor(selected.type, selected.id)
    };
    canvas.setPointerCapture?.(event.pointerId);
    suppressNextCanvasClick = true;
    event.preventDefault();
    event.stopImmediatePropagation();
    return;
  }

  const draftItem = editorPickDraftItem(world);
  if (draftItem) {
    state.editor.selected = editorDraftSelection(draftItem.index);
    const selectedIndexes = state.editor.selectedDraftIndexes || [];
    const wallGroupIndexes = isWallEditorItem(draftItem.item) && !event.altKey
      ? editorWallGroupIndexes(draftItem.item.wallGroupId)
      : [];
    let indexes = [draftItem.index];
    if (selectedIndexes.includes(draftItem.index) && selectedIndexes.length > 1) {
      indexes = selectedIndexes;
    } else if (wallGroupIndexes.length) {
      indexes = wallGroupIndexes;
    }
    state.editor.selectedDraftIndexes = indexes;
    editorDraftMoveDrag = {
      pointerId: event.pointerId,
      index: draftItem.index,
      indexes,
      startWorld: world,
      starts: indexes.map(index => {
        const item = state.editor.draft.items[index];
        return { index, dx: item?.dx || 0, dy: item?.dy || 0 };
      })
    };
    updateEditorSelectedUi();
    canvas.setPointerCapture?.(event.pointerId);
    suppressNextCanvasClick = true;
    event.preventDefault();
    event.stopImmediatePropagation();
    return;
  }

  const picked = editorPickObject(world);
  if (picked) {
    state.editor.selected = picked;
    state.editor.selectedDraftIndexes = Number.isInteger(picked.draftIndex) ? [picked.draftIndex] : [];
    updateEditorSelectedUi();
    suppressNextCanvasClick = true;
    event.preventDefault();
    event.stopImmediatePropagation();
    return;
  }

  state.editor.selected = null;
  state.editor.selectedDraftIndexes = [];
  editorRectSelectDrag = {
    pointerId: event.pointerId,
    startX: sx,
    startY: sy,
    x: sx,
    y: sy
  };
  updateEditorSelectedUi();
  canvas.setPointerCapture?.(event.pointerId);
  suppressNextCanvasClick = true;
  event.preventDefault();
  event.stopImmediatePropagation();
}

function placePlanViewMarker(world) {
  state.editor.planDraft.anchor = { x: world.x, y: world.y };
  state.editor.selected = null;
  state.editor.selectedDraftIndexes = [];
  updateEditorSelectedUi();
  renderEditorPlanTools();
  saveGame(true);
  toast("Plan center marker placed.");
}

function handleEditorPointerMove(event) {
  if (state.editor.planView) return;
  if (editorLineDrag && editorLineDrag.pointerId === event.pointerId) {
    const rect = canvas.getBoundingClientRect();
    editorLineDrag.x = event.clientX - rect.left;
    editorLineDrag.y = event.clientY - rect.top;
    editorLineDrag.currentWorld = screenToWorld(editorLineDrag.x, editorLineDrag.y);
    event.preventDefault();
    return;
  }
  if (handleEditorDraftMove(event)) return;
  if (editorRectSelectDrag && editorRectSelectDrag.pointerId === event.pointerId) {
    const rect = canvas.getBoundingClientRect();
    editorRectSelectDrag.x = event.clientX - rect.left;
    editorRectSelectDrag.y = event.clientY - rect.top;
    event.preventDefault();
    return;
  }
  if (!editorResizeDrag || editorResizeDrag.pointerId !== event.pointerId) return;
  const delta = (event.clientX - editorResizeDrag.startX) - (event.clientY - editorResizeDrag.startY);
  setEditorScale(editorResizeDrag.type, editorResizeDrag.id, editorResizeDrag.startScale * (1 + delta / 140));
  event.preventDefault();
}

function handleEditorDraftMove(event) {
  if (!editorDraftMoveDrag || editorDraftMoveDrag.pointerId !== event.pointerId) return false;
  const rect = canvas.getBoundingClientRect();
  const world = screenToWorld(event.clientX - rect.left, event.clientY - rect.top);
  const deltaX = world.x - editorDraftMoveDrag.startWorld.x;
  const deltaY = world.y - editorDraftMoveDrag.startWorld.y;
  for (const start of editorDraftMoveDrag.starts || []) {
    const item = state.editor.draft.items[start.index];
    if (!item) continue;
    item.dx = start.dx + deltaX;
    item.dy = start.dy + deltaY;
  }
  state.editor.selected = editorDraftSelection(editorDraftMoveDrag.index);
  updateEditorSelectedUi();
  event.preventDefault();
  return true;
}

function handleEditorPointerUp(event) {
  if (editorLineDrag && editorLineDrag.pointerId === event.pointerId) {
    const drag = editorLineDrag;
    editorLineDrag = null;
    canvas.releasePointerCapture?.(event.pointerId);
    if (Math.hypot(drag.currentWorld.x - drag.startWorld.x, drag.currentWorld.y - drag.startWorld.y) >= 0.12) {
      if (state.editor.lineShape === "wall") commitEditorWall(drag.startWorld, drag.currentWorld);
      else commitEditorLine(drag.startWorld, drag.currentWorld);
    }
    event.preventDefault();
    return;
  }
  if (editorDraftMoveDrag && editorDraftMoveDrag.pointerId === event.pointerId) {
    editorDraftMoveDrag = null;
    canvas.releasePointerCapture?.(event.pointerId);
    saveGame(true);
    event.preventDefault();
    return;
  }
  if (editorRectSelectDrag && editorRectSelectDrag.pointerId === event.pointerId) {
    const rect = editorDragRect();
    const shouldSelect = rect && Math.hypot(rect.width, rect.height) >= 8;
    editorRectSelectDrag = null;
    canvas.releasePointerCapture?.(event.pointerId);
    if (shouldSelect) editorSelectDraftItemsInRect(rect);
    else updateEditorSelectedUi();
    event.preventDefault();
    return;
  }
  if (!editorResizeDrag || editorResizeDrag.pointerId !== event.pointerId) return;
  editorResizeDrag = null;
  canvas.releasePointerCapture?.(event.pointerId);
  saveGame(true);
  event.preventDefault();
}

function startCameraDrag(event) {
  if (state.editor.open && (state.editor.placingPrefabId || state.editor.selected)) return;
  if (event.button !== 0 && event.button !== 1 && event.button !== 2) return;
  if (event.button !== 0) event.preventDefault();
  cameraDrag = {
    pointerId: event.pointerId,
    button: event.button,
    startX: event.clientX,
    startY: event.clientY,
    x: event.clientX,
    y: event.clientY,
    moved: false
  };
  if (event.button !== 0) state.camera.mode = "free";
  canvas.setPointerCapture?.(event.pointerId);
}

function moveCameraDrag(event) {
  if (!cameraDrag || cameraDrag.pointerId !== event.pointerId) return;
  const totalMoved = Math.hypot(event.clientX - cameraDrag.startX, event.clientY - cameraDrag.startY);
  if (cameraDrag.button === 0 && !cameraDrag.moved && totalMoved < CAMERA_DRAG_THRESHOLD) return;
  cameraDrag.moved = true;
  state.camera.mode = "free";
  event.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const before = screenToWorld(cameraDrag.x - rect.left, cameraDrag.y - rect.top);
  const after = screenToWorld(event.clientX - rect.left, event.clientY - rect.top);
  const dx = before.x - after.x;
  const dy = before.y - after.y;
  state.camera.x += dx;
  state.camera.y += dy;
  state.camera.targetX += dx;
  state.camera.targetY += dy;
  cameraDrag.x = event.clientX;
  cameraDrag.y = event.clientY;
}

function endCameraDrag(event) {
  if (!cameraDrag || cameraDrag.pointerId !== event.pointerId) return;
  suppressNextCanvasClick = !!cameraDrag.moved;
  cameraDrag = null;
  canvas.releasePointerCapture?.(event.pointerId);
}

function handleCanvasClick(event) {
  if (cameraDrag || suppressNextCanvasClick) {
    suppressNextCanvasClick = false;
    return;
  }
  if (state.editor.open) return;
  const rect = canvas.getBoundingClientRect();
  const sx = event.clientX - rect.left;
  const sy = event.clientY - rect.top;
  const world = screenToWorld(sx, sy);
  const target = state.enemies
    .concat(state.animals || [])
    .filter(e => !e.dead)
    .map(e => ({ e, d: Math.hypot(e.x - world.x, e.y - world.y) }))
    .sort((a, b) => a.d - b.d)[0];
  const propTarget = nearestDestructibleProp(world, 0.9);
  if (target && target.d < 0.9 && (!propTarget || target.d <= propTarget.d)) attack(target.e);
  else if (propTarget) attack(propTarget.target);
  else if (!tileBlocked(world.x, world.y)) {
    const hero = activeHero();
    const clickStep = Math.min(0.38, Math.hypot(world.x - hero.x, world.y - hero.y) * 0.12);
    moveEntityToward(hero, world.x, world.y, clickStep, { maxDistance: 14 });
  }
}

function hideEditorContextMenu() {
  const menu = document.getElementById("editorContextMenu");
  if (menu) menu.hidden = true;
  state.editor.contextTarget = null;
}

function showEditorContextMenu(event, target) {
  const menu = document.getElementById("editorContextMenu");
  if (!menu || !target) return;
  state.editor.contextTarget = target;
  const wallItem = Number.isInteger(target.draftIndex) ? state.editor.draft.items[target.draftIndex] : null;
  const wallOnly = isWallEditorItem(wallItem);
  ["editorContextCycleWall", "editorContextResizeWall", "editorContextSelectWallSide", "editorContextSelectWallGroup"].forEach(id => {
    const button = document.getElementById(id);
    if (button) button.hidden = !wallOnly;
  });
  const cycleButton = document.getElementById("editorContextCycleWall");
  if (cycleButton && wallOnly) {
    cycleButton.textContent = wallItem.id === WALL_SPRITES.gate ? "Replace With Segment" : "Replace With Gate";
    cycleButton.hidden = !(wallItem.wallSide === "front" || wallItem.wallSide === "gate");
  }
  menu.style.left = `${event.clientX}px`;
  menu.style.top = `${event.clientY}px`;
  menu.hidden = false;
}

function deleteEditorTarget(target = state.editor.contextTarget || state.editor.selected) {
  if (!target) return;
  if (Number.isInteger(target.draftIndex)) {
    const indexes = (state.editor.selectedDraftIndexes || []).length > 1 && state.editor.selectedDraftIndexes.includes(target.draftIndex)
      ? state.editor.selectedDraftIndexes
      : [target.draftIndex];
    removeDraftItems(indexes);
    hideEditorContextMenu();
    toast("Removed from draft.");
    return;
  }
  if (target.placementId && Number.isInteger(target.itemIndex)) {
    const placement = state.editor.placements.find(entry => entry.id === target.placementId);
    if (placement) {
      placement.deletedItems = [...new Set([...(placement.deletedItems || []), target.itemIndex])];
      state.editor.selected = null;
      saveGame(true);
      hideEditorContextMenu();
      toast("Removed placed sprite.");
      return;
    }
  }
  if (target.generatedProp) {
    state.worldEdits[worldEditKey("prop", propWorldId(target.id, target.propX, target.propY))] = { dead: true };
    state.editor.selected = null;
    saveGame(true);
    hideEditorContextMenu();
    toast("Removed world sprite.");
  }
}

function handleEditorContextMenu(event) {
  if (!state.editor.open || state.editor.planView) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  const rect = canvas.getBoundingClientRect();
  const world = screenToWorld(event.clientX - rect.left, event.clientY - rect.top);
  const draftItem = editorPickDraftItem(world);
  const target = draftItem
    ? editorDraftSelection(draftItem.index)
    : editorPickObject(world);
  if (!target) {
    hideEditorContextMenu();
    return;
  }
  state.editor.selected = target;
  state.editor.selectedDraftIndexes = Number.isInteger(target.draftIndex) ? [target.draftIndex] : [];
  updateEditorSelectedUi();
  showEditorContextMenu(event, target);
}

function handleEditorDoubleClick(event) {
  if (!state.editor.open || state.editor.lineMode || state.editor.planView) return;
  const rect = canvas.getBoundingClientRect();
  const world = screenToWorld(event.clientX - rect.left, event.clientY - rect.top);
  const draftItem = editorPickDraftItem(world);
  if (!draftItem || !isWallEditorItem(draftItem.item)) return;
  state.editor.selected = editorDraftSelection(draftItem.index);
  if (event.shiftKey) selectWallGroupFromTarget(state.editor.selected);
  else selectWallSideFromTarget(state.editor.selected);
  event.preventDefault();
  event.stopImmediatePropagation();
}

function handleEditorWallWheel(event) {
  return false;
}

function handleEditorWallArrowKey(event, key) {
  if (!state.editor.open || state.editor.lineMode || state.editor.placingPrefabId) return false;
  if (!["arrowright", "arrowleft", "arrowup", "arrowdown"].includes(key)) return false;
  const groupId = activeWallGroupId();
  if (!groupId) return false;
  if (key === "arrowright" && resizeWallGroup(groupId, 1)) toast("Increased wall by one tile per side.");
  else if (key === "arrowleft" && resizeWallGroup(groupId, -1)) toast("Reduced wall by one tile per side.");
  else if (key === "arrowup" && adjustWallGroupSpacing(groupId, 1)) toast(`Wall spacing: every ${wallGroupSpacing(groupId)} tile${wallGroupSpacing(groupId) === 1 ? "" : "s"}.`);
  else if (key === "arrowdown" && adjustWallGroupSpacing(groupId, -1)) toast(`Wall spacing: every ${wallGroupSpacing(groupId)} tile${wallGroupSpacing(groupId) === 1 ? "" : "s"}.`);
  else return false;
  event.preventDefault();
  event.stopImmediatePropagation();
  return true;
}

function toggleEditor(forceOpen = null) {
  state.editor.open = forceOpen ?? !state.editor.open;
  if (!state.editor.open) {
    state.editor.placingPrefabId = null;
    state.editor.selected = null;
    state.editor.selectedDraftIndexes = [];
    editorDraftMoveDrag = null;
    editorResizeDrag = null;
    editorRectSelectDrag = null;
    editorLineDrag = null;
    editorPlanPainting = false;
    hideEditorContextMenu();
  }
  renderEditorPanel();
}

function bindEditorEvents() {
  document.getElementById("editorToggle").addEventListener("click", () => toggleEditor());
  document.getElementById("closeEditor").addEventListener("click", () => toggleEditor(false));
  const scaleInput = document.getElementById("editorScaleInput");
  scaleInput.addEventListener("change", () => {
    const selected = state.editor.selected;
    if (selected) setEditorScale(selected.type, selected.id, scaleInput.value);
  });
  document.getElementById("editorLineModeToggle")?.addEventListener("click", () => {
    state.editor.lineMode = !state.editor.lineMode;
    if (state.editor.lineMode) state.editor.planView = false;
    state.editor.placingPrefabId = null;
    hideEditorContextMenu();
    renderEditorPanel();
  });
  document.getElementById("editorPlanViewToggle")?.addEventListener("click", () => {
    state.editor.planView = !state.editor.planView;
    if (state.editor.planView) {
      state.editor.lineMode = false;
      state.editor.placingPrefabId = null;
    }
    hideEditorContextMenu();
    renderEditorPanel();
  });
  document.getElementById("editorLineCategory")?.addEventListener("change", event => {
    state.editor.lineCategory = event.target.value;
    updateEditorSelectedUi();
  });
  document.getElementById("editorLineShape")?.addEventListener("change", event => {
    state.editor.lineShape = ["straight", "curved", "circle", "wall"].includes(event.target.value) ? event.target.value : "straight";
    updateEditorSelectedUi();
  });
  document.getElementById("editorBrushDensity")?.addEventListener("input", event => {
    state.editor.brushDensity = clamp(Number(event.target.value) || 4, 1, 10);
    updateEditorSelectedUi();
  });
  document.getElementById("editorScatterFill")?.addEventListener("click", scatterFillEditorDraft);
  document.getElementById("editorVariantCluster")?.addEventListener("click", saveVariantFromSelection);
  document.getElementById("editorPlanTileset")?.addEventListener("change", event => {
    state.editor.planDraft.tileset = PLAN_TILESET_DEFS[event.target.value] ? event.target.value : "village";
    renderEditorPlanTools();
    saveGame(true);
  });
  document.getElementById("savePlanSpawn")?.addEventListener("click", saveCurrentPlan);
  document.getElementById("savePlanViewModal")?.addEventListener("click", saveCurrentPlan);
  document.getElementById("newPlanViewModal")?.addEventListener("click", newPlanDraft);
  document.getElementById("loadPlanViewModal")?.addEventListener("click", loadSelectedPlanView);
  document.getElementById("clearPlanDraft")?.addEventListener("click", clearEditorPlanDraft);
  document.getElementById("applyPlanGridSize")?.addEventListener("click", applyPlanGridSize);
  document.getElementById("closePlanModal")?.addEventListener("click", () => {
    state.editor.planView = false;
    renderEditorPanel();
    saveGame(true);
  });
  document.getElementById("loadPlanTilesetImage")?.addEventListener("click", () => document.getElementById("planTilesetImageInput")?.click());
  document.getElementById("loadPlanWallImage")?.addEventListener("click", () => document.getElementById("planWallImageInput")?.click());
  document.getElementById("planTilesetImageInput")?.addEventListener("change", event => handlePlanTilesetUpload(event.target, "main"));
  document.getElementById("planWallImageInput")?.addEventListener("change", event => handlePlanTilesetUpload(event.target, "walls"));
  bindPlanWallSlider("editorPlanWallCount", "wallCount", value => clamp(Math.round(Number(value) || PLAN_WALL_COUNT_DEFAULT), PLAN_WALL_COUNT_MIN, PLAN_WALL_COUNT_MAX));
  bindPlanWallSlider("editorPlanWallSpacing", "wallSpacing", value => clamp(Number(value) || PLAN_WALL_SPACING_DEFAULT, PLAN_WALL_SPACING_MIN, PLAN_WALL_SPACING_MAX));
  bindPlanWallSlider("editorPlanWallSpread", "wallSpread", value => clamp(Number(value) || PLAN_WALL_SPREAD_DEFAULT, PLAN_WALL_SPREAD_MIN, PLAN_WALL_SPREAD_MAX));
  const planCanvas = document.getElementById("editorPlanCanvas");
  planCanvas?.addEventListener("pointerdown", event => {
    if (event.button === 2) {
      erasePlanCellFromEvent(event);
      event.preventDefault();
      return;
    }
    editorPlanPainting = true;
    planCanvas.setPointerCapture?.(event.pointerId);
    paintPlanFromEvent(event);
    event.preventDefault();
  });
  planCanvas?.addEventListener("pointermove", event => {
    if (!editorPlanPainting) return;
    paintPlanFromEvent(event);
    event.preventDefault();
  });
  planCanvas?.addEventListener("pointerup", event => {
    editorPlanPainting = false;
    planCanvas.releasePointerCapture?.(event.pointerId);
    saveGame(true);
  });
  planCanvas?.addEventListener("pointercancel", () => {
    editorPlanPainting = false;
  });
  planCanvas?.addEventListener("contextmenu", event => {
    erasePlanCellFromEvent(event);
    event.preventDefault();
  });
  const planModal = document.getElementById("editorPlanModal");
  const planModalHeader = document.getElementById("editorPlanModalHeader");
  planModalHeader?.addEventListener("pointerdown", event => {
    if (event.target.closest("button")) return;
    const rect = planModal.getBoundingClientRect();
    editorPlanModalDrag = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      modalX: rect.left,
      modalY: rect.top
    };
    planModalHeader.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  });
  planModalHeader?.addEventListener("pointermove", event => {
    if (!editorPlanModalDrag || editorPlanModalDrag.pointerId !== event.pointerId) return;
    state.editor.planModal.x = editorPlanModalDrag.modalX + event.clientX - editorPlanModalDrag.startX;
    state.editor.planModal.y = editorPlanModalDrag.modalY + event.clientY - editorPlanModalDrag.startY;
    applyPlanModalLayout();
    event.preventDefault();
  });
  const endPlanModalDrag = event => {
    if (!editorPlanModalDrag || editorPlanModalDrag.pointerId !== event.pointerId) return;
    editorPlanModalDrag = null;
    planModalHeader.releasePointerCapture?.(event.pointerId);
    saveGame(true);
  };
  planModalHeader?.addEventListener("pointerup", endPlanModalDrag);
  planModalHeader?.addEventListener("pointercancel", endPlanModalDrag);
  planModal?.addEventListener("pointerup", () => {
    syncPlanModalSize();
    drawPlanCanvas();
    saveGame(true);
  });
  if (typeof ResizeObserver === "function" && planModal) {
    const observer = new ResizeObserver(() => {
      syncPlanModalSize();
      drawPlanCanvas();
    });
    observer.observe(planModal);
  }
  document.getElementById("editorContextDelete")?.addEventListener("click", () => deleteEditorTarget());
  document.getElementById("editorContextCycleWall")?.addEventListener("click", () => {
    if (cycleWallTarget()) hideEditorContextMenu();
  });
  document.getElementById("editorContextResizeWall")?.addEventListener("click", () => resizeWallGroupFromMenu());
  document.getElementById("editorContextSelectWallSide")?.addEventListener("click", () => selectWallSideFromTarget());
  document.getElementById("editorContextSelectWallGroup")?.addEventListener("click", () => selectWallGroupFromTarget());
  document.addEventListener("pointerdown", event => {
    const menu = document.getElementById("editorContextMenu");
    if (menu && !menu.hidden && !menu.contains(event.target)) hideEditorContextMenu();
  });

  const nameInput = document.getElementById("editorPrefabName");
  nameInput.addEventListener("input", () => {
    if (state.editor.planView) state.editor.planDraft.name = nameInput.value;
    else state.editor.draft.name = nameInput.value;
  });
  const occurrence = document.getElementById("editorOccurrence");
  occurrence.addEventListener("input", () => {
    const value = clamp(Number(occurrence.value) || 4, 1, 10);
    if (state.editor.planView) state.editor.planDraft.occurrence = value;
    else state.editor.draft.occurrence = value;
    document.getElementById("editorOccurrenceValue").textContent = value;
  });
  const layer = document.getElementById("editorLayer");
  layer.addEventListener("change", () => {
    state.editor.activeLayer = normalizeEditorLayer(layer.value);
    if ((state.editor.selectedDraftIndexes || []).length > 1) {
      for (const index of state.editor.selectedDraftIndexes) {
        const item = state.editor.draft.items[index];
        if (item) item.layer = state.editor.activeLayer;
      }
      renderEditorDraft();
      saveGame(true);
      return;
    }
    if (Number.isInteger(state.editor.selected?.draftIndex)) {
      const item = state.editor.draft.items[state.editor.selected.draftIndex];
      if (item) {
        item.layer = state.editor.activeLayer;
        renderEditorDraft();
        saveGame(true);
      }
    }
  });
  document.querySelectorAll("[data-editor-layer-visible]").forEach(input => {
    input.addEventListener("change", () => {
      const layerName = normalizeEditorLayer(input.dataset.editorLayerVisible);
      state.editor.layerVisibility[layerName] = input.checked;
      updateEditorSelectedUi();
      renderEditorDraft();
      saveGame(true);
    });
  });

  const dropZone = document.getElementById("editorDropZone");
  dropZone.addEventListener("dragover", event => {
    event.preventDefault();
    dropZone.classList.add("drag-over");
  });
  dropZone.addEventListener("dragleave", () => dropZone.classList.remove("drag-over"));
  dropZone.addEventListener("drop", event => {
    event.preventDefault();
    dropZone.classList.remove("drag-over");
    const raw = event.dataTransfer.getData("application/json");
    if (!raw) return;
    try {
      const hero = activeHero();
      addAssetToDraft(JSON.parse(raw), { x: hero.x + 1.5, y: hero.y + 1.5 });
    } catch (error) {
      console.warn("Prefab drop failed.", error);
    }
  });

  document.getElementById("savePrefab").addEventListener("click", saveCurrentPrefab);
  document.getElementById("saveSelectionPrefab").addEventListener("click", saveSelectionPrefab);
  document.getElementById("clearPrefabDraft").addEventListener("click", clearEditorDraft);
  canvas.addEventListener("dragover", event => {
    if (!state.editor.open) return;
    event.preventDefault();
  });
  canvas.addEventListener("drop", event => {
    if (!state.editor.open) return;
    event.preventDefault();
    const raw = event.dataTransfer.getData("application/json");
    if (!raw) return;
    const rect = canvas.getBoundingClientRect();
    const world = screenToWorld(event.clientX - rect.left, event.clientY - rect.top);
    try {
      addAssetToDraft(JSON.parse(raw), world);
      toast("Item added to set.");
    } catch (error) {
      console.warn("Map drop failed.", error);
    }
  });
  canvas.addEventListener("pointerdown", handleEditorPointerDown);
  canvas.addEventListener("pointermove", handleEditorPointerMove);
  canvas.addEventListener("pointerup", handleEditorPointerUp);
  canvas.addEventListener("pointercancel", handleEditorPointerUp);
  canvas.addEventListener("contextmenu", handleEditorContextMenu);
  canvas.addEventListener("dblclick", handleEditorDoubleClick);
}

function bindEvents() {
  addEventListener("resize", resize);
  addEventListener("pointerdown", requestGameMusicStart, { capture: true });
  addEventListener("keydown", event => {
    requestGameMusicStart();
    const key = event.key.toLowerCase();
    const typing = ["input", "textarea", "select"].includes(document.activeElement?.tagName?.toLowerCase());
    if (!typing && handleEditorWallArrowKey(event, key)) return;
    if (state.editor.open && !typing && (key === "delete" || key === "backspace")) {
      event.preventDefault();
      deleteEditorTarget(state.editor.selected);
      return;
    }
    state.keys.add(key);
    if (["1", "2", "3", "4", "5", "6"].includes(key)) activateHotbarSlot(Number(key) - 1);
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
    if (key === "p") toggleProgression();
    if (key === "l") toggleEditor();
    if (key === "m") enableFollowCamera();
    if (key === "e") {
      const npc = nearestNpc();
      if (npc) openChat(npc);
      else enterBuilding();
    }
  });
  addEventListener("keyup", event => state.keys.delete(event.key.toLowerCase()));
  bindEditorEvents();
  canvas.addEventListener("click", handleCanvasClick);
  canvas.addEventListener("contextmenu", event => event.preventDefault());
  canvas.addEventListener("pointerdown", startCameraDrag);
  canvas.addEventListener("pointermove", moveCameraDrag);
  canvas.addEventListener("pointerup", endCameraDrag);
  canvas.addEventListener("pointercancel", endCameraDrag);
  canvas.addEventListener("wheel", event => {
    if (handleEditorWallWheel(event)) return;
    event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const factor = Math.exp(-event.deltaY * 0.0015);
    zoomCameraBy(factor, event.clientX - rect.left, event.clientY - rect.top);
  }, { passive: false });
  document.getElementById("zoomIn").addEventListener("click", () => zoomCameraBy(1.28, canvas.clientWidth * 0.5, canvas.clientHeight * 0.5));
  document.getElementById("zoomOut").addEventListener("click", () => zoomCameraBy(1 / 1.28, canvas.clientWidth * 0.5, canvas.clientHeight * 0.5));
  document.getElementById("centerView").addEventListener("click", () => enableFollowCamera());
  document.getElementById("toggleInventory").addEventListener("click", toggleInventory);
  document.getElementById("inventoryHandle").addEventListener("click", toggleInventory);
  document.getElementById("progressionToggle").addEventListener("click", () => toggleProgression());
  document.getElementById("closeProgression").addEventListener("click", () => toggleProgression(false));
  document.getElementById("restartGame").addEventListener("click", restartGame);
  document.getElementById("closeChat").addEventListener("click", () => document.getElementById("chatPanel").classList.remove("open"));
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

let lastHudRender = 0;
let lastMiniMapRender = 0;
let lastMiniMapKey = "";
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
  if (state.camera.mode !== "free") {
    enableFollowCamera(true);
  }
  refreshActiveWorld();
  bindEvents();
  renderInventory();
  renderProgression();
  renderEditorPanel();
  renderHud();
  await loadAssets();
  renderInventory();
  renderProgression();
  renderEditorPanel();
  drawMiniMapThrottled(true);
  requestAnimationFrame(loop);
}

start();
