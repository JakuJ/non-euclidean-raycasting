class Ray {
    public pos: p5.Vector;
    public dir: p5.Vector;
    private _angle: number;

    constructor(x: number, y: number, a: number) {
        this.pos = p.createVector(x, y);
        this.angle = a;
    }

    set angle(a: number) {
        this._angle = a;
        this.dir = p5.Vector.fromAngle(a);
    }

    get angle() {
        return this._angle;
    }

    cast(shape: IShape) {
        var closest: p5.Vector;
        var target: Segment;
        var dist = Infinity;

        for (let segment of shape.getSegments()) {
            const pt = this.castSegment(segment);
            if (pt) {
                const d = p.dist(this.pos.x, this.pos.y, pt.x, pt.y);
                if (d < dist) {
                    dist = d;
                    closest = pt;
                    target = segment;
                }
            }
        }
        if (closest) {
            return { point: closest, segment: target };
        }
    }

    private castSegment(wall: Segment): p5.Vector {
        const x1 = wall.a.x;
        const y1 = wall.a.y;
        const x2 = wall.b.x;
        const y2 = wall.b.y;

        const x3 = this.pos.x;
        const y3 = this.pos.y;
        const x4 = this.pos.x + this.dir.x;
        const y4 = this.pos.y + this.dir.y;

        const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (den == 0) {
            return null;
        }

        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
        const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;
        
        if (t > 0 && t < 1 && u > 0) {
            return p.createVector(x1 + t * (x2 - x1), y1 + t * (y2 - y1));
        }

        return null;
    }
}