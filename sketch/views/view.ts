abstract class View {
    x: number;
    y: number;
    width: number;
    height: number;

    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    abstract render(): void;
}

class FPSView extends View {
    constructor(x: number, y: number) {
        super(x, y, 0, 0);
    }

    render(): void {
        p.fill(255, 255, 0);
        p.textSize(24);
        p.text(p.round(p.frameRate()) + ' FPS', this.x, this.y);
    }
}

class CompositeView extends View {
    views: View[];

    constructor(views: View[]) {
        const x = p.min(views.map(t => t.x));
        const y = p.min(views.map(t => t.y));
        const width = p.max(views.map(t => t.x)) - x;
        const height = p.max(views.map(t => t.x)) - y;

        super(x, y, width, height);

        this.views = views;
    }

    render(): void {
        for (let i = 0; i < this.views.length; i++) {
            this.views[i].render();
        }
    }
}

abstract class GameView extends View {
    state: GameState;

    constructor(x: number, y: number, width: number, height: number, state: GameState) {
        super(x, y, width, height);
        this.state = state;
    }

    abstract renderCollisions(collisions: { point: p5.Vector, segment: Segment, distance: number }[][]): void;

    render() {
        this.renderCollisions(this.state.collisions);
    }
}

class RaycastView extends GameView {
    constructor(x: number, y: number, width: number, height: number, state: GameState) {
        super(x, y, width, height, state);
    }

    renderCollisions(collisions: { point: p5.Vector, segment: Segment, distance: number }[][]): void {
        const scaleX = this.width / (this.state.level.width * this.state.level.cellSize);
        const scaleY = this.height / (this.state.level.height * this.state.level.cellSize);
        const scale = p.min(scaleX, scaleY);

        p.push();
        p.translate(this.x, this.y);

        // background
        p.fill(0);
        p.rect(0, 0, this.width, this.height);

        p.scale(scale);
        p.strokeWeight(0.5);
        
        // level polygons on a minimap
        for (let i = this.state.level.cells.length - 1; i >= 0; --i) {
            const x = this.state.level.cells[i];
            if (x) {
                x.show();
            }
        }

        p.strokeWeight(0.25);
        p.stroke(255, 150);

        for (let i = 0; i < collisions.length; i++) {
            if (collisions[i].length > 0) {
                const closest = collisions[i].sort((x, y) => x.distance - y.distance)[0].point;
                p.line(this.state.actor.rays[i].pos.x, this.state.actor.rays[i].pos.y, closest.x, closest.y);
            }
        }

        // player (dot)
        p.stroke(255, 255);
        p.fill(255);
        p.ellipse(this.state.actor.pos.x, this.state.actor.pos.y, 20 / scale, 20 / scale);
        p.pop();
    }
}

class FirstPersonView extends GameView {
    constructor(x: number, y: number, width: number, height: number, state: GameState) {
        super(x, y, width, height, state);
    }

    // actor's perceived "height" is half the level's cell size
    renderCollisions(collisions: { point: p5.Vector, segment: Segment, distance: number }[][]): void {
        p.noStroke();
        p.fill('#87CEEB');
        p.rect(this.x, this.y, this.width, this.height * 0.5);
        p.fill('#694629');
        p.rect(this.x, this.y + this.height * 0.5, this.width, this.height * 0.5);

        const w = this.width / this.state.actor.rays.length;
        const h_coeff = this.height * this.width / p.displayHeight;
        const small_alpha = this.state.actor.fov / this.state.actor.rays.length;

        for (let i = 0; i < collisions.length; i++) {
            const cols = collisions[i].sort((x, y) => (y.distance - x.distance));

            for (let j = 0; j < cols.length; j++) {
                const c = cols[j];

                const offset = p.map(this.state.actor.rays[i].angle, this.state.actor.angle - this.state.actor.fov * 0.5, this.state.actor.angle + this.state.actor.fov * 0.5, 0, this.width);
                const alpha = this.state.actor.rays[i].angle - this.state.actor.angle;
                const cameraDist = c.distance * p.cos(alpha);

                const baseline = 0.5 * (this.height + h_coeff * this.state.level.cellSize / cameraDist)
                const h = h_coeff * c.segment.h / cameraDist;

                p.push();
                p.translate(this.x, this.y);

                const ai = p5.Vector.dist(c.segment.a, c.point);
                const ratio = c.segment.texture.width / c.segment.length;

                const sx = ai * ratio;
                var sw = c.distance * small_alpha * ratio; // engineering approximation
                sw = p.abs(sw / p.sin(c.segment.angle - this.state.actor.rays[i].angle));

                p.imageMode(p.CORNER);
                p.image(c.segment.texture, offset, baseline - h, w, h, sx, 0, p.min(sw, c.segment.texture.width - sx), c.segment.texture.height);
                p.pop();
            }
        }
    }
}