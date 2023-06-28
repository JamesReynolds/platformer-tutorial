import { Game } from './game';
import { blockSize } from './utils';

const height = innerHeight - 150;
const width = innerWidth - 5;
console.log(`Sizes: ${width}x${height}`);

const wrapper = document.querySelector('#wrapper') as HTMLDivElement;
const display = document.querySelector('pre');
const canvas = document.querySelector('canvas');
const bloxY = parseInt((height / blockSize).toFixed(0), 10);
canvas.height = bloxY * blockSize;
canvas.width = 100 * blockSize;

const game = new Game(wrapper, canvas, display);

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

function ticker(timeStamp) {
    game.tick();
    window.requestAnimationFrame(ticker);
}
game.load().then(_ => {
    window.requestAnimationFrame(ticker);
    document.addEventListener('keydown', keyDown);
    document.addEventListener('keyup', keyUp);
});
