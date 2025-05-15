const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreDisplay = document.getElementById('scoreDisplay');

const GRAVITY = 0.20;           // Caída más lenta
const JUMP_STRENGTH = -6;
const OBSTACLE_WIDTH = 70;
const GAP_HEIGHT = 180;
const OBSTACLE_SPEED = 2.5;

let frameCount = 0;
let score = 0;
let gameOver = false;

// Cargar imágenes
const minionImg = new Image();
minionImg.src = 'assets/minion.png';

const bananaImg = new Image();
bananaImg.src = 'assets/star.png';

const backgroundColor = '#87ceeb'; // Cielo celeste

// Minion (jugador)
let minion = {
  x: 70,
  y: canvas.height / 2,
  width: 50,
  height: 50,
  vy: 0
};

// Obstáculos: array con pares de tuberías (arriba y abajo)
let obstacles = [];

// Bananas que aparecen en los huecos
let bananas = [];

function resetGame() {
  minion.y = canvas.height / 2;
  minion.vy = 0;
  score = 0;
  obstacles = [];
  bananas = [];
  gameOver = false;
  frameCount = 0;
  scoreDisplay.textContent = 'Puntaje: 0';

  // Actualizar texto del botón al reiniciar
  jumpBtn.textContent = '🕊️ Volar';
}

function createObstacle() {
  // Altura aleatoria del hueco
  let gapY = Math.floor(Math.random() * (canvas.height - GAP_HEIGHT - 100)) + 50;

  obstacles.push({
    x: canvas.width,
    top: gapY,
    bottom: gapY + GAP_HEIGHT,
    width: OBSTACLE_WIDTH
  });

  // Banana en el centro del hueco
  bananas.push({
    x: canvas.width + OBSTACLE_WIDTH / 2 - 15,
    y: gapY + GAP_HEIGHT / 2 - 15,
    width: 30,
    height: 30,
    collected: false
  });
}

function drawBackground() {
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Texto en fondo
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.font = '40px Comic Sans MS';
  ctx.fillText('❤️ Jesica ❤️', canvas.width / 2 - 120, 60);
}

function drawMinion() {
  ctx.drawImage(minionImg, minion.x, minion.y, minion.width, minion.height);
}

function drawObstacles() {
  ctx.fillStyle = '#228B22'; // Verde para obstáculos

  obstacles.forEach(obstacle => {
    // Tubo superior
    ctx.fillRect(obstacle.x, 0, obstacle.width, obstacle.top);
    // Tubo inferior
    ctx.fillRect(obstacle.x, obstacle.bottom, obstacle.width, canvas.height - obstacle.bottom);
  });
}

function drawBananas() {
  bananas.forEach(banana => {
    if (!banana.collected) {
      ctx.drawImage(bananaImg, banana.x, banana.y, banana.width, banana.height);
    }
  });
}

function update() {
  if (gameOver) {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'red';
    ctx.font = '36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('¡Perdiste!', canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '24px Arial';
    ctx.fillText('Presiona "Volar" para reiniciar', canvas.width / 2, canvas.height / 2 + 20);

    return;
  }

  frameCount++;

  drawBackground();

  // Física del minion
  minion.vy += GRAVITY;
  minion.y += minion.vy;

  // Limitar al suelo y techo
  if (minion.y + minion.height > canvas.height) {
    minion.y = canvas.height - minion.height;
    gameOver = true;
  }
  if (minion.y < 0) {
    minion.y = 0;
    minion.vy = 0;
  }

  // Crear obstáculos cada 150 frames aprox
  if (frameCount % 150 === 0) {
    createObstacle();
  }

  // Mover obstáculos
  obstacles.forEach(obstacle => {
    obstacle.x -= OBSTACLE_SPEED;
  });

  // Mover bananas
  bananas.forEach(banana => {
    banana.x -= OBSTACLE_SPEED;
  });

  // Eliminar obstáculos y bananas que ya no están en pantalla
  while (obstacles.length && obstacles[0].x + OBSTACLE_WIDTH < 0) {
    obstacles.shift();
    bananas.shift();
  }

  // Dibuja todo
  drawObstacles();
  drawBananas();
  drawMinion();

  // Detectar colisiones con obstáculos
  for (let obstacle of obstacles) {
    if (
      (minion.x + minion.width > obstacle.x &&
      minion.x < obstacle.x + obstacle.width) &&
      (minion.y < obstacle.top || minion.y + minion.height > obstacle.bottom)
    ) {
      gameOver = true;
    }
  }

  // Detectar si recoge banana
  bananas.forEach(banana => {
    if (!banana.collected) {
      if (
        minion.x + minion.width > banana.x &&
        minion.x < banana.x + banana.width &&
        minion.y + minion.height > banana.y &&
        minion.y < banana.y + banana.height
      ) {
        banana.collected = true;
        score++;
        scoreDisplay.textContent = 'Puntaje: ' + score;
      }
    }
  });

  requestAnimationFrame(update);
}

// Control de salto
function jump() {
  if (!gameOver) {
    minion.vy = JUMP_STRENGTH;
  }
}

// Control del botón
const jumpBtn = document.getElementById('jumpBtn');

function handleButton() {
  if (gameOver) {
    resetGame();
  } else {
    jump();
  }
}

jumpBtn.addEventListener('click', (e) => {
  e.preventDefault();
  handleButton();
});

jumpBtn.addEventListener('touchstart', (e) => {
  e.preventDefault();
  handleButton();
});

// Salto con teclado (barra espaciadora o flecha arriba)
window.addEventListener('keydown', (e) => {
  if ((e.code === 'Space' || e.code === 'ArrowUp') && !gameOver) {
    jump();
  }
});

// Iniciar el juego
resetGame();
update();
