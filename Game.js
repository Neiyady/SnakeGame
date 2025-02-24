class Game {
    constructor(rows, cols) {
        this.score = 0;
        this.bestScore = localStorage.getItem('bestScore') || 0;
        this.snake = new Snake(this);
        this.apple = new Apple(this);
        this.grid = this.createGrid(rows, cols);
        this.isGameOver = false;
        this.speed = 500; // Начальная скорость
        this.init();
    }

    createGrid(rows, cols) {
        const grid = [];
        for (let i = 0; i < rows; i++) {
            const row = [];
            for (let j = 0; j < cols; j++) {
                row.push({ x: j, y: i });
            }
            grid.push(row);
        }
        return grid;
    }

    init() {
        this.render();
        document.querySelector('.game-field').addEventListener('click', () => {
            if (!this.isGameOver) {
                this.startGame();
            }
        });
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
    }

    startGame() {
        this.score = 0; // Сбрасываем счет при старте новой игры
        this.snake.initialize();
        this.apple.generateNewPosition(this.snake.body);
        this.updateScore();
        this.gameLoop();
    }

    gameLoop() {
        if (this.isGameOver) return;
        setTimeout(() => {
            this.snake.move();
            this.checkCollision();
            this.render();
            this.gameLoop();
        }, this.speed);
    }

    checkCollision() {
        if (this.snake.checkCollision()) {
            this.endGame();
        }
    }

    endGame() {
        this.isGameOver = true;
        document.getElementById('restartButton').style.display = 'block';
        this.checkBestScore();
        this.updateScore(); // Обновляем счет, чтобы отобразить лучший результат
    }

    checkBestScore() {
        if (this.score > this.bestScore) {
            localStorage.setItem('bestScore', this.score);
            this.bestScore = this.score;
        }
    }

    updateScore() {
        document.getElementById('currentScore').innerText = this.score;
        document.getElementById('bestScore').innerText = this.bestScore;
    }

    handleKeydown(e) {
        const directionMap = {
            ArrowUp: 'up',
            ArrowDown: 'down',
            ArrowLeft: 'left',
            ArrowRight: 'right'
        };
        if (directionMap[e.key]) {
            this.snake.changeDirection(directionMap[e.key]);
        }
    }

    render() {
        const gameField = document.querySelector('.game-field');
        gameField.innerHTML = '';
        gameField.style.gridTemplateColumns = `repeat(${this.grid[0].length}, 20px)`; // Устанавливаем количество столбцов на основе ширины ячейки

        this.grid.forEach(row => {
            row.forEach(cell => {
                const cellDiv = document.createElement('div');
                cellDiv.classList.add('cell');
                if (this.snake.body.some(part => part.x === cell.x && part.y === cell.y)) {
                    cellDiv.classList.add('snake');
                }
                if (cell.x === this.apple.position.x && cell.y === this.apple.position.y) {
                    cellDiv.classList.add('apple');
                }
                gameField.appendChild(cellDiv);
            });
        });
    }
}
