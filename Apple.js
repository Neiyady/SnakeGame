class Apple {
    constructor(game) {
        this.game = game;
        this.position = { x: 0, y: 0 };
    }

    generateNewPosition(snakeBody) {
        let newPosition;
        do {
            newPosition = {
                x: Math.floor(Math.random() * this.game.grid[0].length),
                y: Math.floor(Math.random() * this.game.grid.length)
            };
        } while (snakeBody.some(part => part.x === newPosition.x && part.y === newPosition.y));
        this.position = newPosition;
    }
}
