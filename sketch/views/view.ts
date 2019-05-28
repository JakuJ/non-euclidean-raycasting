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
        this.views.forEach(x => x.render());
    }
}

abstract class GameView extends View {
    state: GameState;

    constructor(x: number, y: number, width: number, height: number, state: GameState) {
        super(x, y, width, height);
        this.state = state;
    }

    abstract renderCollisions(collisions: { point: p5.Vector, segment: Segment, distance: number }[]): void;

    render() {
        this.renderCollisions(this.state.collisions);
    }
}

class RaycastView extends GameView {
    constructor(x: number, y: number, width: number, height: number, state: GameState) {
        super(x, y, width, height, state);
    }

    renderCollisions(collisions: { point: p5.Vector, segment: Segment, distance: number }[]): void {
        const scaleX = this.width / (this.state.level.width * this.state.level.cellSize);
        const scaleY = this.height / (this.state.level.height * this.state.level.cellSize);
        const scale = p.min(scaleX, scaleY);

        p.push();
        p.translate(this.x, this.y);
        // background
        p.fill(0);
        p.rect(0, 0, this.width, this.height);
        
        p.scale(scale);

        for (let x of this.state.level.cells) {
            if (x) {
                x.show();
            }
        }

        p.strokeWeight(0.5);
        p.stroke(255, 150);

        const seen = new Map<Segment, number[]>();
        collisions.forEach((c, i) => {
            if (c && !seen.has(c.segment)) {
                //seen.set(c.segment, [1]);
                const closest = c.point;
                p.line(this.state.actor.rays[i].pos.x, this.state.actor.rays[i].pos.y, closest.x, closest.y);
            }
        });

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

    renderCollisions(collisions: { point: p5.Vector, segment: Segment, distance: number }[]): void {
        p.noStroke();
        p.fill('#87CEEB');
        p.rect(this.x, this.y, this.width, this.height / 2);
        p.fill('#694629');
        p.rect(this.x, this.y + this.height / 2, this.width, this.height / 2);

        const w = this.width / this.state.actor.rays.length;

        collisions.forEach((c, i) => {
            if (c) {
                const offset = p.map(this.state.actor.rays[i].angle, this.state.actor.angle - this.state.actor.fov / 2, this.state.actor.angle + this.state.actor.fov / 2, 0, this.width);
                const alpha = this.state.actor.rays[i].angle - this.state.actor.angle;
                const cameraDist = c.distance * p.cos(alpha);
                const h = p.min(this.height, this.height / cameraDist * (this.width / (p.displayHeight / c.segment.h)));

                p.push();
                p.translate(this.x, this.y);
                p.fill(c.segment.c);
                p.rectMode(p.CENTER);
                p.rect(offset + 0.5 * w, this.height / 2, w, h);
                p.pop();
            }
        });
    }
}