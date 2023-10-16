const boardSize = 10; // Adjust this value to change the size of the grid
const minesCount = 20; // Adjust this value to change the number of mines
let firstClick = false;

let grid = [];
let flagMode = false;
let endOfGame = false;

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
    const smallDirections = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];
    smallDirections.forEach((dir) => {
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

function startSmartAI() {
  const row = Math.floor(Math.random() * boardSize);
  const col = Math.floor(Math.random() * boardSize);
  revealSquare(row, col);

  let i = 0;
  let lastMove = { row: -1, col: -1 };
  while (endOfGame == false) {
    var move = chooseSmartMove();
    if (move && move != lastMove) {
      revealSquare(move.row, move.col);
      //Uncomment if bug free.
      //i = 0;
      lastMove = move;
    } else {
      const randomRow = Math.floor(Math.random() * boardSize);
      const randomCol = Math.floor(Math.random() * boardSize);
      console.log(
        "No smart move available, resorting to random click." + "\b" + "row: " + randomRow + "col: " + randomCol
      );
      revealSquare(randomRow, randomCol);
    }
    i++;
    //Move limit
    if (i > 500) {
      break;
    }
  }
}

function chooseSmartMove() {
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      const cell = grid[i][j];

      if (cell.revealed && cell.value > 0) {
        const flaggedCount = countFlaggedAdjacentCells(i, j);
        const unrevealedCount = countUnrevealedAdjacentCells(i, j);

        if (flaggedCount === cell.value && unrevealedCount > 0) {
          return findUnrevealedAdjacentCell(i, j);
        } else if (flaggedCount + unrevealedCount === cell.value) {
          return flagUnrevealedAdjacentCells(i, j);
        }
        //console.log("cell: " + i + ":" + j);
      }
    }
  }
  return null;
}

function countFlaggedAdjacentCells(row, col) {
  let count = 0;

  for (const dir of directions) {
    const newRow = row + dir[0];
    const newCol = col + dir[1];

    if (isValidCell(newRow, newCol) && grid[newRow][newCol].flagged) {
      count++;
    }
  }
  return count;
}

function countUnrevealedAdjacentCells(row, col) {
  let count = 0;

  for (const dir of directions) {
    const newRow = row + dir[0];
    const newCol = col + dir[1];

    if (isValidCell(newRow, newCol) && !grid[newRow][newCol].revealed) {
      count++;
    }
  }
  return count;
}

function findUnrevealedAdjacentCell(row, col) {
  for (const dir of directions) {
    const newRow = row + dir[0];
    const newCol = col + dir[1];

    if (isValidCell(newRow, newCol) && !grid[newRow][newCol].revealed) {
      return { row: newRow, col: newCol };
    }
  }

  return null;
}

function isValidCell(row, col) {
  return row >= 0 && row < boardSize && col >= 0 && col < boardSize;
}

function flagUnrevealedAdjacentCells(row, col) {
  for (const dir of directions) {
    const newRow = row + dir[0];
    const newCol = col + dir[1];

    if (isValidCell(newRow, newCol) && !grid[newRow][newCol].revealed && !grid[newRow][newCol].flagged) {
      flagMine(newRow, newCol);
    }
  }

  return null;
}
