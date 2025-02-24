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
