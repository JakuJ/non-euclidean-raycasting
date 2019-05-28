class GameState{
    actor: Actor;
    level: Level;
    collisions: { point: p5.Vector, segment: Segment, distance: number }[];

    constructor(width: number, height: number) {
        this.collisions = [];
        this.level = new Level(width, height);
        this.actor = new Actor(this.level.width * this.level.cellSize / 2, this.level.height * this.level.cellSize / 2);

        // Initialize the level with a random valley of squares
        for (let x = 0; x < this.level.width; x++) {
            for (let y = 0; y < this.level.height; y++) {
                if (p.abs(x - this.level.width / 2) > p.floor(width / 6) && p.random() < 0.1) {
                    this.level.addSquare(x, y);
                }
            }
        }
    }

    update(){
        this.actor.update();
        this.collisions = this.actor.raycast(this.level.cells);
    }
}