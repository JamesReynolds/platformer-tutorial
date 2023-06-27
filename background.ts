import { shades } from './img/shades.base64';
import { blockSize, Rectangle } from './utils';

export class Background {
  private sprite: CanvasImageSource;
  constructor(
    private shadeX: number,
    private shadeY: number
  ) {
    const _sprite = new Image();
    _sprite.src = shades;
    _sprite.onload = () => (this.sprite = _sprite);
  }

  draw(ctx: CanvasRenderingContext2D, area: Rectangle) {
    if (!this.sprite) {
      return false;
    }
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
          this.shadeX * 300,
          this.shadeY * 300,
          300,
          300,
          i * blockSize,
          j * blockSize,
          blockSize,
          blockSize
        );
      }
    }
    return true;
  }
}
