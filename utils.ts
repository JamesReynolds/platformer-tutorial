export const blockSize = 60;
export type Rectangle = { x: number; y: number; w: number; h: number };

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

export type Shade = { x: number; y: number };
export function randomShade(shade?: Shade) {
  return { x: Math.floor(Math.random() * 4), y: Math.floor(Math.random() * 4) };
}

export async function loadImageLocal(url: string) {
  try {
    return await loadImage(url);
  } catch (err) {
    console.log(`Failed to load ${url}, trying ${ROOT}${url}`);
    return await loadImage(ROOT + url);
  }
}
