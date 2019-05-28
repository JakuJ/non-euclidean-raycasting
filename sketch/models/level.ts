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
    
    addSquare(x: number, y: number) {
        if (x < 0 || x > this.width || y < 0 || y > this.height) {
            throw new Error("Cell out of bounds");
        }
        
        this.add(new Square(x * this.cellSize, y * this.cellSize, this.cellSize));
    }
}