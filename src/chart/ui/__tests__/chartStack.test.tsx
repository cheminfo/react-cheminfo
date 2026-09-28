// @vitest-environment jsdom
import { afterEach, beforeEach, expect, test } from 'vitest';

import type { ChartStackPane } from '../ChartStack.tsx';

import {
  dragSplitter,
  mountStack,
  paneBoxes,
  paneIds,
  render,
  restedHeights,
  splitSide,
  splitters,
  stackText,
  unmountStack,
} from './chartStackHarness.tsx';
import { clearMountLog, mountLog } from './mountLog.ts';
import { MountProbe } from './mountProbe.tsx';

const chromatogram: ChartStackPane = {
  id: 'chromatogram',
  content: <p>total ion current</p>,
  defaultHeight: 200,
  minimumHeight: 150,
};

const survey: ChartStackPane = {
  id: 'survey',
  content: <p>the survey scan</p>,
  defaultHeight: 260,
};

const fragments: ChartStackPane = {
  id: 'fragments',
  content: <p>what it broke into</p>,
};

beforeEach(mountStack);

afterEach(unmountStack);

test('a stack of one pane is the pane, with no splitter under it', () => {
  render([survey]);

  expect(splitters()).toHaveLength(0);
  expect(paneIds()).toStrictEqual(['survey']);
  expect(stackText()).toBe('the survey scan');
});

test('each pair of panes is parted by one splitter', () => {
  render([chromatogram, survey]);

  expect(splitters()).toHaveLength(1);
  expect(paneIds()).toStrictEqual(['chromatogram', 'survey']);

  render([chromatogram, survey, fragments]);

  expect(splitters()).toHaveLength(2);
  expect(paneIds()).toStrictEqual(['chromatogram', 'survey', 'fragments']);
});

test('every pane is wrapped in a box that may be shrunk', () => {
  render([chromatogram, survey, fragments]);

  expect(paneBoxes().map((box) => box.style.minHeight)).toStrictEqual([
    '0px',
    '0px',
    '0px',
  ]);

  // The reason the wrapper is there at all: the split resets the min-content
  // height of the side it does not control, and never of the side it does —
  // and every pane, the one at the foot included, is a controlled side.
  expect(
    [splitSide(0), splitSide(1), splitSide(2)].map(
      (side) => side.style.minHeight,
    ),
  ).toStrictEqual(['', '', '']);
});

test('the pane at the foot takes what is left, not a height of its own', () => {
  render([chromatogram, survey]);

  expect(splitSide(0).style.height).toBe('200px');
  expect(splitSide(1).style.height).toBe('');
});

test('a pane asking to start under its own minimum starts at the minimum', () => {
  render([{ ...chromatogram, defaultHeight: 40 }, survey]);

  expect(splitSide(0).style.height).toBe('150px');

  // And a pane that named no minimum is held at the one the stack keeps.
  render([{ ...survey, defaultHeight: 40 }, fragments]);

  expect(splitSide(0).style.height).toBe('120px');
});

test('a splitter dragged past a pane leaves it at its minimum, not at nothing', () => {
  render([chromatogram, survey]);

  expect(splitSide(0).style.height).toBe('200px');

  dragSplitter(0, 45);

  expect(splitSide(0).style.height).toBe('150px');
  expect(restedHeights()).toStrictEqual([['chromatogram', 150]]);

  // A drag with room under it is stored as it was made.
  dragSplitter(0, 405);

  expect(splitSide(0).style.height).toBe('400px');
  expect(restedHeights()).toStrictEqual([
    ['chromatogram', 150],
    ['chromatogram', 400],
  ]);
});

test('a pane that leaves the stack comes back the size it was left at', () => {
  render([chromatogram, survey]);
  dragSplitter(0, 405);

  expect(splitSide(0).style.height).toBe('400px');

  render([chromatogram]);

  expect(splitters()).toHaveLength(0);
  expect(paneIds()).toStrictEqual(['chromatogram']);

  render([chromatogram, survey]);

  expect(splitSide(0).style.height).toBe('400px');
});

test('a pane stacked under another leaves the one above it standing', () => {
  const first = { ...chromatogram, content: <MountProbe id="chromatogram" /> };
  const second = { ...survey, content: <MountProbe id="survey" /> };
  const third = { ...fragments, content: <MountProbe id="fragments" /> };

  render([first, second]);

  expect(mountLog()).toStrictEqual(['+chromatogram', '+survey']);

  // The survey is not touched by a pane appearing under it: a chart taken down
  // and stood up again comes back empty, and this one holds twenty thousand
  // points and a window somebody zoomed to.
  clearMountLog();
  render([first, second, third]);

  expect(mountLog()).toStrictEqual(['+fragments']);
  expect(paneIds()).toStrictEqual(['chromatogram', 'survey', 'fragments']);

  clearMountLog();
  render([first, second]);

  expect(mountLog()).toStrictEqual(['-fragments']);
  expect(paneIds()).toStrictEqual(['chromatogram', 'survey']);
});

test('a pane stacked under the only one leaves that one standing too', () => {
  const first = { ...chromatogram, content: <MountProbe id="chromatogram" /> };
  const second = { ...survey, content: <MountProbe id="survey" /> };

  render([first]);
  clearMountLog();
  render([first, second]);

  expect(mountLog()).toStrictEqual(['+survey']);
});
