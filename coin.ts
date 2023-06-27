import { coin } from './img/coin.base64';
import { blockSize } from './utils';

export class Coin {
  sprite: CanvasImageSource;
  w = blockSize;
  h = blockSize;
  center: {
    x: number;
    y: number;
  } = {
    x: blockSize / 2,
    y: blockSize / 2,
  };
  constructor(public x: number, public y: number) {
    const _sprite = new Image();
    _sprite.src = coin;
    _sprite.onload = () => (this.sprite = _sprite);
    this.center.x = this.x + this.w / 2;
    this.center.y = this.y + this.h / 2;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.sprite) return;
    ctx.drawImage(this.sprite, this.x, this.y, this.w, this.h);
  }
}
