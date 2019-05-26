var p: p5;

var sketch = (context: p5) => {
    p = context;
    var game: GameController;

    p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight, p.P2D);
        p.frameRate(60);
        p.textSize(30);

        const state = new GameState(50, 30);
        const view = new CompositeView(
            [
                new RaycastView(0, 0, p.width / 2, p.height, state),
                new FirstPersonView(p.width / 2, 0, p.width / 2, p.height, state)
            ]
        );

        game = new GameController(state, view);
    }

    p.draw = () => {
        p.background(0);
        game.update();
    }
}

var sketchP5 = new p5(sketch);