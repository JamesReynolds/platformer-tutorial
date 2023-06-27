/**
 * TODO:
 *
 * 1. Make sure platforms only draw within region
 * 2. Make syllabus & clean up
 */
import { Coin } from './coin';
import { shades } from './img/shades.base64';
import { Platform } from './platform';
import { Player } from './player';
import { blockSize, Rectangle } from './utils';

export class Game {
  public gravity = 0.5;
  public platforms: Platform[] = [];
  public coins: Coin[] = [];
  private ctx: CanvasRenderingContext2D;
  private leftDown = false;
  private rightDown = false;
  private sprite: CanvasImageSource;
  bloxX: number;
  bloxY: number;
  shadeX = 1;
  shadeY = 2;
  private dirty: Rectangle[];
  constructor(
    private wrapper: HTMLDivElement,
    public canvas: HTMLCanvasElement,
    public display: HTMLPreElement,
    public player: Player
  ) {
    this.bloxX = parseInt((this.canvas.width / blockSize).toFixed(0), 10);
    this.bloxY = parseInt((this.canvas.height / blockSize).toFixed(0), 10);
    this.ctx = this.canvas.getContext('2d');

    const _sprite = new Image();
    // _sprite.src = './img/sprite.png';
    _sprite.src = shades;
    _sprite.onload = () => (this.sprite = _sprite);

    this.start(
      Math.floor(Math.random() * 31) + 1,
      Math.floor(Math.random() * 11) + 1,
      Math.floor(Math.random() * 4),
      Math.floor(Math.random() * 4)
    );
    this.dirty = [
      { x: 0, y: 0, w: this.wrapper.clientWidth, h: this.canvas.height },
    ];
  }

  start(blox: number, coinz: number, shadeX: number, shadeY: number) {
    if (shadeX === shadeY) {
      shadeX = (shadeY + 1) % 4;
    }
    console.log(shadeX, shadeY);
    this.shadeX = shadeX;
    this.shadeY = shadeY;

    for (let i = 0; i < blox; i++) {
      this.platforms.push(
        new Platform(
          (Math.floor(Math.random() * this.bloxX) + 1) * blockSize,
          (Math.floor(Math.random() * this.bloxY) + 1) * blockSize,
          (Math.floor(Math.random() * 6) + 1) * blockSize,
          blockSize,
          shadeY,
          shadeX
        )
      );
    }
    for (let i = 0; i < coinz; i++) {
      this.coins.push(
        new Coin(
          (Math.floor(Math.random() * this.bloxX) + 1) * blockSize,
          (Math.floor(Math.random() * this.bloxY) + 1) * blockSize
        )
      );
    }
    this.wrapper.scrollTo(0, 0);
  }

  drawBackground(area: Rectangle) {
    if (!this.sprite) return;
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
        this.ctx.drawImage(
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
  }

  drawPlatforms(ctx: CanvasRenderingContext2D, area: Rectangle) {
    for (let pl of this.platforms) {
      pl.draw(ctx, area);
    }
  }

  drawCoins(ctx: CanvasRenderingContext2D, area: Rectangle) {
    for (let c of this.coins) {
      c.draw(ctx);
    }
  }

  displayStats(innerhtml: string) {
    // this.display.innerHTML = innerhtml;
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
      this.drawBackground(region);
      this.drawPlatforms(this.ctx, region);
      this.drawCoins(this.ctx, region);
    }
    this.player.draw(this.ctx);
    if (this.sprite) {
      this.dirty = [
        { x: this.player.x, y: this.player.y, w: blockSize, h: blockSize },
      ];
    }

    this.displayStats(
      `
        🐄
    canvas:
    h: ${this.canvas.height}
    w: ${this.canvas.width}
    -----
    Player:
    x: ${this.player.x}
    y: ${this.player.y}
    `
    );
  }

  keyUp(keyCode: number) {
    switch (keyCode) {
      case 37:
        this.leftDown = false;
        break;
      case 38:
        if (this.player.velocity.y < -3) {
          this.player.velocity.y = -3;
        }
        break;
      case 39:
        this.rightDown = false;
        break;
    }
  }
  keyDown(keyCode: number) {
    switch (keyCode) {
      case 37:
        this.leftDown = true;
        break;
      case 38:
        if (this.player.onGround) {
          this.player.velocity.y = -12;
          this.player.onGround = false;
        }
        break;
      case 39:
        this.rightDown = true;
        break;
    }
  }
}
