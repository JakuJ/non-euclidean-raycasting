class Actor {
    pos: p5.Vector;
    angle: number;
    fov: number;
    rays: Ray[];

    constructor(x: number, y: number, nRays: number = 150) {
        this.pos = p.createVector(x, y);
        this.angle = p.PI;
        this.fov = p.radians(45);

        this.rays = new Array(nRays);
        for (let i = 0, a = this.angle + this.fov / 2; i < nRays; i++ , a -= this.fov / nRays) {
            this.rays[i] = new Ray(this.pos.x, this.pos.y, a);
        }
    }

    update() {
        this.pos.x = p.mouseX;
        this.pos.y = p.mouseY;

        for (let i = 0, a = this.angle - this.fov / 2; i < this.rays.length; i++ , a += this.fov / this.rays.length) {
            this.rays[i].pos = this.pos;
            this.rays[i].angle = a;
        }
    }

    raycast(shapes: IShape[]) {
        for (let ray of this.rays) {
            var closest: p5.Vector = null;
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
                p.stroke(255, 0, 0);
                p.line(ray.pos.x, ray.pos.y, closest.x, closest.y);

                // render 2.5D view on the right hand side
                const offset = p.map(ray.angle, this.angle - this.fov / 2, this.angle + this.fov / 2, p.width / 2, p.width);
                const w = p.width / 2 / this.rays.length;
                const h = p.map(p.abs(closest.x - this.pos.x), 0, p.width / 2, p.height, 0);
                const alpha = p.map(h, 0, p.height, 0, 255);

                p.fill(255, alpha);
                p.noStroke();
                p.rectMode(p.CENTER);
                p.rect(offset + w / 2, p.height / 2, w, h);

            }
        }
    }

    show() {
        p.stroke(255, 255);
        p.ellipse(this.pos.x, this.pos.y, 20, 20);
    }
}