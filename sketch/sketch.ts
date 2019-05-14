var p: p5;

var sketch = (context: p5) => {
    p = context;

    var player: Actor;
    var level: Level;
    var isUp: boolean, isDown: boolean, isLeft: boolean, isRight: boolean, isShift: boolean;

    p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight);
        p.frameRate(60);
        p.textSize(30);

        player = new Actor(p.width / 4, p.height / 2);

        const lw = 40;
        const lh = 50;
        level = new Level(lw, lh);

        for (let x = 0; x < lw; x++) {
            for (let y = 0; y < lh; y++) {
                if (p.abs(x - lw / 2) > 5 && p.random() < 0.1) {
                    level.addSquare(x, y);
                }
            }
        }
    }

    p.draw = () => {
        p.background(0);

        level.show();

        player.update();
        player.raycast(level.cells);
        player.show();

        p.stroke(255);
        p.fill(255);
        p.text(p.round(p.frameRate()), p.width / 2, p.textSize());

        const dx = isShift ? 5 : 3;

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