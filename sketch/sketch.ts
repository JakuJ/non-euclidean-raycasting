var p: p5;

var sketch = (context: p5) => {
    p = context;

    var player: Actor;
    var shapes: IShape[];
    var isUp: boolean, isDown: boolean, isLeft: boolean, isRight: boolean, isShift: boolean;

    p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight);

        player = new Actor(p.width / 4, p.height / 2);

        shapes = [];
        for (let i = 0; i < 40; i++) {
            shapes.push(new Square(p.random(0, p.width / 2 - 30), p.random(0, p.height - 30), p.random(10, 30)));
        }
        shapes.push(new Rectangle(0, 0, p.width / 2, p.height));
    }

    p.draw = () => {
        p.background(0);

        for (let shape of shapes) {
            shape.show();
        }

        player.update();
        player.raycast(shapes);
        player.show();

        const dx = isShift ? 3 : 1;

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
    }

    p.mouseMoved = () => {
        player.angle = p.map(p.mouseX, 0, p.width, 0, p.PI * 2) + p.PI / 2;
    }

    p.keyPressed = () => {
        setMove(p.keyCode, true);
    }

    p.keyReleased = () => {
        setMove(p.keyCode, false);
    }

    var setMove = (c: number, b: boolean) => {
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
    }
}

var sketchP5 = new p5(sketch);