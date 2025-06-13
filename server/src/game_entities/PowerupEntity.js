import { PhysicsEntity } from './PhysicsEntity.js';
import { Vec2 } from '../utils/vector.js';

export default class PowerUpEntity extends PhysicsEntity {
  constructor(config) {
    super({ ...config, type: 'powerup' });

    this.type = config.type;
  }

  activate(position) {
    // update position & bounding box
    this.position = position;
    console.log("Activating powerup at position: ", this.position);

    this.size = new Vec2(25, 25);


    this.flags = {
      facing: 'right' // Can be 'left' or 'right'
    };

    this.game.passive_actors.push(this);

    // // register empty lsit
    if (this.type in this.game.actor_lists) {
      this.game.actor_lists[this.type].push(this);
    } else {
      this.game.actor_lists[this.type] = [];
      this.game.actor_lists[this.type].push(this);
    }
  }

  /**
   * Update state
   */
  update() {
    // process forces on player
    this.processForces();
    this.applyDrag(this.dragCoefficient);

    // update X and check for collisions along the x-axis
    this.updateX();
    this.boundingBox.updateX();

    // update Y
    this.updateY();
    this.boundingBox.updateY();

    // update state
    if (this.velocity.x > 0.1) {
      this.flags.facing = 'left';
    } else if (this.velocity.x < -0.1) {
      this.flags.facing = 'right';
    }

    // TODO: handle collisions
  }
} 