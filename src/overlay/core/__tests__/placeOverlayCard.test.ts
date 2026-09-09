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
