(function () {
  const VERSION = 1;
  const ATTRIBUTE_POINTS_PER_LEVEL = 5;
  const SKILL_POINTS_PER_LEVEL = 1;
  const MAX_SKILL_RANK = 5;

  const ATTRIBUTE_DEFS = [
    {
      id: "strength",
      name: "Strength",
      short: "STR",
      text: "Melee damage and health",
      perPoint: "+3.5% melee damage, +2 health"
    },
    {
      id: "dexterity",
      name: "Dexterity",
      short: "DEX",
      text: "Ranged damage, crits, movement",
      perPoint: "+3% ranged damage, +0.6% crit"
    },
    {
      id: "vitality",
      name: "Vitality",
      short: "VIT",
      text: "Health and damage reduction",
      perPoint: "+10 health, +0.5% reduction"
    },
    {
      id: "endurance",
      name: "Endurance",
      short: "END",
      text: "Stamina and recovery",
      perPoint: "+12 stamina, faster recovery"
    },
    {
      id: "intellect",
      name: "Intellect",
      short: "INT",
      text: "Spell damage and mana",
      perPoint: "+3% spell damage, +9 mana"
    },
    {
      id: "willpower",
      name: "Willpower",
      short: "WIL",
      text: "Mana control and skill costs",
      perPoint: "+4 mana, lower costs"
    }
  ];

  const ATTRIBUTE_DEFAULTS = ATTRIBUTE_DEFS.reduce((all, attr) => {
    all[attr.id] = 0;
    return all;
  }, {});

  const STARTER_SKILLS = {
    alaric: ["cleave"],
    sable: ["firebolt", "frostShard"],
    rowan: ["piercingShot"]
  };

  const SKILL_TREE = {
    cleave: { tier: 1, branch: "Arms", requires: [], level: 1 },
    piercingShot: { tier: 1, branch: "Hunt", requires: [], level: 1 },
    firebolt: { tier: 1, branch: "Embers", requires: [], level: 1 },
    frostShard: { tier: 2, branch: "Embers", requires: ["firebolt"], level: 2 },
    lightningArc: { tier: 2, branch: "Tempest", requires: ["firebolt"], level: 3 },
    arcaneWard: { tier: 2, branch: "Aegis", requires: ["frostShard"], level: 3 },
    stormChain: { tier: 3, branch: "Tempest", requires: ["lightningArc"], level: 5 },
    bloodHex: { tier: 3, branch: "Aegis", requires: ["arcaneWard"], level: 5 }
  };

  function starterSkillsForHero(hero) {
    return [...(STARTER_SKILLS[hero?.id] || ["cleave"])];
  }

  function defaultBarForHero(hero) {
    const starters = starterSkillsForHero(hero);
    return [starters[0] || "cleave", starters[1] || null, "redPotion", "bluePotion", null, null];
  }

  function xpToNext(level) {
    const safeLevel = Math.max(1, Math.floor(level || 1));
    return Math.round(72 + safeLevel * 42 + Math.pow(safeLevel - 1, 1.45) * 26);
  }

  function createHeroProgression(hero) {
    return {
      version: VERSION,
      attributePoints: 0,
      skillPoints: 0,
      attributes: { ...ATTRIBUTE_DEFAULTS },
      base: {
        hp: Math.round(hero?.maxHp || hero?.hp || 100),
        mana: Math.round(hero?.maxMana || hero?.mana || 50),
        stamina: Math.round(hero?.maxStamina || hero?.stamina || 100)
      }
    };
  }

  function normalizeHero(hero, skillInfo = {}) {
    if (!hero) return hero;
    hero.level = Math.max(1, Math.floor(hero.level || 1));
    hero.xp = Math.max(0, Math.floor(hero.xp || 0));
    const hadProgression = Boolean(hero.progression);
    hero.progression ||= createHeroProgression(hero);
    hero.progression.version = VERSION;
    hero.progression.attributePoints = Math.max(0, Math.floor(hero.progression.attributePoints || 0));
    hero.progression.skillPoints = Math.max(0, Math.floor(hero.progression.skillPoints || 0));
    hero.progression.attributes ||= {};
    for (const attr of ATTRIBUTE_DEFS) {
      hero.progression.attributes[attr.id] = Math.max(0, Math.floor(hero.progression.attributes[attr.id] || 0));
    }
    hero.progression.base ||= {};
    hero.progression.base.hp = Math.max(1, Math.round(hero.progression.base.hp || hero.maxHp || hero.hp || 100));
    hero.progression.base.mana = Math.max(0, Math.round(hero.progression.base.mana || hero.maxMana || hero.mana || 50));
    hero.progression.base.stamina = Math.max(1, Math.round(hero.progression.base.stamina || hero.maxStamina || hero.stamina || 100));
    if (!hadProgression && hero.level > 1) {
      hero.progression.attributePoints += (hero.level - 1) * ATTRIBUTE_POINTS_PER_LEVEL;
      hero.progression.skillPoints += (hero.level - 1) * SKILL_POINTS_PER_LEVEL;
    }

    hero.skills ||= {};
    const validSkillIds = Object.keys(skillInfo);
    const fullDefaultKnown = validSkillIds.length && Array.isArray(hero.skills.known)
      && hero.skills.known.length >= validSkillIds.length
      && validSkillIds.every(id => hero.skills.known.includes(id));
    if (!Array.isArray(hero.skills.known) || !hero.skills.known.length || (fullDefaultKnown && !hero.skills.ranks)) {
      hero.skills.known = starterSkillsForHero(hero).filter(id => !validSkillIds.length || skillInfo[id]);
    } else {
      hero.skills.known = [...new Set(hero.skills.known.filter(id => !validSkillIds.length || skillInfo[id]))];
    }
    if (!hero.skills.known.length && skillInfo.cleave) hero.skills.known = ["cleave"];
    hero.skills.ranks ||= {};
    for (const id of hero.skills.known) {
      hero.skills.ranks[id] = clamp(Math.floor(hero.skills.ranks[id] || 1), 1, MAX_SKILL_RANK);
    }
    for (const id of Object.keys(hero.skills.ranks)) {
      if (!hero.skills.known.includes(id) || (validSkillIds.length && !skillInfo[id])) delete hero.skills.ranks[id];
    }
    if (!Array.isArray(hero.skills.bar) || !hero.skills.bar.length || (fullDefaultKnown && !hero.skills.ranks)) {
      hero.skills.bar = defaultBarForHero(hero);
    }
    while (hero.skills.bar.length < 6) hero.skills.bar.push(null);
    hero.skills.bar = hero.skills.bar
      .slice(0, 6)
      .map(id => {
        if (!id) return null;
        if (skillInfo[id]) return hero.skills.known.includes(id) ? id : null;
        if (!validSkillIds.length && !id.endsWith("Potion")) return hero.skills.known.includes(id) ? id : null;
        return id.endsWith("Potion") ? id : null;
      });

    applyDerivedStats(hero);
    return hero;
  }

  function applyDerivedStats(hero) {
    if (!hero?.progression) return null;
    const beforeHp = hero.maxHp ? hero.hp / hero.maxHp : 1;
    const beforeMana = hero.maxMana ? hero.mana / hero.maxMana : 1;
    const beforeStamina = hero.maxStamina ? hero.stamina / hero.maxStamina : 1;
    const stats = derivedStats(hero);
    hero.maxHp = stats.maxHp;
    hero.maxMana = stats.maxMana;
    hero.maxStamina = stats.maxStamina;
    hero.hp = clamp(Number.isFinite(hero.hp) ? hero.hp : hero.maxHp, 0, hero.maxHp);
    hero.mana = clamp(Number.isFinite(hero.mana) ? hero.mana : hero.maxMana, 0, hero.maxMana);
    hero.stamina = clamp(Number.isFinite(hero.stamina) ? hero.stamina : hero.maxStamina, 0, hero.maxStamina);
    if (beforeHp > 0.98) hero.hp = hero.maxHp;
    if (beforeMana > 0.98) hero.mana = hero.maxMana;
    if (beforeStamina > 0.98) hero.stamina = hero.maxStamina;
    return stats;
  }

  function derivedStats(hero) {
    const p = hero?.progression || createHeroProgression(hero);
    const a = { ...ATTRIBUTE_DEFAULTS, ...(p.attributes || {}) };
    const base = p.base || {};
    return {
      maxHp: Math.round((base.hp || hero?.maxHp || 100) + a.vitality * 10 + a.strength * 2),
      maxMana: Math.round((base.mana || hero?.maxMana || 50) + a.intellect * 9 + a.willpower * 4),
      maxStamina: Math.round((base.stamina || hero?.maxStamina || 100) + a.endurance * 12 + a.dexterity * 4),
      meleeMultiplier: 1 + a.strength * 0.035 + a.dexterity * 0.01,
      rangedMultiplier: 1 + a.dexterity * 0.03 + a.strength * 0.01,
      spellMultiplier: 1 + a.intellect * 0.03 + a.willpower * 0.015,
      critChance: clamp(0.12 + a.dexterity * 0.006, 0.12, 0.38),
      critMultiplier: 1.65 + a.dexterity * 0.012,
      moveSpeed: 2.8 + a.dexterity * 0.018,
      sprintSpeed: 4.4 + a.dexterity * 0.024,
      staminaRegen: 14 + a.endurance * 1.1 + a.willpower * 0.25,
      sprintCost: Math.max(9, 18 - a.endurance * 0.22),
      costMultiplier: clamp(1 - a.willpower * 0.008, 0.75, 1),
      damageReduction: clamp(a.vitality * 0.005 + a.endurance * 0.003, 0, 0.45)
    };
  }

  function awardXp(hero, amount) {
    normalizeHero(hero);
    let gained = Math.max(0, Math.floor(amount || 0));
    let levelsGained = 0;
    hero.xp += gained;
    while (hero.xp >= xpToNext(hero.level)) {
      hero.xp -= xpToNext(hero.level);
      hero.level += 1;
      hero.progression.attributePoints += ATTRIBUTE_POINTS_PER_LEVEL;
      hero.progression.skillPoints += SKILL_POINTS_PER_LEVEL;
      levelsGained += 1;
    }
    return { gained, levelsGained, level: hero.level, next: xpToNext(hero.level) };
  }

  function enemyXp(enemy) {
    if (!enemy) return 0;
    const bossScale = enemy.maxHp >= 140 ? 1.65 : 1;
    return Math.max(8, Math.round((10 + enemy.maxHp * 0.16 + enemy.damage * 1.3) * bossScale));
  }

  function spendAttributePoint(hero, attrId) {
    normalizeHero(hero);
    if (!ATTRIBUTE_DEFAULTS.hasOwnProperty(attrId) || hero.progression.attributePoints <= 0) return false;
    hero.progression.attributes[attrId] += 1;
    hero.progression.attributePoints -= 1;
    applyDerivedStats(hero);
    return true;
  }

  function canSpendSkillPoint(hero, skillId, skillInfo = {}) {
    normalizeHero(hero, skillInfo);
    const node = SKILL_TREE[skillId];
    if (!node || !skillInfo[skillId] || hero.progression.skillPoints <= 0) {
      return { ok: false, reason: "No point" };
    }
    const known = hero.skills.known.includes(skillId);
    const rank = hero.skills.ranks[skillId] || 0;
    if (known && rank >= MAX_SKILL_RANK) return { ok: false, reason: "Max rank" };
    if (known) return { ok: true, action: "rank" };
    if (hero.level < node.level) return { ok: false, reason: `Level ${node.level}` };
    const missing = node.requires.find(required => !hero.skills.known.includes(required));
    if (missing) return { ok: false, reason: `Requires ${skillInfo[missing]?.name || missing}` };
    return { ok: true, action: "unlock" };
  }

  function spendSkillPoint(hero, skillId, skillInfo = {}) {
    const check = canSpendSkillPoint(hero, skillId, skillInfo);
    if (!check.ok) return check;
    hero.progression.skillPoints -= 1;
    if (!hero.skills.known.includes(skillId)) hero.skills.known.push(skillId);
    hero.skills.ranks[skillId] = clamp((hero.skills.ranks[skillId] || 0) + 1, 1, MAX_SKILL_RANK);
    if (!hero.skills.bar.some(Boolean)) hero.skills.bar[0] = skillId;
    return { ok: true, action: check.action, rank: hero.skills.ranks[skillId] };
  }

  function effectiveSkillSpec(hero, skillId, skillInfo = {}) {
    const source = skillInfo[skillId];
    if (!source) return null;
    normalizeHero(hero, skillInfo);
    const rank = Math.max(1, hero.skills.ranks?.[skillId] || 1);
    const stats = derivedStats(hero);
    const rankMultiplier = 1 + (rank - 1) * 0.14;
    let statMultiplier = 1;
    if (source.type === "melee") statMultiplier = stats.meleeMultiplier;
    else if (source.resource === "stamina") statMultiplier = stats.rangedMultiplier;
    else statMultiplier = stats.spellMultiplier;
    const spec = { ...source };
    spec.rank = rank;
    spec.damage = Math.max(0, Math.round((source.damage || 0) * rankMultiplier * statMultiplier));
    spec.cost = Math.max(0, Math.round((source.cost || 0) * stats.costMultiplier));
    spec.range = Number((source.range + Math.max(0, rank - 1) * 0.12).toFixed(2));
    if (source.maxTargets) spec.maxTargets = source.maxTargets + (rank >= 4 ? 1 : 0);
    return spec;
  }

  function incomingDamage(hero, amount) {
    const reduction = derivedStats(hero).damageReduction;
    return Math.max(1, Math.round(amount * (1 - reduction)));
  }

  function skillNodes() {
    return Object.entries(SKILL_TREE)
      .map(([id, node]) => ({ id, ...node }))
      .sort((a, b) => a.tier - b.tier || a.branch.localeCompare(b.branch));
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  window.ProgressionSystem = {
    VERSION,
    ATTRIBUTE_DEFS,
    ATTRIBUTE_POINTS_PER_LEVEL,
    SKILL_POINTS_PER_LEVEL,
    MAX_SKILL_RANK,
    createHeroProgression,
    starterSkillsForHero,
    defaultBarForHero,
    normalizeHero,
    applyDerivedStats,
    derivedStats,
    xpToNext,
    awardXp,
    enemyXp,
    spendAttributePoint,
    canSpendSkillPoint,
    spendSkillPoint,
    effectiveSkillSpec,
    incomingDamage,
    skillNodes
  };
})();
