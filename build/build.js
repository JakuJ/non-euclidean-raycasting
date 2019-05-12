var Actor = (function () {
    function Actor(x, y, nRays) {
        if (nRays === void 0) { nRays = 200; }
        this.pos = p.createVector(x, y);
        this.angle = 0;
        this.fov = p.PI * 2;
        this.rays = Array(nRays);
        for (var i = 0, a = this.angle - this.fov / 2; i < nRays; i++, a += this.fov / nRays) {
            this.rays[i] = new Ray(this.pos.x, this.pos.y, a);
        }
    }
    Actor.prototype.update = function () {
        this.pos.x = p.mouseX;
        this.pos.y = p.mouseY;
        for (var _i = 0, _a = this.rays; _i < _a.length; _i++) {
            var ray = _a[_i];
            ray.pos = this.pos;
        }
    };
    Actor.prototype.raycast = function (shapes) {
        for (var _i = 0, _a = this.rays; _i < _a.length; _i++) {
            var ray = _a[_i];
            var closest;
            var dist = Infinity;
            for (var _b = 0, shapes_1 = shapes; _b < shapes_1.length; _b++) {
                var shape = shapes_1[_b];
                var pt = ray.cast(shape);
                if (pt) {
                    var d = p.dist(this.pos.x, this.pos.y, pt.x, pt.y);
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
    };
    Actor.prototype.show = function () {
        p.stroke(255, 255);
        p.ellipse(this.pos.x, this.pos.y, 20, 20);
    };
    return Actor;
}());
var Ray = (function () {
    function Ray(x, y, angle) {
        this.pos = p.createVector(x, y);
        this.dir = p5.Vector.fromAngle(angle);
    }
    Ray.prototype.lookAt = function (x, y) {
        this.dir.x = x - this.pos.x;
        this.dir.y = y - this.pos.y;
        this.dir.normalize();
    };
    Ray.prototype.cast = function (shape) {
        var closest;
        var dist = Infinity;
        for (var _i = 0, _a = shape.getSegments(); _i < _a.length; _i++) {
            var segment = _a[_i];
            var pt = this.castSegment(segment);
            if (pt) {
                var d = p.dist(this.pos.x, this.pos.y, pt.x, pt.y);
                if (d < dist) {
                    dist = d;
                    closest = pt;
                }
            }
        }
        return closest;
    };
    Ray.prototype.castSegment = function (wall) {
        var x1 = wall.a.x;
        var y1 = wall.a.y;
        var x2 = wall.b.x;
        var y2 = wall.b.y;
        var x3 = this.pos.x;
        var y3 = this.pos.y;
        var x4 = this.pos.x + this.dir.x;
        var y4 = this.pos.y + this.dir.y;
        var den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (den == 0) {
            return;
        }
        var t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
        var u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;
        if (t > 0 && t < 1 && u > 0) {
            var pt = p.createVector();
            pt.x = x1 + t * (x2 - x1);
            pt.y = y1 + t * (y2 - y1);
            return pt;
        }
        else {
            return;
        }
    };
    return Ray;
}());
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Segment = (function () {
    function Segment(x1, y1, x2, y2) {
        this.a = p.createVector(x1, y1);
        this.b = p.createVector(x2, y2);
    }
    Segment.prototype.getSegments = function () {
        return [this];
    };
    Segment.prototype.show = function () {
        p.stroke(255, 255);
        p.line(this.a.x, this.a.y, this.b.x, this.b.y);
    };
    return Segment;
}());
var Rectangle = (function () {
    function Rectangle(x, y, w, h) {
        this.position = p.createVector(x, y);
        this.width = w;
        this.height = h;
        this.segments = new Array(4);
        this.segments[0] = new Segment(this.position.x, this.position.y, this.position.x + this.width, this.position.y);
        this.segments[1] = new Segment(this.position.x, this.position.y, this.position.x, this.position.y + this.height);
        this.segments[2] = new Segment(this.position.x + this.width, this.position.y, this.position.x + this.width, this.position.y + this.height);
        this.segments[3] = new Segment(this.position.x, this.position.y + this.height, this.position.x + this.width, this.position.y + this.height);
    }
    Rectangle.fromCoordinates = function (x1, y1, x2, y2) {
        return new Rectangle(x1, y1, x2 - x1, y2 - y1);
    };
    Rectangle.prototype.getSegments = function () {
        return this.segments;
    };
    Rectangle.prototype.show = function () {
        for (var _i = 0, _a = this.segments; _i < _a.length; _i++) {
            var segment = _a[_i];
            segment.show();
        }
    };
    return Rectangle;
}());
var Square = (function (_super) {
    __extends(Square, _super);
    function Square(x, y, a) {
        return _super.call(this, x, y, a, a) || this;
    }
    return Square;
}(Rectangle));
var p;
var sketch = function (context) {
    p = context;
    var player;
    var shapes;
    p.setup = function () {
        p.createCanvas(p.windowWidth - 1, p.windowHeight - 1);
        player = new Actor(p.width / 2, p.height / 2);
        shapes = [];
        for (var i = 0; i < 5; i++) {
            shapes.push(new Segment(p.random(0, p.width), p.random(0, p.height), p.random(0, p.width), p.random(0, p.height)));
            shapes.push(new Square(p.random(0, p.width), p.random(0, p.height), p.random(50, 300)));
        }
        shapes.push(Rectangle.fromCoordinates(0, 0, p.width, p.height));
    };
    p.draw = function () {
        p.background(0);
        for (var _i = 0, shapes_2 = shapes; _i < shapes_2.length; _i++) {
            var shape = shapes_2[_i];
            shape.show();
        }
        player.update();
        player.show();
        player.raycast(shapes);
    };
};
var sketchP5 = new p5(sketch);
//# sourceMappingURL=build.js.map