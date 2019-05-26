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
        this.pos.add(front).add(side);
    };
    Actor.prototype.update = function () {
        for (var i = 0, a = this.angle - this.fov / 2; i < this.rays.length; i++, a += this.fov / this.rays.length) {
            this.rays[i].pos = this.pos;
            this.rays[i].angle = a;
        }
    };
    Actor.prototype.raycast = function (shapes) {
        var _this = this;
        return this.rays.map(function (ray, i) {
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
            return collided ? { point: collided.point, segment: collided.segment, distance: dist } : null;
        });
    };
    return Actor;
}());
var GameController = (function () {
    function GameController(state, view) {
        var _this = this;
        this.state = state;
        this.view = view;
        p.mouseMoved = function () {
            _this.state.actor.angle = p.map(p.mouseX, 0, p.width, 0, p.PI * 2) + p.PI / 2;
        };
        p.keyPressed = function () {
            _this.setMove(p.keyCode, true);
        };
        p.keyReleased = function () {
            _this.setMove(p.keyCode, false);
        };
    }
    GameController.prototype.update = function () {
        var step = this.isShift ? 5 : 3;
        if (this.isUp) {
            this.state.actor.move(step, 0);
        }
        if (this.isDown) {
            this.state.actor.move(-step, 0);
        }
        if (this.isLeft) {
            this.state.actor.move(0, -step);
        }
        if (this.isRight) {
            this.state.actor.move(0, step);
        }
        this.state.update();
        this.view.render();
    };
    GameController.prototype.setMove = function (c, b) {
        switch (c) {
            case 87:
                return this.isUp = b;
            case 83:
                return this.isDown = b;
            case 65:
                return this.isLeft = b;
            case 68:
                return this.isRight = b;
            case 16:
                return this.isShift = b;
            default:
                return b;
        }
    };
    return GameController;
}());
var Level = (function () {
    function Level(w, h) {
        this.width = w;
        this.height = h;
        this.cellSize = 10;
        this.cells = [];
    }
    Level.prototype.addSquare = function (x, y) {
        if (x < 0 || x > this.width || y < 0 || y > this.height) {
            throw new Error("Cell out of bounds");
        }
        this.cells.push(new Square(x * this.cellSize, y * this.cellSize, this.cellSize));
    };
    return Level;
}());
var GameState = (function () {
    function GameState(width, height) {
        this.level = new Level(width, height);
        for (var x = 0; x < this.level.width; x++) {
            for (var y = 0; y < this.level.height; y++) {
                if (p.abs(x - this.level.width / 2) > p.floor(width / 6) && p.random() < 0.1) {
                    this.level.addSquare(x, y);
                }
            }
        }
        this.actor = new Actor(this.level.width / 2, this.level.height / 2, 160);
    }
    GameState.prototype.update = function () {
        this.actor.update();
    };
    return GameState;
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
    var game;
    p.setup = function () {
        p.createCanvas(p.windowWidth, p.windowHeight, p.P2D);
        p.frameRate(60);
        p.textSize(30);
        var state = new GameState(50, 30);
        var view = new CompositeView([
            new RaycastView(0, 0, p.width / 2, p.height, state),
            new FirstPersonView(p.width / 2, 0, p.width / 2, p.height, state)
        ]);
        game = new GameController(state, view);
    };
    p.draw = function () {
        p.background(0);
        game.update();
    };
};
var sketchP5 = new p5(sketch);
var View = (function () {
    function View(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    return View;
}());
var GameView = (function (_super) {
    __extends(GameView, _super);
    function GameView(x, y, width, height, state) {
        var _this = _super.call(this, x, y, width, height) || this;
        _this.state = state;
        return _this;
    }
    GameView.prototype.render = function () {
        this.renderCollisions(this.state.actor.raycast(this.state.level.cells));
    };
    return GameView;
}(View));
var RaycastView = (function (_super) {
    __extends(RaycastView, _super);
    function RaycastView(x, y, width, height, state) {
        return _super.call(this, x, y, width, height, state) || this;
    }
    RaycastView.prototype.renderCollisions = function (collisions) {
        var _this = this;
        var scale = 1;
        if (this.width < this.height) {
            scale = this.width / (this.state.level.width * this.state.level.cellSize);
        }
        else {
            scale = this.height / (this.state.level.height * this.state.level.cellSize);
        }
        p.push();
        p.translate(this.x, this.y);
        p.scale(scale);
        for (var _i = 0, _a = this.state.level.cells; _i < _a.length; _i++) {
            var x = _a[_i];
            if (x) {
                x.show();
            }
        }
        collisions.forEach(function (c, i) {
            if (c) {
                var closest = c.point;
                p.stroke(255, 150);
                p.line(_this.state.actor.rays[i].pos.x, _this.state.actor.rays[i].pos.y, closest.x, closest.y);
            }
        });
        p.stroke(255, 255);
        p.fill(255);
        p.ellipse(this.state.actor.pos.x, this.state.actor.pos.y, 20 / scale, 20 / scale);
        p.pop();
    };
    return RaycastView;
}(GameView));
var FirstPersonView = (function (_super) {
    __extends(FirstPersonView, _super);
    function FirstPersonView(x, y, width, height, state) {
        return _super.call(this, x, y, width, height, state) || this;
    }
    FirstPersonView.prototype.renderCollisions = function (collisions) {
        var _this = this;
        p.noStroke();
        p.fill('#87CEEB');
        p.rect(this.x, this.y, this.width, this.height / 2);
        p.fill('#694629');
        p.rect(this.x, this.y + this.height / 2, this.width, this.height / 2);
        var wSq = this.width * this.width;
        var w = this.width / this.state.actor.rays.length;
        collisions.forEach(function (c, i) {
            if (c) {
                var offset = p.map(_this.state.actor.rays[i].angle, _this.state.actor.angle - _this.state.actor.fov / 2, _this.state.actor.angle + _this.state.actor.fov / 2, 0, _this.width);
                var dist_1 = c.distance;
                var sq_1 = dist_1 * dist_1;
                var alpha_1 = _this.state.actor.rays[i].angle - _this.state.actor.angle;
                var cameraDist = dist_1 * p.cos(alpha_1);
                var h = p.min(_this.height, 50 / cameraDist * _this.height);
                var clr = c.segment.c;
                var gray = p.map(sq_1, 0, wSq * p.sqrt(2), 1, 0);
                p.push();
                p.translate(_this.x, _this.y);
                p.noStroke();
                p.fill(p.red(clr) * gray, p.green(clr) * gray, p.blue(clr) * gray);
                p.rectMode(p.CENTER);
                p.rect(offset + w, _this.height / 2, w, h);
                p.pop();
            }
        });
    };
    return FirstPersonView;
}(GameView));
var CompositeView = (function (_super) {
    __extends(CompositeView, _super);
    function CompositeView(views) {
        var _this = this;
        var x = p.min(views.map(function (t) { return t.x; }));
        var y = p.min(views.map(function (t) { return t.y; }));
        var width = p.max(views.map(function (t) { return t.x; })) - x;
        var height = p.max(views.map(function (t) { return t.x; })) - y;
        _this = _super.call(this, x, y, width, height) || this;
        _this.views = views;
        return _this;
    }
    CompositeView.prototype.render = function () {
        this.views.forEach(function (x) { return x.render(); });
    };
    return CompositeView;
}(View));
//# sourceMappingURL=build.js.map