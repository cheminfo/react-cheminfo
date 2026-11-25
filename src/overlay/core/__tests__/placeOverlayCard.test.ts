import { expect, test } from 'vitest';

import { placeOverlayCard } from '../placeOverlayCard.ts';

const CARD = { cardWidth: 200, cardHeight: 80, boxWidth: 600, boxHeight: 400 };

test('with room on both axes the card opens down and to the right', () => {
  expect(
    placeOverlayCard({ ...CARD, pointerX: 100, pointerY: 100 }),
  ).toStrictEqual({ left: 114, top: 114, flippedX: false, flippedY: false });
});

test('near the right edge the card opens to the pointer left instead', () => {
  expect(
    placeOverlayCard({ ...CARD, pointerX: 560, pointerY: 100 }),
  ).toStrictEqual({ left: 346, top: 114, flippedX: true, flippedY: false });
});

test('near the bottom edge the card opens above the pointer', () => {
  expect(
    placeOverlayCard({ ...CARD, pointerX: 100, pointerY: 360 }),
  ).toStrictEqual({ left: 114, top: 266, flippedX: false, flippedY: true });
});

test('in the far corner the card flips on both axes at once', () => {
  expect(
    placeOverlayCard({ ...CARD, pointerX: 560, pointerY: 360 }),
  ).toStrictEqual({ left: 346, top: 266, flippedX: true, flippedY: true });
});

test('a card wider than the plot lands against the left edge, not off it', () => {
  expect(
    placeOverlayCard({
      pointerX: 90,
      pointerY: 40,
      cardWidth: 240,
      cardHeight: 90,
      boxWidth: 180,
      boxHeight: 400,
    }),
  ).toStrictEqual({ left: 0, top: 54, flippedX: true, flippedY: false });
});

test('a card taller than the plot lands against the top edge', () => {
  expect(
    placeOverlayCard({
      pointerX: 40,
      pointerY: 30,
      cardWidth: 120,
      cardHeight: 260,
      boxWidth: 600,
      boxHeight: 200,
    }),
  ).toStrictEqual({ left: 54, top: 0, flippedX: false, flippedY: true });
});

test('a flipped card is clamped to the plot rather than pushed past its edge', () => {
  expect(
    placeOverlayCard({ ...CARD, pointerX: 40, pointerY: 390 }),
  ).toStrictEqual({ left: 54, top: 296, flippedX: false, flippedY: true });
});

test('the gap to the pointer is the caller offset when one is given', () => {
  expect(
    placeOverlayCard({ ...CARD, pointerX: 100, pointerY: 100, offset: 0 }),
  ).toStrictEqual({ left: 100, top: 100, flippedX: false, flippedY: false });
  expect(
    placeOverlayCard({ ...CARD, pointerX: 100, pointerY: 100, offset: 30 }),
  ).toStrictEqual({ left: 130, top: 130, flippedX: false, flippedY: false });
});

test('a card anchored to a mark’s box opens beside the box, and flips to its other side', () => {
  const box = { pointerX: 300, pointerY: 50, anchorWidth: 60, offset: 8 };

  expect([
    placeOverlayCard({ ...CARD, ...box }),
    placeOverlayCard({ ...CARD, ...box, pointerX: 400 }),
    placeOverlayCard({ ...CARD, ...box, anchorWidth: -5 }),
  ]).toStrictEqual([
    { left: 368, top: 58, flippedX: false, flippedY: false },
    { left: 192, top: 58, flippedX: true, flippedY: false },
    { left: 308, top: 58, flippedX: false, flippedY: false },
  ]);
});

test('a card opening above the pointer sits above it, and flips below near the top edge', () => {
  expect([
    placeOverlayCard({ ...CARD, pointerX: 100, pointerY: 200, opens: 'above' }),
    placeOverlayCard({ ...CARD, pointerX: 100, pointerY: 40, opens: 'above' }),
  ]).toStrictEqual([
    { left: 114, top: 106, flippedX: false, flippedY: false },
    { left: 114, top: 54, flippedX: false, flippedY: true },
  ]);
});

test('a card keeps clear of another on the figure: across, then along, then both, else where it opens', () => {
  const card = {
    cardWidth: 100,
    cardHeight: 60,
    boxWidth: 800,
    boxHeight: 600,
  };
  const pointer = { pointerX: 300, pointerY: 300 };
  const loupe = { left: 324, top: 324, width: 120, height: 120 };
  const placed = (avoid: typeof loupe) =>
    placeOverlayCard({ ...card, ...pointer, avoid });

  expect([
    placeOverlayCard({ ...card, ...pointer }),
    placed(loupe),
    placed({ ...loupe, top: 200, height: 250 }),
    placed({ left: 0, top: 0, width: 800, height: 600 }),
  ]).toStrictEqual([
    { left: 314, top: 314, flippedX: false, flippedY: false },
    { left: 314, top: 226, flippedX: false, flippedY: true },
    { left: 186, top: 314, flippedX: true, flippedY: false },
    { left: 314, top: 314, flippedX: false, flippedY: false },
  ]);
});
