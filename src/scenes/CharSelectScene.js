// Heldenauswahl: beide Spieler waehlen gleichzeitig auf derselben Tastatur.
class CharSelectScene extends Phaser.Scene {
  constructor() {
    super('CharSelect');
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    this.add.rectangle(W / 2, H / 2, W, H, 0x0d0716);
    this.add
      .text(W / 2, 46, 'DEADLOCK ARENA — HELDENAUSWAHL', {
        fontFamily: 'monospace',
        fontSize: '26px',
        color: '#ffffff'
      })
      .setOrigin(0.5);
    this.add
      .text(W / 2, 78, '(Inoffizielles Fan-Minispiel, nur zum Spass — keine offizielle Deadlock-Balance)', {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#8877aa'
      })
      .setOrigin(0.5);

    this.cardW = 150;
    this.cardH = 200;
    const totalW = HEROES.length * (this.cardW + 20) - 20;
    const startX = W / 2 - totalW / 2 + this.cardW / 2;
    this.cards = HEROES.map((hero, i) => this.buildCard(hero, startX + i * (this.cardW + 20), H / 2 + 10));

    this.p1Index = 0;
    this.p2Index = HEROES.length - 1;
    this.p1Confirmed = false;
    this.p2Confirmed = false;
    this.transitioning = false;

    this.p1Cursor = this.add.rectangle(0, 0, this.cardW + 14, this.cardH + 14).setStrokeStyle(4, 0x55aaff);
    this.p2Cursor = this.add.rectangle(0, 0, this.cardW + 14, this.cardH + 14).setStrokeStyle(4, 0xff5588);

    this.p1Label = this.add
      .text(0, 0, 'P1', { fontFamily: 'monospace', fontSize: '14px', color: '#55aaff' })
      .setOrigin(0.5);
    this.p2Label = this.add
      .text(0, 0, 'P2', { fontFamily: 'monospace', fontSize: '14px', color: '#ff5588' })
      .setOrigin(0.5);

    this.add
      .text(W / 2, H - 40, 'P1: A/D waehlen, F bestaetigen   |   P2: Pfeile waehlen, K bestaetigen', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#cccccc'
      })
      .setOrigin(0.5);

    this.statusText = this.add
      .text(W / 2, H - 68, '', { fontFamily: 'monospace', fontSize: '16px', color: '#ffdd55' })
      .setOrigin(0.5);

    this.keys = this.input.keyboard.addKeys({
      p1Left: 'A',
      p1Right: 'D',
      p1Confirm: 'F',
      p2Left: 'LEFT',
      p2Right: 'RIGHT',
      p2Confirm: 'K',
      esc: 'ESC'
    });

    this.updateCursors();
  }

  buildCard(hero, x, y) {
    return buildHeroCard(this, hero, x, y, this.cardW, this.cardH);
  }

  updateCursors() {
    const c1 = this.cards[this.p1Index];
    const c2 = this.cards[this.p2Index];
    this.p1Cursor.setPosition(c1.x, c1.y - 14);
    this.p1Label.setPosition(c1.x, c1.y - this.cardH / 2 - 16);
    this.p2Cursor.setPosition(c2.x, c2.y + 14);
    this.p2Label.setPosition(c2.x, c2.y + this.cardH / 2 + 16);

    const status = [];
    if (this.p1Confirmed) status.push('P1 bereit: ' + HEROES[this.p1Index].name);
    if (this.p2Confirmed) status.push('P2 bereit: ' + HEROES[this.p2Index].name);
    this.statusText.setText(status.join('   |   '));
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.keys.esc)) {
      this.scene.start('MainMenu');
      return;
    }

    if (!this.p1Confirmed) {
      if (Phaser.Input.Keyboard.JustDown(this.keys.p1Left)) {
        this.p1Index = (this.p1Index - 1 + HEROES.length) % HEROES.length;
      }
      if (Phaser.Input.Keyboard.JustDown(this.keys.p1Right)) {
        this.p1Index = (this.p1Index + 1) % HEROES.length;
      }
      if (Phaser.Input.Keyboard.JustDown(this.keys.p1Confirm)) {
        this.p1Confirmed = true;
      }
    }

    if (!this.p2Confirmed) {
      if (Phaser.Input.Keyboard.JustDown(this.keys.p2Left)) {
        this.p2Index = (this.p2Index - 1 + HEROES.length) % HEROES.length;
      }
      if (Phaser.Input.Keyboard.JustDown(this.keys.p2Right)) {
        this.p2Index = (this.p2Index + 1) % HEROES.length;
      }
      if (Phaser.Input.Keyboard.JustDown(this.keys.p2Confirm)) {
        this.p2Confirmed = true;
      }
    }

    this.updateCursors();

    if (this.p1Confirmed && this.p2Confirmed && !this.transitioning) {
      this.transitioning = true;
      this.time.delayedCall(300, () => {
        this.scene.start('Fight', { p1Hero: HEROES[this.p1Index], p2Hero: HEROES[this.p2Index] });
      });
    }
  }
}
