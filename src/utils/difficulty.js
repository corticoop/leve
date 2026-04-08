// Difficulty curve. Determines which pieces show up based on score.
// Always gradual, never spiky. Generous early.

import { PIECE_SHAPES, makePiece } from './pieces.js';

// Weighted draws by tier. Tier 1 = easiest (2-block + straight 3), tier 2 =
// 3-block corners + 2x2 square, tier 3 = T/L/S/4-line shapes.
//
// Returns weights [tier1, tier2, tier3] given a score level.
function tierWeights(score) {
  if (score < 30) return [85, 13, 2];
  if (score < 80) return [70, 22, 8];
  if (score < 160) return [55, 28, 17];
  if (score < 280) return [40, 32, 28];
  if (score < 440) return [28, 34, 38];
  return [20, 32, 48];
}

function shapesByTier(tier) {
  return Object.entries(PIECE_SHAPES)
    .filter(([, def]) => def.tier === tier)
    .map(([name]) => name);
}

const TIER_INDEX = [shapesByTier(1), shapesByTier(2), shapesByTier(3)];

function pickWeighted(weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return weights.length - 1;
}

export function nextPiece(score) {
  const weights = tierWeights(score);
  const tier = pickWeighted(weights);
  const pool = TIER_INDEX[tier];
  const shape = pool[Math.floor(Math.random() * pool.length)];
  return makePiece(shape);
}

// Generate a tray of 3 pieces. Bias toward at least ONE easy piece in each
// tray to keep flow gentle.
export function nextTray(score) {
  const tray = [nextPiece(score), nextPiece(score), nextPiece(score)];
  const hasEasy = tray.some((p) => PIECE_SHAPES[p.shape].tier === 1);
  if (!hasEasy && score < 200) {
    const easy = TIER_INDEX[0];
    const idx = Math.floor(Math.random() * 3);
    tray[idx] = makePiece(easy[Math.floor(Math.random() * easy.length)]);
  }
  return tray;
}
