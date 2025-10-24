const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const resetBtn = document.getElementById("resetBtn");
const themeToggle = document.getElementById("themeToggle");
const celebrationEl = document.getElementById("celebration");

const xScoreEl = document.getElementById("xScore");
const oScoreEl = document.getElementById("oScore");
const drawsEl = document.getElementById("draws");

let board = Array(9).fill(null);
let currentPlayer = "X";
let gameOver = false;
let scores = { X: 0, O: 0, D: 0 };

// Create board UI
function createBoard() {
  boardEl.innerHTML = "";
  board.forEach((_, i) => {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;
    cell.addEventListener("click", handleClick);
    boardEl.appendChild(cell);
  });
}

function handleClick(e) {
  const index = e.target.dataset.index;
  if (board[index] || gameOver) return;

  board[index] = currentPlayer;
  e.target.textContent = currentPlayer;
  e.target.classList.add("taken");

  const winner = checkWinner(board);
  if (winner) return endGame(`${winner} wins!`, winner);
  if (board.every((cell) => cell)) return endGame("It's a draw!", "D");

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  statusEl.textContent = `Player ${currentPlayer}'s turn`;

  if (currentPlayer === "O") setTimeout(aiMove, 400);
}

// AI (Minimax)
function aiMove() {
  const best = minimax(board, "O");
  board[best.index] = "O";
  const cell = boardEl.children[best.index];
  cell.textContent = "O";
  cell.classList.add("taken");

  const winner = checkWinner(board);
  if (winner) return endGame(`${winner} wins!`, winner);
  if (board.every((cell) => cell)) return endGame("It's a draw!", "D");

  currentPlayer = "X";
  statusEl.textContent = "Player X's turn";
}

function minimax(newBoard, player) {
  const availSpots = newBoard
    .map((val, i) => (val ? null : i))
    .filter((v) => v !== null);

  const winner = checkWinner(newBoard);
  if (winner === "X") return { score: -10 };
  if (winner === "O") return { score: 10 };
  if (availSpots.length === 0) return { score: 0 };

  const moves = [];
  for (let i = 0; i < availSpots.length; i++) {
    const move = {};
    move.index = availSpots[i];
    newBoard[availSpots[i]] = player;

    const result =
      player === "O" ? minimax(newBoard, "X") : minimax(newBoard, "O");
    move.score = result.score;
    newBoard[availSpots[i]] = null;
    moves.push(move);
  }

  let bestMove;
  if (player === "O") {
    let bestScore = -Infinity;
    moves.forEach((m, i) => {
      if (m.score > bestScore) {
        bestScore = m.score;
        bestMove = i;
      }
    });
  } else {
    let bestScore = Infinity;
    moves.forEach((m, i) => {
      if (m.score < bestScore) {
        bestScore = m.score;
        bestMove = i;
      }
    });
  }
  return moves[bestMove];
}

function checkWinner(b) {
  const wins = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (const [a, b1, c] of wins) {
    if (b[a] && b[a] === b[b1] && b[a] === b[c]) return b[a];
  }
  return null;
}

// ✅ Updated endGame with "Tie" message
function endGame(message, result) {
  statusEl.textContent = message;
  gameOver = true;

  if (result === "X") scores.X++;
  else if (result === "O") scores.O++;
  else scores.D++;

  updateScoreboard();

  if (result === "D") {
    triggerDrawMessage(); // new tie function
  } else {
    triggerCelebration();
  }
}

function updateScoreboard() {
  xScoreEl.textContent = scores.X;
  oScoreEl.textContent = scores.O;
  drawsEl.textContent = scores.D;
}

// ✅ "Congrats" Celebration
function triggerCelebration() {
  celebrationEl.style.display = "flex";
  celebrationEl.innerHTML = `<h1 class="celebration-text">🎆🎉 Congrats! You Won 🎉🎆</h1>`;
  launchConfetti();

  setTimeout(() => {
    celebrationEl.style.display = "none";
  }, 3000);
}

// ✅ "Tie" Celebration
function triggerDrawMessage() {
  celebrationEl.style.display = "flex";
  celebrationEl.innerHTML = `<h1 class="draw-text">😅 Ohh!! It’s a Tie 🤝</h1>`;

  setTimeout(() => {
    celebrationEl.style.display = "none";
    celebrationEl.innerHTML = `<h1 class="celebration-text">🎆🎉 Congrats! You Won 🎉🎆</h1>`; // reset default
  }, 2500);
}

function launchConfetti() {
  const duration = 2.5 * 1000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 6,
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      origin: { x: Math.random(), y: Math.random() - 0.2 },
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

resetBtn.addEventListener("click", () => {
  board = Array(9).fill(null);
  gameOver = false;
  currentPlayer = "X";
  statusEl.textContent = "Click a cell to start";
  createBoard();
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light");
  themeToggle.textContent = document.body.classList.contains("light")
    ? "🌞"
    : "🌙";
});

createBoard();
