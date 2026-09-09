import { expect, test } from 'vitest';

import {
  LabelBoxField,
  labelBoxHeight,
  labelBoxWidth,
  labelBoxesOverlap,
} from '../scatterLabelBoxes.ts';
import type { PlacedScatterLabel } from '../scatterLabelPlacement.ts';
import { placeScatterLabels } from '../scatterLabelPlacement.ts';
import type { ScatterPixelLabel } from '../scatterLabels.ts';

const INK = 'var(--text)';

test('a lonely word is written just to the right of what it names', () => {
  const placed = placeScatterLabels([word(100, 100, 'Alpha')]);

  expect(placed).toHaveLength(1);
  expect(placed[0]?.anchor).toBe('start');
  expect(placed[0]?.textX).toBe(106.5);
  expect(placed[0]?.textY).toBe(100);
  expect(placed[0]?.leader).toBeUndefined();
});

test('the second of two words on the same spot is moved off the first', () => {
  const placed = placeScatterLabels([
    word(100, 100, 'Alpha'),
    word(100, 100, 'Beta'),
  ]);

  expect(placed).toHaveLength(2);
  expect(boxesOf(placed).some(overlapsAnother)).toBe(false);
  expect(placed[0]?.anchor).toBe('start');
  expect(placed[1]?.anchor).toBe('end');
});

test('the word speaking for the larger crowd keeps the place both wanted', () => {
  const small = { ...word(100, 100, 'Small'), weight: 3 };
  const large = { ...word(100, 100, 'Large'), weight: 400 };
  const placed = placeScatterLabels([small, large]);

  expect(placed.map((label) => label.text)).toStrictEqual(['Small', 'Large']);
  expect(seatOf(placed, 'Large')?.textX).toBe(106.5);
  expect(seatOf(placed, 'Small')?.anchor).toBe('end');
});

test('a word pushed clear of the crowd carries a line back to its own dot', () => {
  const crowd: ScatterPixelLabel[] = [];
  for (let index = 0; index < 8; index++) {
    crowd.push({ ...word(200, 200, `Group ${index}`), weight: 8 - index });
  }
  const placed = placeScatterLabels(crowd, { centered: true, bold: true });

  expect(placed.length).toBeGreaterThan(4);
  expect(boxesOf(placed, true).some(overlapsAnother)).toBe(false);
  expect(placed[0]?.leader).toBeUndefined();

  const far = placed.at(-1);

  expect(far?.leader).toBeDefined();
  expect(far?.x).toBe(200);
  expect(far?.textX).not.toBe(200);
});

test('a word with nowhere left to go is dropped rather than written over one', () => {
  const stack: ScatterPixelLabel[] = [];
  for (let index = 0; index < 40; index++) {
    stack.push(word(100, 100, `Sample ${index}`));
  }
  const placed = placeScatterLabels(stack, { shift: 20 });

  expect(placed.length).toBeLessThan(12);
  expect(placed[0]?.text).toBe('Sample 0');
  expect(boxesOf(placed).some(overlapsAnother)).toBe(false);
});

test('no word is written outside the plot it belongs to', () => {
  const bounds = { x: 40, y: 10, width: 200, height: 150 };
  const placed = placeScatterLabels(
    [word(45, 15, 'Corner'), word(238, 158, 'Far corner')],
    { bounds },
  );

  for (const box of boxesOf(placed)) {
    expect(box.left).toBeGreaterThanOrEqual(bounds.x);
    expect(box.right).toBeLessThanOrEqual(bounds.x + bounds.width);
    expect(box.top).toBeGreaterThanOrEqual(bounds.y);
    expect(box.bottom).toBeLessThanOrEqual(bounds.y + bounds.height);
  }
});

test('two thousand names on one map are placed in well under a second', () => {
  const many: ScatterPixelLabel[] = [];
  for (let index = 0; index < 2000; index++) {
    many.push(
      word(30 + (index % 50) * 12, 30 + Math.floor(index / 50) * 9, 'S'),
    );
  }
  const started = performance.now();
  const placed = placeScatterLabels(many, {
    bounds: { x: 0, y: 0, width: 640, height: 480 },
  });

  expect(performance.now() - started).toBeLessThan(500);
  expect(placed.length).toBeGreaterThan(100);
  expect(boxesOf(placed).some(overlapsAnother)).toBe(false);
});

test('a word is believed as wide as its widest possible glyphs', () => {
  expect(labelBoxWidth('XTC0240', 12, true)).toBeCloseTo(53.76, 10);
  expect(labelBoxWidth('XTC0240', 10)).toBeCloseTo(42, 10);
  expect(labelBoxHeight(10)).toBe(13);
});

test('the field answers what has been written near a place, and only that', () => {
  const field = new LabelBoxField(32);
  field.add({ left: 0, top: 0, right: 30, bottom: 12 });
  field.add({ left: 400, top: 400, right: 460, bottom: 412 });

  expect(field.fits({ left: 20, top: 6, right: 50, bottom: 18 })).toBe(false);
  expect(field.fits({ left: 31, top: 0, right: 60, bottom: 12 })).toBe(true);
  expect(field.fits({ left: 455, top: 405, right: 470, bottom: 417 })).toBe(
    false,
  );
  expect(
    labelBoxesOverlap(
      { left: 0, top: 0, right: 10, bottom: 10 },
      { left: 10, top: 0, right: 20, bottom: 10 },
    ),
  ).toBe(false);
});

function word(x: number, y: number, text: string): ScatterPixelLabel {
  return { x, y, text, color: INK };
}

function seatOf(
  placed: readonly PlacedScatterLabel[],
  text: string,
): PlacedScatterLabel | undefined {
  return placed.find((label) => label.text === text);
}

/**
 * The rectangle a placed word ended up in, rebuilt from where it is written —
 * the placing keeps no boxes, and a test that trusted its own arithmetic
 * rather than the drawn position would not catch a word drawn elsewhere.
 * @param placed - The words that were placed.
 * @param bold - Whether they were measured in the heavier weight.
 * @returns One rectangle per word.
 */
function boxesOf(placed: readonly PlacedScatterLabel[], bold = false) {
  return placed.map((label) => {
    const width = labelBoxWidth(label.text, 10, bold);
    const height = labelBoxHeight(10);
    const left =
      label.anchor === 'start'
        ? label.textX
        : label.anchor === 'end'
          ? label.textX - width
          : label.textX - width / 2;
    return {
      left,
      right: left + width,
      top: label.textY - height / 2,
      bottom: label.textY + height / 2,
    };
  });
}

function overlapsAnother(
  box: { left: number; top: number; right: number; bottom: number },
  index: number,
  boxes: ReadonlyArray<{
    left: number;
    top: number;
    right: number;
    bottom: number;
  }>,
): boolean {
  for (let other = 0; other < boxes.length; other++) {
    const against = boxes[other];
    if (other === index || against === undefined) continue;
    if (labelBoxesOverlap(box, against)) return true;
  }
  return false;
}
