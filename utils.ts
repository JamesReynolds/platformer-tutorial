export const blockSize = 60;
export type Rectangle = { x: number; y: number; w: number; h: number };
export type Vector = { x: number; y: number };

const ROOT =
  'https://raw.githubusercontent.com/JamesReynolds/platformer-tutorial/main/';

async function loadImage(url: string): Promise<HTMLImageElement> {
  const sprite = new Image();
  sprite.src = url;
  return new Promise<HTMLImageElement>((res, rej) => {
    sprite.onload = () => res(sprite);
    sprite.onerror = (err: any) => rej(err);
  });
}

export function randomShade(): Rectangle {
  return { x: Math.floor(Math.random() * 4) * 300, y: Math.floor(Math.random() * 4) * 300, w: 300, h: 300 };
}

export async function loadImageLocal(url: string) {
  try {
    return await loadImage(url);
  } catch (err) {
    console.log(`Failed to load ${url}, trying ${ROOT}${url}`);
    return await loadImage(ROOT + url);
  }
}

export function randomBetween(from: number, to: number) {
  return Math.floor(from + Math.random() * (to - from));
}
