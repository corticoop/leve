// Core game state machine. Uses useReducer for clarity.

import { useReducer, useEffect, useCallback } from 'react';
import {
  emptyBoard,
  canPlace,
  placePiece,
  findClears,
  clearLines,
  anyPieceFits,
  BOARD_SIZE,
} from '../utils/board.js';
import { nextTray } from '../utils/difficulty.js';

const HIGHSCORE_KEY = 'leve.highscore';

function loadHighScore() {
  try {
    const v = parseInt(localStorage.getItem(HIGHSCORE_KEY) || '0', 10);
    return Number.isFinite(v) ? v : 0;
  } catch {
    return 0;
  }
}

function saveHighScore(score) {
  try { localStorage.setItem(HIGHSCORE_KEY, String(score)); } catch {}
}

function initialState() {
  return {
    board: emptyBoard(),
    tray: nextTray(0),
    score: 0,
    highScore: loadHighScore(),
    gameOver: false,
    // ephemeral feedback signals consumed by the App for fairy/audio
    lastEvent: null,    // { kind: 'place' | 'clear' | 'gameover', ... }
    flowStreak: 0,      // consecutive moves that produced a clear
    clearingCells: null, // { rows: [], cols: [] } during clearing animation
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'PLACE': {
      const { piece, row, col } = action;
      if (state.gameOver) return state;
      if (!canPlace(state.board, piece, row, col)) return state;

      const placed = placePiece(state.board, piece, row, col);
      const clears = findClears(placed);
      const totalClears = clears.rows.length + clears.cols.length;

      // Score: 1 per block placed, then bonuses for clears (combo grows fast)
      const placeScore = piece.cells.length;
      // n*(n+1)*5 is generous: 1 clear=10, 2 clears=30, 3=60, 4=100
      const clearScore = totalClears * (totalClears + 1) * 5;
      const flowBonus = totalClears > 0 ? state.flowStreak * 5 : 0;

      // Remove the placed piece from the tray
      const trayIdx = state.tray.findIndex((p) => p && p.id === piece.id);
      const nextTrayArr = state.tray.slice();
      if (trayIdx >= 0) nextTrayArr[trayIdx] = null;

      // Refill the tray if it is empty
      let trayFinal = nextTrayArr;
      const allEmpty = nextTrayArr.every((p) => !p);
      if (allEmpty) trayFinal = nextTray(state.score + placeScore + clearScore + flowBonus);

      // For the clearing animation we postpone the actual line wipe to a
      // follow-up COMMIT_CLEAR action. Until then we keep the placed board.
      const newScore = state.score + placeScore + clearScore + flowBonus;
      const newFlow = totalClears > 0 ? state.flowStreak + 1 : 0;
      const newHigh = Math.max(state.highScore, newScore);
      if (newHigh > state.highScore) saveHighScore(newHigh);

      return {
        ...state,
        board: placed,
        tray: trayFinal,
        score: newScore,
        highScore: newHigh,
        flowStreak: newFlow,
        clearingCells: totalClears > 0 ? clears : null,
        lastEvent: {
          kind: totalClears > 0 ? 'clear' : 'place',
          totalClears,
          flowStreak: newFlow,
          gainedScore: placeScore + clearScore + flowBonus,
          at: performance.now(),
        },
      };
    }

    case 'COMMIT_CLEAR': {
      if (!state.clearingCells) return state;
      const cleared = clearLines(state.board, state.clearingCells);
      // Now check game over with current tray
      const over = !anyPieceFits(cleared, state.tray);
      return {
        ...state,
        board: cleared,
        clearingCells: null,
        gameOver: over,
        lastEvent: over
          ? { kind: 'gameover', at: performance.now() }
          : state.lastEvent,
      };
    }

    case 'CHECK_GAMEOVER': {
      if (state.clearingCells) return state;
      const over = !anyPieceFits(state.board, state.tray);
      if (!over) return state;
      return {
        ...state,
        gameOver: true,
        lastEvent: { kind: 'gameover', at: performance.now() },
      };
    }

    case 'RESET':
      return initialState();

    default:
      return state;
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  // After a placement that triggered clears, commit the clear after the
  // animation duration (matches CSS) and then check for game over.
  useEffect(() => {
    if (!state.clearingCells) return;
    const t = setTimeout(() => dispatch({ type: 'COMMIT_CLEAR' }), 480);
    return () => clearTimeout(t);
  }, [state.clearingCells]);

  // After every non-clearing placement, also check game over.
  useEffect(() => {
    if (state.lastEvent && state.lastEvent.kind === 'place') {
      dispatch({ type: 'CHECK_GAMEOVER' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.lastEvent]);

  const place = useCallback((piece, row, col) => {
    dispatch({ type: 'PLACE', piece, row, col });
  }, []);

  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  return { state, place, reset, BOARD_SIZE };
}
