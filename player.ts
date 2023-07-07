/**
 * The player is a more complex GameObject that
 * needs to `move` and check whether they bump
 * into things.
 */
import { GameObject } from './gameobject.js';
import { blockSize, moveRectangle } from './utils.js';

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
   * @param canvas The canvas that the player is on
   * @param platforms The platforms the player can stand on
   */
  move(
    keysHeld: Set<string>,
    canvas: HTMLCanvasElement,
    platforms: GameObject[]
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
    this.boundingBox.x += this.velocity.x;
    this.boundingBox.y += this.velocity.y;

    // Make the player step
    if (this.velocity.x !== 0) {
      this.crop.x = ((this.crop.x / this.crop.w + 1) % 6) * this.crop.w;
    }

    const collided = platforms.map((platform, i) => this.checkCollision(platform, i > 2)).filter(x => x);

    this.onGround = false;
    const bumpVector = {x: 0, y: 0};
    this.onGround = false;
    for(const bump of collided) {
      bumpVector.x += bump.x || 0;
      bumpVector.y += bump.y || 0;
      if (bump.y && (bump.y < 0 || (this.velocity.y === 0 && bump.y === 0))) {
        this.onGround = true;
      }
    }
    moveRectangle(this.boundingBox, bumpVector);
    if (bumpVector.y !== 0) {
      this.velocity.y += bumpVector.y;
    }
    if (bumpVector.x !== 0) {
      this.velocity.x += bumpVector.x;
    }
    
    if (this.onGround) {
      this.velocity.x *= 0.8;
    } else {
      this.velocity.y += this.gravity;
    }
  }

  checkCoin(coin: GameObject) {
    return this.checkCollision(coin, false) !== undefined;
  }
}
