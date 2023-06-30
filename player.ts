import { GameObject } from './gameobject';
import { blockSize } from './utils';

export class Player {
  public onGround = false;
  faceLeft = false;
  public velocity = {
    x: 0,
    y: 0,
  };
  constructor(
    private sprite: CanvasImageSource,
    public x: number = 0,
    public y: number = 0,
    public w: number = 36.4,
    public h: number = blockSize
  ) {}

  run(
    holdLeft: boolean,
    holdRight: boolean,
    canvas: HTMLCanvasElement,
    platforms: GameObject[]
  ) {
    this.faceLeft = holdLeft;
    if (holdLeft && this.velocity.x > -10) {
      this.velocity.x += -2;
    }
    if (holdRight && this.velocity.x < 10) {
      this.velocity.x += 2;
    }
    if (!holdLeft && !holdRight) {
      this.velocity.x = 0;
    }
    this.x += this.velocity.x;
    this.y += this.velocity.y;

    this.stayOnCanvas(canvas);
    if (this.y !== canvas.height) {
      const platform = platforms.filter(this.checkPlatform.bind(this))[0];
      if (platform) {
        this.y = platform.boundingBox.y;
        this.onGround = true;
        this.velocity.y = 0;
      } else {
        this.onGround = false;
      }
    }
  }

  stayOnCanvas(canvas: HTMLCanvasElement) {
    if (this.y > canvas.height) {
      this.y = canvas.height;

      this.onGround = true;
      this.velocity.y = 0;
    }

    if (this.y < 20) {
      this.y = 20;
    }
    if (this.x > canvas.width - 10) {
      this.x = canvas.width - 10;
    }

    if (this.x < 0) {
      this.x = 0;
    }
  }

  checkPlatform(p: GameObject): boolean {
    return (
      this.x + this.w > p.boundingBox.x && this.x < p.boundingBox.x + p.boundingBox.w && this.y >= p.boundingBox.y && this.y < p.boundingBox.y + 20
    );
  }

  draw(ctx: CanvasRenderingContext2D) {
    const direction = this.faceLeft ? 300 : 0;
    ctx.drawImage(
      this.sprite,
      0,
      direction,
      182,
      300,
      this.x,
      this.y - blockSize,
      this.w,
      this.h
    );
  }
  checkCoin(coin: GameObject) {
    const coinCentre = coin.centre();
    const centreX = this.x + this.w / 2;
    const centreY = this.y - this.h / 2;

    return (
      coinCentre.x - 15 < centreX &&
      centreX < coinCentre.x + 15 &&
      coinCentre.y - 15 < centreY &&
      centreY < coinCentre.y + 15
    );
  }
}
