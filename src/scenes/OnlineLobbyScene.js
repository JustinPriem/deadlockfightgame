// Verbindungsaufbau: entweder einen Raum erstellen (Host) und den Link
// anzeigen, oder automatisch einem Raum beitreten (Gast, kam ueber ?room=CODE).
class OnlineLobbyScene extends Phaser.Scene {
  constructor() {
    super('OnlineLobby');
  }

  init(data) {
    this.hostMode = !!data.host;
    this.autoJoinCode = data.autoJoinCode || null;
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    this.add.rectangle(W / 2, H / 2, W, H, 0x0d0716);
    this.statusText = this.add
      .text(W / 2, H / 2 - 70, '', {
        fontFamily: 'monospace',
        fontSize: '17px',
        color: '#ffffff',
        align: 'center',
        wordWrap: { width: W - 120 }
      })
      .setOrigin(0.5);
    this.codeText = this.add
      .text(W / 2, H / 2 - 10, '', { fontFamily: 'monospace', fontSize: '32px', color: '#ffdd55' })
      .setOrigin(0.5);
    this.linkText = this.add
      .text(W / 2, H / 2 + 40, '', {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#88ccff',
        align: 'center',
        wordWrap: { width: W - 100 }
      })
      .setOrigin(0.5);
    this.hintText = this.add
      .text(W / 2, H - 40, 'ESC: zurueck zum Menue', { fontFamily: 'monospace', fontSize: '12px', color: '#8877aa' })
      .setOrigin(0.5);

    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    NET.onData = null;
    NET.onOpen = null;
    NET.onError = (err) => {
      const reason = err && err.type ? err.type : err && err.message ? err.message : 'unbekannt';
      this.statusText.setText('Verbindungsfehler (' + reason + ').\nESC fuer Hauptmenue');
      this.codeText.setText('');
      this.linkText.setText('');
    };
    NET.onClose = () => {
      this.statusText.setText('Verbindung getrennt.\nESC fuer Hauptmenue');
    };

    if (this.hostMode) {
      this.startHosting();
    } else if (this.autoJoinCode) {
      this.startJoining(this.autoJoinCode);
    } else {
      this.statusText.setText('Kein Raum-Code angegeben.\nESC fuer Hauptmenue');
    }
  }

  startHosting() {
    const code = this.generateCode();
    this.statusText.setText('Erstelle Raum...');
    NET.hostRoom(code)
      .then(() => {
        const url = location.origin + location.pathname + '?room=' + code;
        this.statusText.setText('Warte auf Mitspieler ...\nLink an einen Freund schicken:');
        this.codeText.setText(code);
        this.linkText.setText(url);

        // Sobald sich jemand verbindet, geht's direkt in die Heldenauswahl.
        const check = () => {
          if (!this.scene.isActive()) return;
          if (NET.conn && NET.conn.open) {
            this.scene.start('OnlineCharSelect', { role: 'host' });
            return;
          }
          this.time.delayedCall(150, check);
        };
        check();
      })
      .catch(() => {
        /* Fehleranzeige laeuft ueber NET.onError */
      });
  }

  startJoining(code) {
    this.statusText.setText('Verbinde mit Raum ' + code + ' ...');
    NET.joinRoom(code)
      .then(() => {
        this.scene.start('OnlineCharSelect', { role: 'guest' });
      })
      .catch(() => {
        this.statusText.setText('Konnte Raum ' + code + ' nicht erreichen.\nESC fuer Hauptmenue');
      });
  }

  generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // ohne leicht verwechselbare Zeichen
    let s = '';
    for (let i = 0; i < 5; i++) s += chars[Phaser.Math.Between(0, chars.length - 1)];
    return s;
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
      NET.destroy();
      this.scene.start('MainMenu');
    }
  }
}
