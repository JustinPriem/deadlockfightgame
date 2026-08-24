// Steuerungs-Layout fuer lokalen 2-Spieler-Modus auf einer Tastatur.
const CONTROL_SCHEMES = {
  p1: { left: 'A', right: 'D', up: 'W', down: 'S', light: 'F', heavy: 'G', special: 'H' },
  p2: { left: 'LEFT', right: 'RIGHT', up: 'UP', down: 'DOWN', light: 'K', heavy: 'L', special: 'SEMICOLON' }
};

function createControlReader(scene, scheme) {
  const codes = Phaser.Input.Keyboard.KeyCodes;
  const keys = {};
  Object.keys(scheme).forEach((action) => {
    keys[action] = scene.input.keyboard.addKey(codes[scheme[action]]);
  });
  return {
    keys,
    getState() {
      return {
        left: keys.left.isDown,
        right: keys.right.isDown,
        up: keys.up.isDown,
        down: keys.down.isDown,
        light: keys.light.isDown,
        heavy: keys.heavy.isDown,
        special: keys.special.isDown
      };
    }
  };
}
