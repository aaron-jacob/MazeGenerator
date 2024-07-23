let rows, cols;
let maze;
let lastVisitedRow, lastVisitedCol;

function initializeMaze() {
  maze = new Array(rows).fill(null).map(() => new Array(cols).fill(1)); // Initialize maze with all walls
}

async function generateMaze() {
  const rowSizeInput = document.getElementById('row-size');
  const colSizeInput = document.getElementById('col-size');

  rows = parseInt(rowSizeInput.value);
  cols = parseInt(colSizeInput.value);

  initializeMaze();
  await generateMazeRecursive(0, 0); // Start from the top-left corner
  displayMaze();
}

async function generateMazeRecursive(row, col) {
  maze[row][col] = 0; // Mark current cell as passage

  // Keep track of the last visited cell
  lastVisitedRow = row;
  lastVisitedCol = col;

  const directions = shuffle([[0, -1], [0, 1], [-1, 0], [1, 0]]); // Shuffle directions (up, down, left, right)

  for (const dir of directions) {
    const [dRow, dCol] = dir;
    const newRow = row + dRow * 2;
    const newCol = col + dCol * 2;

    if (isValidCell(newRow, newCol)) {
      if (maze[newRow][newCol] === 1) {
        maze[row + dRow][col + dCol] = 0; // Mark the cell between the current and the new cell as passage
        await generateMazeRecursive(newRow, newCol);
      }
    }
  }
}

function isValidCell(row, col) {
  return row >= 0 && row < rows && col >= 0 && col < cols;
}

function shuffle(array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

function displayMaze() {
  const container = document.getElementById('maze-container');
  container.innerHTML = '';
  container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

  // Adjust grid-template-rows based on whether rows is even or odd
  if (rows % 2 === 0) {
    container.style.gridTemplateRows = `repeat(${rows - 1}, 1fr)`;
  } else {
    container.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
  }

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      if (maze[row][col] === 1) {
        cell.classList.add('wall');
      }
      container.appendChild(cell);
    }
  }

  const solveMazeButton = document.getElementById('solve-maze-button');
  solveMazeButton.style.display = 'inline-block';
}

let visited;
let pathFound;
let path;

async function bfs(startRow, startCol) {
  const queue = [];
  visited = new Array(rows).fill(null).map(() => new Array(cols).fill(false));
  const parent = new Array(rows).fill(null).map(() => new Array(cols).fill(null));

  queue.push([startRow, startCol]);
  visited[startRow][startCol] = true;

  while (queue.length > 0) {
    const [row, col] = queue.shift();

    if (row === rows - 1 && col === cols - 1) {
      pathFound = true; // Track if a path is found
      return findPath(parent, startRow, startCol); // Found the exit, retrieve the path
    }

    for (const dir of [[-1, 0], [1, 0], [0, -1], [0, 1]]) { // Explore up, down, left, right
      const [dRow, dCol] = dir;
      const newRow = row + dRow;
      const newCol = col + dCol;

      if (isValidCell(newRow, newCol) && !visited[newRow][newCol] && maze[newRow][newCol] === 0) {
        // Check if it's a cell (not a wall) before adding to queue
        visited[newRow][newCol] = true;
        parent[newRow][newCol] = [row, col]; // Track parent for path retrieval
        queue.push([newRow, newCol]);

        // Visualize the path generation with a delay
        await new Promise(resolve => setTimeout(resolve, 50));
        markCellAsTraversed(newRow, newCol);
      }
    }
  }

  pathFound = false; // No path found yet
  return null; // No path found
}

function findPath(parent, startRow, startCol) {
  const path = [];
  let row = rows - 1;
  let col = cols - 1;

  while (!(row === startRow && col === startCol)) {
    path.unshift([row, col]);
    const [parentRow, parentCol] = parent[row][col];
    row = parentRow;
    col = parentCol;
  }

  path.unshift([startRow, startCol]); // Add the starting cell
  return path;
}

async function solveMaze() {
  path = await bfs(0, 0); // Start from the top-left corner
  if (pathFound) {
    displayPath(path);
  } else {
    alert("No path found!");
  }
}

function markCellAsTraversed(row, col) {
  const container = document.getElementById('maze-container');
  const cells = container.querySelectorAll('.cell');
  const index = row * cols + col;

  if (maze[row][col] === 0) {
    cells[index].style.backgroundColor = 'red';
  }
}

function displayPath(path) {
  if (!path) { // Check if path is null (no path found)
    return;
  }

  const container = document.getElementById('maze-container');
  const cells = container.querySelectorAll('.cell');

  for (const cell of path) {
    const [row, col] = cell;
    const index = row * cols + col;

    // Check if it's a cell (not a wall) before highlighting
    if (maze[row][col] === 0) {
      cells[index].style.backgroundColor = 'green';
    }
  }
}

const generateMazeButton = document.getElementById('generate-maze-button');
generateMazeButton.addEventListener('click', generateMaze);

const solveMazeButton = document.getElementById('solve-maze-button');
solveMazeButton.addEventListener('click', solveMaze);
