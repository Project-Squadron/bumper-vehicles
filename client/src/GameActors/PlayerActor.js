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
      one: false,
      two: false,
      three: false,
      four: false,
      five: false,
      space: false
    };

    // Boost oscillation variables
    this.oscillationTime = 0;
    this.oscillationSpeed = 0.1;
    this.oscillationAmplitude = 0.5;

    keyManager.onGenericKeyPress((keyCode) => {
      const action = keyManager.getActionForKeyCode(keyCode);
      if (action && action === 'one' || action === 'two' || action === 'three' || action === 'four' || action === 'five') {
        this.inputs[action] = true;
      }
    });

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
    this.inputs.up = keyManager.pressed('up');
    this.inputs.down = keyManager.pressed('down');
    this.inputs.left = keyManager.pressed('left');
    this.inputs.right = keyManager.pressed('right');
    this.inputs.space = keyManager.pressed('space');

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

      this.inputs.one = false;
      this.inputs.two = false;
      this.inputs.three = false;
      this.inputs.four = false;
      this.inputs.five = false;
      this.inputs.space = false;
    }
  }

  update() {
    if (this.isLocalPlayer) {
      this.updateInputs();
      this.sendInputs();
    }

    this.p.fill(255, 0, 0);
    this.p.noStroke();
    this.p.ellipse(this.x + this.width / 2, this.y + this.height / 2, this.width, this.height);

    // Update oscillation for boost effects
    if (this.flags?.about_to_boost || this.flags?.boosting) {
      this.oscillationTime += this.oscillationSpeed;
      this.rotation = Math.sin(this.oscillationTime) * this.oscillationAmplitude;
    } else {
      this.rotation = 0;
      this.oscillationTime = 0;
    }

    this.display();
  }
} 