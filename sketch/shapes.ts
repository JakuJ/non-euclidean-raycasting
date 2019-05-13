interface IShape {
    show(): void;
    getSegments(): Segment[];
}

class Segment implements IShape {
    public a: p5.Vector;
    public b: p5.Vector;

    constructor(x1: number, y1: number, x2: number, y2: number) {
        this.a = p.createVector(x1, y1);
        this.b = p.createVector(x2, y2);
    }

    public getSegments(): Segment[] {
        return [this];
    }

    public show(): void {
        p.stroke(255, 255);
        p.line(this.a.x, this.a.y, this.b.x, this.b.y);
    }
}

class Rectangle implements IShape {
    protected position: p5.Vector;
    protected width: number;
    protected height: number;
    protected segments: Segment[];

    constructor(x: number, y: number, w: number, h: number) {
        this.position = p.createVector(x, y);
        this.width = w;
        this.height = h;

        this.segments = new Array(4);
        this.segments[0] = new Segment(this.position.x, this.position.y, this.position.x + this.width, this.position.y);
        this.segments[1] = new Segment(this.position.x, this.position.y, this.position.x, this.position.y + this.height);
        this.segments[2] = new Segment(this.position.x + this.width, this.position.y, this.position.x + this.width, this.position.y + this.height);
        this.segments[3] = new Segment(this.position.x, this.position.y + this.height, this.position.x + this.width, this.position.y + this.height);
    }

    public static fromCoordinates(x1: number, y1: number, x2: number, y2: number): Rectangle {
        return new Rectangle(x1, y1, x2 - x1, y2 - y1);
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
    constructor(x: number, y: number, a: number){
        super(x, y, a, a);
    }
}