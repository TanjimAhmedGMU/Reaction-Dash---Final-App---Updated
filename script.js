const TOTAL_ROUNDS = 8;
const EARLY_PENALTY = 40;

let state = {
  round: 0,
  waiting: false,
  roundStartedAt: 0,
  allTimes: [],
  earlyCount: 0,
  score: 0,
  active: false,
  timer: null,
  readyToClick: false
};

const startButton = document.getElementById('start-btn');
const startPageButtons = document.getElementsByClassName('start-page');
const restartButton = document.getElementById('restart-btn');
const playAgainButton = document.getElementById('play-again-btn');
const introDiv = document.getElementById('intro-section');
const gameDiv = document.getElementById('game-section');
const resultDiv = document.getElementById('result-section');
const statusBox = document.getElementById('game-status');
const statsBox = document.getElementById('stats-output');
const roundNumber = document.getElementById('round-number');

function show(x) { x.classList.remove('hidden'); }
function hide(x) { x.classList.add('hidden'); }

function logCurrent() {
  console.log('Round:', state.round, 'Score:', state.score, 'Times:', state.allTimes);
}

function resetGame() {
  state.round = 1;
  state.waiting = false;
  state.roundStartedAt = 1;
  state.allTimes = [];
  state.earlyCount = 0;
  state.score = 0;
  state.active = false;
  state.readyToClick = false;
  if (state.timer) clearTimeout(state.timer);
}

function startGame() {
  resetGame();
  hide(introDiv);
  hide(resultDiv);
  show(gameDiv);
  state.active = true;
  nextRound();
}

function startPage() {
  hide(gameDiv);
  hide(resultDiv);
  show(introDiv);
  state.active = false;
}

function restartGame() {
  if (state.timer) clearTimeout(state.timer);
  startGame();
}

function finishGame() {
  hide(gameDiv);
  show(resultDiv);

  if (state.allTimes.length === 0) {
    statsBox.innerHTML = "<i>No valid reactions recorded.</i>";
    return;
  }

  let fastest = Math.min(...state.allTimes);
  let slowest = Math.max(...state.allTimes);
  let avg = state.allTimes.reduce((a, b) => a + b, 0) / state.allTimes.length;

  statsBox.innerHTML = `
    <strong>Fastest:</strong> ${fastest.toFixed(0)} ms<br>
    <strong>Slowest:</strong> ${slowest.toFixed(0)} ms<br>
    <strong>Average:</strong> ${avg.toFixed(0)} ms<br>
    <strong>Early Clicks:</strong> ${state.earlyCount}<br>
    <strong>Total Score:</strong> ${state.score} points
  `;
}

function nextRound() {
  roundNumber.innerHTML = 'Round ' + state.round;
  if (state.round >= TOTAL_ROUNDS) {
    finishGame();
    return;
  }

  state.waiting = true;
  state.readyToClick = false;
  statusBox.className = 'waiting';
  statusBox.textContent = 'Get Ready...';

  let waitTime = 1100 + Math.random() * 1200;

  state.timer = setTimeout(() => {
    state.waiting = false;
    state.readyToClick = true;
    state.roundStartedAt = Date.now();
    statusBox.className = 'active';
    statusBox.textContent = 'Click now!';
  }, waitTime);
}

statusBox.addEventListener('click', function () {
  if (!state.active) return;

  if (state.waiting && !state.readyToClick) {
    if (state.timer) clearTimeout(state.timer);
    state.earlyCount++;
    state.score -= EARLY_PENALTY;
    statusBox.className = 'early';
    statusBox.textContent = 'Too soon! -' + EARLY_PENALTY + ' pts';
    state.round++;
    roundNumber.innerHTML = 'Round ' + state.round;
    setTimeout(nextRound, 950);
    logCurrent();
    return;
  }

  if (!state.waiting && state.readyToClick) {
    let reaction = Date.now() - state.roundStartedAt;
    let roundScore;
    if (reaction <= 500) {
      roundScore = 100 + (500 - reaction);
    } else {
      roundScore = 0;
    }
    roundScore = Math.round(roundScore);
    state.allTimes.push(reaction);
    state.score += roundScore;
    statusBox.className = 'ready';
    statusBox.textContent = `Time: ${reaction} ms (+${roundScore} pts)`;
    state.round++;
    roundNumber.innerHTML = 'Round ' + state.round;

    state.readyToClick = false;
    setTimeout(nextRound, 850);
    logCurrent();
    return;
  }
});

startButton.addEventListener('click', startGame);
for (let btn of startPageButtons) {
  btn.addEventListener('click', startPage);
}
restartButton.addEventListener('click', restartGame);
playAgainButton.addEventListener('click', startGame);

document.addEventListener('keydown', e => {
  if (resultDiv && !resultDiv.classList.contains('hidden')) {
    if (e.key === ' ' || e.key === 'Enter') startGame();
  }
});

hide(gameDiv);
hide(resultDiv);
