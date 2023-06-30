import { GameObject } from './gameobject';
import { Player } from './player';
import { blockSize, loadImageLocal, randomShade, Rectangle } from './utils';

export class Game {
  public gravity = 0.5;

  public platforms: GameObject[] = [];
  public coins: GameObject[] = [];
  public player: Player;

  private ctx: CanvasRenderingContext2D;
  private leftDown = false;
  private rightDown = false;
  private dirty: Rectangle[];
  constructor(
    private wrapper: HTMLDivElement,
    public canvas: HTMLCanvasElement,
    public display: HTMLPreElement
  ) {
    this.ctx = this.canvas.getContext('2d');
    this.dirty = [
      { x: 0, y: 0, w: this.canvas.width, h: this.canvas.height },
    ];
  }

  public async load() {
    const platformShade = randomShade();
    const shades = await loadImageLocal('img/shades.png');
    const coin = await loadImageLocal('img/coin.png');
    const player = await loadImageLocal('img/player.png');
    const background = await loadImageLocal('img/background.jpg');

    this.canvas.style.backgroundImage = `url('${background.src}')`;
    this.canvas.style.backgroundRepeat = 'repeat-x repeat-y';

    this.player = new Player(player);

    const blox = 100;
    for (let i = 0; i < blox; i++) {
      const platform = new GameObject(
        {
          x: Math.floor(Math.random() * this.canvas.width),
          y: Math.floor(Math.random() * this.canvas.height),
          w: Math.floor(Math.random() * blockSize * 10),
          h: Math.floor(Math.random() * blockSize * 2)
        },
        shades,
        {x: platformShade.x * 300, y: platformShade.y * 300, w: 300, h: 300},
        1 / 5);
      this.platforms.push(platform);
    }

    const coinz = 50;
    for (let i = 0; i < coinz; i++) {
      this.coins.push(
        new GameObject(
          {
            x: Math.floor(Math.random() * this.canvas.width),
            y: Math.floor(Math.random() * this.canvas.height),
            w: blockSize,
            h: blockSize,
          },
          coin, undefined, 1 / 5));
    }
    this.wrapper.scrollTo(0, 0);
  }

  tick() {
    this.dirty.push({
      x: this.player.x,
      y: this.player.y - this.player.h,
      w: this.player.w,
      h: this.player.h,
    });
    this.player.run(this.leftDown, this.rightDown, this.canvas, this.platforms);
    if (this.player.onGround) {
      this.player.velocity.x *= 0.8;
    } else {
      this.player.velocity.y += this.gravity;
    }

    if (this.leftDown || this.rightDown) {
      const displayX = this.player.x - this.wrapper.clientWidth / 2;
      this.wrapper.scrollTo(displayX, 0);
    }

    for (let i = 0; i < this.coins.length; i++) {
      if (this.player.checkCoin(this.coins[i])) {
        this.dirty.push(this.coins[i].boundingBox);
        this.coins.splice(i, 1);
      }
    }

    for (let region of this.dirty) {
      region = {x: Math.floor(region.x), y: Math.floor(region.y), w: Math.ceil(region.w), h: Math.ceil(region.h + 1)};
      this.ctx.clearRect(region.x, region.y, region.w, region.h);
      for (let pl of this.platforms) {
        pl.draw(this.ctx, region);
      }
      for (let c of this.coins) {
        c.draw(this.ctx, region);
      }
    }
    this.player.draw(this.ctx);
    this.dirty = [
      { x: this.player.x, y: this.player.y - this.player.h, w: this.player.w, h: this.player.h },
    ];
  }

  keyUp(key: string) {
    switch (key) {
      case 'ArrowLeft':
        this.leftDown = false;
        break;
      case 'ArrowUp':
        if (this.player.velocity.y < -3) {
          this.player.velocity.y = -3;
        }
        break;
      case 'ArrowRight':
        this.rightDown = false;
        break;
    }
  }

  keyDown(key: string) {
    switch (key) {
      case 'ArrowLeft':
        this.leftDown = true;
        break;
      case 'ArrowUp':
        if (this.player.onGround) {
          this.player.velocity.y = -12;
          this.player.onGround = false;
        }
        break;
      case 'ArrowRight':
        this.rightDown = true;
        break;
    }
  }
}
