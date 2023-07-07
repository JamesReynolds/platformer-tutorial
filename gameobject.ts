import { Rectangle, intersect, labelledCorners, zoomCropImageToData, corners, vectorBetween, projectToLine } from './utils.js';

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
    public checkCollision(other: GameObject, verbose: boolean) {
        // The bit we're now overlapping with the object
        const overlap = intersect(this.boundingBox, other.boundingBox);
        if (!overlap) {
            return undefined;
        }
        if (verbose) {
            console.log(`This: `, this.boundingBox);
            console.log(`Other: `, other.boundingBox);
            console.log(`Overlap: `, overlap);
        }
        
        // If we have some pixels, then check whether the overlap has any
        if (this.pixels) {
            const spritex = Math.floor(overlap.x - this.boundingBox.x);
            const spritey = Math.floor(overlap.y - this.boundingBox.y);
            let impact = false;
            for(let x = spritex; !impact && x < spritex + overlap.w ; ++x) {
                for(let y =  spritey ; !impact && y < spritey + overlap.h ; ++y) {
                    const [r, g, b, a] = [...this.pixels.data.slice(y * this.pixels.width * 4 + x * 4), 0, 0, 0, 0];
                    impact = impact || a !== 0;
                }
            }
            if (!impact) {
                return undefined;
            }
        }
        const labelled = labelledCorners(overlap, other.boundingBox);
        const inside = labelled.findIndex(x => x.label === "In");

        // Problems:
        //   1. Can walk through platforms touching the ground
        //   2. Wall climbing on corners is a bit odd
        //      ....Can I just make them smaller?
        // Touching
        if (inside === -1) {
            if (verbose) {
                console.log(`Touching: `, labelled);
            }
            if (overlap.h === 0) {
                return {x: undefined, y: 0};
            } else {
                return {x: 0, y: undefined};
            }
        }
        const [l, i, r] = [...labelled, ...labelled, ...labelled].slice(inside + 3, inside + 6);
        if (verbose) {
            console.log(l, i, r);
        }
        if (l.label === "In") {
            if (verbose) {
                console.log("Edge L");
            }
            return vectorBetween(i, r);
        } else if (r.label === "In") {
            if (verbose) {
                console.log("Edge R");
            }
            return vectorBetween(i, l);
        }
        const tangent = {p0: l, p1: r};
        const projection = projectToLine(tangent, i);
        if (verbose) {
            console.log("Tangent: ", tangent);
            console.log("Projection: ", projection);
        }
        return vectorBetween(i, projection);
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
