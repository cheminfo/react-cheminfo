/**
 * What moves in glassware: the timing of a bubble and of a run, the compact
 * stylesheet a figure carries, and whether a scene has anything to move.
 */

import { expect, test } from 'vitest';

import {
  MOTION_CSS,
  MOTION_STYLE,
  bubbleDelay,
  runTiming,
  sceneMoves,
} from '../motion.ts';
import type { PathPrimitive, Scene, SceneItem } from '../primitives.ts';

function path(extra: Partial<PathPrimitive> = {}): PathPrimitive {
  return { kind: 'path', d: 'M0 0L1 1', width: 1, extent: [], ...extra };
}

function sceneOf(...items: SceneItem[]): Scene {
  return { items, bounds: { x: 0, y: 0, width: 1, height: 1 } };
}

test('a bubble starts a step further into its rise than the one under it', () => {
  expect(bubbleDelay(0)).toBe('0.00s');
  expect(bubbleDelay(1)).toBe('-0.35s');
  expect(bubbleDelay(2)).toBe('-0.70s');
  expect(bubbleDelay(3)).toBe('-1.05s');
  // A whole rise later, the stream starts over.
  expect(bubbleDelay(5)).toBe('-0.35s');
});

test('a run keeps its own clock, repeated for ever', () => {
  expect(
    runTiming({ path: 'M0 0L0 10', begin: 0.5, duration: 2 }),
  ).toStrictEqual({ begin: '0.50s', dur: '2.00s', repeatCount: 'indefinite' });
  expect(
    runTiming({ path: 'M0 0', begin: 1.234, duration: 0.3, still: true }),
  ).toStrictEqual({ begin: '1.23s', dur: '0.30s', repeatCount: 'indefinite' });
});

test('a scene moves when a piece turns, a bubble rises or something runs', () => {
  const owner = { kind: 'glass', id: 'g1' };

  expect(sceneMoves(sceneOf())).toBe(false);
  expect(
    sceneMoves(
      sceneOf({
        owner,
        primitives: [path(), { kind: 'dot', x: 0, y: 0, r: 1 }],
      }),
    ),
  ).toBe(false);
  expect(sceneMoves(sceneOf({ owner, primitives: [], turning: 0 }))).toBe(true);
  expect(
    sceneMoves(sceneOf({ owner, primitives: [path({ bubble: 2 })] })),
  ).toBe(true);
  expect(
    sceneMoves(
      sceneOf(
        { owner, primitives: [path()] },
        {
          owner,
          primitives: [path({ flow: { path: 'M0 0', begin: 0, duration: 1 } })],
        },
      ),
    ),
  ).toBe(true);
});

test('the stylesheet a figure carries is the page one without comments or spare spaces', () => {
  expect(MOTION_CSS).toContain('/* A bubble rises');
  expect(MOTION_STYLE).not.toContain('/*');
  expect(MOTION_STYLE).not.toContain('\n');
  expect(MOTION_STYLE).not.toContain('  ');
  expect(
    MOTION_STYLE.startsWith(
      "[data-motion='moving'] .glass-bubble{animation: glass-bubble-rise 1.4s linear infinite;transform-box: fill-box;}@keyframes glass-bubble-rise{0%{opacity: 0;transform: translateY(0);}20%,75%{opacity: 1;}",
    ),
  ).toBe(true);
  expect(MOTION_STYLE).toContain(
    '@media print,(prefers-reduced-motion: reduce){.glass-bubble,.glass-turning{animation: none;}',
  );
  expect(
    MOTION_STYLE.endsWith(
      "[data-motion='moving'] .glass-stands{display: inline;}}",
    ),
  ).toBe(true);
});
