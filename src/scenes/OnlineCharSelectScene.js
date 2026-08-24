// Heldenauswahl im Online-Modus: jeder Spieler waehlt unabhaengig auf seiner
// eigenen Tastatur, die Auswahl wird per Netzwerk synchronisiert. Der Host
// entscheidet, wann beide bereit sind, und startet den Kampf fuer beide Seiten.
class OnlineCharSelectScene extends Phaser.Scene {
  constructor() {
    super('OnlineCharSelect');
  }

  init(data) {
    this.role = data.role; // 'host' | 'guest'
    this.starting = false;
    this.disconnected = false;
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    this.add.rectangle(W / 2, H / 2, W, H, 0x0d0716);
    this.add
      .text(W / 2, 40, this.role === 'host' ? 'DU BIST SPIELER 1 (links)' : 'DU BIST SPIELER 2 (rechts)', {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#ffffff'
      })
      .setOrigin(0.5);

    this.cardW = 150;
    this.cardH = 190;
    const totalW = HEROES.length * (this.cardW + 16) - 16;
    const startX = W / 2 - totalW / 2 + this.cardW / 2;
    this.cards = HEROES.map((hero, i) => buildHeroCard(this, hero, startX + i * (this.cardW + 16), H / 2, this.cardW, this.cardH));

    this.myIndex = 0;
    this.myReady = false;
    this.oppIndex = null;
    this.oppReady = false;

    this.myCursor = this.add.rectangle(0, 0, this.cardW + 12, this.cardH + 12).setStrokeStyle(4, 0x55aaff);
    this.oppCursor = this.add.rectangle(0, 0, this.cardW + 12, this.cardH + 12).setStrokeStyle(4, 0xff5588).setVisible(false);
    this.myLabel = this.add
      .text(0, 0, 'DU', { fontFamily: 'monospace', fontSize: '13px', color: '#55aaff' })
      .setOrigin(0.5);
    this.oppLabel = this.add
      .text(0, 0, 'GEGNER', { fontFamily: 'monospace', fontSize: '13px', color: '#ff5588' })
      .setOrigin(0.5)
      .setVisible(false);

    this.statusText = this.add
      .text(W / 2, H - 70, '', { fontFamily: 'monospace', fontSize: '15px', color: '#ffdd55' })
      .setOrigin(0.5);
    this.add
      .text(W / 2, H - 40, 'A/D waehlen, F bestaetigen   |   ESC: Verbindung trennen & Hauptmenue', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#cccccc'
      })
      .setOrigin(0.5);

    this.keys = this.input.keyboard.addKeys({ left: 'A', right: 'D', confirm: 'F', esc: 'ESC' });

    NET.onData = (msg) => this.handleNetMessage(msg);
    NET.onClose = () => {
      this.disconnected = true;
      this.statusText.setText('Verbindung getrennt. ESC fuer Hauptmenue.');
    };
    NET.onError = () => {
      this.disconnected = true;
      this.statusText.setText('Verbindungsfehler. ESC fuer Hauptmenue.');
    };

    this.sendPick();
    this.updateCursors();
  }

  sendPick() {
    NET.send({ t: 'pick', heroIndex: this.myIndex, ready: this.myReady });
  }

  handleNetMessage(msg) {
    if (!msg || !msg.t) return;
    if (msg.t === 'pick') {
      this.oppIndex = msg.heroIndex;
      this.oppReady = msg.ready;
      this.updateCursors();
      if (this.role === 'host') this.maybeStart();
    } else if (msg.t === 'start') {
      this.startFight(msg.p1HeroId, msg.p2HeroId);
    }
  }

  updateCursors() {
    const c = this.cards[this.myIndex];
    this.myCursor.setPosition(c.x, c.y);
    this.myLabel.setPosition(c.x, c.y - this.cardH / 2 - 14);

    if (this.oppIndex !== null) {
      const oc = this.cards[this.oppIndex];
      this.oppCursor.setPosition(oc.x, oc.y).setVisible(true);
      this.oppLabel.setPosition(oc.x, oc.y + this.cardH / 2 + 14).setVisible(true);
    }

    const parts = [];
    parts.push('Du: ' + HEROES[this.myIndex].name + (this.myReady ? ' (bereit)' : ''));
    parts.push(
      'Gegner: ' + (this.oppIndex !== null ? HEROES[this.oppIndex].name + (this.oppReady ? ' (bereit)' : '') : '...')
    );
    this.statusText.setText(parts.join('   |   '));
  }

  maybeStart() {
    if (this.starting) return;
    if (this.role !== 'host') return;
    if (!this.myReady || !this.oppReady || this.oppIndex === null) return;

    this.starting = true;
    const p1HeroId = HEROES[this.myIndex].id;
    const p2HeroId = HEROES[this.oppIndex].id;
    NET.send({ t: 'start', p1HeroId, p2HeroId });
    this.time.delayedCall(150, () => this.startFight(p1HeroId, p2HeroId));
  }

  startFight(p1HeroId, p2HeroId) {
    if (this.starting && this.role === 'guest') return;
    this.starting = true;
    const p1Hero = HEROES.find((h) => h.id === p1HeroId);
    const p2Hero = HEROES.find((h) => h.id === p2HeroId);
    this.scene.start('Fight', { mode: this.role, p1Hero, p2Hero });
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.keys.esc)) {
      NET.destroy();
      this.scene.start('MainMenu');
      return;
    }

    if (this.disconnected || this.starting) return;

    if (!this.myReady) {
      let changed = false;
      if (Phaser.Input.Keyboard.JustDown(this.keys.left)) {
        this.myIndex = (this.myIndex - 1 + HEROES.length) % HEROES.length;
        changed = true;
      }
      if (Phaser.Input.Keyboard.JustDown(this.keys.right)) {
        this.myIndex = (this.myIndex + 1) % HEROES.length;
        changed = true;
      }
      if (Phaser.Input.Keyboard.JustDown(this.keys.confirm)) {
        this.myReady = true;
        changed = true;
      }
      if (changed) {
        this.sendPick();
        this.updateCursors();
      }
    }

    if (this.role === 'host') this.maybeStart();
  }
}
