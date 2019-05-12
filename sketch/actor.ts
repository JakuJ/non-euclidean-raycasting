class Actor {
    pos: p5.Vector;
    angle: number;
    fov: number;
    rays: Ray[];

    constructor(x: number, y: number, nRays: number = 200) {
        this.pos = p.createVector(x, y);
        this.angle = 0;
        this.fov = p.PI * 2;

        this.rays = Array(nRays);
        for (let i = 0, a = this.angle - this.fov / 2; i < nRays; i++ , a += this.fov / nRays) {
            this.rays[i] = new Ray(this.pos.x, this.pos.y, a);
        }
    }

    update() {
        this.pos.x = p.mouseX;
        this.pos.y = p.mouseY;

        for (let ray of this.rays) {
            ray.pos = this.pos;
        }
    }

    raycast(shapes: Shape[]) {
        for (let ray of this.rays) {
            var closest: p5.Vector;
            var dist = Infinity;

            for (let shape of shapes) {
                const pt = ray.cast(shape);
                if (pt) {
                    const d = p.dist(this.pos.x, this.pos.y, pt.x, pt.y);
                    if (d < dist) {
                        dist = d;
                        closest = pt;
                    }
                }
            }
            if (closest) {
                p.stroke(255, 150);
                p.line(ray.pos.x, ray.pos.y, closest.x, closest.y);
            }
        }
    }

    show() {
        p.stroke(255, 255);
        p.ellipse(this.pos.x, this.pos.y, 20, 20);
    }
}