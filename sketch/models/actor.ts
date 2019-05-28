class Actor{
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

        this.pos.add(front).add(side);
    }

    update() {
        for (let i = 0, a = this.angle - this.fov / 2; i < this.rays.length; i++ , a += this.fov / this.rays.length) {
            this.rays[i].pos = this.pos;
            this.rays[i].angle = a;
        }
    }

    raycast(shapes: IShape[]): { point: p5.Vector, segment: Segment, distance: number }[] {
        return this.rays.map((ray, i) => {
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
            return collided ? { point: collided.point, segment: collided.segment, distance: dist } : null;
        });
    }
}