// Piece definitions. Each piece is a list of [row, col] offsets from the
// piece's top-left anchor (0,0). Pieces are NOT rotated in this game.

export const PIECE_SHAPES = {
  // 2-block pieces (easy)
  'domino-h': { cells: [[0, 0], [0, 1]], size: 2, tier: 1 },
  'domino-v': { cells: [[0, 0], [1, 0]], size: 2, tier: 1 },

  // 3-block pieces
  'line3-h': { cells: [[0, 0], [0, 1], [0, 2]], size: 3, tier: 1 },
  'line3-v': { cells: [[0, 0], [1, 0], [2, 0]], size: 3, tier: 1 },
  'corner-tl': { cells: [[0, 0], [0, 1], [1, 0]], size: 3, tier: 2 },
  'corner-tr': { cells: [[0, 0], [0, 1], [1, 1]], size: 3, tier: 2 },
  'corner-bl': { cells: [[0, 0], [1, 0], [1, 1]], size: 3, tier: 2 },
  'corner-br': { cells: [[0, 1], [1, 0], [1, 1]], size: 3, tier: 2 },

  // 4-block pieces
  'square2': { cells: [[0, 0], [0, 1], [1, 0], [1, 1]], size: 4, tier: 2 },
  'line4-h': { cells: [[0, 0], [0, 1], [0, 2], [0, 3]], size: 4, tier: 3 },
  'line4-v': { cells: [[0, 0], [1, 0], [2, 0], [3, 0]], size: 4, tier: 3 },
  't-down': { cells: [[0, 0], [0, 1], [0, 2], [1, 1]], size: 4, tier: 3 },
  't-up': { cells: [[0, 1], [1, 0], [1, 1], [1, 2]], size: 4, tier: 3 },
  't-right': { cells: [[0, 0], [1, 0], [1, 1], [2, 0]], size: 4, tier: 3 },
  't-left': { cells: [[0, 1], [1, 0], [1, 1], [2, 1]], size: 4, tier: 3 },
  'l-1': { cells: [[0, 0], [1, 0], [2, 0], [2, 1]], size: 4, tier: 3 },
  'l-2': { cells: [[0, 0], [0, 1], [0, 2], [1, 0]], size: 4, tier: 3 },
  'l-3': { cells: [[0, 0], [0, 1], [1, 1], [2, 1]], size: 4, tier: 3 },
  'l-4': { cells: [[0, 2], [1, 0], [1, 1], [1, 2]], size: 4, tier: 3 },
  's-1': { cells: [[0, 1], [0, 2], [1, 0], [1, 1]], size: 4, tier: 3 },
  's-2': { cells: [[0, 0], [1, 0], [1, 1], [2, 1]], size: 4, tier: 3 },
};

let _pid = 0;
export function newPieceId() {
  _pid += 1;
  return `p_${Date.now().toString(36)}_${_pid}`;
}

// Compute the bounding box of a piece (rows x cols)
export function pieceBounds(shape) {
  const cells = PIECE_SHAPES[shape].cells;
  let maxR = 0, maxC = 0;
  for (const [r, c] of cells) {
    if (r > maxR) maxR = r;
    if (c > maxC) maxC = c;
  }
  return { rows: maxR + 1, cols: maxC + 1 };
}

export function makePiece(shape) {
  return {
    id: newPieceId(),
    shape,
    cells: PIECE_SHAPES[shape].cells,
  };
}
