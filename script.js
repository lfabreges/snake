const bestScoreElement = document.getElementById('bestScore');
const canvas = document.getElementById('game');
const context = canvas.getContext('2d');
const cyanElement = document.getElementById('cyan');
const redElement = document.getElementById('red');
const scoreElement = document.getElementById('score');

const colorChangeInterval = 30000;
const gridSize = 30;
const gridCount = canvas.width / gridSize;

let redValue = localStorage.getItem('redValue') || '154';
let cyanValue = localStorage.getItem('cyanValue') || '140';
let bestScore = localStorage.getItem('snakeBestScore') || 0;
let lastUpdateTime = 0;

let direction;
let food;
let gameSpeed;
let nextDirection;
let score ;
let snake;
let snakeIdleTime;

redElement.value = redValue;
cyanElement.value = cyanValue;
bestScoreElement.textContent = bestScore;

context.scale(1, 1);

newGame();
requestAnimationFrame(gameLoop);

/*
 * Functions
 */

function checkCollisions() {
    const head = snake[0];

    if (head.x < 0 || head.x >= gridCount || head.y < 0 || head.y >= gridCount) {
        gameOver();
        return;
    }

    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return;
        }
    }
}

function createRandomFood() {
    let newFood;

    do {
        newFood = {
            x: Math.floor(Math.random() * gridCount),
            y: Math.floor(Math.random() * gridCount)
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y))

    return newFood;
}

function draw() {
    const colors = getColors();

    context.fillStyle = colors[0];
    snake.forEach(position => context.fillRect(position.x * gridSize, position.y * gridSize, gridSize, gridSize))

    context.fillStyle = colors[1];
    context.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
}

function gameLoop(time) {
    snakeIdleTime += time - lastUpdateTime;
    lastUpdateTime = time;

    if (snakeIdleTime >= gameSpeed) {
        snakeIdleTime = snakeIdleTime % gameSpeed;
        context.clearRect(0, 0, canvas.width, canvas.height);
        moveSnake();
        checkCollisions();   
    }

    draw();
    requestAnimationFrame(gameLoop);
}

function gameOver() {
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('snakeBestScore', bestScore);
        bestScoreElement.textContent = bestScore;
    }
    newGame();
}

function getColors() {
    const index = Math.trunc(Date.now() / colorChangeInterval) % 2;
    return {
        [index]: `rgb(${redValue}, 0, 0)`,
        [(index + 1) % 2]: `rgb(0, ${cyanValue}, ${cyanValue})`
    };
}

function moveSnake() {
    direction = nextDirection;

    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    snake.unshift(head);
    
    if (head.x === food.x && head.y === food.y) {
        scoreElement.textContent = ++score;
        food = createRandomFood();
        gameSpeed = Math.max(50, 200 - score * 2);
    } else {
        snake.pop();
    }
}

function newGame() {
    snake = [{ x: gridCount / 2 | 0, y: gridCount / 2 | 0 }];
    food = createRandomFood();

    direction = { x: 0, y: 0 };
    gameSpeed = 200;
    nextDirection = direction;
    score = 0;
    snakeIdleTime = 0;

    scoreElement.textContent = score;
} 

/*
 * Events
 */

document.addEventListener('keydown', event => {
    const { key } = event;

    const goingUp = direction.y === -1;
    const goingDown = direction.y === 1;
    const goingRight = direction.x === 1;
    const goingLeft = direction.x === -1;

    if (key === 'ArrowUp' && !goingDown) {
        nextDirection = { x: 0, y: -1 };
    } else if (key === 'ArrowDown' && !goingUp) {
        nextDirection = { x: 0, y: 1 };
    } else if (key === 'ArrowLeft' && !goingRight) {
        nextDirection = { x: -1, y: 0 };
    } else if (key === 'ArrowRight' && !goingLeft) {
        nextDirection = { x: 1, y: 0 };
    }
});

redElement.addEventListener('input', (event) => {
    redValue = event.target.value;
    localStorage.setItem('redValue', redValue);
    event.target.blur();
});

cyanElement.addEventListener('input', (event) => {
    cyanValue = event.target.value;
    localStorage.setItem('cyanValue', cyanValue)
    event.target.blur();
});
