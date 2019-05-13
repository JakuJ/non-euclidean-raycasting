var p: p5;

var sketch = (context: p5) => {
    p = context;

    var player: Actor;
    var shapes: IShape[];

    p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight);

        player = new Actor(p.width / 2, p.height / 2);

        shapes = [];
        for (let i = 0; i < 3; i++) {
            shapes.push(new Segment(p.random(0, p.width / 2), p.random(0, p.height), p.random(0, p.width / 2), p.random(0, p.height)));
            shapes.push(new Square(p.random(0, p.width / 2 - 300), p.random(0, p.height - 300), p.random(50, 300)));
        }

        // border around the scene
        //shapes.push(Rectangle.fromCoordinates(0, 0, p.width / 2, p.height));
    }

    p.draw = () => {
        p.background(0);

        for (let shape of shapes) {
            shape.show();
        }

        player.update();
        if (p.mouseX < p.width / 2) {
            player.raycast(shapes);
            player.show();
        }
    }
}

var sketchP5 = new p5(sketch);