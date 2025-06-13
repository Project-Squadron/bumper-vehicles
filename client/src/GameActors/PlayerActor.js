import keyManager from '../EventObjects/KeyManager.js';
import socket from '../networking/socket.js';
import DynamicActor from './DynamicActor.js';
import { loadImageAsync } from '../utils/images.js';

export class PlayerActor extends DynamicActor {
  constructor(config) {
    super({ ...config, isAnimated: true, width: config.radius * 2, height: config.radius * 2 });

    // names of images we want to load for our player
    this.imageNames.push(
      'Penguin/penguin_walk01.png',
      'Penguin/penguin_walk02.png',
      'Penguin/penguin_walk03.png',
      'Penguin/penguin_walk04.png'
    );

    this.isLocalPlayer = config.isLocalPlayer;
    this.socket_id = config.socket_id || null;

    // Store powerup names from userData
    this.powerups = config.powerups || [];
    
    // Map to store loaded powerup images
    this.powerup_images = new Map();

    // if isLocalPlayer is true, then we will use these
    this.inputs = {
      up: false,
      down: false,
      left: false,
      right: false,
      powerup1: false,
      powerup2: false,
      powerup3: false,
      powerup4: false,
      powerup5: false
    };
    this.lastInputUpdate = 0;
    this.inputUpdateInterval = 1000 / 60; // 60fps

    this.radius = config.radius;
  }

  async loadImages() {
    await super.loadImages();

    if (!this.isLocalPlayer) return;
    
    // Load powerup images
    for (const powerupName of this.powerups) {
      try {
        const imagePath = this.game.powerupImages.get(powerupName);
        const loadedImg = await loadImageAsync(this.p, imagePath);
        this.powerup_images.set(powerupName, loadedImg);
      } catch (error) {
        console.error("Failed to load powerup image:", powerupName, error);
      }
    }
  }

  /**
   * Update the player's input state
   */
  updateInputs() {
    this.inputs = {
      up: keyManager.pressed('up'),
      down: keyManager.pressed('down'),
      left: keyManager.pressed('left'),
      right: keyManager.pressed('right'),
      powerup1: keyManager.pressed('one'),
      powerup2: keyManager.pressed('two'),
      powerup3: keyManager.pressed('three'),
      powerup4: keyManager.pressed('four'),
      powerup5: keyManager.pressed('five')
    };
    

    this.sendInputs();
  }

  /**
   * Send current input state to the server
   */
  sendInputs() {
    const currentTime = Date.now();
    if (socket.id && currentTime - this.lastInputUpdate >= this.inputUpdateInterval) {
      socket.emit('playerInput', {
        playerId: this.id,
        input: this.inputs
      });
      this.lastInputUpdate = currentTime;
    }
  }

  update() {
    if (this.isLocalPlayer) {
      this.updateInputs();
      this.sendInputs();
    }

    this.display();
  }
} 