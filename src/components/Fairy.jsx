import React from 'react';

// A single accent-colored square with a soft halo, living above the
// top-right corner of the board. When an affirmation fires, it loops and
// throws off small magic squares.
//
// `mood`: 'idle' | 'place' | 'clear' | 'combo' | 'watching' | 'over'
export default function Fairy({ mood = 'idle' }) {
  const sparking = mood === 'clear' || mood === 'combo';
  return (
    <div className={`fairy fairy--${mood}`} aria-hidden="true">
      <div className="fairy__halo" />
      <div className="fairy__square" />
      {sparking && (
        <div className="fairy__sparks">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className={`spark spark--${i}`} />
          ))}
        </div>
      )}
    </div>
  );
}
