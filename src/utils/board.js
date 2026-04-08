// Board logic — pure functions for a 6x6 grid.

export const BOARD_SIZE = 6;

export function emptyBoard() {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => null)
  );
}

// Return absolute cells a piece would occupy if anchored at (row, col).
export function pieceCellsAt(piece, row, col) {
  return piece.cells.map(([dr, dc]) => [row + dr, col + dc]);
}

export function canPlace(board, piece, row, col) {
  for (const [r, c] of pieceCellsAt(piece, row, col)) {
    if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) return false;
    if (board[r][c] != null) return false;
  }
  return true;
}

export function placePiece(board, piece, row, col, fillToken = true) {
  const next = board.map((rowArr) => rowArr.slice());
  for (const [r, c] of pieceCellsAt(piece, row, col)) {
    next[r][c] = fillToken;
  }
  return next;
}

// Find which rows + cols are fully filled. Returns { rows: [], cols: [] }.
export function findClears(board) {
  const rows = [];
  const cols = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    if (board[r].every((cell) => cell != null)) rows.push(r);
  }
  for (let c = 0; c < BOARD_SIZE; c++) {
    let full = true;
    for (let r = 0; r < BOARD_SIZE; r++) {
      if (board[r][c] == null) { full = false; break; }
    }
    if (full) cols.push(c);
  }
  return { rows, cols };
}

export function clearLines(board, { rows, cols }) {
  const next = board.map((rowArr) => rowArr.slice());
  for (const r of rows) {
    for (let c = 0; c < BOARD_SIZE; c++) next[r][c] = null;
  }
  for (const c of cols) {
    for (let r = 0; r < BOARD_SIZE; r++) next[r][c] = null;
  }
  return next;
}

// Can ANY of the pieces be placed somewhere on the board?
export function anyPieceFits(board, pieces) {
  for (const piece of pieces) {
    if (!piece) continue;
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (canPlace(board, piece, r, c)) return true;
      }
    }
  }
  return false;
}
