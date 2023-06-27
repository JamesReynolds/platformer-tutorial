import { shades } from './img/shades.base64';
import { blockSize, Rectangle } from './utils';

export class Platform {
  bloxX: number;
  bloxY: number;
  sprite: CanvasImageSource;
  constructor(
    public x: number,
    public y: number,
    public w: number,
    public h: number,
    private shadeX: number,
    private shadeY: number
  ) {
    this.bloxX = Math.floor((this.w + blockSize) / blockSize);
    this.w = (this.bloxX + 1) * blockSize;
    const _sprite = new Image();
    _sprite.src = shades;
    _sprite.onload = () => (this.sprite = _sprite);
  }

  draw(ctx: CanvasRenderingContext2D, area: Rectangle) {
    if (!this.sprite) {
      return;
    }
    if (
      this.x + this.bloxX * blockSize + blockSize < area.x ||
      area.x + area.w + blockSize < this.x
    ) {
      return;
    }
    for (let i = 0; i <= this.bloxX; i++) {
      ctx.drawImage(
        this.sprite,
        this.shadeX * 300,
        this.shadeY * 300,
        300,
        300,
        this.x + i * blockSize,
        this.y,
        blockSize,
        blockSize
      );
    }
  }
}
