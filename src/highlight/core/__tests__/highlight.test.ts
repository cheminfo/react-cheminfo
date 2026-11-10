import { expect, test } from 'vitest';

import type { Highlight } from '../highlight.ts';
import {
  highlightMatches,
  highlightStateOf,
  hoverHighlight,
  sameHighlightKey,
  selectHighlight,
} from '../highlight.ts';

interface PlateKey {
  lane?: number;
  compound?: number;
  spot?: string;
}

function countingCell() {
  let current: PlateKey | null = null;
  const cell = {
    writes: 0,
    get value() {
      return current;
    },
    set value(next: PlateKey | null) {
      current = next;
      cell.writes++;
    },
  };
  return cell;
}

function plateHighlight() {
  const hovered = countingCell();
  const selected = countingCell();
  const highlight: Highlight<PlateKey> = { hovered, selected };
  return { highlight, hovered, selected };
}

test('a record key lights the things that share its fields', () => {
  const spot: PlateKey = { lane: 2, compound: 1, spot: 's7' };

  expect(highlightMatches(spot, { lane: 2, compound: 1 })).toBe(true);
  expect(highlightMatches(spot, { compound: 1 })).toBe(true);
  expect(highlightMatches(spot, { lane: 2 })).toBe(true);
  expect(highlightMatches({ compound: 1 }, spot)).toBe(true);
  expect(highlightMatches({ compound: 1 }, { lane: 2, compound: 0 })).toBe(
    false,
  );
  expect(highlightMatches(spot, { lane: 3, compound: 1 })).toBe(false);
});

test('a record key with no field in common lights nothing', () => {
  expect(highlightMatches({ compound: 1 }, { lane: 2 })).toBe(false);
  expect(highlightMatches({ compound: undefined, lane: 2 }, { lane: 2 })).toBe(
    true,
  );
  expect(highlightMatches({}, { lane: 2 })).toBe(false);
});

test('any other key lights what is identical to it', () => {
  expect(highlightMatches(3, 3)).toBe(true);
  expect(highlightMatches(3, 4)).toBe(false);
  expect(highlightMatches('Fe', 'Fe')).toBe(true);
  expect(highlightMatches(Number.NaN, Number.NaN)).toBe(true);
  expect(highlightMatches<number>(null, 0)).toBe(false);
});

test('two keys are the same when they hold the same fields', () => {
  expect(
    sameHighlightKey({ lane: 2, compound: 1 }, { compound: 1, lane: 2 }),
  ).toBe(true);
  expect(sameHighlightKey({ lane: 2 }, { lane: 2, compound: 1 })).toBe(false);
  expect(sameHighlightKey({ lane: 2, compound: 1 }, { lane: 2 })).toBe(false);
  expect(sameHighlightKey(null, { lane: 2 })).toBe(false);
  expect(sameHighlightKey(null, null)).toBe(true);
  expect(sameHighlightKey(5, 5)).toBe(true);
});

test('a key equal to the one held is not written again', () => {
  const { highlight, hovered, selected } = plateHighlight();

  hoverHighlight(highlight, { lane: 2, compound: 1 });
  hoverHighlight(highlight, { compound: 1, lane: 2 });
  hoverHighlight(highlight, { lane: 3 });
  hoverHighlight(highlight, null);
  hoverHighlight(highlight, null);
  selectHighlight(highlight, { spot: 's1' });
  selectHighlight(highlight, { spot: 's1' });

  expect(hovered.writes).toBe(3);
  expect(hovered.value).toBeNull();
  expect(selected.writes).toBe(1);
  expect(selected.value).toStrictEqual({ spot: 's1' });
});

test('being chosen wins over being pointed at', () => {
  const { highlight } = plateHighlight();
  hoverHighlight(highlight, { lane: 2 });
  selectHighlight(highlight, { lane: 2, compound: 0, spot: 's4' });

  expect(highlightStateOf(highlight, { lane: 2, compound: 0 })).toBe(
    'selected',
  );
  expect(highlightStateOf(highlight, { lane: 2, compound: 1 })).toBe('hovered');
  expect(highlightStateOf(highlight, { lane: 1, compound: 1 })).toBeUndefined();
});
