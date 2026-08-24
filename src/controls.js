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

const EMPTY_INPUT_STATE = {
  left: false,
  right: false,
  up: false,
  down: false,
  light: false,
  heavy: false,
  special: false
};

// Liefert dieselbe {getState()}-Schnittstelle wie createControlReader, speist
// sich aber aus Netzwerk-Nachrichten statt aus echten Tasten. Damit kann der
// Host den entfernten Spieler genauso simulieren wie einen lokalen.
function createRemoteControlReader() {
  let latest = EMPTY_INPUT_STATE;
  return {
    setState(state) {
      latest = state || EMPTY_INPUT_STATE;
    },
    getState() {
      return latest;
    }
  };
}
