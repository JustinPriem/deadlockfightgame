// Der eigentliche 1v1-Kampf: Arena, HUD, Hitbox-Verwaltung, Rundenlogik.
//
// mode 'local' (Default): beide Fighter laufen mit echter Physik, gesteuert
//   von zwei Tastatur-Layouts auf einer Tastatur (unveraendertes Verhalten).
// mode 'host': wie 'local', aber Spieler 2 wird nicht von echten Tasten,
//   sondern von per Netzwerk empfangenen Eingaben gesteuert. Der Host simuliert
//   die gesamte Physik fuer beide Seiten und sendet periodisch einen
//   Zustands-Snapshot an den Gast.
// mode 'guest': keine eigene Physik-Simulation. Beide Fighter sind reine
//   "Puppets", deren Position/HP/Zustand 1:1 vom Host uebernommen wird. Der
//   Gast schickt nur seine eigenen Tasteneingaben an den Host.
class FightScene extends Phaser.Scene {
  constructor() {
    super('Fight');
  }

  init(data) {
    this.mode = data.mode || 'local';
    this.p1Hero = data.p1Hero;
    this.p2Hero = data.p2Hero;
    this.roundOver = false;
    this.disconnectMode = false;
    this.starting = false;
    this.netSendTimer = 0;
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    this.physics.world.setBounds(0, 0, W, H);

    // Hintergrund
    this.add.rectangle(W / 2, H / 2, W, H, 0x120a1f);
    for (let i = 0; i < 6; i++) {
      this.add.rectangle(60 + i * 160, 80, 4, H - 140, 0x2a1c47, 0.4);
    }

    const groundY = H - 70;
    const ground = this.add.rectangle(W / 2, groundY + 35, W, 70, 0x241a3d).setStrokeStyle(2, 0x4a3570);
    this.physics.add.existing(ground, true);

    this.activeHitboxes = [];
    this.ghostRects = [];

    if (this.mode === 'guest') {
      this.buildGuestPuppets(groundY);
    } else {
      this.buildSimulatedFighters(groundY, ground);
    }

    this.buildHud();
    this.restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    if (this.mode !== 'guest') {
      this.roundTime = 60;
      this.roundTimerEvent = this.time.addEvent({
        delay: 1000,
        loop: true,
        callback: () => {
          if (this.roundOver) return;
          this.roundTime--;
          if (this.roundTime <= 0) this.endRoundByTimeout();
        }
      });
    } else {
      this.roundTime = 60;
    }

    this.setupNetworking();
  }

  buildSimulatedFighters(groundY, ground) {
    const W = this.scale.width;

    if (this.mode === 'host') {
      this.controlsP1 = createControlReader(this, CONTROL_SCHEMES.p1);
      this.remoteControls = createRemoteControlReader();
      this.controlsP2 = this.remoteControls;
    } else {
      this.controlsP1 = createControlReader(this, CONTROL_SCHEMES.p1);
      this.controlsP2 = createControlReader(this, CONTROL_SCHEMES.p2);
    }

    this.p1 = new Fighter(this, W * 0.28, groundY - 60, this.p1Hero, this.controlsP1, 1);
    this.p2 = new Fighter(this, W * 0.72, groundY - 60, this.p2Hero, this.controlsP2, -1);
    this.p1.opponentRef = this.p2;
    this.p2.opponentRef = this.p1;

    this.physics.add.collider(this.p1.sprite, ground);
    this.physics.add.collider(this.p2.sprite, ground);
    this.physics.add.collider(this.p1.sprite, this.p2.sprite);
  }

  buildGuestPuppets(groundY) {
    const W = this.scale.width;
    this.p1 = new Fighter(this, W * 0.28, groundY - 60, this.p1Hero, null, 1, { noPhysics: true });
    this.p2 = new Fighter(this, W * 0.72, groundY - 60, this.p2Hero, null, -1, { noPhysics: true });
    this.localControls = createControlReader(this, CONTROL_SCHEMES.p1);
  }

  setupNetworking() {
    if (this.mode === 'host') {
      NET.onData = (msg) => {
        if (msg && msg.t === 'input') this.remoteControls.setState(msg.keys);
      };
      NET.onClose = () => this.onNetDisconnect();
      NET.onError = () => this.onNetDisconnect();
    } else if (this.mode === 'guest') {
      NET.onData = (msg) => this.applyHostMessage(msg);
      NET.onClose = () => this.onNetDisconnect();
      NET.onError = () => this.onNetDisconnect();
    }
  }

  onNetDisconnect() {
    if (this.disconnectMode) return;
    this.disconnectMode = true;
    this.roundOver = true;
    if (this.roundTimerEvent) this.roundTimerEvent.remove();
    this.showResult('VERBINDUNG GETRENNT', 'ENTER fuer Hauptmenue');
  }

  buildHud() {
    const W = this.scale.width;
    const p1Suffix = this.mode === 'host' ? ' (DU)' : this.mode === 'guest' ? ' (GEGNER)' : '';
    const p2Suffix = this.mode === 'host' ? ' (GEGNER)' : this.mode === 'guest' ? ' (DU)' : '';

    this.add
      .text(24, 16, this.p1Hero.name.toUpperCase() + p1Suffix, {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#ffffff'
      })
      .setDepth(20);
    this.add
      .text(W - 24, 16, this.p2Hero.name.toUpperCase() + p2Suffix, {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#ffffff'
      })
      .setOrigin(1, 0)
      .setDepth(20);

    this.add.rectangle(24, 42, 320, 20, 0x000000, 0.5).setOrigin(0, 0.5).setStrokeStyle(2, 0xffffff, 0.6).setDepth(20);
    this.add
      .rectangle(W - 24, 42, 320, 20, 0x000000, 0.5)
      .setOrigin(1, 0.5)
      .setStrokeStyle(2, 0xffffff, 0.6)
      .setDepth(20);
    this.p1BarFill = this.add.rectangle(26, 42, 316, 16, 0x33dd66).setOrigin(0, 0.5).setDepth(21);
    this.p2BarFill = this.add.rectangle(W - 26, 42, 316, 16, 0x33dd66).setOrigin(1, 0.5).setDepth(21);

    this.timerText = this.add
      .text(W / 2, 20, '60', { fontFamily: 'monospace', fontSize: '28px', color: '#ffffff' })
      .setOrigin(0.5, 0)
      .setDepth(20);

    const hint =
      this.mode === 'local'
        ? 'P1: A/D bewegen · W springen · S blocken · F leicht · G schwer · H spezial   |   P2: Pfeile bewegen/springen/blocken · K leicht · L schwer · ; spezial'
        : 'Bewegen: A/D · Springen: W · Blocken: S · Leichter Angriff: F · Schwerer Angriff: G · Spezial: H';

    this.add
      .text(W / 2, this.scale.height - 18, hint, { fontFamily: 'monospace', fontSize: '11px', color: '#8877aa' })
      .setOrigin(0.5, 0)
      .setDepth(20);
  }

  updateHud() {
    const ratio1 = Phaser.Math.Clamp(this.p1.hp / this.p1.maxHp, 0, 1);
    const ratio2 = Phaser.Math.Clamp(this.p2.hp / this.p2.maxHp, 0, 1);
    this.p1BarFill.width = 316 * ratio1;
    this.p2BarFill.width = 316 * ratio2;
    this.p1BarFill.fillColor = ratio1 > 0.3 ? 0x33dd66 : 0xdd3333;
    this.p2BarFill.fillColor = ratio2 > 0.3 ? 0x33dd66 : 0xdd3333;
    this.timerText.setText(String(Math.max(0, Math.ceil(this.roundTime))));
  }

  showDamagePopup(x, y, amount) {
    const t = this.add
      .text(x, y, '-' + amount, { fontFamily: 'monospace', fontSize: '16px', color: '#ffdd55' })
      .setOrigin(0.5)
      .setDepth(10);
    this.tweens.add({ targets: t, y: y - 40, alpha: 0, duration: 500, onComplete: () => t.destroy() });
  }

  // Erzeugt eine Trefferzone (Nahkampf, Projektil oder Flaechen-Spezialangriff).
  // Nur relevant in 'local'/'host', wo tatsaechlich simuliert wird.
  spawnHitbox(owner, opts) {
    const rect = this.add.rectangle(opts.x, opts.y, opts.width, opts.height, opts.color, 0.85);
    rect.setStrokeStyle(2, 0xffffff, 0.5);
    rect.setDepth(5);

    const meta = {
      obj: rect,
      owner,
      hitTargets: new Set(),
      vx: opts.velocityX || 0,
      vy: opts.velocityY || 0,
      life: opts.life || 150,
      bornAt: this.time.now,
      followOwner: !!opts.followOwner,
      followMagnitude: opts.followOwner ? Math.abs(opts.x - owner.sprite.x) : 0,
      followYOffset: opts.followOwner ? opts.y - owner.sprite.y : 0,
      damage: opts.damage,
      knockback: opts.knockback
    };
    this.activeHitboxes.push(meta);
    return meta;
  }

  updateHitboxes(time, delta) {
    const W = this.scale.width;
    for (let i = this.activeHitboxes.length - 1; i >= 0; i--) {
      const hb = this.activeHitboxes[i];

      if (time - hb.bornAt > hb.life) {
        hb.obj.destroy();
        this.activeHitboxes.splice(i, 1);
        continue;
      }

      if (hb.followOwner) {
        hb.obj.x = hb.owner.sprite.x + hb.owner.facing * hb.followMagnitude;
        hb.obj.y = hb.owner.sprite.y + hb.followYOffset;
      } else {
        hb.obj.x += hb.vx * (delta / 1000);
        hb.obj.y += hb.vy * (delta / 1000);
        if (hb.obj.x < -60 || hb.obj.x > W + 60) {
          hb.obj.destroy();
          this.activeHitboxes.splice(i, 1);
          continue;
        }
      }

      const target = hb.owner.opponent;
      if (target && target.state !== 'dead' && !hb.hitTargets.has(target)) {
        if (Phaser.Geom.Intersects.RectangleToRectangle(hb.obj.getBounds(), target.sprite.getBounds())) {
          hb.hitTargets.add(target);
          target.takeDamage(hb.damage, hb.knockback, hb.obj.x);
          this.showDamagePopup(target.sprite.x, target.sprite.y - 70, hb.damage);
          this.cameras.main.shake(70, 0.004);
        }
      }
    }
  }

  onFighterDefeated(fighter) {
    if (this.roundOver) return;
    this.roundOver = true;
    if (this.roundTimerEvent) this.roundTimerEvent.remove();
    const winnerName = fighter === this.p1 ? this.p2Hero.name : this.p1Hero.name;
    this.showResult(winnerName + ' GEWINNT!', this.mode === 'host' ? 'ENTER fuer Rematch' : undefined);
  }

  endRoundByTimeout() {
    if (this.roundOver) return;
    this.roundOver = true;
    let msg;
    if (this.p1.hp === this.p2.hp) {
      msg = 'UNENTSCHIEDEN!';
    } else {
      msg = (this.p1.hp > this.p2.hp ? this.p1Hero.name : this.p2Hero.name) + ' GEWINNT!';
    }
    this.showResult(msg, this.mode === 'host' ? 'ENTER fuer Rematch' : undefined);
  }

  showResult(msg, subMsg) {
    const W = this.scale.width;
    const H = this.scale.height;
    this.lastResultMsg = msg;
    this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.55).setDepth(30);
    this.add
      .text(W / 2, H / 2 - 20, msg, { fontFamily: 'monospace', fontSize: '36px', color: '#ffffff' })
      .setOrigin(0.5)
      .setDepth(31);
    this.add
      .text(W / 2, H / 2 + 30, subMsg || 'ENTER fuer Heldenauswahl', {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#cccccc'
      })
      .setOrigin(0.5)
      .setDepth(31);
  }

  // --- Host: periodisch Zustand an den Gast senden ---
  sendSnapshotToGuest() {
    const hitboxes = this.activeHitboxes.map((hb) => ({
      x: hb.obj.x,
      y: hb.obj.y,
      w: hb.obj.width,
      h: hb.obj.height,
      c: hb.obj.fillColor
    }));
    NET.send({
      t: 'state',
      p1: { x: this.p1.sprite.x, y: this.p1.sprite.y, hp: this.p1.hp, state: this.p1.state, facing: this.p1.facing },
      p2: { x: this.p2.sprite.x, y: this.p2.sprite.y, hp: this.p2.hp, state: this.p2.state, facing: this.p2.facing },
      hitboxes,
      roundTime: this.roundTime,
      roundOver: this.roundOver,
      resultMsg: this.roundOver ? this.lastResultMsg : null
    });
  }

  // --- Gast: vom Host empfangenen Zustand uebernehmen ---
  applyHostMessage(msg) {
    if (!msg || !msg.t) return;
    if (msg.t === 'state') {
      this.p1.applyRemoteState(msg.p1);
      this.p2.applyRemoteState(msg.p2);
      this.roundTime = msg.roundTime;
      this.syncGhostHitboxes(msg.hitboxes || []);
      if (msg.roundOver && !this.roundOver) {
        this.roundOver = true;
        this.showResult(msg.resultMsg || 'RUNDE VORBEI', 'Warte auf Spieler 1 fuer Rematch ...');
      }
    } else if (msg.t === 'rematch') {
      this.scene.start('OnlineCharSelect', { role: 'guest' });
    }
  }

  syncGhostHitboxes(list) {
    this.ghostRects.forEach((r) => r.destroy());
    this.ghostRects = list.map((hb) => {
      const r = this.add.rectangle(hb.x, hb.y, hb.w, hb.h, hb.c, 0.85);
      r.setStrokeStyle(2, 0xffffff, 0.5);
      r.setDepth(5);
      return r;
    });
  }

  updateGuest(delta) {
    this.netSendTimer += delta;
    if (this.netSendTimer > 33) {
      this.netSendTimer = 0;
      NET.send({ t: 'input', keys: this.localControls.getState() });
    }
  }

  update(time, delta) {
    if (this.mode === 'guest') {
      if (!this.disconnectMode) this.updateGuest(delta);
      this.updateHud();
      this.handleRoundOverInput();
      return;
    }

    if (!this.roundOver) {
      this.p1.update(time);
      this.p2.update(time);
      this.updateHitboxes(time, delta);
    }
    this.updateHud();

    if (this.mode === 'host' && !this.disconnectMode) {
      this.netSendTimer += delta;
      if (this.netSendTimer > 33) {
        this.netSendTimer = 0;
        this.sendSnapshotToGuest();
      }
    }

    this.handleRoundOverInput();
  }

  handleRoundOverInput() {
    if (!this.roundOver || !Phaser.Input.Keyboard.JustDown(this.restartKey)) return;

    if (this.disconnectMode) {
      NET.destroy();
      this.scene.start('MainMenu');
    } else if (this.mode === 'local') {
      this.scene.start('CharSelect');
    } else if (this.mode === 'host') {
      NET.send({ t: 'rematch' });
      this.scene.start('OnlineCharSelect', { role: 'host' });
    }
    // Gast wartet auf die 'rematch'-Nachricht vom Host statt selbst zu handeln.
  }
}
