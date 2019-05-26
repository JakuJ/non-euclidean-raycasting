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

abstract class GameView extends View {
    state: GameState;

    constructor(x: number, y: number, width: number, height: number, state: GameState) {
        super(x, y, width, height);
        this.state = state;
    }

    abstract renderCollisions(collisions: { point: p5.Vector, segment: Segment, distance: number }[]): void;

    render() {
        this.renderCollisions(this.state.actor.raycast(this.state.level.cells));
    }
}

class RaycastView extends GameView {
    constructor(x: number, y: number, width: number, height: number, state: GameState) {
        super(x, y, width, height, state);
    }

    renderCollisions(collisions: { point: p5.Vector, segment: Segment, distance: number }[]): void {

        var scale = 1;
        if (this.width < this.height) {
            scale = this.width / (this.state.level.width * this.state.level.cellSize);
        }
        else {
            scale = this.height / (this.state.level.height * this.state.level.cellSize);
        }

        p.push();
        p.translate(this.x, this.y);
        p.scale(scale);

        for (let x of this.state.level.cells) {
            if (x) {
                x.show();
            }
        }

        collisions.forEach((c, i) => {
            if (c) {
                const closest = c.point;
                p.stroke(255, 150);
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

        const wSq = this.width * this.width;
        const w = this.width / this.state.actor.rays.length

        collisions.forEach((c, i) => {
            if (c) {
                const offset = p.map(this.state.actor.rays[i].angle, this.state.actor.angle - this.state.actor.fov / 2, this.state.actor.angle + this.state.actor.fov / 2, 0, this.width);
                const dist = c.distance;
                const sq = dist * dist;
                const alpha = this.state.actor.rays[i].angle - this.state.actor.angle;
                const cameraDist = dist * p.cos(alpha);
                const h = p.min(this.height, 50 / cameraDist * this.height);
                const clr = c.segment.c;
                const gray = p.map(sq, 0, wSq * p.sqrt(2), 1, 0);

                p.push();
                p.translate(this.x, this.y);
                p.noStroke();
                p.fill(p.red(clr) * gray, p.green(clr) * gray, p.blue(clr) * gray);
                p.rectMode(p.CENTER);
                p.rect(offset + w, this.height / 2, w, h);
                p.pop();
            }
        });
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