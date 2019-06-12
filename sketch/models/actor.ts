class Actor {
    pos: p5.Vector;
    angle: number;
    fov: number;
    rays: Ray[];

    constructor(x: number, y: number, nRays: number = 320) {
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
        const side = p5.Vector.fromAngle(this.angle + p.HALF_PI);
        side.setMag(dy);

        this.pos.add(front).add(side);
    }

    update() {
        for (let i = 0, a = this.angle - this.fov / 2; i < this.rays.length; i++ , a += this.fov / this.rays.length) {
            this.rays[i].pos = this.pos;
            this.rays[i].angle = a;
        }
    }

    raycast(shapes: IShape[]): { point: p5.Vector, segment: Segment, distance: number }[][] {
        return this.rays.map(ray => {
            var collisions: { point: p5.Vector, segment: Segment, distance: number }[] = [];

            for (let shape of shapes) {
                if (!shape) {
                    continue;
                }
                const hit = ray.cast(shape);
                if (hit) {
                    const d = p.dist(this.pos.x, this.pos.y, hit.point.x, hit.point.y);
                    
                    collisions.push({point: hit.point, segment: hit.segment, distance: d});
                }
            }
            return collisions;
        });
    }
}