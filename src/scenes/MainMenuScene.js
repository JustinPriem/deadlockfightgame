// Startbildschirm: lokal (ein Keyboard) vs. online (Link teilen).
// Kommt jemand ueber einen geteilten Raum-Link (?room=CODE) auf die Seite,
// wird das Menue uebersprungen und direkt der Beitritts-Flow gestartet.
class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenu');
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    this.add.rectangle(W / 2, H / 2, W, H, 0x0d0716);
    this.add
      .text(W / 2, 90, 'DEADLOCK ARENA', { fontFamily: 'monospace', fontSize: '40px', color: '#ffffff' })
      .setOrigin(0.5);
    this.add
      .text(W / 2, 128, '(Inoffizielles Fan-Minispiel, nur zum Spass — keine offizielle Deadlock-Balance)', {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#8877aa'
      })
      .setOrigin(0.5);

    const params = new URLSearchParams(location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      this.scene.start('OnlineLobby', { autoJoinCode: roomParam.toUpperCase() });
      return;
    }

    this.options = [
      { label: '1) Lokal spielen (ein Keyboard, 2 Spieler)', action: () => this.scene.start('CharSelect') },
      { label: '2) Online-Raum erstellen (Link teilen)', action: () => this.scene.start('OnlineLobby', { host: true }) }
    ];
    this.optionIndex = 0;
    this.optionTexts = this.options.map((o, i) =>
      this.add
        .text(W / 2, 260 + i * 50, o.label, { fontFamily: 'monospace', fontSize: '18px', color: '#ffffff' })
        .setOrigin(0.5)
    );

    this.add
      .text(W / 2, H - 40, 'Waehlen: W/S · Bestaetigen: ENTER   (oder direkt 1 / 2 druecken)', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#8877aa'
      })
      .setOrigin(0.5);

    this.keys = this.input.keyboard.addKeys({
      up: 'UP',
      down: 'DOWN',
      w: 'W',
      s: 'S',
      enter: 'ENTER',
      one: 'ONE',
      two: 'TWO'
    });

    this.highlight();
  }

  highlight() {
    this.optionTexts.forEach((t, i) => t.setColor(i === this.optionIndex ? '#ffdd55' : '#ffffff'));
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.keys.up) || Phaser.Input.Keyboard.JustDown(this.keys.w)) {
      this.optionIndex = (this.optionIndex - 1 + this.options.length) % this.options.length;
      this.highlight();
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.down) || Phaser.Input.Keyboard.JustDown(this.keys.s)) {
      this.optionIndex = (this.optionIndex + 1) % this.options.length;
      this.highlight();
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.enter)) this.options[this.optionIndex].action();
    if (Phaser.Input.Keyboard.JustDown(this.keys.one)) this.options[0].action();
    if (Phaser.Input.Keyboard.JustDown(this.keys.two)) this.options[1].action();
  }
}
