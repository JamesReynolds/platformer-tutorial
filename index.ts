import { Game } from './game.js';
import { blockSize } from './utils.js';

const height = innerHeight - 150;
const width = innerWidth - 5;
console.log(`Sizes: ${width}x${height}`);

const wrapper = document.querySelector('#wrapper') as HTMLDivElement;
const canvas = document.querySelector('canvas');
const bloxY = parseInt((height / blockSize).toFixed(0), 10);
canvas.height = bloxY * blockSize;
canvas.width = 100 * blockSize;

const game = new Game(wrapper, canvas);

const keyUp = (evt) => {
  game.keyUp(evt.code);
};
const keyDown = (evt) => {
  if (
    ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(
      evt.code
    ) > -1
  ) {
    evt.preventDefault();
  }
  game.keyDown(evt.code);
};

async function ticker(timeStamp) {
    await game.tick();
    window.requestAnimationFrame(ticker);
}

let move = false;
game.load().then(_ => {
    window.requestAnimationFrame(ticker);
    document.addEventListener('keydown', keyDown);
    document.addEventListener('keyup', keyUp);
    document.addEventListener('mousedown', (evt) => {
      game.keyDown("mouse");
    });
    document.addEventListener('mouseup', (evt) => {
      game.keyUp("mouse");
    });
    document.addEventListener('mousemove', (evt) => {
      const canvasRect = canvas.getBoundingClientRect();
      const x = evt.clientX - canvasRect.left;
      const y = evt.clientY - canvasRect.top;
      game.move({x, y});
    });
});
