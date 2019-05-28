interface IShape {
    show(): void;
    getSegments(): Segment[];
}

class Segment implements IShape {
    public a: p5.Vector;
    public b: p5.Vector;
    public h: number;
    public c: p5.Color;

    constructor(x1: number, y1: number, x2: number, y2: number, h: number, clr: p5.Color = null) {
        this.a = p.createVector(x1, y1);
        this.b = p.createVector(x2, y2);
        this.h = h;

        if (clr) {
            this.c = clr;
        }
        else {
            this.c = p.color(p.random(255), p.random(255), p.random(255));
        }
    }

    public getSegments(): Segment[] {
        return [this];
    }

    get length(): number {
        return p5.Vector.sub(this.b, this.a).mag();
    }

    public show(): void {
        p.stroke(this.c);
        p.line(this.a.x, this.a.y, this.b.x, this.b.y);
    }
}

class Rectangle implements IShape {
    protected position: p5.Vector;
    protected a: number;
    protected b: number;
    protected h: number;
    protected segments: Segment[];

    constructor(x: number, y: number, a: number, b: number, h: number) {
        this.position = p.createVector(x, y);
        this.a = a;
        this.b = b;
        this.h = h;

        const clr = p.color(p.random(255), p.random(255), p.random(255));

        this.segments = new Array(4);
        this.segments[0] = new Segment(this.position.x, this.position.y, this.position.x + this.a, this.position.y, this.h, clr);
        this.segments[1] = new Segment(this.position.x, this.position.y, this.position.x, this.position.y + this.b, this.h, clr);
        this.segments[2] = new Segment(this.position.x + this.a, this.position.y, this.position.x + this.a, this.position.y + this.b, this.h, clr);
        this.segments[3] = new Segment(this.position.x, this.position.y + this.b, this.position.x + this.a, this.position.y + this.b, this.h, clr);
    }

    public getSegments(): Segment[] {
        return this.segments;
    }

    public show() {
        for (let segment of this.segments) {
            segment.show();
        }
    }
}

class Square extends Rectangle {
    constructor(x: number, y: number, a: number) {
        super(x, y, a, a, a);
    }
}