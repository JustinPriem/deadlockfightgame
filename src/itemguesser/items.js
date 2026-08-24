// ACHTUNG: Demo-/Platzhalterdaten! Keine echten Deadlock-Werte.
//
// Diese Datei ist bewusst so aufgebaut, dass sie leicht durch die echte
// Item-Datenbank (z.B. abgetippt/kopiert von deadlock.wiki oder
// deadlockcalc.com) ersetzt werden kann: einfach die ITEMS-Liste unten
// austauschen, das Spiel (game.js) braucht dafuer keine Aenderung.
//
// Schema pro Item:
//   id                 eindeutiger Slug (klein, ohne Leerzeichen)
//   name               Anzeigename (das, was man eintippt)
//   category           'Weapon' | 'Vitality' | 'Spirit'
//   tier               1 | 2 | 3 | 4  (Preisstufe im Shop)
//   activeOrPassive    'Aktiv' | 'Passiv'
//   tags               1-3 kurze Stichworte zum Haupteffekt, fuer den
//                      Vergleich im Raetsel (z.B. ['Leben','Regeneration'])
const ITEMS = [
  {
    id: 'testklinge',
    name: 'Testklinge',
    category: 'Weapon',
    tier: 1,
    activeOrPassive: 'Passiv',
    tags: ['Schaden']
  },
  {
    id: 'uebungsweste',
    name: 'Übungsweste',
    category: 'Vitality',
    tier: 1,
    activeOrPassive: 'Passiv',
    tags: ['Leben']
  },
  {
    id: 'platzhalter-fokus',
    name: 'Platzhalter-Fokus',
    category: 'Spirit',
    tier: 1,
    activeOrPassive: 'Passiv',
    tags: ['Abklingzeit']
  },
  {
    id: 'probe-sprint',
    name: 'Probe-Sprint',
    category: 'Vitality',
    tier: 2,
    activeOrPassive: 'Aktiv',
    tags: ['Tempo', 'Ausweichen']
  },
  {
    id: 'muster-magazin',
    name: 'Muster-Magazin',
    category: 'Weapon',
    tier: 2,
    activeOrPassive: 'Passiv',
    tags: ['Munition', 'Schaden']
  },
  {
    id: 'demo-schild',
    name: 'Demo-Schild',
    category: 'Vitality',
    tier: 3,
    activeOrPassive: 'Aktiv',
    tags: ['Schutz']
  },
  {
    id: 'test-echo',
    name: 'Test-Echo',
    category: 'Spirit',
    tier: 3,
    activeOrPassive: 'Aktiv',
    tags: ['Abklingzeit', 'Reichweite']
  },
  {
    id: 'platzhalter-titan',
    name: 'Platzhalter-Titan',
    category: 'Weapon',
    tier: 4,
    activeOrPassive: 'Passiv',
    tags: ['Schaden', 'Durchschlag']
  }
];

const ITEM_CATEGORIES = ['Weapon', 'Vitality', 'Spirit'];
const ITEM_TIER_COSTS = { 1: 500, 2: 1250, 3: 3200, 4: 6200 };
