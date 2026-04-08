import React, { useEffect, useMemo, useRef, useState } from 'react';
import Board from './components/Board.jsx';
import PieceTray from './components/PieceTray.jsx';
import Piece from './components/Piece.jsx';
import Fairy from './components/Fairy.jsx';
import Compliment from './components/Compliment.jsx';
import Score from './components/Score.jsx';
import GameOver from './components/GameOver.jsx';
import { useGameState } from './hooks/useGameState.js';
import { useAudio } from './hooks/useAudio.js';
import { useDragAndDrop, POINTER_OFFSET } from './hooks/useDragAndDrop.js';
import { PALETTES, paletteForScore, applyPaletteToRoot } from './utils/palettes.js';
import { makeComplimentBag, randomGameOverLine } from './utils/compliments.js';
import { BOARD_SIZE } from './utils/board.js';

// Cell size computed to fit the viewport, accounting for header + message slot + tray.
function useCellSize() {
  const [size, setSize] = useState(() => computeSize());
  function computeSize() {
    const vw = Math.min(window.innerWidth, 560);
    const vh = window.innerHeight;
    const maxByW = (vw - 48) / BOARD_SIZE;
    const maxByH = (vh - 360) / BOARD_SIZE;
    return Math.max(36, Math.min(70, Math.floor(Math.min(maxByW, maxByH))));
  }
  useEffect(() => {
    const onResize = () => setSize(computeSize());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return size;
}

function Logo() {
  return (
    <div className="logo">
      <span className="logo__square" />
      <span className="logo__text">LEVE</span>
    </div>
  );
}

export default function App() {
  const cellSize = useCellSize();
  const { state, place, reset } = useGameState();
  const { board, tray, score, highScore, gameOver, lastEvent, clearingCells, flowStreak } = state;

  const audio = useAudio();
  const boardRef = useRef(null);

  // Current compliment drives the slot's fade-in; lastCompliment persists the
  // text through the fade-out so the letters don't disappear before the box.
  const [compliment, setCompliment] = useState(null);
  const [lastCompliment, setLastCompliment] = useState('');
  useEffect(() => {
    if (compliment) setLastCompliment(compliment);
  }, [compliment]);

  // Auto-dismiss the compliment (the rectangle fades back out).
  useEffect(() => {
    if (!compliment) return;
    const t = setTimeout(() => setCompliment(null), 2600);
    return () => clearTimeout(t);
  }, [compliment]);

  const [gameOverLine, setGameOverLine] = useState('');
  const complimentBag = useRef(makeComplimentBag()).current;

  // Palette progression — apply CSS variables on score change.
  const paletteIdx = paletteForScore(score);
  const palette = PALETTES[paletteIdx];
  useEffect(() => { applyPaletteToRoot(palette); }, [palette]);

  // Drag-and-drop
  const handleDrop = (piece, row, col) => place(piece, row, col);
  const { drag, startDrag } = useDragAndDrop({
    boardRef,
    cellSize,
    onDrop: handleDrop,
    onPick: () => audio.playPick(),
  });

  // React to game events: play sound, fairy mood, compliments
  const [fairyMood, setFairyMood] = useState('idle');
  useEffect(() => {
    if (!lastEvent) return;
    if (lastEvent.kind === 'place') {
      audio.playPlace();
      setFairyMood('place');
      const t = setTimeout(() => setFairyMood('idle'), 600);
      return () => clearTimeout(t);
    }
    if (lastEvent.kind === 'clear') {
      const total = lastEvent.totalClears || 1;
      for (let i = 0; i < total; i++) audio.playClear(i, total);
      setFairyMood(total >= 2 || lastEvent.flowStreak >= 2 ? 'combo' : 'clear');
      setCompliment(complimentBag.next());
      const t = setTimeout(() => setFairyMood('idle'), 1100);
      return () => clearTimeout(t);
    }
    if (lastEvent.kind === 'gameover') {
      setFairyMood('over');
      setGameOverLine(randomGameOverLine());
    }
  }, [lastEvent]); // eslint-disable-line react-hooks/exhaustive-deps

  // "Watching" mood when the board gets full
  useEffect(() => {
    if (gameOver) return;
    const filled = board.flat().filter((c) => c != null).length;
    const ratio = filled / (BOARD_SIZE * BOARD_SIZE);
    if (ratio > 0.65 && fairyMood === 'idle') setFairyMood('watching');
    if (ratio <= 0.55 && fairyMood === 'watching') setFairyMood('idle');
  }, [board, gameOver, fairyMood]);

  const handleAgain = () => {
    reset();
    setCompliment(null);
    setFairyMood('idle');
  };

  // Floating drag preview — aligned to snap math.
  const dragPreview = useMemo(() => {
    if (!drag) return null;
    return (
      <div
        className="drag-preview"
        style={{
          left: `${drag.pointer.x}px`,
          top: `${drag.pointer.y - cellSize * POINTER_OFFSET}px`,
        }}
      >
        <Piece piece={drag.piece} cellSize={cellSize} dragging scale={1} />
      </div>
    );
  }, [drag, cellSize]);

  return (
    <div className={`app ${flowStreak >= 2 ? 'app--flow' : ''}`}>
      {/* Mute toggle tucked in the corner so the main column stays centered */}
      <button
        className="mute-btn mute-btn--corner"
        onClick={audio.toggleMute}
        aria-label={audio.muted ? 'Unmute' : 'Mute'}
      >
        {audio.muted ? 'SOUND OFF' : 'SOUND ON'}
      </button>

      <main className="app__main">
        {/* Every element sits inside a stage no wider than the board. */}
        <div
          className="stage"
          style={{ '--board-size': `${cellSize * BOARD_SIZE}px` }}
        >
          {/* Logo + score on one row, right above the affirmation */}
          <div className="brandline">
            <Logo />
            <Score score={score} highScore={highScore} />
          </div>

          {/* Affirmation rectangle: wide, fades in/out with the message */}
          <div className={`message-slot ${compliment ? 'message-slot--on' : ''}`}>
            <Compliment text={lastCompliment} />
          </div>

          <div className="board-wrap">
            <Board
              board={board}
              drag={drag}
              clearingCells={clearingCells}
              cellSize={cellSize}
              boardRef={boardRef}
            />
            <Fairy mood={fairyMood} />
          </div>

          <PieceTray
            tray={tray}
            cellSize={cellSize}
            draggingId={drag?.piece?.id}
            onPickPiece={startDrag}
          />
        </div>
      </main>

      {dragPreview}

      {gameOver && (
        <GameOver
          line={gameOverLine}
          score={score}
          highScore={highScore}
          onAgain={handleAgain}
        />
      )}
    </div>
  );
}
