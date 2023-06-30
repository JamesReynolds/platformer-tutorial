import { Rectangle } from './utils';

/**
 * Return the "intersection" (overlap) of two rectangles
 * @param lhs The left hand rectangle
 * @param rhs The right hand rectangle
 * @returns A new rectangle of the overlap between the two
 */
function intersect(lhs: Rectangle, rhs: Rectangle) {
    const x = Math.max(lhs.x, rhs.x);
    const y = Math.max(lhs.y, rhs.y);
    return {x, y, 
        w: Math.max(0, Math.min(lhs.x + lhs.w, rhs.x + rhs.w) - x),
        h: Math.max(0, Math.min(lhs.y + lhs.h, rhs.y + rhs.h) - y)
    }
}

/**
 * A game object is a "sprite" (picture)
 * at a location and possible cropped
 */
export class GameObject {
    protected crop: Rectangle;
    constructor(
        public boundingBox: Rectangle,
        private sprite: HTMLImageElement,
        crop?: Rectangle,
        private scale = 1
    ) {
        this.crop = crop ? crop : {x: 0, y: 0, w: this.sprite.width, h: this.sprite.height};
    }

    public centre() {
        return { 
            x: this.boundingBox.x + this.boundingBox.w / 2,
            y: this.boundingBox.y + this.boundingBox.h / 2,
        };
    }

    public draw(ctx: CanvasRenderingContext2D, area?: Rectangle) {
        if (!area) {
            area = this.boundingBox;
        }
        const cropX = Math.floor(Math.max(0, area.x - this.boundingBox.x) / this.scale) % this.crop.w;
        const cropY = Math.floor(Math.max(0, area.y - this.boundingBox.y) / this.scale) % this.crop.h;
        area = intersect(this.boundingBox, area);
        if (area.w === 0 || area.h === 0) {
            return;
        }
        this.draw1(ctx, area, cropX, cropY);
        for(let y = area.y + Math.floor((this.crop.h - cropY) * this.scale); y < area.y + area.h ; y += this.crop.h * this.scale) {
            this.draw1(ctx, {...area, y, h: area.y + area.h - y}, cropX, 0);
        }
        for(let x = area.x + Math.floor((this.crop.w - cropX) * this.scale); x < area.x + area.w ; x += this.crop.w * this.scale) {
            this.draw1(ctx, {...area, x, w: area.x + area.w - x}, 0, cropY);
            for(let y = area.y + Math.floor((this.crop.h - cropY) * this.scale); y < area.y + area.h ; y += this.crop.h * this.scale) {
                this.draw1(ctx, {x, y, w: area.x + area.w - x, h: area.y + area.h - y}, 0, 0);
            }
        }
    }
    draw1(ctx: CanvasRenderingContext2D, area: Rectangle, cropX: number, cropY: number) {
        ctx.drawImage(
            this.sprite,
            this.crop.x + cropX,
            this.crop.y + cropY,
            Math.min(area.w / this.scale, this.crop.w - cropX),
            Math.min(area.h / this.scale, this.crop.h - cropY),
            area.x,
            area.y,
            Math.min(area.w, (this.crop.w - cropX) * this.scale),
            Math.min(area.h, (this.crop.h - cropY) * this.scale));
    }
}
