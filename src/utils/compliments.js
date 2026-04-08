// Hype-friend energy. Body-positive, irreverent, never woo-woo.
// Pool of 30+ — never repeats until exhausted.

export const COMPLIMENT_POOL = [
  'Your butt looks good.',
  'That move was disgusting. In a good way.',
  'You\u2019re the kind of person who remembers birthdays.',
  'Main character energy right now.',
  'That clear? Poetry.',
  'Somebody\u2019s been moisturizing.',
  'You just made math feel sexy.',
  'If that combo were a person, I\u2019d date it.',
  'The grid fears you.',
  'Honestly? Flawless.',
  'That was giving architect.',
  'You smell like good decisions.',
  'Unbothered. Hydrated. Clearing rows.',
  'Your posture just improved. I saw it.',
  'That was so clean I need a moment.',
  'Okay, calm down, Mozart.',
  'You have great hands.',
  'That was almost rude.',
  'I\u2019d let you organize my closet.',
  'Sweetheart, that was art.',
  'You\u2019re glowing and I\u2019m noticing.',
  'Nobody\u2019s done it like that. Nobody.',
  'Iconic. Genuinely iconic.',
  'You\u2019re built different. In a flattering way.',
  'That was a love language.',
  'Whoever raised you did a great job.',
  'I would frame that move.',
  'You\u2019re winning at being a person.',
  'That move was a small symphony.',
  'Look at you, just thriving.',
  'You\u2019re the reason colors exist.',
  'A masterclass. A buffet.',
  'I\u2019m taking notes.',
  'You\u2019re too much. Keep going.',
  'That was practically illegal.',
];

export const GAME_OVER_LINES = [
  'That was beautiful. Let\u2019s go again.',
  'Honestly? Iconic run.',
  'A complete piece of work. (Affectionate.)',
  'I felt that one. Tea soon?',
  'You did a thing. A whole thing.',
  'Round of applause for the human.',
  'We\u2019ll always have that combo.',
];

// A non-repeating shuffler. Keeps state in a closure so the App can have one.
export function makeComplimentBag(pool = COMPLIMENT_POOL) {
  let bag = [];
  const refill = () => {
    bag = pool.slice();
    // Fisher-Yates
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
  };
  return {
    next() {
      if (bag.length === 0) refill();
      return bag.pop();
    },
  };
}

export function randomGameOverLine() {
  return GAME_OVER_LINES[Math.floor(Math.random() * GAME_OVER_LINES.length)];
}
