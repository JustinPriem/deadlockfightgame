// Ein Fighter kapselt Physik-Koerper, Zustandsmaschine, Eingaben und Angriffe
// eines Spielers waehrend eines Kampfes.
class Fighter {
  // opts.noPhysics: fuer den Online-Gast, der nur ein "Puppet" rendert
  // (Position kommt per Netzwerk vom Host) statt selbst zu simulieren.
  constructor(scene, x, y, heroData, controls, startFacing, opts) {
    opts = opts || {};
    this.scene = scene;
    this.hero = heroData;
    this.controls = controls;
    this.facing = startFacing;
    this.opponentRef = null;
    this.isPuppet = !!opts.noPhysics;

    // Koerper: einfaches farbiges Rechteck (kein Sprite-Asset noetig).
    this.sprite = scene.add.rectangle(x, y, 56, 120, heroData.color).setStrokeStyle(3, 0x111116);
    this.sprite.setDepth(2);
    if (!this.isPuppet) {
      scene.physics.add.existing(this.sprite);
      this.sprite.body.setCollideWorldBounds(true);
      this.sprite.body.setBounce(0);
    }

    // Kleiner Blickrichtungs-Marker (rein kosmetisch, keine Physik).
    this.marker = scene.add.rectangle(x, y, 10, 10, heroData.accentColor);
    this.marker.setDepth(3);

    this.maxHp = heroData.maxHp;
    this.hp = this.maxHp;
    this.state = 'idle'; // idle, walk, jump, block, attackLight, attackHeavy, special, hitstun, dead
    this.stateUntil = 0;
    this.cooldowns = { light: 0, heavy: 0, special: 0 };
    this.isBlocking = false;
    this.prevKeys = {};
  }

  get opponent() {
    return this.opponentRef;
  }

  isLocked() {
    return (
      this.state === 'attackLight' ||
      this.state === 'attackHeavy' ||
      this.state === 'special' ||
      this.state === 'hitstun' ||
      this.state === 'dead'
    );
  }

  setState(state, durationMs) {
    this.state = state;
    this.stateUntil = this.scene.time.now + (durationMs || 0);
  }

  takeDamage(amount, knockback, fromX) {
    if (this.state === 'dead') return;

    const blocking = this.isBlocking;
    const dmg = blocking ? Math.max(1, Math.round(amount * 0.25)) : amount;
    const kb = blocking ? knockback * 0.35 : knockback;

    this.hp = Math.max(0, this.hp - dmg);
    const dir = this.sprite.x < fromX ? -1 : 1;
    this.sprite.body.setVelocityX(dir * kb);

    if (this.hp <= 0) {
      this.setState('dead', 999999);
      this.scene.onFighterDefeated(this);
      return;
    }

    if (blocking) {
      this.setState('hitstun', 140);
    } else {
      this.sprite.body.setVelocityY(-140);
      this.setState('hitstun', 300);
    }
  }

  doLightAttack(time) {
    this.setState('attackLight', 220);
    this.cooldowns.light = time + 260;
    this.sprite.body.setVelocityX(0);
    this.scene.time.delayedCall(80, () => {
      if (this.state !== 'attackLight') return;
      this.spawnMelee({ damage: 6, knockback: 180, range: 46, height: 60, life: 100, color: this.hero.accentColor });
    });
  }

  doHeavyAttack(time) {
    this.setState('attackHeavy', 420);
    this.cooldowns.heavy = time + 650;
    this.sprite.body.setVelocityX(0);
    this.scene.time.delayedCall(220, () => {
      if (this.state !== 'attackHeavy') return;
      this.spawnMelee({ damage: 13, knockback: 320, range: 58, height: 76, life: 120, color: this.hero.accentColor });
    });
  }

  spawnMelee(o) {
    const x = this.sprite.x + this.facing * (28 + o.range / 2);
    const y = this.sprite.y;
    this.scene.spawnHitbox(this, {
      x,
      y,
      width: o.range,
      height: o.height,
      damage: o.damage,
      knockback: o.knockback,
      color: o.color,
      life: o.life
    });
  }

  doSpecial(time) {
    const sp = this.hero.special;
    const totalLock = sp.startup + (sp.duration || sp.hitDuration || 250);
    this.setState('special', totalLock);
    this.cooldowns.special = time + sp.cooldown;
    this.scene.time.delayedCall(sp.startup, () => {
      if (this.state === 'dead') return;
      this.executeSpecial(sp);
    });
  }

  executeSpecial(sp) {
    const scene = this.scene;
    const facing = this.facing;
    const originX = this.sprite.x;
    const originY = this.sprite.y;

    switch (sp.type) {
      case 'dash': {
        this.sprite.body.setVelocityX(facing * sp.dashSpeed);
        scene.spawnHitbox(this, {
          x: originX + facing * 40,
          y: originY,
          width: 70,
          height: 90,
          damage: sp.damage,
          knockback: sp.knockback,
          color: sp.color,
          life: sp.duration,
          followOwner: true
        });
        break;
      }
      case 'projectile': {
        scene.spawnHitbox(this, {
          x: originX + facing * 40,
          y: originY,
          width: sp.width,
          height: sp.height,
          damage: sp.damage,
          knockback: sp.knockback,
          color: sp.color,
          life: sp.projectileLife,
          velocityX: facing * sp.projectileSpeed
        });
        break;
      }
      case 'aoeDelayed': {
        scene.spawnHitbox(this, {
          x: originX + facing * (sp.range / 2),
          y: originY,
          width: sp.range,
          height: 110,
          damage: sp.damage,
          knockback: sp.knockback,
          color: sp.color,
          life: sp.hitDuration
        });
        scene.cameras.main.shake(140, 0.008);
        break;
      }
      case 'aoePulse': {
        let ticksLeft = sp.ticks;
        const doTick = () => {
          if (this.state === 'dead') return;
          scene.spawnHitbox(this, {
            x: originX,
            y: originY,
            width: sp.range,
            height: 130,
            damage: sp.damage,
            knockback: sp.knockback,
            color: sp.color,
            life: 120
          });
          ticksLeft--;
          if (ticksLeft > 0) scene.time.delayedCall(sp.tickInterval, doTick);
        };
        doTick();
        break;
      }
      case 'teleport': {
        scene.spawnHitbox(this, {
          x: originX + facing * 30,
          y: originY,
          width: 60,
          height: 100,
          damage: sp.damage,
          knockback: sp.knockback,
          color: sp.color,
          life: 120
        });
        const W = scene.scale.width;
        this.sprite.x = Phaser.Math.Clamp(originX + facing * sp.teleportDistance, 40, W - 40);
        break;
      }
      default:
        break;
    }
  }

  // Fuer den Online-Gast: uebernimmt den vom Host gesendeten Zustand 1:1,
  // ohne eigene Physik/Zustandsmaschine laufen zu lassen.
  applyRemoteState(d) {
    this.sprite.x = d.x;
    this.sprite.y = d.y;
    this.facing = d.facing;
    this.hp = d.hp;
    this.state = d.state;
    this.sprite.setAlpha(d.state === 'dead' ? 0.5 : d.state === 'block' ? 0.75 : 1);
    this.marker.x = this.sprite.x + this.facing * 32;
    this.marker.y = this.sprite.y - 40;
  }

  update(time) {
    if (this.state === 'dead') return;

    const keys = this.controls.getState();
    const onGround = this.sprite.body.blocked.down;

    if (this.isLocked() && time >= this.stateUntil) {
      this.state = onGround ? 'idle' : 'jump';
    }

    if (!this.isLocked() && this.opponentRef) {
      this.facing = this.opponentRef.sprite.x >= this.sprite.x ? 1 : -1;
    }

    this.isBlocking = false;

    if (!this.isLocked()) {
      const wantsBlock = keys.down && onGround;

      if (wantsBlock) {
        this.isBlocking = true;
        this.sprite.body.setVelocityX(0);
        this.setState('block');
      } else {
        let moveX = 0;
        if (keys.left) moveX -= 1;
        if (keys.right) moveX += 1;
        this.sprite.body.setVelocityX(moveX * this.hero.speed);
        if (onGround) this.setState(moveX !== 0 ? 'walk' : 'idle');

        if (keys.up && onGround) {
          this.sprite.body.setVelocityY(this.hero.jumpVelocity);
        }
      }

      if (!onGround && (this.state === 'idle' || this.state === 'walk' || this.state === 'block')) {
        this.setState('jump');
      }

      if (keys.light && !this.prevKeys.light && time >= this.cooldowns.light) {
        this.doLightAttack(time);
      } else if (keys.heavy && !this.prevKeys.heavy && time >= this.cooldowns.heavy) {
        this.doHeavyAttack(time);
      } else if (keys.special && !this.prevKeys.special && time >= this.cooldowns.special) {
        this.doSpecial(time);
      }
    }

    this.prevKeys = keys;
    this.marker.x = this.sprite.x + this.facing * 32;
    this.marker.y = this.sprite.y - 40;
  }
}
