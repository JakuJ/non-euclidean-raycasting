class Level {
    cells: Square[];
    width: number;
    height: number;
    cellSize: number;

    constructor(w: number, h: number) {
        this.width = w;
        this.height = h;
        this.cellSize = p.width / this.width / 2;

        this.cells = []
    }

    addSquare(x: number, y: number) {
        this.cells.push(new Square(x * this.cellSize, y * this.cellSize, this.cellSize));
    }

    show() {
        for (let x of this.cells) {
            if (x) {
                x.show();
            }
        }
    }
}