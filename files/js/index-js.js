const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("startButton");

let isGameActive = false;
let player;
let bullets = [];
let enemies = [];
let enemyDirection = 1;
let isMovingLeft = false;
let isMovingRight = false;
let canShoot = true;
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

const playerImg = new Image();
playerImg.src = 'files/images/player.jpg';
playerImg.onload = () => console.log("Player image loaded successfully.");
playerImg.onerror = () => console.error("Failed to load player image.");

const enemyImg = new Image();
enemyImg.src = 'files/images/enemy.jpg';
enemyImg.onload = () => console.log("Enemy image loaded successfully.");
enemyImg.onerror = () => console.error("Failed to load enemy image.");

const bulletImg = new Image();
bulletImg.src = 'files/images/bullet.jpg';
bulletImg.onload = () => console.log("Bullet image loaded successfully.");
bulletImg.onerror = () => console.error("Failed to load bullet image.");

function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
}

window.addEventListener("load", resizeCanvas);
window.addEventListener("resize", resizeCanvas);

startButton.addEventListener("click", () => {
    if (!isGameActive) {
        startButton.innerText = "PLAY AGAIN";
        resetGame();
        isGameActive = true;
        gameLoop();
    }
});

function createPlayer() {
    player = {
        x: canvas.width / 2 - 15,
        y: canvas.height - 30,
        width: 30,
        height: 30,
        speed: Math.max(2, canvas.width * 0.007)
    };
}

function createEnemies() {
    enemies = [];
    const enemyWidth = 30;
    const enemyHeight = 30;
    const startX = 50;
    const startY = 30;
    const gap = 40;

    const rows = isMobile ? 3 : 4;
    const cols = isMobile ? 6 : 10;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            enemies.push({
                x: startX + col * gap,
                y: startY + row * gap,
                width: enemyWidth,
                height: enemyHeight,
                speed: Math.max(1, canvas.width * 0.002)
            });
        }
    }
}

function gameLoop() {
    if (!isGameActive) return;

    update();
    draw();

    if (isGameActive) {
        requestAnimationFrame(gameLoop);
    }
}

function update() {
    if (isMovingLeft && player.x > 0) {
        player.x -= player.speed;
    }
    if (isMovingRight && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }

    bullets.forEach((bullet, index) => {
        bullet.y -= bullet.speed;
        if (bullet.y < 0) {
            bullets.splice(index, 1);
        }
    });

    let hitWall = false;
    enemies.forEach(enemy => {
        enemy.x += enemyDirection * enemy.speed;

        if (enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) {
            hitWall = true;
        }
    });

    if (hitWall) {
        enemyDirection *= -1;
        enemies.forEach(enemy => enemy.y += 20);
    }

    checkCollisions();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);

    bullets.forEach(bullet => {
        ctx.drawImage(bulletImg, bullet.x, bullet.y, bullet.width, bullet.height);
    });

    enemies.forEach(enemy => {
        ctx.drawImage(enemyImg, enemy.x, enemy.y, enemy.width, enemy.height);
    });
}

function createBullet() {
    if (canShoot) {
        bullets.push({
            x: player.x + player.width / 2 - 2,
            y: player.y,
            width: 4,
            height: 10,
            speed: Math.max(4, canvas.height * 0.01)
        });
        canShoot = false;
        setTimeout(() => {
            canShoot = true;
        }, 500);
    }
}

function checkCollisions() {
    bullets.forEach((bullet, bIndex) => {
        enemies.forEach((enemy, eIndex) => {
            if (
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y
            ) {
                enemies.splice(eIndex, 1);
                bullets.splice(bIndex, 1);

                if (enemies.length === 0) {
                    alert("Вы победили!");
                    isGameActive = false;
                }
            }
        });
    });

    enemies.forEach(enemy => {
        if (
            player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y
        ) {
            alert("Игра окончена!");
            isGameActive = false;
        }
    });
}

function resetGame() {
    resizeCanvas();
    createPlayer();
    createEnemies();
    bullets = [];
}

document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
        isMovingLeft = true;
    }
    if (e.key === "ArrowRight") {
        isMovingRight = true;
    }
    if (e.key === " " && !isMobile) {
        createBullet();
    }
});

document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft") {
        isMovingLeft = false;
    }
    if (e.key === "ArrowRight") {
        isMovingRight = false;
    }
});

if (isMobile) {
    window.addEventListener("devicemotion", (event) => {
        if (!isGameActive) return;

        const { x } = event.accelerationIncludingGravity;

        if (x > 1) {
            player.x -= player.speed;
        } else if (x < -1) {
            player.x += player.speed;
        }

        player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
    });

    canvas.addEventListener("click", () => {
        if (isGameActive) {
            createBullet();
        }
    });
}

resetGame();
