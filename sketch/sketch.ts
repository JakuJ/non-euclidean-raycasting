var p: p5;

var sketch = (context: p5) => {
    p = context;

    var player: Actor;
    var shapes: Shape[];

    p.setup = () => {
        // -1 to see the border
        p.createCanvas(p.windowWidth - 1, p.windowHeight - 1);

        player = new Actor(p.width / 2, p.height / 2);
        shapes = [];

        for (let i = 0; i < 5; i++) {
            shapes.push(new Segment(p.random(0, p.width), p.random(0, p.height), p.random(0, p.width), p.random(0, p.height)));
            shapes.push(new Square(p.random(0, p.width), p.random(0, p.height), p.random(50, 300)));
        }
        
        // border around the scene
        shapes.push(Rectangle.fromCoordinates(0, 0, p.width, p.height));
    }

    p.draw = () => {
        p.background(0);
        
        for(let shape of shapes){
            shape.show();
        }
        
        player.update();
        player.show();
        player.raycast(shapes);
    }
}

var sketchP5 = new p5(sketch);