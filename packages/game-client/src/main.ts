import * as Phaser from 'phaser';
import { PlayerNameScene } from './scenes/PlayerNameScene';
import { StartScene } from './scenes/StartScene';
import { LobbyFinderScene } from './scenes/LobbyFinderScene';
import { ReadyScene } from './scenes/ReadyScene';
import { GameScene } from './scenes/GameScene';
import { GameOverScene } from './scenes/GameOverScene';
import { CreditsScene } from './scenes/CreditsScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  backgroundColor: '#2c3e50',
  scene: [
    PlayerNameScene,
    StartScene,
    LobbyFinderScene, 
    ReadyScene,
    GameScene,
    GameOverScene,
    CreditsScene
  ],
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  }
};

new Phaser.Game(config);
