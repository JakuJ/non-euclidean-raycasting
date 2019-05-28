var p: p5;

var sketch = (context: p5) => {
    p = context;
    var game: GameController;
    var frames: number;

    p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight, p.P2D);
        p.frameRate(60);
        p.textSize(30);

        const state = new GameState(24, 24);
        const view = new CompositeView([
            new RaycastView(0, 0, p.width / 2, p.height, state),
            new FirstPersonView(p.width / 2, 0, p.width / 2, p.height, state)
        ]);

        game = new GameController(state, view);
        frames = p.round(p.frameRate());
    }

    p.draw = () => {
        p.background(0);
        game.update();

        // fixed framerate counter
        if (p.frameCount % 20 == 0) {
            frames = p.round(p.frameRate());
        }
        
        p.fill(255, 255, 0);
        p.textSize(24);
        p.text(frames + ' FPS', 10, 30);
    }
}

var sketchP5 = new p5(sketch);