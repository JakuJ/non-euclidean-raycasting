var Actor = (function () {
    function Actor(x, y, nRays) {
        if (nRays === void 0) { nRays = 160; }
        this.pos = p.createVector(x, y);
        this.angle = 0;
        this.fov = p.radians(60);
        this.rays = new Array(nRays);
        for (var i = 0, a = this.angle + this.fov / 2; i < nRays; i++, a -= this.fov / nRays) {
            this.rays[i] = new Ray(this.pos.x, this.pos.y, a);
        }
    }
    Actor.prototype.move = function (dx, dy) {
        var front = p5.Vector.fromAngle(this.angle);
        front.setMag(dx);
        var side = p5.Vector.fromAngle(this.angle + p.PI / 2);
        side.setMag(dy);
        this.pos = this.pos.add(front).add(side);
    };
    Actor.prototype.update = function () {
        for (var i = 0, a = this.angle - this.fov / 2; i < this.rays.length; i++, a += this.fov / this.rays.length) {
            this.rays[i].pos = this.pos;
            this.rays[i].angle = a;
        }
    };
    Actor.prototype.raycast = function (shapes) {
        var _this = this;
        var sceneW = p.width / 2;
        var wSq = sceneW * sceneW;
        var w = sceneW / this.rays.length;
        p.noStroke();
        p.fill('#87CEEB');
        p.rect(sceneW, 0, sceneW, p.height / 2);
        p.fill('#694629');
        p.rect(sceneW, p.height / 2, sceneW, p.height / 2);
        this.rays.forEach(function (ray, i) {
            var collided = null;
            var dist = Infinity;
            for (var _i = 0, shapes_1 = shapes; _i < shapes_1.length; _i++) {
                var shape = shapes_1[_i];
                if (!shape) {
                    continue;
                }
                var t = ray.cast(shape);
                if (t) {
                    var d = p.dist(_this.pos.x, _this.pos.y, t.point.x, t.point.y);
                    if (d < dist) {
                        dist = d;
                        collided = t;
                    }
                }
            }
            var offset = p.map(ray.angle, _this.angle - _this.fov / 2, _this.angle + _this.fov / 2, 0, sceneW);
            if (collided) {
                var closest = collided.point;
                p.stroke(255, 150);
                p.line(ray.pos.x, ray.pos.y, closest.x, closest.y);
                var sq_1 = dist * dist;
                var alpha_1 = ray.angle - _this.angle;
                var cameraDist = dist * p.cos(alpha_1);
                var h = 50 / cameraDist * p.height;
                var clr = collided.segment.c;
                var gray = p.map(sq_1, 0, wSq * p.sqrt(2), 1, 0);
                p.push();
                p.translate(sceneW, 0);
                p.noStroke();
                p.fill(p.red(clr) * gray, p.green(clr) * gray, p.blue(clr) * gray);
                p.rectMode(p.CENTER);
                p.rect(offset + w, p.height / 2, w, h);
                p.pop();
            }
        });
    };
    Actor.prototype.show = function () {
        p.stroke(255, 255);
        p.fill(255);
        p.ellipse(this.pos.x, this.pos.y, 20, 20);
    };
    return Actor;
}());
var Level = (function () {
    function Level(w, h) {
        this.width = w;
        this.height = h;
        this.cellSize = p.width / this.width / 2;
        this.cells = [];
    }
    Level.prototype.addSquare = function (x, y) {
        this.cells.push(new Square(x * this.cellSize, y * this.cellSize, this.cellSize));
    };
    Level.prototype.show = function () {
        for (var _i = 0, _a = this.cells; _i < _a.length; _i++) {
            var x = _a[_i];
            if (x) {
                x.show();
            }
        }
    };
    return Level;
}());
var Ray = (function () {
    function Ray(x, y, a) {
        this.pos = p.createVector(x, y);
        this.angle = a;
    }
    Object.defineProperty(Ray.prototype, "angle", {
        get: function () {
            return this._angle;
        },
        set: function (a) {
            this._angle = a;
            this.dir = p5.Vector.fromAngle(a);
        },
        enumerable: true,
        configurable: true
    });
    Ray.prototype.cast = function (shape) {
        var closest;
        var target;
        var dist = Infinity;
        for (var _i = 0, _a = shape.getSegments(); _i < _a.length; _i++) {
            var segment = _a[_i];
            var pt = this.castSegment(segment);
            if (pt) {
                var d = p.dist(this.pos.x, this.pos.y, pt.x, pt.y);
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
    function Segment(x1, y1, x2, y2, clr) {
        if (clr === void 0) { clr = null; }
        this.a = p.createVector(x1, y1);
        this.b = p.createVector(x2, y2);
        if (clr) {
            this.c = clr;
        }
        else {
            this.c = p.color(p.random(255), p.random(255), p.random(255));
        }
    }
    Segment.prototype.getSegments = function () {
        return [this];
    };
    Segment.prototype.show = function () {
        p.stroke(this.c);
        p.line(this.a.x, this.a.y, this.b.x, this.b.y);
    };
    return Segment;
}());
var Rectangle = (function () {
    function Rectangle(x, y, w, h) {
        this.position = p.createVector(x, y);
        this.width = w;
        this.height = h;
        var clr = p.color(p.random(255), p.random(255), p.random(255));
        this.segments = new Array(4);
        this.segments[0] = new Segment(this.position.x, this.position.y, this.position.x + this.width, this.position.y, clr);
        this.segments[1] = new Segment(this.position.x, this.position.y, this.position.x, this.position.y + this.height, clr);
        this.segments[2] = new Segment(this.position.x + this.width, this.position.y, this.position.x + this.width, this.position.y + this.height, clr);
        this.segments[3] = new Segment(this.position.x, this.position.y + this.height, this.position.x + this.width, this.position.y + this.height, clr);
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
    var level;
    var isUp, isDown, isLeft, isRight, isShift;
    p.setup = function () {
        p.createCanvas(p.windowWidth, p.windowHeight);
        p.frameRate(60);
        p.textSize(30);
        player = new Actor(p.width / 4, p.height / 2);
        var lw = 40;
        var lh = 50;
        level = new Level(lw, lh);
        for (var x = 0; x < lw; x++) {
            for (var y = 0; y < lh; y++) {
                if (p.abs(x - lw / 2) > 5 && p.random() < 0.1) {
                    level.addSquare(x, y);
                }
            }
        }
    };
    p.draw = function () {
        p.background(0);
        level.show();
        player.update();
        player.raycast(level.cells);
        player.show();
        p.stroke(255);
        p.fill(255);
        p.text(p.round(p.frameRate()), p.width / 2, p.textSize());
        var dx = isShift ? 5 : 3;
        if (isUp) {
            player.move(dx, 0);
        }
        if (isDown) {
            player.move(-dx, 0);
        }
        if (isLeft) {
            player.move(0, -dx);
        }
        if (isRight) {
            player.move(0, dx);
        }
    };
    p.mouseMoved = function () {
        player.angle = p.map(p.mouseX, 0, p.width, 0, p.PI * 2) + p.PI / 2;
    };
    p.keyPressed = function () {
        setMove(p.keyCode, true);
    };
    p.keyReleased = function () {
        setMove(p.keyCode, false);
    };
    var setMove = function (c, b) {
        switch (c) {
            case 87:
                return isUp = b;
            case 83:
                return isDown = b;
            case 65:
                return isLeft = b;
            case 68:
                return isRight = b;
            case 16:
                return isShift = b;
            default:
                return b;
        }
    };
};
var sketchP5 = new p5(sketch);
//# sourceMappingURL=build.js.map