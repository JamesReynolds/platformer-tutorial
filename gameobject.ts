import { Rectangle, intersect, zoomCropImageToData, projectToLine, Line, corners } from './utils.js';

export function floorBox(rect: Rectangle) {
    rect.x = Math.floor(rect.x);
    rect.y = Math.floor(rect.y);
    rect.w = Math.floor(rect.w);
    rect.h = Math.floor(rect.h);
}

/**
 * A game object is a "sprite" (picture)
 * at a location and possible cropped
 */
export class GameObject {
    protected crop: Rectangle;
    private pixels: ImageData;
    constructor(
        public boundingBox: Rectangle,
        private sprite: HTMLImageElement,
        crop?: Rectangle,
        private scale = 1,
        context?: CanvasRenderingContext2D
    ) {
        this.crop = crop ? crop : {x: 0, y: 0, w: this.sprite.width, h: this.sprite.height};
        if (context) {
            zoomCropImageToData(context, sprite, this.crop, scale).then(x => this.pixels = x);
        }
    }

    public centre() {
        return { 
            x: this.boundingBox.x + this.boundingBox.w / 2,
            y: this.boundingBox.y + this.boundingBox.h / 2,
        };
    }

    /**
     * Figure out whether we collided with another object and return
     * opposite velocity to get us back outside the object if we did.
     * 
     * @param other The other gameobject we may have collided with
     * @param velocity The velocity we're moving at
     */
    public checkCollision(other: GameObject, target: Rectangle, canvas?: CanvasRenderingContext2D) {
        // The bit we're now overlapping with the object
        const overlap = intersect(other.boundingBox, target);
        if (!overlap) {
            return undefined;
        }
        floorBox(overlap);

        // If we have some pixels, then check whether the overlap has any
        if (other.pixels) {
            overlap.x = Math.floor(overlap.x - other.boundingBox.x);
            overlap.y = Math.floor(overlap.y - other.boundingBox.y);
            for(; overlap.w > 0; (++overlap.x, --overlap.w)) {
                let impact = false;
                for(let y =  overlap.y ; !impact && y < overlap.y + overlap.h ; ++y) {
                    const alpha = other.pixels.data[y * other.pixels.width * 4 + overlap.x * 4 + 3];
                    impact = impact || alpha > 20;
                }
                if (impact) break;
            }
            for(; overlap.w > 0 ; --overlap.w) {
                let impact = false;
                for(let y =  overlap.y ; !impact && y < overlap.y + overlap.h ; ++y) {
                    const alpha = other.pixels.data[y * other.pixels.width * 4 + (overlap.x + overlap.w) * 4 + 3];
                    impact = impact || alpha > 20;
                }
                if (impact) break;
            }
            for(; overlap.h > 0 ; (++overlap.y, --overlap.h)) {
                let impact = false;
                for(let x =  overlap.x ; !impact && x < overlap.x + overlap.h ; ++x) {
                    const alpha = other.pixels.data[overlap.y * other.pixels.width * 4 + x * 4 + 3];
                    impact = impact || alpha > 20;
                }
                if (impact) break;
            }
            for(; overlap.h > 0 ; --overlap.h) {
                let impact = false;
                for(let x =  overlap.x ; !impact && x < overlap.x + overlap.h ; ++x) {
                    const alpha = other.pixels.data[(overlap.y + overlap.h) * other.pixels.width * 4 + x * 4 + 3];
                    impact = impact || alpha > 20;
                }
                if (impact) break;
            }
            if (overlap.w === 0 && overlap.h === 0) {
                return undefined;
            }
            overlap.x += other.boundingBox.x;
            overlap.y += other.boundingBox.y;
        }

        if (overlap.h === 0) {
            return {x: undefined, y: 0};
        } else if (overlap.w === 0) {
            return {y: undefined, x: 0};
        }
        
        const dx = target.x - this.boundingBox.x;
        const dy = target.y - this.boundingBox.y;

        // TODO:
        // 1. Squeezing through small gaps
        // 2. Cleanup & comment
        const centre = {x: overlap.x + overlap.w / 2, y: overlap.y + overlap.h / 2};
        const myCentre = {x: target.x + target.w / 2, y: target.y + target.h / 2};
        const x = myCentre.x - centre.x;
        const y = myCentre.y - centre.y;
        if (x === 0) {
            return {x: undefined, y: dy > 0 ? -overlap.h : overlap.h };
        } else if (y === 0) {
            return {x: dx > 0 ? -overlap.w : overlap.w, y: undefined};
        }
        const we = Math.sign(x) * overlap.w;
        const he = Math.sign(y) * overlap.h;
        const hp = we / x * y;
        const wp = he / y * x;

        if (wp * wp + overlap.h * overlap.h < overlap.w * overlap.w + hp * hp) {
            // console.log("horizontal", centre, myCentre, dx.toFixed(2), dy.toFixed(2), wp, hp, overlap);
            return {x: wp, y: he};
        } else {
            // console.log("vertical", centre, myCentre, dx.toFixed(2), dy.toFixed(2), wp, hp, overlap);
            return {x: we, y: hp};
        }
    }

    public draw(ctx: CanvasRenderingContext2D, area?: Rectangle) {
        if (!area) {
            area = this.boundingBox;
        }
        const cropX = Math.floor(Math.max(0, area.x - this.boundingBox.x) / this.scale) % this.crop.w;
        const cropY = Math.floor(Math.max(0, area.y - this.boundingBox.y) / this.scale) % this.crop.h;
        area = intersect(this.boundingBox, area);
        if (!area || area.w === 0 || area.h === 0) {
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
