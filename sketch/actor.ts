class Actor {
    pos: p5.Vector;
    angle: number;
    fov: number;
    rays: Ray[];

    constructor(x: number, y: number, nRays: number = 160) {
        this.pos = p.createVector(x, y);
        this.angle = 0;
        this.fov = p.radians(60);

        this.rays = new Array(nRays);
        for (let i = 0, a = this.angle + this.fov / 2; i < nRays; i++ , a -= this.fov / nRays) {
            this.rays[i] = new Ray(this.pos.x, this.pos.y, a);
        }
    }

    move(dx: number, dy: number) {
        const front = p5.Vector.fromAngle(this.angle);
        front.setMag(dx);
        const side = p5.Vector.fromAngle(this.angle + p.PI / 2);
        side.setMag(dy);

        this.pos = this.pos.add(front).add(side);
    }

    update() {
        for (let i = 0, a = this.angle - this.fov / 2; i < this.rays.length; i++ , a += this.fov / this.rays.length) {
            this.rays[i].pos = this.pos;
            this.rays[i].angle = a;
        }
    }

    raycast(shapes: IShape[]) {
        const sceneW = p.width / 2;
        const wSq = sceneW * sceneW;
        const w = sceneW / this.rays.length;

        p.noStroke();
        p.fill('#87CEEB');
        p.rect(sceneW, 0, sceneW, p.height / 2);
        p.fill('#694629');
        p.rect(sceneW, p.height / 2, sceneW, p.height / 2);

        this.rays.forEach((ray, i) => {
            var collided: { point: p5.Vector, segment: Segment } = null;
            var dist = Infinity;

            for (let shape of shapes) {
                if (!shape) {
                    continue;
                }
                const t = ray.cast(shape);
                if (t) {
                    const d = p.dist(this.pos.x, this.pos.y, t.point.x, t.point.y);
                    if (d < dist) {
                        dist = d;
                        collided = t;
                    }
                }
            }

            const offset = p.map(ray.angle, this.angle - this.fov / 2, this.angle + this.fov / 2, 0, sceneW);

            if (collided) {
                const closest = collided.point;
                p.stroke(255, 150);
                p.line(ray.pos.x, ray.pos.y, closest.x, closest.y);

                // render 3D view on the right hand side
                const sq = dist * dist;
                const alpha = ray.angle - this.angle;
                const cameraDist = dist * p.cos(alpha);
                const h = 50 / cameraDist * p.height;
                const clr = collided.segment.c;
                const gray = p.map(sq, 0, wSq * p.sqrt(2), 1, 0);
                p.push();
                p.translate(sceneW, 0);
                p.noStroke();
                p.fill(p.red(clr) * gray, p.green(clr) * gray, p.blue(clr) * gray);
                p.rectMode(p.CENTER);
                p.rect(offset + w, p.height / 2, w, h);
                p.pop();
            }
        });
    }

    show() {
        p.stroke(255, 255);
        p.fill(255);
        p.ellipse(this.pos.x, this.pos.y, 20, 20);
    }
}