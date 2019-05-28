var p: p5;

var sketch = (context: p5) => {
    p = context;
    var game: GameController;
    //var texture: p5.Image;

    p.preload = () => {
        //texture = p.loadImage("../assets/textures/archs.bmp");
    }

    p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight, p.P2D);
        p.frameRate(60);
        p.textSize(30);

        const state = new GameState(24, 24);
        const view = new CompositeView([
            new FirstPersonView(0, 0, p.width, p.height, state),
            new RaycastView(0, 0, 200, 200, state),
            new FPSView(p.width - 100, 30)
        ]);

        game = new GameController(state, view);
    }

    p.draw = () => {
        p.background(0);
        game.update();

        // TODO: Texturing
        //skewImage(texture, p.width / 2, 200, 4, 100, 200);
    }
}

var skewImage = (image: p5.Image, x: number, y: number, sliceWidth: number, left: number, right: number) => {
    const slices = p.floor(image.width / sliceWidth);
    const sw = p.floor(image.width / slices);
    const step = (right - left) / slices;
    var h = left;

    p.imageMode(p.CENTER);
    for (let i = 0; i < slices; i++) {
        p.image(image, x + (i + 0.5) * sliceWidth, y, sliceWidth, h, i * sw, 0, sw, image.height);
        h += step;
    }
}

var sketchP5 = new p5(sketch);