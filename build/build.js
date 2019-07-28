var p;
var sketch = function (context) {
    p = context;
    var game;
    p.setup = function () {
        p.createCanvas(p.windowWidth, p.windowHeight, p.P2D);
        p.frameRate(60);
        p.textSize(30);
        var state = new GameState(24, 24);
        var view = new CompositeView([
            new FirstPersonView(0, 0, p.width, p.height, state),
            new RaycastView(0, 0, 200, 200, state),
            new FPSView(p.width - 100, 30, 60)
        ]);
        game = new GameController(state, view);
    };
    p.draw = function () {
        p.background(0);
        game.update();
    };
};
var sketchP5 = new p5(sketch);
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
        var step = this.isShift ? 2 : 1;
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
var Actor = (function () {
    function Actor(x, y, nRays) {
        if (nRays === void 0) { nRays = 320; }
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
        var side = p5.Vector.fromAngle(this.angle + p.HALF_PI);
        side.setMag(dy);
        this.pos.add(front).add(side);
    };
    Actor.prototype.update = function () {
        var da = this.fov / this.rays.length;
        for (var i = 0, a = this.angle - this.fov * 0.5; i < this.rays.length; i++, a += da) {
            this.rays[i].pos = this.pos;
            this.rays[i].angle = a;
        }
    };
    Actor.prototype.raycast = function (shapes) {
        var ret = new Array(this.rays.length);
        for (var i = 0; i < ret.length; i++) {
            var collisions = [];
            for (var j = 0; j < shapes.length; j++) {
                var hit = this.rays[i].cast(shapes[j]);
                if (hit) {
                    collisions.push({ point: hit.point, segment: hit.segment });
                }
            }
            ret[i] = collisions;
        }
        return ret;
    };
    return Actor;
}());
var Level = (function () {
    function Level(width, height) {
        this.width = width;
        this.height = height;
        this.cellSize = 20;
        this.cells = [];
    }
    Level.prototype.add = function (shape) {
        this.cells.push(shape);
    };
    return Level;
}());
var GameState = (function () {
    function GameState(width, height) {
        this.collisions = [];
        this.level = new Level(width, height);
        this.actor = new Actor(this.level.width * this.level.cellSize / 2, this.level.height * this.level.cellSize / 2);
        var textures = [
            '../../assets/textures/wall.bmp',
            '../../assets/textures/archs.bmp',
            '../../assets/textures/grid.jpeg'
        ].map(function (x) { return p.loadImage(x); });
        var a = this.level.cellSize;
        for (var x = 0; x < this.level.width; x++) {
            for (var y = 0; y < this.level.height; y++) {
                if (p.abs(x - this.level.width / 2) > p.floor(width / 6) && p.random() < 0.1) {
                    var magic = (x + y) % textures.length;
                    var h = a * (1 + p.random());
                    this.level.add(new RegularPolygon(x * a, y * a, p.floor(p.random() * 3) + 3, a / 2, h, textures[magic]));
                }
            }
        }
    }
    GameState.prototype.update = function () {
        this.actor.update();
        this.collisions = this.actor.raycast(this.level.cells);
    };
    return GameState;
}());
var Ray = (function () {
    function Ray(x, y, a) {
        this.pos = p.createVector(x, y);
        this.angle = a;
    }
    Ray.prototype.cast = function (shape) {
        var closest;
        var segment;
        var dist = Infinity;
        var segments = shape.getSegments();
        for (var i = 0; i < segments.length; i++) {
            var pt = this.castSegment(segments[i]);
            if (pt) {
                var d = p.dist(this.pos.x, this.pos.y, pt.x, pt.y);
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
    };
    Ray.prototype.castSegment = function (wall) {
        var x1 = wall.a.x;
        var y1 = wall.a.y;
        var x2 = wall.b.x;
        var y2 = wall.b.y;
        var x3 = this.pos.x;
        var y3 = this.pos.y;
        var x4 = this.pos.x + p.cos(this.angle);
        var y4 = this.pos.y + p.sin(this.angle);
        var den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (den == 0) {
            return null;
        }
        var t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
        var u = ((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;
        if (t > 0 && t < 1 && u < 0) {
            return p.createVector(x1 + t * (x2 - x1), y1 + t * (y2 - y1));
        }
        return null;
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
    function Segment(x1, y1, x2, y2, h, tex) {
        if (tex === void 0) { tex = null; }
        this.a = p.createVector(x1, y1);
        this.b = p.createVector(x2, y2);
        this.h = h;
        this.texture = tex || p.loadImage('../../assets/textures/wall.bmp');
    }
    Segment.prototype.getSegments = function () {
        return [this];
    };
    Object.defineProperty(Segment.prototype, "length", {
        get: function () {
            return p5.Vector.sub(this.b, this.a).mag();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Segment.prototype, "angle", {
        get: function () {
            return p5.Vector.sub(this.b, this.a).heading();
        },
        enumerable: true,
        configurable: true
    });
    Segment.prototype.show = function () {
        p.stroke(255, 0, 0);
        p.line(this.a.x, this.a.y, this.b.x, this.b.y);
    };
    return Segment;
}());
var Polygon = (function () {
    function Polygon(segments) {
        this.x = p.min(segments.map(function (s) { return p.min(s.a.x, s.b.x); }));
        this.y = p.min(segments.map(function (s) { return p.min(s.a.y, s.b.y); }));
        this.h = p.max(segments.map(function (s) { return s.h; }));
        this.segments = segments;
    }
    Polygon.prototype.getSegments = function () {
        return this.segments;
    };
    Polygon.prototype.show = function () {
        p.stroke(255);
        for (var _i = 0, _a = this.segments; _i < _a.length; _i++) {
            var s = _a[_i];
            p.line(s.a.x, s.a.y, s.b.x, s.b.y);
        }
    };
    return Polygon;
}());
var RegularPolygon = (function (_super) {
    __extends(RegularPolygon, _super);
    function RegularPolygon(x, y, n, r, h, tex) {
        var _this = this;
        var segments = [];
        for (var i = 0; i < n; i++) {
            var x1 = r * p.cos(p.TWO_PI * i / n) + x;
            var y1 = r * p.sin(p.TWO_PI * i / n) + y;
            var x2 = r * p.cos(p.TWO_PI * ((i + 1) % n) / n) + x;
            var y2 = r * p.sin(p.TWO_PI * ((i + 1) % n) / n) + y;
            segments.push(new Segment(x2, y2, x1, y1, h, tex));
        }
        _this = _super.call(this, segments) || this;
        return _this;
    }
    return RegularPolygon;
}(Polygon));
var Rectangle = (function (_super) {
    __extends(Rectangle, _super);
    function Rectangle(x, y, a, b, h) {
        var _this = this;
        var texture = p.loadImage("../../assets/textures/" + (p.random() < 0.5 ? 'archs.bmp' : 'grid.jpeg'));
        var segments = [
            new Segment(x, y, x + a, y, h, texture),
            new Segment(x + a, y, x + a, y + b, h, texture),
            new Segment(x + a, y + b, x, y + b, h, texture),
            new Segment(x, y + b, x, y, h, texture),
        ];
        _this = _super.call(this, segments) || this;
        return _this;
    }
    Rectangle.prototype.getSegments = function () {
        return this.segments;
    };
    return Rectangle;
}(Polygon));
var Square = (function (_super) {
    __extends(Square, _super);
    function Square(x, y, a) {
        return _super.call(this, x, y, a, a, a) || this;
    }
    return Square;
}(Rectangle));
var View = (function () {
    function View(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    return View;
}());
var FPSView = (function (_super) {
    __extends(FPSView, _super);
    function FPSView(x, y, width) {
        var _this = _super.call(this, x, y, 0, 0) || this;
        _this.buffer = new Array(width);
        _this.width = width;
        _this.index = 0;
        _this.value = p.frameRate();
        return _this;
    }
    FPSView.prototype.render = function () {
        this.buffer[this.index] = p.frameRate();
        this.index = (this.index + 1) % this.width;
        if (this.index == this.width - 1) {
            this.value = p.round(this.buffer.reduce(function (acc, x) { return acc + x; }) / this.width);
        }
        p.fill(255, 255, 0);
        p.textSize(24);
        p.text(this.value + " FPS", this.x, this.y);
    };
    return FPSView;
}(View));
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
        for (var i = 0; i < this.views.length; i++) {
            this.views[i].render();
        }
    };
    return CompositeView;
}(View));
var GameView = (function (_super) {
    __extends(GameView, _super);
    function GameView(x, y, width, height, state) {
        var _this = _super.call(this, x, y, width, height) || this;
        _this.state = state;
        return _this;
    }
    GameView.prototype.render = function () {
        this.renderCollisions(this.state.collisions);
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
        var scaleX = this.width / (this.state.level.width * this.state.level.cellSize);
        var scaleY = this.height / (this.state.level.height * this.state.level.cellSize);
        var scale = p.min(scaleX, scaleY);
        p.push();
        p.translate(this.x, this.y);
        p.fill(0);
        p.rect(0, 0, this.width, this.height);
        p.scale(scale);
        p.strokeWeight(0.5);
        for (var i = this.state.level.cells.length - 1; i >= 0; --i) {
            var x = this.state.level.cells[i];
            if (x) {
                x.show();
            }
        }
        p.strokeWeight(0.25);
        p.stroke(255, 150);
        for (var i = 0; i < collisions.length; i++) {
            if (collisions[i].length > 0) {
                var closest = collisions[i].sort(function (x, y) { return p5.Vector.dist(_this.state.actor.pos, x.point) - p5.Vector.dist(_this.state.actor.pos, y.point); })[0].point;
                p.line(this.state.actor.pos.x, this.state.actor.pos.y, closest.x, closest.y);
            }
        }
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
        p.rect(this.x, this.y, this.width, this.height * 0.5);
        p.fill('#694629');
        p.rect(this.x, this.y + this.height * 0.5, this.width, this.height * 0.5);
        var w = this.width / this.state.actor.rays.length;
        var h_coeff = this.height * this.width / p.displayHeight;
        var small_alpha = this.state.actor.fov / this.state.actor.rays.length;
        for (var i = 0; i < collisions.length; i++) {
            var cols = collisions[i].sort(function (x, y) { return p5.Vector.dist(_this.state.actor.pos, y.point) - p5.Vector.dist(_this.state.actor.pos, x.point); });
            for (var j = 0; j < cols.length; j++) {
                var c = cols[j];
                var distance = p5.Vector.dist(this.state.actor.pos, c.point);
                var offset = p.map(this.state.actor.rays[i].angle, this.state.actor.angle - this.state.actor.fov * 0.5, this.state.actor.angle + this.state.actor.fov * 0.5, 0, this.width);
                var alpha_1 = this.state.actor.rays[i].angle - this.state.actor.angle;
                var cameraDist = distance * p.cos(alpha_1);
                var baseline = 0.5 * (this.height + h_coeff * this.state.level.cellSize / cameraDist);
                var h = h_coeff * c.segment.h / cameraDist;
                p.push();
                p.translate(this.x, this.y);
                var ratio = c.segment.texture.width / c.segment.length;
                var sx = p5.Vector.dist(c.segment.a, c.point) * ratio;
                var sw = distance * small_alpha * ratio;
                sw = p.abs(sw / p.sin(c.segment.angle - this.state.actor.rays[i].angle));
                p.imageMode(p.CORNER);
                p.image(c.segment.texture, offset, baseline - h, w, h, sx, 0, p.min(sw, c.segment.texture.width - sx), c.segment.texture.height);
                p.pop();
            }
        }
    };
    return FirstPersonView;
}(GameView));
//# sourceMappingURL=build.js.map