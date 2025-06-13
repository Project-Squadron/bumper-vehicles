import { PhysicsEntity } from './PhysicsEntity.js';
import PowerupEntity from './PowerupEntity.js';
import { Vec2 } from '../utils/vector.js';

export class PlayerEntity extends PhysicsEntity {
  constructor(config) {
    // note: player is technically an active_dynamic actor,
    // but since players are categorized separately from all other 
    // entities this distinction is moot
    super({ ...config, size: new Vec2(config.radius * 2, config.radius * 2) });
    this.moveForce = 10; // Force to apply for movement
    this.dragCoefficient = 0.2; // Higher drag for more responsive movement
    this.input = {
      up: false,
      down: false,
      left: false,
      right: false
    };
    this.disconnected = false;
    this.flags = {
      facing: 'right' // Can be 'left' or 'right'
    };
    this.radius = config.radius;
    this.socketId = config.socketId;
    this.game = config.game;

    console.log("User data: ", config.userData);
    this.powerups = [];
    for (const powerup_name of config.userData.powerups) {
      this.powerups.push(new PowerupEntity({
        type: powerup_name,
        game: this.game,
        position: new Vec2(0, 0),
        size: new Vec2(25, 25),
        tileMap: this.tileMap
      }));
    }
  }
  /**
   * Update input state
   * @param {Object} newInput 
   */
  updateInput(newInput) {
    this.input = { ...newInput };

    // Update facing direction based on input
    if (this.input.left) {
      this.flags.facing = 'left';
    } else if (this.input.right) {
      this.flags.facing = 'right';
    }
  }

  /**
   * Process inputs
   */
  handleInputs() {
    if (this.input.left) {
      this.applyForce(new Vec2(-this.moveForce, 0));
    } else if (this.input.right) {
      this.applyForce(new Vec2(this.moveForce, 0));
    }

    if (this.input.up) {
      this.applyForce(new Vec2(0, -this.moveForce));
    } else if (this.input.down) {
      this.applyForce(new Vec2(0, this.moveForce));
    }

    // if 1/2/3/4/5/Z key is pressed, activate the corresponding powerup
    if (this.input.powerup1) {
      this.activatePowerup(0);
    } else if (this.input.powerup2) {
      this.activatePowerup(1);
    } else if (this.input.powerup3) {
      this.activatePowerup(2);
    } else if (this.input.powerup4) {
      this.activatePowerup(3);
    } else if (this.input.powerup5) {
      this.activatePowerup(4);
    } else if (this.input.powerupZ) {
      this.activatePowerup(5);  // Add Z key powerup activation
    }
  }

  activatePowerup(powerup_index) {
    this.powerups[powerup_index].activate(this.position);
  }

  /* 
    * Handle Collisions with Blocks
  */
  handleTileCollisions() {
    const collidingTiles = this.tileMap.getCollidingTiles('block', this.boundingBox);

    for (const tile of collidingTiles) {
      const centerX = this.position.x + this.radius,
        centerY = this.position.y + this.radius;

      const closestX = Math.max(tile.position.x, Math.min(centerX, tile.position.x + tile.size.x));
      const closestY = Math.max(tile.position.y, Math.min(centerY, tile.position.y + tile.size.y));

      // Calculate distance between closest point and circle center
      const distance = Math.sqrt(
        Math.pow(centerX - closestX, 2) +
        Math.pow(centerY - closestY, 2)
      );

      if (distance < this.radius) {

        // Calculate push-out vector
        const pushX = centerX - closestX;
        const pushY = centerY - closestY;
        const pushLength = Math.sqrt(pushX * pushX + pushY * pushY);

        // Normalize and scale by overlap
        const overlap = this.radius - distance;
        const pushVector = new Vec2(
          (pushX / pushLength) * overlap,
          (pushY / pushLength) * overlap
        );

        // Apply push-out
        this.position.x += pushVector.x;
        this.position.y += pushVector.y;
        this.boundingBox.updateX();
        this.boundingBox.updateY();
        return true;
      }
    }

    return false;
  }

  handlePlayerCollisions() {
    // Check collisions with other players
    this.game.players.forEach((otherPlayer) => {
      // Skip self
      if (otherPlayer.id === this.id) return;

      // Calculate distance between centers
      const dx = (this.position.x + this.radius) - (otherPlayer.position.x + otherPlayer.radius);
      const dy = (this.position.y + this.radius) - (otherPlayer.position.y + otherPlayer.radius);
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Check if circles are colliding
      if (distance < (this.radius + otherPlayer.radius)) {
        // Calculate collision normal
        const nx = dx / distance;
        const ny = dy / distance;

        // Calculate relative velocity
        const relativeVelocityX = this.velocity.x - otherPlayer.velocity.x;
        const relativeVelocityY = this.velocity.y - otherPlayer.velocity.y;
        const relativeSpeed = Math.sqrt(relativeVelocityX * relativeVelocityX + relativeVelocityY * relativeVelocityY);

        // Calculate velocity along normal
        const velocityAlongNormal = relativeVelocityX * nx + relativeVelocityY * ny;

        // Only resolve if objects are moving towards each other
        if (velocityAlongNormal < 0) {
          // Calculate impulse scalar
          const impulseScalar = -(1 + 0.8) * velocityAlongNormal; // 0.8 is elasticity

          // Calculate mass ratio (assuming equal mass for simplicity)
          const massRatio = 0.5;

          // Calculate impulse vector
          const impulseX = impulseScalar * nx * massRatio;
          const impulseY = impulseScalar * ny * massRatio;

          // Apply impulse to both objects
          this.velocity.x += impulseX;
          this.velocity.y += impulseY;
          otherPlayer.velocity.x -= impulseX;
          otherPlayer.velocity.y -= impulseY;

          // Separate the objects to prevent sticking
          const overlap = (this.radius + otherPlayer.radius) - distance;
          const separationX = nx * overlap * 0.5;
          const separationY = ny * overlap * 0.5;

          this.position.x += separationX;
          this.position.y += separationY;
          otherPlayer.position.x -= separationX;
          otherPlayer.position.y -= separationY;

          // Update bounding boxes
          this.boundingBox.updateX();
          this.boundingBox.updateY();
          otherPlayer.boundingBox.updateX();
          otherPlayer.boundingBox.updateY();
        }
      }
    });
  }

  /**
   * Update player state
   */
  update() {
    if (this.disconnected) return;

    // handle inputs
    this.handleInputs();

    // process forces on player
    this.processForces();

    // Apply drag to slow down when no input
    if (!this.input.left && !this.input.right && !this.input.up && !this.input.down) {
      this.applyDrag(this.dragCoefficient);
    }

    // update X and check for collisions along the x-axis
    this.updateX();
    this.updateY();

    // Handle collisions with other players
    this.handlePlayerCollisions();

    // Handle collisions with tiles
    this.handleTileCollisions();
  }
} 
