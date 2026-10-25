
// GET HTML ELEMENTS

const cells = document.querySelectorAll(".cell");

const gameStatus = document.getElementById("gameStatus");
const gameMessage = document.getElementById("gameMessage");

const twoPlayerBtn = document.getElementById("twoPlayerBtn");
const computerBtn = document.getElementById("computerBtn");

const difficultySection = document.getElementById("difficultySection");
const difficultyButtons = document.querySelectorAll(".difficulty-btn");

const restartBtn = document.getElementById("restartBtn");
const resetScoreBtn = document.getElementById("resetScoreBtn");

const scoreXElement = document.getElementById("scoreX");
const scoreOElement = document.getElementById("scoreO");
const scoreDrawElement = document.getElementById("scoreDraw");

const playerXName = document.getElementById("playerXName");
const playerOName = document.getElementById("playerOName");

const soundBtn = document.getElementById("soundBtn");
const confettiContainer = document.getElementById("confettiContainer");

const turnSymbol = document.getElementById("turnSymbol");
const turnName = document.getElementById("turnName");
const turnDescription = document.getElementById("turnDescription");

const resultInfo = document.getElementById("resultInfo");
const resultDescription = document.getElementById("resultDescription");

const modeInfo = document.getElementById("modeInfo");
const difficultyInfo = document.getElementById("difficultyInfo");
const movesInfo = document.getElementById("movesInfo");
const roundLabel = document.getElementById("roundLabel");


// GAME VARIABLES

let board = ["", "", "", "", "", "", "", "", ""];

let currentPlayer = "X";

let gameOver = false;

let isComputer = false;

let isThinking = false;

let soundEnabled = true;

let audioContext = null;

let difficulty = "easy";

let roundNumber = 1;

let lastResult = "No result yet";

let scores = {
    X: 0,
    O: 0,
    draw: 0
};


// WINNING COMBINATIONS

const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],

    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],

    [0, 4, 8],
    [2, 4, 6]
];


// SOUND SYSTEM

function playTone(frequency, duration, type = "sine", volume = 0.12) {

    if (!soundEnabled) return;

    try {

        if (!audioContext) {

            audioContext = new (
                window.AudioContext ||
                window.webkitAudioContext
            )();

        }

        if (audioContext.state === "suspended") {
            audioContext.resume();
        }

        const oscillator = audioContext.createOscillator();

        const gain = audioContext.createGain();

        oscillator.type = type;

        oscillator.frequency.setValueAtTime(
            frequency,
            audioContext.currentTime
        );

        gain.gain.setValueAtTime(
            volume,
            audioContext.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            audioContext.currentTime + duration
        );

        oscillator.connect(gain);

        gain.connect(audioContext.destination);

        oscillator.start();

        oscillator.stop(
            audioContext.currentTime + duration
        );

    } catch (error) {

        console.log("Audio could not be played:", error);

    }

}


// PLAY GAME SOUNDS

function playSound(type) {

    if (!soundEnabled) return;

    if (type === "move") {

        playTone(500, 0.12, "sine");

    }

    else if (type === "win") {

        playTone(523, 0.25);

        setTimeout(() => playTone(659, 0.25), 150);

        setTimeout(() => playTone(784, 0.35), 300);

        setTimeout(() => playTone(1046, 0.5), 500);

    }

    else if (type === "draw") {

        playTone(400, 0.3);

        setTimeout(() => playTone(300, 0.4), 250);

    }

}


// CONFETTI CELEBRATION

function celebrateWin() {

    confettiContainer.innerHTML = "";

    const colors = [
        "#9b7cff",
        "#50c8ff",
        "#ffcf70",
        "#ff7070",
        "#55e6a5"
    ];

    for (let i = 0; i < 100; i++) {

        const piece = document.createElement("div");

        piece.classList.add("confetti");

        piece.style.left = Math.random() * 100 + "%";

        piece.style.backgroundColor =
            colors[Math.floor(Math.random() * colors.length)];

        piece.style.animationDelay =
            Math.random() * 1.5 + "s";

        piece.style.animationDuration =
            (2 + Math.random() * 2) + "s";

        confettiContainer.appendChild(piece);

    }

    setTimeout(() => {

        confettiContainer.innerHTML = "";

    }, 5000);

}


// CHECK WINNER

function checkWinner(currentBoard) {

    for (let combination of winningCombinations) {

        const [a, b, c] = combination;

        if (
            currentBoard[a] !== "" &&
            currentBoard[a] === currentBoard[b] &&
            currentBoard[b] === currentBoard[c]
        ) {

            return combination;

        }

    }

    return null;

}


// CHECK DRAW

function checkDraw(currentBoard) {

    return currentBoard.every(cell => cell !== "");

}


// UPDATE GAME INFORMATION

function updateInformation() {

    const moveCount = board.filter(cell => cell !== "").length;

    movesInfo.textContent = `${moveCount} / 9`;

    modeInfo.textContent =
        isComputer ? "Vs Computer" : "Two Players";

    difficultyInfo.textContent =
        isComputer
            ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
            : "Not applicable";

    roundLabel.textContent =
        `ROUND ${String(roundNumber).padStart(2, "0")}`;


    if (gameOver) {

        turnSymbol.textContent = "✓";

        turnSymbol.classList.remove("o-turn");

        turnName.textContent = "Match Finished";

        turnDescription.textContent = "Start another round to play again.";

        return;

    }


    turnSymbol.textContent = currentPlayer;

    turnSymbol.classList.toggle(
        "o-turn",
        currentPlayer === "O"
    );


    if (isComputer && currentPlayer === "O") {

        turnName.textContent = "Computer";

        turnDescription.textContent = "Computer is thinking...";

    }

    else if (isComputer) {

        turnName.textContent = "Your Turn";

        turnDescription.textContent = "Play as X against the computer.";

    }

    else {

        turnName.textContent = `Player ${currentPlayer}`;

        turnDescription.textContent =
            `Waiting for Player ${currentPlayer}'s move.`;

    }

}


// UPDATE STATUS

function updateStatus() {

    if (isComputer) {

        gameStatus.textContent =
            currentPlayer === "X"
                ? "Your Turn (X)"
                : "Computer's Turn";

    }

    else {

        gameStatus.textContent =
            `Player ${currentPlayer}'s Turn`;

    }

    updateInformation();

}


// UPDATE SCOREBOARD

function updateScores() {

    scoreXElement.textContent = scores.X;

    scoreOElement.textContent = scores.O;

    scoreDrawElement.textContent = scores.draw;

}


// MAKE A MOVE

function makeMove(index) {

    if (
        board[index] !== "" ||
        gameOver ||
        isThinking
    ) {

        return;

    }

    board[index] = currentPlayer;

    cells[index].textContent = currentPlayer;

    cells[index].classList.add(
        currentPlayer.toLowerCase()
    );

    cells[index].disabled = true;

    playSound("move");

    updateInformation();


    // CHECK WINNER

    const winningLine = checkWinner(board);

    if (winningLine) {

        endGame(currentPlayer, winningLine);

        return;

    }


    // CHECK DRAW

    if (checkDraw(board)) {

        endGame("draw");

        return;

    }


    // COMPUTER TURN

    if (isComputer && currentPlayer === "X") {

        currentPlayer = "O";

        isThinking = true;

        gameStatus.textContent = "Computer is thinking...";

        gameMessage.textContent =
            "The computer is planning its move.";

        updateInformation();

        setTimeout(() => {

            computerMove();

        }, 500);

        return;

    }


    // SWITCH PLAYER

    currentPlayer = currentPlayer === "X" ? "O" : "X";

    updateStatus();

    gameMessage.textContent = "Make your move!";

}


// END GAME

function endGame(result, winningLine = []) {

    gameOver = true;

    isThinking = false;


    if (result === "draw") {

        scores.draw++;

        lastResult = "It's a Draw!";

        gameStatus.textContent = "It's a Draw!";

        gameMessage.textContent =
            "Nobody won. Good game!";

        resultInfo.textContent = "It's a Draw!";

        resultDescription.textContent =
            "Both players played well. Nobody won this round.";

        playSound("draw");

    }

    else {

        scores[result]++;

        winningLine.forEach(index => {

            cells[index].classList.add("winner");

        });

        playSound("win");

        celebrateWin();


        if (isComputer) {

            lastResult =
                result === "X" ? "You Won!" : "Computer Won!";

            gameStatus.textContent = lastResult;

            gameMessage.textContent =
                result === "X"
                    ? "Congratulations! You defeated the computer!"
                    : "The computer wins! Try again!";

            resultInfo.textContent = lastResult;

            resultDescription.textContent =
                result === "X"
                    ? "You successfully defeated the AI."
                    : "The computer won this round.";

        }

        else {

            lastResult = `Player ${result} Wins!`;

            gameStatus.textContent = lastResult;

            gameMessage.textContent =
                `Congratulations! Player ${result} is the winner!`;

            resultInfo.textContent = lastResult;

            resultDescription.textContent =
                `Player ${result} won this round. Well played!`;

        }

    }

    updateScores();

    updateInformation();

}


// MINIMAX ALGORITHM

function minimax(currentBoard, depth, isMaximizing) {

    const winningLine = checkWinner(currentBoard);

    if (winningLine) {

        const winner = currentBoard[winningLine[0]];

        if (winner === "O") {
            return 10 - depth;
        }

        if (winner === "X") {
            return depth - 10;
        }

    }

    if (checkDraw(currentBoard)) {
        return 0;
    }


    // COMPUTER'S TURN

    if (isMaximizing) {

        let bestScore = -Infinity;

        for (let i = 0; i < 9; i++) {

            if (currentBoard[i] === "") {

                currentBoard[i] = "O";

                const score = minimax(
                    currentBoard,
                    depth + 1,
                    false
                );

                currentBoard[i] = "";

                bestScore = Math.max(bestScore, score);

            }

        }

        return bestScore;

    }


    // HUMAN'S TURN

    else {

        let bestScore = Infinity;

        for (let i = 0; i < 9; i++) {

            if (currentBoard[i] === "") {

                currentBoard[i] = "X";

                const score = minimax(
                    currentBoard,
                    depth + 1,
                    true
                );

                currentBoard[i] = "";

                bestScore = Math.min(bestScore, score);

            }

        }

        return bestScore;

    }

}


// RANDOM COMPUTER MOVE

function getRandomMove() {

    const availableMoves = [];

    for (let i = 0; i < 9; i++) {

        if (board[i] === "") {

            availableMoves.push(i);

        }

    }

    if (availableMoves.length === 0) {
        return -1;
    }

    return availableMoves[
        Math.floor(Math.random() * availableMoves.length)
    ];

}


// BEST COMPUTER MOVE

function getBestMove() {

    let bestScore = -Infinity;

    let bestMoves = [];

    for (let i = 0; i < 9; i++) {

        if (board[i] === "") {

            board[i] = "O";

            const score = minimax(board, 0, false);

            board[i] = "";

            if (score > bestScore) {

                bestScore = score;

                bestMoves = [i];

            }

            else if (score === bestScore) {

                bestMoves.push(i);

            }

        }

    }

    if (bestMoves.length === 0) {
        return -1;
    }

    return bestMoves[
        Math.floor(Math.random() * bestMoves.length)
    ];

}


// MEDIUM DIFFICULTY

function getMediumMove() {

    if (Math.random() < 0.5) {

        return getBestMove();

    }

    return getRandomMove();

}


// COMPUTER MOVE

function computerMove() {

    if (gameOver) return;

    let bestMove;

    if (difficulty === "easy") {

        bestMove = getRandomMove();

    }

    else if (difficulty === "medium") {

        bestMove = getMediumMove();

    }

    else {

        bestMove = getBestMove();

    }

    isThinking = false;

    if (bestMove !== -1) {

        makeMove(bestMove);

    }

}


// RESTART GAME

function restartGame() {

    board = ["", "", "", "", "", "", "", "", ""];

    currentPlayer = "X";

    gameOver = false;

    isThinking = false;

    confettiContainer.innerHTML = "";

    cells.forEach(cell => {

        cell.textContent = "";

        cell.disabled = false;

        cell.classList.remove(
            "x",
            "o",
            "winner"
        );

    });

    roundNumber++;

    updateStatus();

    gameMessage.textContent = "Make your move and win the battle!";

}


// CHANGE GAME MODE

function changeMode(computerMode) {

    isComputer = computerMode;

    twoPlayerBtn.classList.toggle(
        "active",
        !isComputer
    );

    computerBtn.classList.toggle(
        "active",
        isComputer
    );

    difficultySection.classList.toggle(
        "visible",
        isComputer
    );

    playerXName.textContent =
        isComputer ? "YOU (X)" : "PLAYER X";

    playerOName.textContent =
        isComputer ? "COMPUTER (O)" : "PLAYER O";

    modeInfo.textContent =
        isComputer ? "Vs Computer" : "Two Players";


    // RESET SCORES WHEN MODE CHANGES

    scores = {
        X: 0,
        O: 0,
        draw: 0
    };

    lastResult = "No result yet";

    resultInfo.textContent = lastResult;

    resultDescription.textContent =
        "Complete a match to see its result here.";

    roundNumber = 0;

    updateScores();

    restartGame();

}


// CHANGE DIFFICULTY

difficultyButtons.forEach(button => {

    button.addEventListener("click", () => {

        difficulty = button.dataset.level;

        difficultyButtons.forEach(btn => {

            btn.classList.remove("active");

        });

        button.classList.add("active");

        restartGame();

        gameMessage.textContent =
            `Difficulty changed to ${difficulty.toUpperCase()}!`;

        updateInformation();

    });

});


// CELL CLICK EVENTS

cells.forEach(cell => {

    cell.addEventListener("click", () => {

        const index = Number(cell.dataset.index);

        makeMove(index);

    });

});


// TWO PLAYER MODE

twoPlayerBtn.addEventListener("click", () => {

    if (!isComputer) return;

    changeMode(false);

});


// COMPUTER MODE

computerBtn.addEventListener("click", () => {

    if (isComputer) return;

    changeMode(true);

});


// RESTART BUTTON

restartBtn.addEventListener("click", () => {

    restartGame();

});


// RESET SCORES BUTTON

resetScoreBtn.addEventListener("click", () => {

    scores = {
        X: 0,
        O: 0,
        draw: 0
    };

    lastResult = "No result yet";

    resultInfo.textContent = lastResult;

    resultDescription.textContent =
        "Complete a match to see its result here.";

    roundNumber = 0;

    updateScores();

    restartGame();

});


// SOUND BUTTON

soundBtn.addEventListener("click", () => {

    soundEnabled = !soundEnabled;

    soundBtn.textContent = soundEnabled
        ? "🔊 Sound On"
        : "🔇 Sound Off";

});


// INITIALIZE GAME

roundNumber = 0;

updateScores();

updateStatus();

resultInfo.textContent = lastResult;

updateInformation();
