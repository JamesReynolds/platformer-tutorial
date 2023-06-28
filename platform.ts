import { blockSize, Rectangle, Shade, loadImageLocal } from './utils';

export class Platform {
  bloxX: number;
  bloxY: number;
  constructor(
    public x: number,
    public y: number,
    public w: number,
    public h: number,
    private sprite: CanvasImageSource,
    private shade: Shade
  ) {
    this.bloxX = Math.floor((this.w + blockSize) / blockSize);
    this.w = (this.bloxX + 1) * blockSize;
  }

  draw(ctx: CanvasRenderingContext2D, area: Rectangle) {
    if (
      this.x + this.bloxX * blockSize + blockSize < area.x ||
      area.x + area.w + blockSize < this.x
    ) {
      return;
    }
    for (let i = 0; i <= this.bloxX; i++) {
      ctx.drawImage(
        this.sprite,
        this.shade.x * 300,
        this.shade.y * 300,
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
