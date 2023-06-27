import { Game } from './game';
import { Player } from './player';
import { blockSize } from './utils';

const height = innerHeight - 150;
const width = innerWidth - 5;
const bloxY = parseInt((width / blockSize).toFixed(0), 10);
const bloxX = parseInt((height / blockSize).toFixed(0), 10);
console.log(`Sizes: ${width}x${height}`);

const wrapper = document.querySelector('#wrapper') as HTMLDivElement;
const display = document.querySelector('pre');
const canvas = document.querySelector('canvas');
canvas.height = bloxX * blockSize;
canvas.width = bloxY * blockSize * 10;

const game = new Game(wrapper, canvas, display, new Player());

const update = () => {
  game.tick();
};
const keyUp = (evt) => {
  game.keyUp(evt.keyCode);
};
const keyDown = (evt) => {
  if (
    ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(
      evt.code
    ) > -1
  ) {
    evt.preventDefault();
  }
  game.keyDown(evt.keyCode);
};

setInterval(update, 1000 / 60);
document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);
