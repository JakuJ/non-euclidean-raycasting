interface IShape {
    show(): void;
    getSegments(): Segment[];
}

class Segment implements IShape {
    public a: p5.Vector;
    public b: p5.Vector;
    public h: number;
    public texture: p5.Image;

    constructor(x1: number, y1: number, x2: number, y2: number, h: number, tex: p5.Image = null) {
        this.a = p.createVector(x1, y1);
        this.b = p.createVector(x2, y2);
        this.h = h;

        if (tex) {
            this.texture = tex;
        }
        else {
            this.texture = p.loadImage('../../assets/textures/wall.bmp');
        }
    }

    public getSegments(): Segment[] {
        return [this];
    }

    get length(): number {
        return p5.Vector.sub(this.b, this.a).mag();
    }

    public show(): void {
        p.stroke(255, 0, 0);
        p.line(this.a.x, this.a.y, this.b.x, this.b.y);
    }
}

class Polygon implements IShape {
    x: number;
    y: number;
    h: number;
    segments: Segment[];

    constructor(segments: Segment[]) {
        this.x = p.min(segments.map(s => p.min(s.a.x, s.b.x)));
        this.y = p.min(segments.map(s => p.min(s.a.y, s.b.y)));
        this.h = p.max(segments.map(s => s.h));
        
        this.segments = segments;
    }

    getSegments(): Segment[] {
        return this.segments;
    }

    show(): void {
        p.stroke(255);
        for (let s of this.segments) {
            p.line(s.a.x, s.a.y, s.b.x, s.b.y);
        }
    }
}

class RegularPolygon extends Polygon {
    constructor(x: number, y: number, n: number, r: number, h: number, tex: p5.Image) {
        var segments: Segment[] = [];
        
        for (let i = 0; i < n; i++) {
            const x1 = r * p.cos(p.TWO_PI * i / n) + x;
            const y1 = r * p.sin(p.TWO_PI * i / n) + y;

            const x2 = r * p.cos(p.TWO_PI * ((i + 1) % n) / n) + x;
            const y2 = r * p.sin(p.TWO_PI * ((i + 1) % n) / n) + y;

            segments.push(new Segment(x1, y1, x2, y2, h, tex));
        }

        super(segments);
    }
}

class Rectangle implements IShape {
    protected position: p5.Vector;
    protected a: number;
    protected b: number;
    protected h: number;
    protected texture: p5.Image;
    protected segments: Segment[];

    constructor(x: number, y: number, a: number, b: number, h: number) {
        this.position = p.createVector(x, y);
        this.a = a;
        this.b = b;
        this.h = h;

        this.texture = p.loadImage(`../../assets/textures/${p.random() < 0.5 ? 'archs' : 'wall'}.bmp`);

        this.segments = new Array(4);
        this.segments[0] = new Segment(this.position.x, this.position.y, this.position.x + this.a, this.position.y, this.h, this.texture);
        this.segments[1] = new Segment(this.position.x, this.position.y, this.position.x, this.position.y + this.b, this.h, this.texture);
        this.segments[2] = new Segment(this.position.x + this.a, this.position.y, this.position.x + this.a, this.position.y + this.b, this.h, this.texture);
        this.segments[3] = new Segment(this.position.x, this.position.y + this.b, this.position.x + this.a, this.position.y + this.b, this.h, this.texture);
    }

    public getSegments(): Segment[] {
        return this.segments;
    }

    public show() {
        p.image(this.texture, this.position.x, this.position.y, this.a, this.b);
    }
}

class Square extends Rectangle {
    constructor(x: number, y: number, a: number) {
        super(x, y, a, a, a);
    }
}