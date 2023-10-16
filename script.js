const boardSize = 10; // Adjust this value to change the size of the grid
const minesCount = 20; // Adjust this value to change the number of mines
let firstClick = false;

let grid = [];
let flagMode = false;
let endOfGame = false;

function initializeGrid() {
  for (let i = 0; i < boardSize; i++) {
    grid[i] = [];
    for (let j = 0; j < boardSize; j++) {
      grid[i][j] = { isMine: false, revealed: false, value: 0, flagged: false };
    }
  }
}

initializeGrid();

function placeMines() {
  let placedMines = 0;
  while (placedMines < minesCount) {
    const row = Math.floor(Math.random() * boardSize);
    const col = Math.floor(Math.random() * boardSize);
    if (!grid[row][col].isMine) {
      grid[row][col].isMine = true;
      updateAdjacentValues(row, col);
      placedMines++;
    }
  }
}

function updateAdjacentValues(row, col) {
  const directions = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];

  directions.forEach((dir) => {
    const newRow = row + dir[0];
    const newCol = col + dir[1];

    if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize) {
      grid[newRow][newCol].value++;
    }
  });
}

placeMines();

function handleCellClick(event) {
  const row = parseInt(event.target.dataset.row);
  const col = parseInt(event.target.dataset.col);

  if (flagMode) {
    flagMine(row, col);
  } else {
    // Ensure the first clicked cell is not a mine
    if (grid[row][col].isMine && !firstClick) {
      initializeGrid(); // Reset the grid and re-place mines
      placeMines();
      renderGrid();
      handleCellClick(event); // Simulate the click again
      firstClick = true;
      return;
    }

    firstClick = true;

    revealSquare(row, col);
  }
}

function renderGrid() {
  const boardElement = document.getElementById("minesweeper-board");
  boardElement.innerHTML = "";

  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.row = i;
      cell.dataset.col = j;
      boardElement.appendChild(cell);
      cell.addEventListener("click", handleCellClick);
    }
  }
}

function revealSquare(row, col) {
  const cell = grid[row][col];

  if (cell.revealed || cell.flagged) {
    return;
  }

  cell.revealed = true;
  const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  cellElement.classList.add("revealed");

  if (cell.value === 0) {
    const directions = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];
    directions.forEach((dir) => {
      const newRow = row + dir[0];
      const newCol = col + dir[1];

      if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize) {
        revealSquare(newRow, newCol);
      }
    });
  } else if (cell.isMine) {
    cellElement.classList.add("mine");
    endGame(false);
  } else if (cell.value > 0) {
    cellElement.classList.add("revealed");
    cellElement.textContent = cell.value;
  }
}

function flagMine(row, col) {
  const cell = grid[row][col];

  if (cell.revealed) {
    return;
  }

  cell.flagged = !cell.flagged;
  const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  cellElement.classList.toggle("flagged");
}

function toggleMode() {
  flagMode = !flagMode;
  const modeButton = document.getElementById("mode-button");
  modeButton.innerHTML = flagMode ? "🚩" : "💣"; // Unicode characters for flag and bomb
}

function endGame(win) {
  if (win) {
    alert("Congratulations! You won!");
  } else {
    alert("Oops! You hit a mine. Game over!");
  }
  endOfGame = true;
}

function resetGame() {
  grid = [];
  endOfGame = false;
  initializeGrid();
  placeMines();
  renderGrid();
}

renderGrid();

// ---------------AI Part ------------

function startRandomAI() {
  while (endOfGame == false) {
    const row = Math.floor(Math.random() * boardSize);
    const col = Math.floor(Math.random() * boardSize);
    revealSquare(row, col);
  }
}
