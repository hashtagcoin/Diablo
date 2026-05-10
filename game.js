const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const miniMap = document.getElementById("miniMap");
const miniCtx = miniMap.getContext("2d");

const STORAGE_KEY = "umbral-descent-save-v1";
const TILE_W = 84;
const TILE_H = 42;
const MAP_W = 24;
const MAP_H = 24;
const SPRITE_CELL = 128;
const ATLAS_DISPLAY = 322;
const ATLAS_SIZE = 736;

const atlasFiles = {
  items: "items.png",
  weapons: "weapons.png",
  armour: "armour.png",
  ui: "ui.png",
  characters: "characters.png"
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
  redPotion: ["items", 0, 0],
  bluePotion: ["items", 0, 1],
  greenPotion: ["items", 0, 2],
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

const images = {};
const worldAssets = {};
const spriteLookup = {};
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

const state = {
  camera: { x: 0, y: 0, zoom: 1 },
  keys: new Set(),
  mode: "melee",
  selectedItem: null,
  lastSave: 0,
  inside: null,
  player: {
    id: "alaric",
    name: "Alaric",
    x: 10,
    y: 14,
    tx: 10,
    ty: 14,
    hp: 120,
    maxHp: 120,
    mana: 80,
    maxMana: 80,
    stamina: 100,
    maxStamina: 100,
    gold: 48,
    runes: 0,
    level: 1,
    xp: 0,
    dir: 1,
    walkT: 0,
    attackT: 0,
    equipment: { weapon: "flameSword", helm: "helm", chest: "armor", gloves: null, boots: null, trinket: "amulet", offhand: null },
    inventory: [
      { id: "redPotion", qty: 3 },
      { id: "bluePotion", qty: 2 },
      { id: "greenPotion", qty: 2 },
      { id: "runeShard", qty: 1 },
      { id: "crossbow", qty: 1 },
      { id: "leatherArmor", qty: 1 }
    ]
  },
  enemies: [],
  npcs: [],
  loot: [],
  projectiles: [],
  particles: [],
  floating: [],
  buildings: [],
  map: [],
  quest: { temple: false, priest: false }
};

const itemInfo = {
  redPotion: { name: "Blood Vial", type: "potion", text: "Restores 35 health.", use: () => heal("hp", 35) },
  bluePotion: { name: "Moonwater Vial", type: "potion", text: "Restores 30 mana.", use: () => heal("mana", 30) },
  greenPotion: { name: "Bitterleaf Draught", type: "potion", text: "Restores 35 stamina.", use: () => heal("stamina", 35) },
  runeShard: { name: "Rune Shard", type: "quest", text: "A humming fragment used to unlock buried temple doors." },
  flameSword: { name: "Emberbrand", type: "weapon", text: "A close combat blade with fire damage.", slot: "weapon" },
  crossbow: { name: "Gilded Crossbow", type: "weapon", text: "A ranged weapon. Equip it to strengthen ranged attacks.", slot: "weapon" },
  leatherArmor: { name: "Stalker Leathers", type: "armor", text: "Light armor that favors stamina.", slot: "chest" },
  helm: { name: "Spired Helm", type: "armor", text: "A heavy helm etched with warding marks.", slot: "helm" },
  armor: { name: "Stalwart Chainmail", type: "armor", text: "Reliable protection for the Weeping Grove.", slot: "chest" },
  amulet: { name: "Amulet of the Owl", type: "trinket", text: "Keeps old secrets close to the heart.", slot: "trinket" },
  staff: { name: "Graven Staff", type: "weapon", text: "A staff still full of hostile sparks.", slot: "weapon" },
  bow: { name: "Thorn Bow", type: "weapon", text: "A quick bow cut from living blackwood.", slot: "weapon" },
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

  applySpriteStyles();
  await Promise.all([...Object.values(images), ...Object.values(worldAssets)].map(img => img.decode().catch(() => undefined)));
  assetsReady = true;
}

function applySpriteStyles() {
  document.querySelectorAll("[data-sprite]").forEach(el => {
    const id = el.dataset.sprite;
    const sprite = spriteLookup[id] || spriteLookup.redPotion;
    if (!sprite) return;
    const scale = ATLAS_DISPLAY / ATLAS_SIZE;
    el.style.setProperty("--sheet", `url("${atlasFiles[sprite.sheet]}")`);
    el.style.setProperty("--x", `${-sprite.x * scale}px`);
    el.style.setProperty("--y", `${-sprite.y * scale}px`);
  });
}

function buildWorld() {
  state.map = Array.from({ length: MAP_H }, (_, y) => Array.from({ length: MAP_W }, (_, x) => {
    const edge = x < 2 || y < 2 || x > MAP_W - 3 || y > MAP_H - 3;
    const water = (x < 5 && y > 16) || (x > 18 && y < 7);
    const road = Math.abs(x - y + 4) < 2 || Math.abs(x + y - 28) < 2;
    const propSeed = (x * 31 + y * 17) % 23;
    const prop = !water && !road && !edge && propSeed > 18 ? ["ruinProp", "deadTree", "obelisk"][propSeed % 3] : null;
    return { edge, water, road, prop };
  }));

  state.buildings = [
    { id: "temple", name: "Temple Depths", x: 6, y: 6, w: 4, h: 3, open: false, sprite: "portalRune" },
    { id: "forge", name: "Blackened Forge", x: 15, y: 9, w: 3, h: 3, open: true, sprite: "chestIcon" },
    { id: "sanctum", name: "Moonlit Sanctum", x: 11, y: 18, w: 4, h: 3, open: true, sprite: "mapIcon" }
  ];

  state.npcs = [
    { id: "questKeeper", name: "Quest Keeper", sprite: "questKeeper", x: 9, y: 13, lines: ["Find the Temple Depths and bring me a Rune Shard.", "The priest listens through the stones. Keep your mana high."] },
    { id: "healer", name: "Healer", sprite: "healer", x: 13, y: 16, lines: ["Stand still a breath and I can mend the worst of it.", "Ask me to heal and I will spend what herbs remain."] },
    { id: "merchant", name: "Merchant", sprite: "merchant", x: 17, y: 12, lines: ["Gold has a memory. Spend it well.", "I saw a crossbow buried near the old water stairs."] },
    { id: "blacksmith", name: "Blacksmith", sprite: "blacksmith", x: 16.5, y: 10.8, lines: ["Blades chip. Armor lies. Boots tell the truth.", "Bring runes and I will wake the metal."] }
  ];

  state.enemies = [
    enemy("skeleton", "Skeleton", 4, 12, 56, 8, "coinStack"),
    enemy("skeleton", "Skeleton", 7, 16, 56, 8, "redPotion"),
    enemy("emberImp", "Ember Imp", 15, 15, 44, 10, "fireOrb"),
    enemy("emberImp", "Ember Imp", 18, 7, 44, 10, "bluePotion"),
    enemy("frostAcolyte", "Frost Acolyte", 7, 8, 72, 13, "staff"),
    enemy("cultist", "Cultist", 20, 14, 68, 12, "runeShard")
  ];
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
    walkT: 0,
    attackT: 0,
    dead: false
  };
}

function restoreSave() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;
  try {
    const parsed = JSON.parse(saved);
    Object.assign(state.player, parsed.player || {});
    if (Array.isArray(parsed.enemies)) {
      state.enemies.forEach(enemyState => {
        const savedEnemy = parsed.enemies.find(e => e.id === enemyState.id);
        if (savedEnemy) Object.assign(enemyState, savedEnemy);
      });
    }
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
    player: state.player,
    enemies: state.enemies.map(({ id, hp, dead, x, y }) => ({ id, hp, dead, x, y })),
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
}

function worldToScreen(x, y) {
  const centerX = canvas.clientWidth * 0.48 + state.camera.x;
  const centerY = canvas.clientHeight * 0.24 + state.camera.y;
  return {
    x: centerX + (x - y) * (TILE_W / 2) * state.camera.zoom,
    y: centerY + (x + y) * (TILE_H / 2) * state.camera.zoom
  };
}

function screenToWorld(sx, sy) {
  const centerX = canvas.clientWidth * 0.48 + state.camera.x;
  const centerY = canvas.clientHeight * 0.24 + state.camera.y;
  const xIso = (sx - centerX) / state.camera.zoom;
  const yIso = (sy - centerY) / state.camera.zoom;
  return {
    x: yIso / TILE_H + xIso / TILE_W,
    y: yIso / TILE_H - xIso / TILE_W
  };
}

function tileBlocked(x, y) {
  const tx = Math.floor(x);
  const ty = Math.floor(y);
  if (tx < 0 || ty < 0 || tx >= MAP_W || ty >= MAP_H) return true;
  const tile = state.map[ty][tx];
  if (tile.water || tile.edge) return true;
  return state.buildings.some(b => tx >= b.x && ty >= b.y && tx < b.x + b.w && ty < b.y + b.h - 1);
}

function update(dt) {
  const player = state.player;
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

  updateEnemies(dt);
  updateProjectiles(dt);
  updateParticles(dt);
  pickupNearbyLoot();
  updateQuestState();
  saveGame();
  renderHud();
}

function updateEnemies(dt) {
  for (const e of state.enemies) {
    if (e.dead) continue;
    e.cooldown = Math.max(0, e.cooldown - dt);
    e.attackT = Math.max(0, e.attackT - dt);
    const dist = distance(e, state.player);
    if (dist < e.aggro && dist > e.attackRange) {
      const dx = (state.player.x - e.x) / dist;
      const dy = (state.player.y - e.y) / dist;
      const nx = e.x + dx * e.speed * dt;
      const ny = e.y + dy * e.speed * dt;
      if (!tileBlocked(nx, e.y)) e.x = nx;
      if (!tileBlocked(e.x, ny)) e.y = ny;
      e.walkT += dt * 8;
    }
    if (dist <= e.attackRange && e.cooldown <= 0) {
      e.cooldown = e.sprite === "frostAcolyte" ? 1.35 : 1.05;
      e.attackT = 0.35;
      damagePlayer(e.damage);
      addFloating(`-${e.damage}`, state.player.x, state.player.y, "#ff9b7b");
      burst(state.player.x, state.player.y, e.sprite === "frostAcolyte" ? "#79d7ff" : "#e14527", 10);
    }
  }
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

function damagePlayer(amount) {
  state.player.hp = Math.max(0, state.player.hp - amount);
  if (state.player.hp <= 0) {
    state.player.hp = state.player.maxHp;
    state.player.x = 10;
    state.player.y = 14;
    toast("You were pulled back from the brink.");
  }
}

function attack(target = nearestEnemy()) {
  if (!target || target.dead) return;
  const player = state.player;
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
  addFloating(`${crit ? "Crit " : ""}-${finalDamage}`, target.x, target.y, kind === "frost" ? "#b9efff" : "#ffcf75");
  if (target.hp <= 0) {
    target.dead = true;
    dropLoot(target);
    state.player.xp += 12;
    toast(`${target.name} defeated.`);
  }
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
  state.loot = state.loot.filter(loot => {
    if (distance(loot, state.player) > 0.8) return true;
    if (loot.id === "coinStack") {
      state.player.gold += loot.qty;
      toast(`Picked up ${loot.qty} gold.`);
    } else {
      addItem(loot.id, loot.qty);
      toast(`Picked up ${itemName(loot.id)}.`);
    }
    renderInventory();
    return false;
  });
}

function addItem(id, qty = 1) {
  const existing = state.player.inventory.find(i => i.id === id);
  if (existing && itemInfo[id]?.type === "potion") existing.qty += qty;
  else state.player.inventory.push({ id, qty });
}

function heal(resource, amount) {
  const p = state.player;
  if (resource === "hp") p.hp = Math.min(p.maxHp, p.hp + amount);
  if (resource === "mana") p.mana = Math.min(p.maxMana, p.mana + amount);
  if (resource === "stamina") p.stamina = Math.min(p.maxStamina, p.stamina + amount);
  return true;
}

function useItem(id) {
  const item = itemInfo[id];
  const inv = state.player.inventory.find(i => i.id === id);
  if (!item || !inv) return;
  if (item.slot) {
    state.player.equipment[item.slot] = id;
    toast(`Equipped ${item.name}.`);
  } else if (item.use && item.use()) {
    inv.qty -= 1;
    toast(`Used ${item.name}.`);
    if (inv.qty <= 0) state.player.inventory = state.player.inventory.filter(i => i !== inv);
  }
  renderInventory();
  saveGame(true);
}

function nearestEnemy(range = 8) {
  let best = null;
  let bestDist = range;
  for (const e of state.enemies) {
    if (e.dead) continue;
    const d = distance(e, state.player);
    if (d < bestDist) {
      best = e;
      bestDist = d;
    }
  }
  return best;
}

function nearestNpc(range = 1.6) {
  return state.npcs.find(npc => distance(npc, state.player) <= range);
}

function nearestBuilding(range = 1.5) {
  return state.buildings.find(b => {
    const door = { x: b.x + b.w / 2, y: b.y + b.h - 0.4 };
    return distance(door, state.player) <= range;
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
  return state.player.inventory.some(i => i.id === id && i.qty > 0);
}

function updateQuestState() {
  state.quest.temple = state.quest.temple || state.inside === "temple";
  state.quest.priest = state.quest.priest || state.enemies.some(e => e.sprite === "cultist" && e.dead);
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
  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      const tile = state.map[y][x];
      const p = worldToScreen(x, y);
      const tw = TILE_W * state.camera.zoom;
      const th = TILE_H * state.camera.zoom;
      if (p.x < -tw || p.x > canvas.clientWidth + tw || p.y < -th || p.y > canvas.clientHeight + th) continue;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + tw / 2, p.y + th / 2);
      ctx.lineTo(p.x, p.y + th);
      ctx.lineTo(p.x - tw / 2, p.y + th / 2);
      ctx.closePath();
      ctx.fillStyle = tile.water ? "#063436" : tile.road ? "#30302a" : tile.edge ? "#101611" : "#1b2119";
      ctx.fill();
      ctx.strokeStyle = "rgba(176, 119, 45, 0.16)";
      ctx.lineWidth = 1;
      ctx.stroke();
      if (assetLoaded(worldAssets.dungeonFloor) && !tile.water && !tile.edge) {
        ctx.save();
        ctx.globalAlpha = tile.road ? 0.24 : 0.42;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + tw / 2, p.y + th / 2);
        ctx.lineTo(p.x, p.y + th);
        ctx.lineTo(p.x - tw / 2, p.y + th / 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(worldAssets.dungeonFloor, p.x - tw / 2, p.y, tw, th);
        ctx.restore();
      }
      if (tile.prop && assetLoaded(worldAssets[tile.prop])) {
        const prop = worldAssets[tile.prop];
        const size = tile.prop === "obelisk" ? 72 : 62;
        ctx.drawImage(prop, p.x - size * state.camera.zoom / 2, p.y - size * state.camera.zoom * 0.7, size * state.camera.zoom, size * state.camera.zoom);
      } else if (tile.prop && !tile.water) {
        ctx.fillStyle = "rgba(97, 153, 69, 0.34)";
        ctx.fillRect(p.x - 3, p.y + th / 2 - 2, 6, 4);
      }
    }
  }
}

function drawBuildings() {
  for (const b of state.buildings) {
    const base = worldToScreen(b.x + b.w / 2 - 0.5, b.y + b.h - 1);
    const z = state.camera.zoom;
    const generated = worldAssets[b.id];
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

function drawEntities() {
  const entities = [
    ...state.loot.map(l => ({ ...l, kind: "loot", sortY: l.x + l.y })),
    ...state.npcs.map(n => ({ ...n, kind: "npc", sortY: n.x + n.y })),
    ...state.enemies.filter(e => !e.dead).map(e => ({ ...e, kind: "enemy", sortY: e.x + e.y })),
    { ...state.player, kind: "player", sprite: state.player.id, sortY: state.player.x + state.player.y + 0.1 }
  ].sort((a, b) => a.sortY - b.sortY);

  for (const ent of entities) {
    if (ent.kind === "loot") drawLoot(ent);
    else drawActor(ent);
  }
}

function drawActor(actor) {
  const p = worldToScreen(actor.x, actor.y);
  const z = state.camera.zoom;
  const bob = Math.sin((actor.walkT || 0) * 2.1) * 4;
  const attack = actor.attackT > 0 ? Math.sin(actor.attackT * 24) * 8 : 0;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(z * (actor.dir === -1 ? -1 : 1), z);
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.beginPath();
  ctx.ellipse(0, 17, 25, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  if (actor.kind === "enemy") {
    ctx.strokeStyle = "rgba(178, 34, 34, 0.85)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, -32 + bob, 24 + attack, 0.15, Math.PI - 0.15);
    ctx.stroke();
  }
  drawSprite(actor.sprite, -28 + attack, -76 + bob, 56, 68);
  if (actor.kind === "player") {
    drawSprite(state.player.equipment.weapon, 13 + attack, -48 + bob, 36, 56);
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

function drawSprite(id, x, y, w, h) {
  const sprite = spriteLookup[id];
  const image = images[sprite?.sheet];
  if (!sprite || !image || !assetsReady) {
    ctx.fillStyle = "#c38a2f";
    ctx.fillRect(x, y, w, h);
    return;
  }
  ctx.drawImage(image, sprite.x, sprite.y, sprite.width || SPRITE_CELL, sprite.height || SPRITE_CELL, x, y, w, h);
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
  const p = worldToScreen(b.x + b.w / 2 - 0.5, b.y + b.h - 1);
  ctx.strokeRect(p.x - 130 * state.camera.zoom, p.y - 150 * state.camera.zoom, 260 * state.camera.zoom, 170 * state.camera.zoom);
  drawLabel(`Exploring ${b.name}`, p.x, p.y - 170 * state.camera.zoom, "#92eaff");
  ctx.restore();
}

function drawMiniMap() {
  miniCtx.clearRect(0, 0, miniMap.width, miniMap.height);
  miniCtx.fillStyle = "#090b0a";
  miniCtx.fillRect(0, 0, miniMap.width, miniMap.height);
  const sx = miniMap.width / MAP_W;
  const sy = miniMap.height / MAP_H;
  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      const tile = state.map[y][x];
      miniCtx.fillStyle = tile.water ? "#075462" : tile.road ? "#76684b" : tile.edge ? "#161813" : "#303a24";
      miniCtx.fillRect(x * sx, y * sy, sx + 0.5, sy + 0.5);
    }
  }
  miniCtx.fillStyle = "#d8a73a";
  for (const b of state.buildings) miniCtx.fillRect(b.x * sx, b.y * sy, b.w * sx, b.h * sy);
  miniCtx.fillStyle = "#df3b2f";
  for (const e of state.enemies) if (!e.dead) miniCtx.fillRect(e.x * sx - 2, e.y * sy - 2, 4, 4);
  miniCtx.fillStyle = "#61d8ff";
  miniCtx.beginPath();
  miniCtx.arc(state.player.x * sx, state.player.y * sy, 4, 0, Math.PI * 2);
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
  const p = state.player;
  document.getElementById("healthValue").textContent = `${Math.round(p.hp)} / ${p.maxHp}`;
  document.getElementById("manaValue").textContent = `${Math.round(p.mana)} / ${p.maxMana}`;
  document.getElementById("staminaFill").style.width = `${Math.max(0, p.stamina / p.maxStamina * 100)}%`;
  const activeParty = document.querySelector(".party-member.active");
  activeParty.querySelector(".health i").style.width = `${p.hp / p.maxHp * 100}%`;
  activeParty.querySelector(".mana i").style.width = `${p.mana / p.maxMana * 100}%`;
}

function renderInventory() {
  const grid = document.getElementById("inventoryGrid");
  grid.innerHTML = "";
  const pageSize = 12;
  const pages = Math.max(1, Math.ceil(state.player.inventory.length / pageSize));
  for (let pageIndex = 0; pageIndex < pages; pageIndex++) {
    const page = document.createElement("div");
    page.className = "inventory-page";
    const items = state.player.inventory.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize);
    for (let slotIndex = 0; slotIndex < pageSize; slotIndex++) {
      const inv = items[slotIndex];
      const button = document.createElement("button");
      button.className = "inventory-slot";
      if (inv) {
        button.dataset.item = inv.id;
        button.title = itemName(inv.id);
        if (state.selectedItem === inv.id) button.classList.add("selected");
        button.innerHTML = `<span class="sprite" data-sprite="${inv.id}"></span><small>${inv.qty > 1 ? inv.qty : ""}</small>`;
        button.addEventListener("click", () => selectItem(inv.id));
        button.addEventListener("dblclick", () => useItem(inv.id));
      } else {
        button.disabled = true;
        button.setAttribute("aria-label", "Empty inventory slot");
      }
      page.appendChild(button);
    }
    grid.appendChild(page);
  }
  document.querySelectorAll(".equip-slot").forEach(slot => {
    const id = state.player.equipment[slot.dataset.slot];
    const labels = { weapon: "Weapon", helm: "Helm", chest: "Armour", gloves: "Gloves", boots: "Boots", trinket: "Trinket", offhand: "Offhand" };
    const label = labels[slot.dataset.slot] || slot.dataset.slot;
    slot.innerHTML = `<span class="slot-label">${label}</span>${id ? `<span class="sprite" data-sprite="${id}"></span>` : ""}`;
  });
  document.getElementById("goldCount").textContent = state.player.gold;
  document.getElementById("runeCount").textContent = state.player.inventory.find(i => i.id === "runeShard")?.qty || 0;
  applySpriteStyles();
}

function selectItem(id) {
  state.selectedItem = id;
  const item = itemInfo[id] || {};
  document.getElementById("itemDetails").innerHTML = `<strong>${itemName(id)}</strong><span>${item.text || "A strange thing from the dark."} ${item.slot ? "Double click to equip." : item.use ? "Double click to use." : ""}</span>`;
  renderInventory();
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
    .filter(e => !e.dead)
    .map(e => ({ e, d: Math.hypot(e.x - world.x, e.y - world.y) }))
    .sort((a, b) => a.d - b.d)[0];
  if (target && target.d < 0.9) attack(target.e);
  else if (!tileBlocked(world.x, world.y)) {
    state.player.x = state.player.x + (world.x - state.player.x) * 0.12;
    state.player.y = state.player.y + (world.y - state.player.y) * 0.12;
  }
}

function bindEvents() {
  addEventListener("resize", resize);
  addEventListener("keydown", event => {
    const key = event.key.toLowerCase();
    state.keys.add(key);
    if (["1", "2", "3", "4"].includes(key)) setMode(["melee", "ranged", "fire", "frost"][Number(key) - 1]);
    if (key === " ") {
      event.preventDefault();
      attack();
    }
    if (key === "q") useItem("redPotion");
    if (key === "r") useItem("bluePotion");
    if (key === "i") document.getElementById("inventoryPanel").classList.toggle("collapsed");
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
    state.camera.x = 0;
    state.camera.y = 0;
  });
  document.getElementById("toggleInventory").addEventListener("click", () => document.getElementById("inventoryPanel").classList.toggle("collapsed"));
  document.getElementById("closeChat").addEventListener("click", () => document.getElementById("chatPanel").classList.remove("open"));
  document.querySelectorAll(".skill[data-mode]").forEach(btn => btn.addEventListener("click", () => setMode(btn.dataset.mode)));
  document.querySelectorAll(".skill[data-use]").forEach(btn => btn.addEventListener("click", () => useItem(btn.dataset.use)));
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
  bindEvents();
  renderInventory();
  renderHud();
  await loadAssets();
  renderInventory();
  requestAnimationFrame(loop);
}

start();
