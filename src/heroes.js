// Vereinfachte, "vom Prinzip her" an Deadlock angelehnte Heldendaten.
// Keine offizielle Balance/Werte – Ziel ist Spielspaß in einem 2D-Fighting-Game-Prototyp,
// nicht eine exakte Umsetzung der Original-Fähigkeiten.
const HEROES = [
  {
    id: 'infernus',
    name: 'Infernus',
    color: 0xff5522,
    accentColor: 0xffaa33,
    description: 'Aggressiver Nahkaempfer mit Feuerschaden.',
    speed: 220,
    jumpVelocity: -560,
    maxHp: 100,
    special: {
      name: 'Flammensturm',
      type: 'dash',
      damage: 14,
      cooldown: 2800,
      startup: 80,
      duration: 220,
      dashSpeed: 620,
      knockback: 260,
      color: 0xff7733
    }
  },
  {
    id: 'vindicta',
    name: 'Vindicta',
    color: 0x33ccaa,
    accentColor: 0xaaffdd,
    description: 'Fernkaempferin mit schnellem Kraehen-Projektil.',
    speed: 200,
    jumpVelocity: -600,
    maxHp: 90,
    special: {
      name: 'Kraehenschwarm',
      type: 'projectile',
      damage: 10,
      cooldown: 2200,
      startup: 120,
      projectileSpeed: 640,
      projectileLife: 900,
      knockback: 160,
      color: 0x55eecc,
      width: 26,
      height: 14
    }
  },
  {
    id: 'abrams',
    name: 'Abrams',
    color: 0x8855ff,
    accentColor: 0xcbb3ff,
    description: 'Tank mit verzoegertem, hartem Flaechenschlag.',
    speed: 170,
    jumpVelocity: -500,
    maxHp: 130,
    special: {
      name: 'Seismischer Schlag',
      type: 'aoeDelayed',
      damage: 22,
      cooldown: 3400,
      startup: 500,
      hitDuration: 180,
      knockback: 420,
      range: 130,
      color: 0xa377ff
    }
  },
  {
    id: 'seven',
    name: 'Seven',
    color: 0xffdd33,
    accentColor: 0xfff2aa,
    description: 'Kontrolliert den Raum um sich mit Blitzschlaegen.',
    speed: 190,
    jumpVelocity: -560,
    maxHp: 100,
    special: {
      name: 'Sturmwolke',
      type: 'aoePulse',
      damage: 6,
      ticks: 3,
      tickInterval: 260,
      cooldown: 3600,
      startup: 200,
      range: 120,
      knockback: 60,
      color: 0xffe866
    }
  },
  {
    id: 'wraith',
    name: 'Wraith',
    color: 0xff44aa,
    accentColor: 0xffb3dd,
    description: 'Extrem mobil, schlaegt beim Teleport zu.',
    speed: 230,
    jumpVelocity: -580,
    maxHp: 85,
    special: {
      name: 'Kartentrick-Sprung',
      type: 'teleport',
      damage: 12,
      cooldown: 2600,
      startup: 60,
      teleportDistance: 220,
      knockback: 220,
      color: 0xff77c2
    }
  }
];
