const GAME_WIDTH = 960;
const GAME_HEIGHT = 540;

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  backgroundColor: '#0d0716',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1800 },
      debug: false
    }
  },
  scene: [MainMenuScene, CharSelectScene, OnlineLobbyScene, OnlineCharSelectScene, FightScene]
};

window.addEventListener('load', () => {
  // Auf window abgelegt, um in der Browser-Konsole beim Debuggen leicht an
  // die laufende Szene/den Spielzustand zu kommen (z.B. window.game.scene).
  window.game = new Phaser.Game(config);
});
