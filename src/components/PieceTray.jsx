import React from 'react';
import Piece from './Piece.jsx';

// Shows the 3 pieces available to place. The tray is the full stage width;
// the pieces sit inset 20px from the stage edges via the .tray padding, and
// distribute with space-between.
export default function PieceTray({ tray, cellSize, draggingId, onPickPiece }) {
  const trayCell = cellSize * 0.66;

  return (
    <div className="tray">
      {tray.map((piece, idx) => (
        <div key={idx} className="tray__slot">
          {piece && (
            <Piece
              piece={piece}
              cellSize={trayCell}
              scale={1}
              dragging={draggingId === piece.id}
              faded={draggingId === piece.id}
              onPointerDown={onPickPiece}
            />
          )}
        </div>
      ))}
    </div>
  );
}
