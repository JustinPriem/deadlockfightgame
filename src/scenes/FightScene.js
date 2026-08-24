// Der eigentliche 1v1-Kampf: Arena, HUD, Hitbox-Verwaltung, Rundenlogik.
class FightScene extends Phaser.Scene {
  constructor() {
    super('Fight');
  }

  init(data) {
    this.p1Hero = data.p1Hero;
    this.p2Hero = data.p2Hero;
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
    this.roundOver = false;

    this.controlsP1 = createControlReader(this, CONTROL_SCHEMES.p1);
    this.controlsP2 = createControlReader(this, CONTROL_SCHEMES.p2);

    this.p1 = new Fighter(this, W * 0.28, groundY - 60, this.p1Hero, this.controlsP1, 1);
    this.p2 = new Fighter(this, W * 0.72, groundY - 60, this.p2Hero, this.controlsP2, -1);
    this.p1.opponentRef = this.p2;
    this.p2.opponentRef = this.p1;

    this.physics.add.collider(this.p1.sprite, ground);
    this.physics.add.collider(this.p2.sprite, ground);
    this.physics.add.collider(this.p1.sprite, this.p2.sprite);

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

    this.buildHud();

    this.restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
  }

  buildHud() {
    const W = this.scale.width;

    this.add
      .text(24, 16, this.p1Hero.name.toUpperCase(), { fontFamily: 'monospace', fontSize: '18px', color: '#ffffff' })
      .setDepth(20);
    this.add
      .text(W - 24, 16, this.p2Hero.name.toUpperCase(), {
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

    this.add
      .text(
        W / 2,
        this.scale.height - 18,
        'P1: A/D bewegen · W springen · S blocken · F leicht · G schwer · H spezial   |   P2: Pfeile bewegen/springen/blocken · K leicht · L schwer · ; spezial',
        { fontFamily: 'monospace', fontSize: '11px', color: '#8877aa' }
      )
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
    this.timerText.setText(String(Math.max(0, this.roundTime)));
  }

  showDamagePopup(x, y, amount) {
    const t = this.add
      .text(x, y, '-' + amount, { fontFamily: 'monospace', fontSize: '16px', color: '#ffdd55' })
      .setOrigin(0.5)
      .setDepth(10);
    this.tweens.add({ targets: t, y: y - 40, alpha: 0, duration: 500, onComplete: () => t.destroy() });
  }

  // Erzeugt eine Trefferzone (Nahkampf, Projektil oder Flaechen-Spezialangriff).
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
    this.roundTimerEvent.remove();
    const winnerName = fighter === this.p1 ? this.p2Hero.name : this.p1Hero.name;
    this.showResult(winnerName + ' GEWINNT!');
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
    this.showResult(msg);
  }

  showResult(msg) {
    const W = this.scale.width;
    const H = this.scale.height;
    this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.55).setDepth(30);
    this.add
      .text(W / 2, H / 2 - 20, msg, { fontFamily: 'monospace', fontSize: '36px', color: '#ffffff' })
      .setOrigin(0.5)
      .setDepth(31);
    this.add
      .text(W / 2, H / 2 + 30, 'ENTER fuer Heldenauswahl', { fontFamily: 'monospace', fontSize: '16px', color: '#cccccc' })
      .setOrigin(0.5)
      .setDepth(31);
  }

  update(time, delta) {
    if (!this.roundOver) {
      this.p1.update(time);
      this.p2.update(time);
      this.updateHitboxes(time, delta);
    }
    this.updateHud();

    if (this.roundOver && Phaser.Input.Keyboard.JustDown(this.restartKey)) {
      this.scene.start('CharSelect');
    }
  }
}
