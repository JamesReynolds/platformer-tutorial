/**
 * TODO:
 *
 * 1. Make sure platforms only draw within region
 * 2. Make syllabus & clean up
 */
import { Coin } from './coin';
import { Background } from './background';
import { Platform } from './platform';
import { Player } from './player';
import { blockSize, loadImageLocal, randomShade, Rectangle } from './utils';

export class Game {
  public gravity = 0.5;

  public platforms: Platform[] = [];
  public coins: Coin[] = [];
  public background: Background;
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
      { x: 0, y: 0, w: this.wrapper.clientWidth, h: this.canvas.height },
    ];
  }

  public async load() {
    const blox = Math.floor(Math.random() * 31) + 1;
    const coinz = Math.floor(Math.random() * 11) + 1;
    const backgroundShade = randomShade();
    const platformShade = randomShade(backgroundShade);
    const shades = await loadImageLocal('img/shades.png');
    const coin = await loadImageLocal('img/coin.png');
    const player = await loadImageLocal('img/player.png');
    
    this.background = new Background(shades, backgroundShade);
    this.player = new Player(player);
    const bloxX = parseInt((this.canvas.width / blockSize).toFixed(0), 10);
    const bloxY = parseInt((this.canvas.height / blockSize).toFixed(0), 10);

    for (let i = 0; i < blox; i++) {
      const platform = new Platform(
          (Math.floor(Math.random() * bloxX) + 1) * blockSize,
          (Math.floor(Math.random() * bloxY) + 1) * blockSize,
          (Math.floor(Math.random() * 6) + 1) * blockSize,
          blockSize,
          shades,
          platformShade
        );
      this.platforms.push(platform);
    }
    for (let i = 0; i < coinz; i++) {
      this.coins.push(
        new Coin(
          (Math.floor(Math.random() * bloxX) + 1) * blockSize,
          (Math.floor(Math.random() * bloxY) + 1) * blockSize,
          coin
        )
      );
    }
    this.wrapper.scrollTo(0, 0);
  }

  tick() {
    this.dirty.push({
      x: this.player.x,
      y: this.player.y - blockSize,
      w: blockSize,
      h: blockSize,
    });
    this.player.run(this.leftDown, this.rightDown, this.canvas, this.platforms);
    if (this.leftDown || this.rightDown) {
      const displayX = this.player.x - this.wrapper.clientWidth / 2;
      this.wrapper.scrollTo(displayX, 0);
      this.dirty.push({
        x: this.leftDown ? displayX : displayX + this.wrapper.clientWidth,
        y: 0,
        w: blockSize,
        h: this.canvas.height,
      });
    }

    for (let i = 0; i < this.coins.length; i++) {
      const c = this.coins[i];
      if (this.player.collectCoin(c)) {
        this.coins.splice(i, 1);
      }
    }

    if (this.player.onGround) {
      this.player.velocity.x *= 0.8;
    } else {
      this.player.velocity.y += this.gravity;
    }

    for (const region of this.dirty) {
      this.background.draw(this.ctx, region);
      for (let pl of this.platforms) {
        pl.draw(this.ctx, region);
      }
      for (let c of this.coins) {
        c.draw(this.ctx);
      }
    }
    this.player.draw(this.ctx);
    this.dirty = [
      { x: this.player.x, y: this.player.y, w: blockSize, h: blockSize },
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
