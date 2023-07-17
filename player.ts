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
    
    // Make the player step
    if (this.velocity.x !== 0) {
      this.crop.x = ((this.crop.x / this.crop.w + 1) % 6) * this.crop.w;
    }

    // Check collision and adjust target appropriately
    this.onGround = false;
    let overlap = undefined;
    floorBox(target);
    for(const platform of platforms) {
      overlap = unionOverlap(overlap, platform.findOverlap(target));
    }
    const vector = this.checkCollision(overlap, target, context);
    if (vector) {
      target.x += vector.x || 0;
      target.y += vector.y || 0;
      this.onGround = this.onGround || vector.y && vector.y <= 0;
      if (vector.x && Math.sign(vector.x) !== Math.sign(this.velocity.x) && vector.x !== 0) {
        this.velocity.x = 0;
      }
      if (vector.y && Math.sign(vector.y) !== Math.sign(this.velocity.y) && vector.y !== 0) {
        this.velocity.y = 0;
      }
    }
    this.boundingBox = target;

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
