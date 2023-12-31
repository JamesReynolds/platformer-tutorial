/**
 * This file is responsible for loading up all of the parts of the game
 * and calling each part as part of the "game loop": the function `tick`
 * that is called every change.
 */
import { GameObject } from './gameobject.js';
import { Player } from './player.js';
import { blockSize, loadImageLocal, randomShade, Rectangle, randomBetween, zoomCropImageToData, Point } from './utils.js';

export class Game {
  // The player!
  private player: Player;

  // Each platform they can stand on
  private platforms: GameObject[] = [];

  // Each coin they can collect
  private coins: GameObject[] = [];

  // What keys are we holding down (if any!)
  private keysHeld = new Set<string>();

  // The thing we need to draw with
  private context: CanvasRenderingContext2D;

  // List of things to redraw
  private dirty: Rectangle[] = [];
  
  constructor(
    // The frame looking into onto our canvas
    private wrapper: HTMLDivElement,
    // Our canvas to paint our picture
    public canvas: HTMLCanvasElement,
  ) {
    this.context = this.canvas.getContext('2d');
  }

  public move(position?: Point) {
    if (position && !this.keysHeld.has("mouse")) {
      return;
    }
    // Mark where the player was as needing to be redrawn ("dirty")
    this.dirty.push({...this.player.boundingBox});
    
    // The player moves
    this.player.move(this.keysHeld, this.context, this.platforms, position);

    // Redraw where we moved to
    this.dirty.push({...this.player.boundingBox});

    // Make sure the player is in the middle of the screen
    const displayX = this.player.centre().x - this.wrapper.clientWidth / 2;
    this.wrapper.scrollTo(displayX, 0);
  }

  /**
   * This is called when we load up the game
   */
  public async load() {
    // Load all the pictures (sprites)
    const shades = await loadImageLocal('img/shades.png');
    const coin = await loadImageLocal('img/coin.png');
    const player = await loadImageLocal('img/player.png');
    const background = await loadImageLocal('img/background.jpg');
    
    // Set the background
    this.canvas.height = background.height;
    this.canvas.width = background.width;
    this.canvas.style.backgroundImage = `url('${background.src}')`;
    this.canvas.style.backgroundSize = '1000x400';
    
    // Clear previous data (if any)
    this.context.clearRect(0, 0, this.canvas.height, this.canvas.width);
    this.platforms.length = 0;
    this.coins.length = 0;

    // Make a player
    this.player = new Player(player);

    // The ground
    this.platforms.push(new GameObject({x: -100, y: this.canvas.height, w: this.canvas.width + 200, h: 100}, shades));
    // The left
    this.platforms.push(new GameObject({x: -100, y: -100, w: 100, h: this.canvas.height + 200}, shades));
    // The right
    this.platforms.push(new GameObject({x: this.canvas.width, y: -100, w: 100, h: this.canvas.height + 200}, shades));

    // Cliff on left
    const cliff = await loadImageLocal('img/cliff.png');
    this.platforms.push(new GameObject(
      {x: 0, y: this.canvas.height - cliff.height, w: cliff.width, h: cliff.height},
      cliff, undefined, 1, this.context));
    
    // Make some platforms
    for (let i = 0; i < 10; i++) {
      const platform = new GameObject(
        {
          x: randomBetween(0, this.canvas.width),
          y: randomBetween(0, this.canvas.height),
          w: randomBetween(50, 600),
          h: randomBetween(50, 150)
        },
        shades,
        randomShade(),
        1 / 5);
      this.platforms.push(platform);
    }

    // Make some coins
    for (let i = 0; i < 5; i++) {
      this.coins.push(
        new GameObject(
          {
            x: randomBetween(0, this.canvas.width - blockSize),
            y: randomBetween(0, this.canvas.height - blockSize),
            w: blockSize,
            h: blockSize,
          },
          coin, undefined, 1 / 5, this.context));
    }

    // Make sure we start on the left
    this.wrapper.scrollTo(0, 0);

    // Draw everything
    this.draw([{ x: 0, y: 0, w: this.canvas.width, h: this.canvas.height }]);
  }

  /**
   * This is called each time the screen needs to update
   */
  async tick() {
    // Special keys
    if (this.keysHeld.has("KeyR")) {
      await this.load();
    }

    // Move the player
    this.move();

    // Check whether the player gets a coin
    for (let i = 0; i < this.coins.length; i++) {
      if (this.player.checkCoin(this.coins[i])) {
        // Where the coin used to be needs to be redrawn
        this.dirty.push(this.coins[i].boundingBox);

        // Remove the coin
        this.coins.splice(i, 1);
      }
    }

    this.draw(this.dirty);
    this.dirty = [];
  }

  /**
   * This is called when you press a key down
   * @param key Name of the key
   */
  keyDown(key: string) {
    this.keysHeld.add(key);
  }

  /**
   * This is called when you let go of a key
   * @param key Name of the key
   */
  keyUp(key: string) {
    this.keysHeld.delete(key);
  }
  
  draw(dirty: Rectangle[]) {
    // Redraw everything that is dirty
    for (let region of dirty) {
      // We need to round off the values
      region = {x: Math.floor(region.x), y: Math.floor(region.y), w: Math.ceil(region.w), h: Math.ceil(region.h + 1)};

      // Clear the what was there before
      this.context.clearRect(region.x, region.y, region.w, region.h);

      // Draw the platforms
      for (let pl of this.platforms) {
        pl.draw(this.context, region);
      }

      // Draw the coins
      for (let c of this.coins) {
        c.draw(this.context, region);
      }
    }
    // Draw the things that (may have) moved
    this.player.draw(this.context);
  }
}
