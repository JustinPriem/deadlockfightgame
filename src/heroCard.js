// Gemeinsame Karten-Darstellung fuer die lokale und die Online-Heldenauswahl.
function buildHeroCard(scene, hero, x, y, cardW, cardH) {
  const bg = scene.add.rectangle(x, y, cardW, cardH, 0x1c1330).setStrokeStyle(2, 0x3a2a5c);
  const swatch = scene.add.rectangle(x, y - 50, 56, 100, hero.color).setStrokeStyle(2, 0x111116);
  const name = scene.add
    .text(x, y + 42, hero.name, { fontFamily: 'monospace', fontSize: '16px', color: '#ffffff' })
    .setOrigin(0.5);
  const desc = scene.add
    .text(x, y + 66, hero.description, {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#9988bb',
      align: 'center',
      wordWrap: { width: cardW - 16 }
    })
    .setOrigin(0.5, 0);
  const spec = scene.add
    .text(x, y + 98, 'Spezial: ' + hero.special.name, {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#ffcc66',
      align: 'center',
      wordWrap: { width: cardW - 16 }
    })
    .setOrigin(0.5, 0);
  return { bg, swatch, name, desc, spec, x, y };
}
