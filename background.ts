import { blockSize, loadImageLocal, Rectangle, Shade } from './utils';

export class Background {
  constructor(private sprite: CanvasImageSource, private shade: Shade) {}

  draw(ctx: CanvasRenderingContext2D, area: Rectangle) {
    for (
      let i = Math.floor(area.x / blockSize);
      i <= Math.ceil((area.x + area.w) / blockSize);
      i++
    ) {
      for (
        let j = Math.floor(area.y / blockSize);
        j <= Math.ceil((area.y + area.h) / blockSize);
        j++
      ) {
        ctx.drawImage(
          this.sprite,
          this.shade.x * 300,
          this.shade.y * 300,
          300,
          300,
          i * blockSize,
          j * blockSize,
          blockSize,
          blockSize
        );
      }
    }
  }
}
