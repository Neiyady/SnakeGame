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

class Snake {
    constructor(game) {
        this.game = game;
        this.body = [];
        this.direction = { x: 0, y: 0 };
        this.initialLength = 2;
    }

    initialize() {
        const centerX = Math.floor(this.game.grid[0].length / 2);
        const centerY = Math.floor(this.game.grid.length / 2);
        this.body = [{ x: centerX, y: centerY }];
        this.direction = { x: 0, y: -1 }; // Начальное направление вверх
        for (let i = 1; i < this.initialLength; i++) {
            this.body.push({ x: centerX, y: centerY + i });
        }
    }

    move() {
        const head = { ...this.body[0] };
        head.x += this.direction.x;
        head.y += this.direction.y;

        // Проверка на выход за границы поля
        if (head.x < 0 || head.x >= this.game.grid[0].length || head.y < 0 || head.y >= this.game.grid.length) {
            this.game.endGame(); // Конец игры, если змейка уходит за границы
            return;
        }

        this.body.unshift(head);

        // Проверка на съеденное яблоко
        if (head.x === this.game.apple.position.x && head.y === this.game.apple.position.y) {
            this.game.score++;
            this.game.apple.generateNewPosition(this.body);
            this.increaseSpeed(); // Увеличение скорости
        } else {
            this.body.pop(); // Удаляем последний элемент, если не съедено яблоко
        }

        // Обновляем текущий счет
        this.game.updateScore();
    }

    increaseSpeed() {
        this.game.speed = Math.max(100, this.game.speed - 20); // Увеличиваем скорость, но не ниже 100 мс
    }

    changeDirection(newDirection) {
        const oppositeDirection = {
            up: 'down',
            down: 'up',
            left: 'right',
            right: 'left'
        };

        // Проверяем, что новое направление не является противоположным текущему
        if (this.direction.x === 0 && this.direction.y === -1 && newDirection === 'down') return; // если идем вверх, нельзя пойти вниз
        if (this.direction.x === 0 && this.direction.y === 1 && newDirection === 'up') return; // если идем вниз, нельзя пойти вверх
        if (this.direction.x === -1 && this.direction.y === 0 && newDirection === 'right') return; // если идем влево, нельзя пойти вправо
        if (this.direction.x === 1 && this.direction.y === 0 && newDirection === 'left') return; // если идем вправо, нельзя пойти влево

        switch (newDirection) {
            case 'up':
                this.direction = { x: 0, y: -1 };
                break;
            case 'down':
                this.direction = { x: 0, y: 1 };
                break;
            case 'left':
                this.direction = { x: -1, y: 0 };
                break;
            case 'right':
                this.direction = { x: 1, y: 0 };
                break;
        }
    }

    checkCollision() {
        const head = this.body[0];
        return this.body.slice(1).some(part => part.x === head.x && part.y === head.y);
    }
}

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

// Функция для получения размеров поля от пользователя
function getGridSize() {
    let rows = parseInt(prompt("Введите количество строк (по умолчанию 10):", "10")) || 10;
    let cols = parseInt(prompt("Введите количество столбцов (по умолчанию 10):", "10")) || 10;

    // Проверка на минимальные размеры
    if (rows < 2 || cols < 2) {
        alert("Минимальные размеры поля 2 на 2. Установлены размеры 10 на 10.");
        rows = 10;
        cols = 10;
    }

    return { rows, cols };
}

// Инициализация игры с заданными размерами
const { rows, cols } = getGridSize();
const game = new Game(rows, cols);
document.getElementById('restartButton').addEventListener('click', () => {
    location.reload();
});
