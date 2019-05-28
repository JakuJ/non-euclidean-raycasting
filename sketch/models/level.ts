class Level {
    width: number;
    height: number;
    cellSize: number;
    cells: Square[];

    level: number[][];

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.cellSize = 10;
        this.cells = [];
    }

    addSquare(x: number, y: number) {
        if (x < 0 || x > this.width || y < 0 || y > this.height) {
            throw new Error("Cell out of bounds");
        }
        this.cells.push(new Square(x * this.cellSize, y * this.cellSize, this.cellSize));
    }
}