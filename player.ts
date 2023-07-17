/**
 * The player is a more complex GameObject that
 * needs to `move` and check whether they bump
 * into things.
 */
import { GameObject, floorBox } from './gameobject.js';
import { Point, blockSize, moveRectangle, unionOverlap } from './utils.js';

export class Player extends GameObject {
  // How fast the player falls
  public gravity = 0.5;
  // Whether the player is on the ground
  public onGround = false;
  // The speed and direction the player is moving in
  public velocity = {
    x: 0,
    y: 0,
  };
  
  /**
   * Make a new player
   * @param sprite The picture of the player
   */
  constructor(
    sprite: HTMLImageElement
  ) {
    super(
      {x: 0, y: 0, w: 36.4, h: blockSize},
      sprite,
      {x: 0, y: 0, w: 182, h: 300},
      1 / 5);
  }

  /**
   * Make the player move
   * @param keysHeld The keys being pressed
   * @param context The canvas that the player is on
   * @param platforms The platforms the player can stand on
   */
  move(
    keysHeld: Set<string>,
    context: CanvasRenderingContext2D,
    platforms: GameObject[],
    point?: Point
  ) {
    if (keysHeld.has("ArrowLeft")) {
      this.velocity.x -= 2;
      if (this.velocity.x < -10) {
        this.velocity.x = -10;
      }
      this.crop = { ...this.crop, y: 300};
    } else if (keysHeld.has("ArrowRight")) {
      this.velocity.x += 2;
      if (this.velocity.x > 10) {
        this.velocity.x = 10;
      }
      this.crop = { ...this.crop, y: 0};
    } else {
      this.velocity.x = 0;
    }

    if (keysHeld.has("ArrowUp")) {
      if (this.onGround) {
        this.velocity.y = -12;
        this.onGround = false;
      }
    } else {
      if (this.velocity.y < -3) {
        this.velocity.y = -3;
      }
    }

    // Move the player
    const target = {...this.boundingBox};
    if (!keysHeld.has("mouse")) {
      moveRectangle(target, this.velocity);
    } else if (point) {
      this.velocity.x = 0;
      this.velocity.y = 0;
      target.x = point.x;
      target.y = point.y;
    }
    floorBox(target);
    
    // Make the player step
    if (this.velocity.x !== 0) {
      this.crop.x = ((this.crop.x / this.crop.w + 1) % 6) * this.crop.w;
    }
    
    // Find all platforms near us
    const near = platforms.filter(platform => platform.findOverlap(unionOverlap(this.boundingBox, target)) !== undefined);

    // Find out the area we are overlapping
    let overlap = undefined;
    for(const platform of near) {
      overlap = unionOverlap(overlap, platform.findOverlap(target));
    }

    // Get a vector that should push us out of the collision
    let vector = this.checkCollision(overlap, target);
    this.onGround = vector && vector.y && vector.y <= 0;
    if (vector) {
      // Move us out of the collision
      moveRectangle(target, vector);

      // Stop moving if we hit something going left/right
      if (vector.x && Math.sign(vector.x) !== Math.sign(this.velocity.x) && vector.x !== 0) {
        this.velocity.x = 0;
      }

      // Stop moving if we hit something going up/down
      if (vector.y && Math.sign(vector.y) !== Math.sign(this.velocity.y) && vector.y !== 0) {
        this.velocity.y = 0;
      }

      // Check if we're actually still hitting something...
      overlap = undefined;
      for(const platform of near) {
        overlap = unionOverlap(overlap, platform.findOverlap(target));
      }
    }

    // If we're no longer hitting anything then move
    if (!overlap || overlap.w <= 1 || overlap.h <= 1) {
      this.boundingBox = target;
    }

    // Adjust our speed according to whether we're on the ground
    if (this.onGround) {
      this.velocity.x *= 0.8;
    } else {
      this.velocity.y += this.gravity;
    }
  }

  checkCoin(coin: GameObject) {
    return coin.findOverlap(this.boundingBox) !== undefined;
  }
}
