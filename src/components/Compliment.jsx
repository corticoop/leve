import React from 'react';

// Purely presentational: renders the last affirmation text inside the slot.
// The parent controls visibility (for fade-in/out) and the dismiss timeout
// so we never blank the text mid-fade.
export default function Compliment({ text }) {
  return <span className="compliment__text">{text || '\u00A0'}</span>;
}
