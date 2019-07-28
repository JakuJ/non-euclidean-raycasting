class Ray {
    public pos: p5.Vector;
    public angle: number;

    constructor(x: number, y: number, a: number) {
        this.pos = p.createVector(x, y);
        this.angle = a;
    }

    cast(shape: IShape) {
        var closest: p5.Vector;
        var segment: Segment;
        var dist = Infinity;

        const segments = shape.getSegments();
        for (let i = 0; i < segments.length; i++) {
            const pt = this.castSegment(segments[i]);
            if (pt) {
                const d = p.dist(this.pos.x, this.pos.y, pt.x, pt.y);
                if (d < dist) {
                    dist = d;
                    closest = pt;
                    segment = segments[i];
                }
            }
        }

        if (closest) {
            return { point: closest, segment: segment };
        }

        return null;
    }

    private castSegment(wall: Segment): p5.Vector {
        const x1 = wall.a.x;
        const y1 = wall.a.y;
        const x2 = wall.b.x;
        const y2 = wall.b.y;

        const x3 = this.pos.x;
        const y3 = this.pos.y;
        const x4 = this.pos.x + p.cos(this.angle);
        const y4 = this.pos.y + p.sin(this.angle);

        const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (den == 0) {
            return null;
        }

        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
        const u = ((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;

        if (t > 0 && t < 1 && u < 0) {
            return p.createVector(x1 + t * (x2 - x1), y1 + t * (y2 - y1));
        }

        return null;
    }
}