class Level {
    width: number;
    height: number;
    cellSize: number;
    cells: IShape[];

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.cellSize = 20;
        this.cells = [];
    }

    add(shape: IShape) {
        this.cells.push(shape);
    }
}