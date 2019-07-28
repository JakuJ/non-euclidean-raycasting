class GameController {
    state: GameState;
    view: View;
    isUp: boolean; isDown: boolean; isLeft: boolean; isRight: boolean; isShift: boolean;

    constructor(state: GameState, view: View) {
        this.state = state;
        this.view = view;

        p.mouseMoved = () => {
            this.state.actor.angle = p.map(p.mouseX, 0, p.width, 0, p.PI * 2) + p.PI / 2;
        }

        p.keyPressed = () => {
            this.setMove(p.keyCode, true);
        }

        p.keyReleased = () => {
            this.setMove(p.keyCode, false);
        }
    }

    update() {
        const step = this.isShift ? 2 : 1;

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
    }

    setMove(c: number, b: boolean) {
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
    }
}
