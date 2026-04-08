import React from 'react';

// Warm closing screen. No "GAME OVER". Just the fairy's line and an "Again" button.
export default function GameOver({ line, score, highScore, onAgain }) {
  return (
    <div className="gameover">
      <div className="gameover__inner">
        <p className="gameover__line">{line}</p>
        <div className="gameover__stats">
          <span>{score}</span>
          <span className="gameover__sep">·</span>
          <span>best {highScore}</span>
        </div>
        <button className="gameover__btn" onClick={onAgain}>Again</button>
      </div>
    </div>
  );
}
