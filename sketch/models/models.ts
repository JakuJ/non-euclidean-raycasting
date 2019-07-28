class GameState {
    actor: Actor;
    level: Level;
    collisions: { point: p5.Vector, segment: Segment, distance: number }[][];

    constructor(width: number, height: number) {
        this.collisions = [];
        this.level = new Level(width, height);
        this.actor = new Actor(this.level.width * this.level.cellSize / 2, this.level.height * this.level.cellSize / 2);

        const textures = [
            '../../assets/textures/wall.bmp',
            '../../assets/textures/archs.bmp',
            '../../assets/textures/grid.jpeg'
        ].map(x => p.loadImage(x));
        
        const a = this.level.cellSize;

        // Initialize the level with random polygons
        for (let x = 0; x < this.level.width; x++) {
            for (let y = 0; y < this.level.height; y++) {
                if (p.abs(x - this.level.width / 2) > p.floor(width / 6) && p.random() < 0.1) {
                    const magic = (x + y) % textures.length;
                    const h = a * (1 + p.random());
                    this.level.add(new RegularPolygon(x * a, y * a, p.floor(p.random() * 3) + 3, a / 2, h, textures[magic]));
                }
            }
        }
    }

    update() {
        this.actor.update();
        this.collisions = this.actor.raycast(this.level.cells);
    }
}