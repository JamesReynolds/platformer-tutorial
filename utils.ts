export const blockSize = 60;
export type Rectangle = { x: number; y: number; w: number; h: number };
export type Vector = { x: number; y: number };
export type Point = { x: number, y: number };
export type Line = { p0: Point, p1: Point };

export type VerticalEdge = "Lower" | "Upper";
export type HorizontalEdge = "Left" | "Right";

/**
 * Return the "intersection" (overlap) of two rectangles
 * @param lhs The left hand rectangle
 * @param rhs The right hand rectangle
 * @returns A new rectangle of the overlap between the two
 */
export function intersect(lhs: Rectangle, rhs: Rectangle) {
  const x = Math.max(lhs.x, rhs.x);
  const y = Math.max(lhs.y, rhs.y);
  const result = {x, y, 
      w: Math.min(lhs.x + lhs.w, rhs.x + rhs.w) - x,
      h: Math.min(lhs.y + lhs.h, rhs.y + rhs.h) - y
  };
  if (result.w < 0 || result.h < 0) {
      return undefined;
  }
  return result;
}

/**
* Move a bounding box by the given vector
* @param box    The box to move
* @param vector The vector to move it by
* @returns The input box, shifted by the vector
*/
export function moveRectangle(box: Rectangle, vector: Vector) {
  box.x += vector.x;
  box.y += vector.y;
  return box;
}

export function unionOverlap(lhs: Rectangle | undefined, rhs: Rectangle | undefined) {
  if (!lhs || !rhs) {
    return lhs ? lhs : rhs;
  }
  return {
    x: Math.min(lhs.x, rhs.x),
    y: Math.min(lhs.y, rhs.y),
    w: Math.max(lhs.x + lhs.w, rhs.x + rhs.w) - Math.min(lhs.x, rhs.x),
    h: Math.max(lhs.y + lhs.h, rhs.y + rhs.h) - Math.min(lhs.y, rhs.y),
  }
}

export type CornerLabel = "Out" | "In" | "Edge";

export function vectorBetween(p0: Point, p1: Point) {
  return {x: p1.x - p0.x, y: p1.y - p0.y};
}

export function labelPoint(rect: Rectangle, point: Point): {label: CornerLabel} & Point  {
  if (point.x < rect.x || point.x > rect.x + rect.w || point.y < rect.y || point.y > rect.y + rect.h) {
    return {label: "Out", ...point};
  }
  const edgeX = point.x === rect.x || point.x === rect.x + rect.w;
  const edgeY = point.y === rect.y || point.y === rect.y + rect.h;
  if (edgeX || edgeY) {
    return {label: "Edge", ...point};
  }
  return {label: "In", ...point};
}

export function corners(rect: Rectangle): Point[] {
  return [
    {x: rect.x, y: rect.y},
    {x: rect.x, y: rect.y + rect.h},
    {x: rect.x + rect.w, y: rect.y + rect.h},
    {x: rect.x + rect.w, y: rect.y}];
}

export function labelledCorners(lhs: Rectangle, rhs: Rectangle) {
  return corners(lhs).map(corner => labelPoint(rhs, corner));
}

export function projectToLine(line: Line, point: Point)
{
  const dx = line.p1.x - line.p0.x;
  const dy = line.p1.y - line.p0.y;
  if (dx === 0 || dy === 0) {
    return {x: dx === 0 ? line.p1.x : point.x, y: dy === 0 ? line.p1.y : point.y};
  } 
  const x = (dx * dy * (point.y - line.p0.y) + dx * dx * point.x + dy * dy * line.p0.x) / (dx * dx + dy * dy);
  const y = (dy * point.y + dx * (point.x - x)) / dy;
  return {x, y};
}

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

export async function zoomCropImageToData(context: CanvasRenderingContext2D, image: HTMLImageElement, crop?: Rectangle, scale: number = 1) {
  context.drawImage(
    image,
    crop?.x || 0,
    crop?.y || 0,
    crop?.w || image.width,
    crop?.h || image.height,
    0,
    0,
    image.width * scale,
    image.height * scale);
  return context.getImageData(0, 0, image.width * scale, image.height * scale);
}

export function randomBetween(from: number, to: number) {
  return Math.floor(from + Math.random() * (to - from));
}
