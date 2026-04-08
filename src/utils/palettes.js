// Palettes: white, shades of beige, black. Accent alternates between red
// and yellow (with a tinge of orange). Red and yellow never appear together.

export const PALETTES = [
  {
    name: 'Paper',
    bg: '#ffffff',
    surface: '#ffffff',
    grid: '#e8e4dc',
    ink: '#000000',
    inkSoft: '#000000',
    accent: '#e5352b',       // red
    accentSoft: '#ef5f56',
    accentInk: '#ffffff',    // text on top of the accent block
    glow: '#ffe0dc',
  },
  {
    name: 'Bone',
    bg: '#f6f1e7',           // cream
    surface: '#f6f1e7',
    grid: '#e0d9c8',
    ink: '#000000',
    inkSoft: '#000000',
    accent: '#f5c518',       // yellow
    accentSoft: '#ffd94a',
    accentInk: '#ffffff',
    glow: '#fff2b8',
  },
  {
    name: 'Linen',
    bg: '#faf6ed',
    surface: '#faf6ed',
    grid: '#e8e1d0',
    ink: '#000000',
    inkSoft: '#000000',
    accent: '#e83216',       // orange-red
    accentSoft: '#f0573c',
    accentInk: '#ffffff',
    glow: '#ffd8ce',
  },
  {
    name: 'Sand',
    bg: '#efe6d2',           // warm beige
    surface: '#efe6d2',
    grid: '#d6cbac',
    ink: '#000000',
    inkSoft: '#000000',
    accent: '#f5b301',       // orange-yellow
    accentSoft: '#ffcf3d',
    accentInk: '#ffffff',
    glow: '#ffe9a8',
  },
  {
    name: 'Clay',
    bg: '#ece1cb',           // deeper beige
    surface: '#ece1cb',
    grid: '#d0c4a4',
    ink: '#000000',
    inkSoft: '#000000',
    accent: '#d4180a',       // deep red
    accentSoft: '#e4463a',
    accentInk: '#ffffff',
    glow: '#ffd0c4',
  },
  {
    name: 'Wheat',
    bg: '#e8ddbe',           // rich beige
    surface: '#e8ddbe',
    grid: '#cdbe92',
    ink: '#000000',
    inkSoft: '#000000',
    accent: '#ffc400',       // bright yellow
    accentSoft: '#ffd84a',
    accentInk: '#ffffff',
    glow: '#fff0a8',
  },
  {
    name: 'Ember',
    bg: '#f4ecd9',
    surface: '#f4ecd9',
    grid: '#ddd0a6',
    ink: '#000000',
    inkSoft: '#000000',
    accent: '#ef4a11',       // bold orange
    accentSoft: '#f47443',
    accentInk: '#ffffff',
    glow: '#ffdcc2',
  },
];

// Palettes unlock as the score climbs — slow, earned, gentle.
export function paletteForScore(score) {
  const thresholds = [0, 60, 160, 320, 540, 820, 1180];
  let idx = 0;
  for (let i = 0; i < thresholds.length; i++) {
    if (score >= thresholds[i]) idx = i;
  }
  return Math.min(idx, PALETTES.length - 1);
}

export function applyPaletteToRoot(palette) {
  const root = document.documentElement;
  root.style.setProperty('--bg', palette.bg);
  root.style.setProperty('--surface', palette.surface);
  root.style.setProperty('--grid', palette.grid);
  root.style.setProperty('--ink', palette.ink);
  root.style.setProperty('--ink-soft', palette.inkSoft);
  root.style.setProperty('--accent', palette.accent);
  root.style.setProperty('--accent-soft', palette.accentSoft);
  root.style.setProperty('--accent-ink', palette.accentInk || '#ffffff');
  root.style.setProperty('--glow', palette.glow);
}
