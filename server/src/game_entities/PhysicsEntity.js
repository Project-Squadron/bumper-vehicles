import { Entity } from './Entity.js';
import { Vec2 } from '../utils/vector.js';

export class PhysicsEntity extends Entity {
  constructor(config) {
    super({ ...config, type_of_actor: "passive_dynamic" });
    this.mass = config.mass || 1;
    this.velocity = new Vec2(0, 0);
    this.acceleration = new Vec2(0, 0);
    this.maxSpeed = 5; // Default max speed
    this.applyForces = new Vec2(0, 0);
  }

  /**
   * Apply a force to the entity
   * @param {Vec2} force 
   */
  applyForce(force) {
    this.applyForces = this.applyForces.add(force);
  }

  /**
   * Apply drag force based on velocity
   * @param {number} dragCoefficient 
   */
  applyDrag(dragCoefficient) {
    const dragForce = this.velocity.scale(-dragCoefficient);
    this.applyForce(dragForce);
  }

  /**
   * Process the forces applied on the entity
   * Update acceleration & velocity respectively
   */
  processForces() {
    // Calculate acceleration from forces
    this.acceleration = this.applyForces.scale(1 / this.mass);

    // Update velocity based on acceleration
    this.velocity = this.velocity.add(this.acceleration);

    // Clamp velocity to max speed
    const speed = this.velocity.magnitude();
    if (speed > this.maxSpeed) {
      this.velocity = this.velocity.normalize().scale(this.maxSpeed);
    }

    // Reset forces
    this.applyForces = new Vec2(0, 0);
  }

  updateX() {
    this.position.x += this.velocity.x;
    this.boundingBox.updateX();
  }

  updateY() {
    this.position.y += this.velocity.y;
    this.boundingBox.updateY();
  }
} 
