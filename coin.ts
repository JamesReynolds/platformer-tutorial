import { blockSize } from './utils';

export class Coin {
  w = blockSize;
  h = blockSize;
  center: {
    x: number;
    y: number;
  } = {
    x: blockSize / 2,
    y: blockSize / 2,
  };
  constructor(public x: number, public y: number, private sprite: CanvasImageSource) {
    this.center.x = this.x + this.w / 2;
    this.center.y = this.y + this.h / 2;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.drawImage(this.sprite, this.x, this.y, this.w, this.h);
  }
}
