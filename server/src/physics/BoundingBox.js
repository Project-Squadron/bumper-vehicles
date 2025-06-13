import { Vec2 } from '../utils/vector.js';

export class BoundingBox {
  constructor(entity) {
    this.size = entity.size; // Vec2
    this.left = entity.position.x;
    this.right = entity.position.x + entity.size.x;
    this.top = entity.position.y;
    this.bottom = entity.position.y + entity.size.y;
    this.entity = entity;
  }

  updateX() {
    this.left = this.entity.position.x;
    this.right = this.entity.position.x + this.entity.size.x;
  }

  updateY() {
    this.top = this.entity.position.y;
    this.bottom = this.entity.position.y + this.entity.size.y;
  }

  updateSize() {
    this.size = this.entity.size;
    this.right = this.left + this.size.x;
    this.bottom = this.top + this.size.y;
  }

  /**
   * Check if this bounding box intersects with another
   * @param {BoundingBox} other 
   * @returns {boolean}
   */
  intersects(other) {
    return (
      this.left < other.right &&
      this.right > other.left &&
      this.top < other.bottom &&
      this.bottom > other.top
    );
  }

  /**
   * Get the center point of the bounding box
   * @returns {Vec2}
   */
  getCenter() {
    return new Vec2(
      this.left + this.size.x / 2,
      this.top + this.size.y / 2
    );
  }
} 
