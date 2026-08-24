// Echte Deadlock-Shop-Items: Name, Kategorie und Preisstufe direkt vom
// Deadlock-Wiki uebernommen (Stand: von der Nutzerin/dem Nutzer per
// Screenshot bereitgestellt). "Aktiv/Passiv" und Effekt-Stichworte fehlen
// bewusst - die haben wir (noch) nicht aus einer verlaesslichen Quelle, und
// geratene "Fakten" wollen wir hier nicht als Spielwahrheit ausgeben.
//
// Schema pro Item:
//   id       eindeutiger Slug
//   name     Anzeigename (das, was man eintippt)
//   category 'Weapon' | 'Vitality' | 'Spirit'
//   tier     1 | 2 | 3 | 4 | 'Legendary'  (Preisstufe im Shop)
//
// tier -> Preis: 1=800, 2=1600, 3=3200, 4=6400 Seelen. Legendaries haben
// keinen festen Seelenpreis in der Liste, werden fuers Raetsel aber als
// "hoechste" Stufe behandelt (siehe compareTier in game.js).
function slugify(name) {
  return name
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function makeItems(category, tier, names) {
  return names.map((name) => ({ id: slugify(name), name, category, tier }));
}

const ITEMS = [
  ...makeItems('Weapon', 1, [
    'Close Quarters',
    'Extended Magazine',
    'Headshot Booster',
    'High-Velocity Rounds',
    'Monster Rounds',
    'Rapid Rounds',
    'Restorative Shot'
  ]),
  ...makeItems('Weapon', 2, [
    'Active Reload',
    'Fleetfoot',
    'Intensifying Magazine',
    'Kinetic Dash',
    'Long Range',
    'Melee Charge',
    'Mystic Shot',
    'Opening Rounds',
    'Recharging Rush',
    'Slowing Bullets',
    'Spirit Shredder Bullets',
    'Split Shot',
    'Stalker',
    'Swift Striker',
    'Titanic Magazine',
    'Weakening Headshot'
  ]),
  ...makeItems('Weapon', 3, [
    'Alchemical Fire',
    'Ballistic Enchantment',
    'Berserker',
    'Blood Tribute',
    'Burst Fire',
    'Cultist Sacrifice',
    'Escalating Resilience',
    'Express Shot',
    'Headhunter',
    'Heroic Aura',
    'Hollow Point',
    "Hunter's Aura",
    'Point Blank',
    'Shadow Weave',
    'Sharpshooter',
    'Spirit Rend',
    'Tesla Bullets',
    'Toxic Bullets',
    'Weighted Shots'
  ]),
  ...makeItems('Weapon', 4, [
    'Armor Piercing Rounds',
    'Capacitor',
    'Crippling Headshot',
    'Crushing Fists',
    'Frenzy',
    'Glass Cannon',
    'Lucky Shot',
    'Ricochet',
    'Silencer',
    'Spellslinger',
    'Spiritual Overflow'
  ]),
  ...makeItems('Weapon', 'Legendary', ['Haunting Shot', 'Infinite Rounds', 'Runed Gauntlets']),

  ...makeItems('Vitality', 1, [
    'Extra Health',
    'Extra Regen',
    'Extra Stamina',
    'Grit',
    'Healing Rite',
    'Melee Lifesteal',
    'Rebuttal',
    'Sprint Boots'
  ]),
  ...makeItems('Vitality', 2, [
    'Battle Vest',
    'Bullet Lifesteal',
    'Debuff Reducer',
    "Enchanter's Emblem",
    'Enduring Speed',
    'Guardian Ward',
    'Healbane',
    'Healing Booster',
    'Reactive Barrier',
    'Restorative Locket',
    'Return Fire',
    'Spirit Lifesteal',
    'Spirit Shielding',
    'Trophy Collector',
    'Weapon Shielding'
  ]),
  ...makeItems('Vitality', 3, [
    'Bullet Resilience',
    'Counterspell',
    'Dispel Magic',
    'Fortitude',
    'Fury Trance',
    'Healing Nova',
    'Lifestrike',
    'Majestic Leap',
    'Metal Skin',
    'Rescue Beam',
    'Spirit Resilience',
    'Stamina Mastery',
    'Veil Walker',
    'Warp Stone'
  ]),
  ...makeItems('Vitality', 4, [
    'Cheat Death',
    'Colossus',
    'Divine Barrier',
    "Diviner's Kevlar",
    'Healing Tempo',
    'Indomitable',
    'Infuser',
    'Inhibitor',
    'Juggernaut',
    'Leech',
    'Phantom Strike',
    'Plated Armor',
    'Siphon Bullets',
    'Spellbreaker',
    'Unstoppable',
    'Vampiric Burst',
    'Witchmail'
  ]),
  ...makeItems('Vitality', 'Legendary', [
    'Celestial Blessing',
    'Cloak of Opportunity',
    'Electric Slippers',
    'Eternal Gift',
    'Nullification Burst',
    'Seraphim Wings',
    'Shadow Strike'
  ]),

  ...makeItems('Spirit', 1, [
    'Extra Charge',
    'Extra Spirit',
    'Golden Goose Egg',
    'Mystic Burst',
    'Mystic Expansion',
    'Mystic Regeneration',
    'Rusted Barrel',
    'Spirit Strike'
  ]),
  ...makeItems('Spirit', 2, [
    'Arcane Surge',
    'Bullet Resist Shredder',
    'Cold Front',
    'Compress Cooldown',
    'Duration Extender',
    'Improved Spirit',
    'Mystic Slow',
    'Mystic Vulnerability',
    'Quicksilver Reload',
    'Slowing Hex',
    'Spirit Sap',
    'Suppressor'
  ]),
  ...makeItems('Spirit', 3, [
    'Decay',
    'Disarming Hex',
    'Greater Expansion',
    'Knockdown',
    'Radiant Regeneration',
    'Rapid Recharge',
    'Silence Wave',
    'Spirit Snatch',
    'Superior Cooldown',
    'Superior Duration',
    'Surge of Power',
    'Tankbuster',
    'Torment Pulse'
  ]),
  ...makeItems('Spirit', 4, [
    'Arctic Blast',
    'Boundless Spirit',
    'Cursed Relic',
    'Echo Shard',
    'Escalating Exposure',
    'Ethereal Shift',
    'Focus Lens',
    'Lightning Scroll',
    'Magic Carpet',
    'Mercurial Magnum',
    'Mystic Reverb',
    'Refresher',
    'Scourge',
    'Spirit Burn',
    'Transcendent Cooldown',
    'Vortex Web'
  ]),
  ...makeItems('Spirit', 'Legendary', [
    'Frostbite Charm',
    'Mystic Conduit',
    'Mystical Piano',
    'Omnicharge Signet',
    'Prism Blast',
    'Shrink Ray',
    'Unstable Concoction'
  ])
];

const ITEM_CATEGORIES = ['Weapon', 'Vitality', 'Spirit'];
const ITEM_TIER_COSTS = { 1: 800, 2: 1600, 3: 3200, 4: 6400, Legendary: null };
