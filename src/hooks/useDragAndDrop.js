// Pointer-based drag-and-drop. Mobile-first.
// Tracks the dragged piece, the pointer position, and the snapped grid cell.

import { useState, useCallback, useEffect, useRef } from 'react';
import { pieceBounds } from '../utils/pieces.js';

// How far above the pointer the piece floats. Keeps the piece visible above
// the finger on touch devices.
export const POINTER_OFFSET = 0.8; // in cell units

export function useDragAndDrop({ boardRef, cellSize, onDrop, onPick }) {
  const [drag, setDrag] = useState(null);
  // drag = { piece, pointer: {x,y}, snap: {row,col}|null }
  const dragRef = useRef(null);
  dragRef.current = drag;

  const computeSnap = useCallback((piece, x, y) => {
    if (!boardRef.current) return null;
    const rect = boardRef.current.getBoundingClientRect();
    const { rows, cols } = pieceBounds(piece.shape);
    // The piece's bbox is centered horizontally on the pointer and offset
    // upward by POINTER_OFFSET cells. Compute the resulting bbox top-left in
    // board-local coords, then snap to the grid.
    const cx = x;
    const cy = y - cellSize * POINTER_OFFSET;
    const tlx = cx - rect.left - (cols * cellSize) / 2;
    const tly = cy - rect.top  - (rows * cellSize) / 2;
    const col = Math.round(tlx / cellSize);
    const row = Math.round(tly / cellSize);
    return { row, col };
  }, [boardRef, cellSize]);

  const startDrag = useCallback((piece, e) => {
    const x = e.clientX, y = e.clientY;
    setDrag({
      piece,
      pointer: { x, y },
      snap: computeSnap(piece, x, y),
    });
    if (onPick) onPick();
  }, [computeSnap, onPick]);

  const endDrag = useCallback(() => {
    const d = dragRef.current;
    if (!d) return;
    if (d.snap && onDrop) onDrop(d.piece, d.snap.row, d.snap.col);
    setDrag(null);
  }, [onDrop]);

  // Global pointer move/up handlers (so the user can drag outside the piece)
  useEffect(() => {
    if (!drag) return;
    const handleMove = (e) => {
      const x = e.clientX, y = e.clientY;
      setDrag((d) => {
        if (!d) return d;
        return { ...d, pointer: { x, y }, snap: computeSnap(d.piece, x, y) };
      });
      e.preventDefault();
    };
    const handleUp = () => endDrag();
    const handleCancel = () => setDrag(null);
    window.addEventListener('pointermove', handleMove, { passive: false });
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleCancel);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleCancel);
    };
  }, [drag, computeSnap, endDrag]);

  return { drag, startDrag };
}
