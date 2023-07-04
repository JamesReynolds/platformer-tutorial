/**
 * The player is a more complex GameObject that
 * needs to `move` and check whether they bump
 * into things.
 */
import { GameObject, moveRectangle } from './gameobject';
import { blockSize } from './utils';

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

    const collided = platforms.map(platform => platform.checkCollision(this, this.velocity)).filter(x => x).reverse();
    this.onGround = false;
    const bumpVector = {
      x: collided.reduce((a, v) => a + v.x, 0),
      y: collided.reduce((a, v) => a + v.y, 0),
    }
    moveRectangle(this.boundingBox, bumpVector);
    this.onGround = bumpVector.y < 0;
    if (bumpVector.y !== 0) {
      this.velocity.y = 0;
    }
    if (bumpVector.x !== 0) {
      this.velocity.x = 0;
    }
    
    if (this.onGround) {
      this.velocity.x *= 0.8;
    } else {
      this.velocity.y += this.gravity;
    }
  }

  checkCoin(coin: GameObject) {
    const coinCentre = coin.centre();
    const thisCentre = this.centre();

    return (
      coinCentre.x - 15 < thisCentre.x &&
      thisCentre.x < coinCentre.x + 15 &&
      coinCentre.y - 15 < thisCentre.y &&
      thisCentre.y < coinCentre.y + 15
    );
  }
}
