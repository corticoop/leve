import React from 'react';
import { BOARD_SIZE, canPlace, pieceCellsAt } from '../utils/board.js';

// The 6x6 board. Renders cells, the ghost preview for the dragged piece, and
// any clearing animation overlays.
export default function Board({ board, drag, clearingCells, cellSize, boardRef }) {
  const ghostCells = (() => {
    if (!drag || !drag.snap) return null;
    const { row, col } = drag.snap;
    if (!canPlace(board, drag.piece, row, col)) return { invalid: true, cells: pieceCellsAt(drag.piece, row, col) };
    return { invalid: false, cells: pieceCellsAt(drag.piece, row, col) };
  })();

  const inBounds = (r, c) => r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE;

  const isClearing = (r, c) => {
    if (!clearingCells) return false;
    return clearingCells.rows.includes(r) || clearingCells.cols.includes(c);
  };

  const px = (n) => `${n}px`;

  return (
    <div
      className="board"
      ref={boardRef}
      style={{
        width: px(cellSize * BOARD_SIZE),
        height: px(cellSize * BOARD_SIZE),
        '--cell': px(cellSize),
      }}
    >
      {/* Cells */}
      {board.map((rowArr, r) =>
        rowArr.map((cell, c) => {
          const filled = cell != null;
          const clearing = isClearing(r, c);
          let ghost = false;
          let ghostInvalid = false;
          if (ghostCells) {
            const has = ghostCells.cells.some(([rr, cc]) => rr === r && cc === c && inBounds(rr, cc));
            if (has) {
              ghost = true;
              ghostInvalid = ghostCells.invalid;
            }
          }
          const cls = [
            'cell',
            filled && 'cell--filled',
            ghost && (ghostInvalid ? 'cell--ghost-invalid' : 'cell--ghost'),
            clearing && 'cell--clearing',
          ].filter(Boolean).join(' ');
          return (
            <div
              key={`${r}-${c}`}
              className={cls}
              style={{
                left: px(c * cellSize),
                top: px(r * cellSize),
                width: px(cellSize),
                height: px(cellSize),
              }}
            >
              {filled && <span className="cell__inner" />}
            </div>
          );
        })
      )}
    </div>
  );
}
