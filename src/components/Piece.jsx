import React from 'react';
import { pieceBounds } from '../utils/pieces.js';

// A piece — used both in the tray (small) and as the floating drag preview (full size).
export default function Piece({ piece, cellSize, dragging, onPointerDown, scale = 1, faded = false }) {
  if (!piece) return null;
  const { rows, cols } = pieceBounds(piece.shape);
  const visualCell = cellSize * scale;
  const w = cols * visualCell;
  const h = rows * visualCell;

  return (
    <div
      className={`piece ${dragging ? 'piece--dragging' : ''} ${faded ? 'piece--faded' : ''}`}
      style={{
        width: `${w}px`,
        height: `${h}px`,
        touchAction: 'none',
      }}
      onPointerDown={(e) => {
        if (!onPointerDown) return;
        e.preventDefault();
        e.currentTarget.setPointerCapture?.(e.pointerId);
        onPointerDown(piece, e);
      }}
    >
      {piece.cells.map(([r, c], i) => (
        <span
          key={i}
          className="piece__cell"
          style={{
            left: `${c * visualCell}px`,
            top: `${r * visualCell}px`,
            width: `${visualCell}px`,
            height: `${visualCell}px`,
          }}
        >
          <span className="piece__cell-inner" />
        </span>
      ))}
    </div>
  );
}
