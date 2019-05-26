class GameState{
    actor: Actor;
    level: Level;

    constructor(width: number, height: number) {
        this.level = new Level(width, height);

        for (let x = 0; x < this.level.width; x++) {
            for (let y = 0; y < this.level.height; y++) {
                if (p.abs(x - this.level.width / 2) > p.floor(width / 6) && p.random() < 0.1) {
                    this.level.addSquare(x, y);
                }
            }
        }

        this.actor = new Actor(this.level.width / 2, this.level.height / 2, 160)
    }

    update(){
        this.actor.update();
    }
}