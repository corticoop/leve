import React from 'react';

// Bold, black, tucked into the corner.
export default function Score({ score, highScore }) {
  return (
    <div className="score">
      <div className="score__row">
        <span className="score__label">SCORE</span>
        <span className="score__value">{score}</span>
      </div>
      <div className="score__row">
        <span className="score__label">BEST</span>
        <span className="score__value">{highScore}</span>
      </div>
    </div>
  );
}
