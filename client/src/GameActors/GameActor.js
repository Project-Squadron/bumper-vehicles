import { loadImageAsync } from "../utils/images";
import { AnimatedSprite } from "../utils/AnimatedSprite";

class GameActor {
  constructor(config) {
    this.x = config.x;
    this.y = config.y;
    this.width = config.width;
    this.height = config.height;
    this.id = config.id; // unique id for back-end syncing
    this.p = config.p; // p5 instance

    this.game = config.game;

    // for players
    this.disconnected = false;

    // display options:
    // 1) static image 
    // 2) animated sprite
    this.isAnimated = config.isAnimated || false;
    this.image = null;
    this.sprite = null;
    this.imageNames = [];
    this.spriteImages = [];

    // Initialize flags from server or default
    this.flags = config.flags || {
      facing: 'right'
    };
  }

  async loadImages() {
    console.log("Loading images for actor: ", this.id);
    // Create an array of promises for each image
    const imagePromises = this.imageNames.map(async (imageName, i) => {
      const loadedImg = await loadImageAsync(this.p, imageName);
      this.spriteImages.push(loadedImg);
    });

    // Wait for all images to load
    await Promise.all(imagePromises);

    if (this.isAnimated) {
      this.initSprite();
    } else {
      this.image = this.spriteImages[0];
    }
  }

  /**
   * Initialize the player's sprite with animation frames
   * @param {Array} images - Array of p5.Image objects for the animation
   */
  initSprite() {
    this.sprite = new AnimatedSprite({ images: this.spriteImages });
    this.sprite.setAnimationSpeed(8); // Default walking animation speed
  }

  display() {
    this.p.fill(255, 0, 0);
    this.p.noStroke();
    this.p.ellipse(this.x + this.width / 2, this.y + this.height / 2, this.width, this.height);

    if (this.isAnimated) {
      this.p.push();
      this.p.translate(this.x + this.width / 2, this.y + this.width / 2);

      // Flip horizontally if facing left
      if (this.flags.facing === 'left') {
        this.p.scale(-1, 1);
      }

      // Add blinking effect if disconnected
      if (this.disconnected) {
        const alpha = this.p.sin(this.p.frameCount * 0.1) * 127 + 128; // Oscillate between 128 and 255
        this.p.tint(255, alpha);
      }

      this.sprite.display(this.p, -this.width / 2, -this.height / 2, this.width, this.height);
      this.p.pop();
    } else {
      this.p.push();
      this.p.translate(this.x + this.width / 2, this.y + this.height / 2);

      // Flip horizontally if facing left
      if (this.flags.facing === 'left') {
        this.p.scale(-1, 1);
      }

      // Add blinking effect if disconnected
      if (this.disconnected) {
        const alpha = this.p.sin(this.p.frameCount * 0.1) * 127 + 128; // Oscillate between 128 and 255
        this.p.tint(255, alpha);
      }

      // Display the image if it exists, otherwise show a fallback shape
      if (this.image) {
        this.p.image(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
      } else {
        // Fallback to a colored rectangle
        this.p.fill(100);
        this.p.rect(0, 0, this.width, this.height);
      }
      this.p.pop();
    }
  }

  updateState(newState) {
    const { id, ...stateToUpdate } = newState;
    Object.assign(this, stateToUpdate);
  }

  update() {
    throw new Error('Method update() must be implemented by subclass');
  }
}

export default GameActor;