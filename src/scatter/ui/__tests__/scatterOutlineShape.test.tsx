/**
 * A group's outline whose coordinates are too large to square: the exact
 * projection overflows, so the outline is sampled and each point mapped on its
 * own, which stays linear and so survives.
 *
 * The ellipse is a circle of radius 1e200 in data units, drawn at 1e-198
 * pixels a unit — a circle of radius 100 pixels about (200, 150).
 */

import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import type { ConfidenceEllipse } from '../../core/confidenceEllipse.ts';
import { scatterOutlineShape } from '../scatterOutlineShape.tsx';

const HUGE: ConfidenceEllipse = {
  cx: 0,
  cy: 0,
  rx: 1e200,
  ry: 1e200,
  angle: 0,
  count: 12,
  covariance: { xx: 1, xy: 0, yy: 1 },
};

const X = { offset: 200, factor: 1e-198 };
const Y = { offset: 150, factor: -1e-198 };

function draw(fillOpacity?: number): string {
  return renderToStaticMarkup(
    <svg>
      {scatterOutlineShape(3, HUGE, X, Y, {
        color: '#009e73',
        opacity: 0.8,
        fillOpacity,
      })}
    </svg>,
  );
}

test('an outline too large to project exactly is sampled into a closed path', () => {
  const html = draw();
  const path = /d="(?<d>[^"]*)"/.exec(html)?.groups?.d ?? '';

  expect(html).toMatch(/^<svg><path data-group="3" d="M300 150L/);
  expect(path.endsWith('Z')).toBe(true);
  expect(path.match(/L/g)).toHaveLength(63);
  expect(path).toContain('L200 50L');
  expect(path).toContain('L100 150L');
  expect(html).toContain(
    'opacity="0.8" fill="#009e73" fill-opacity="0.1"></path></svg>',
  );
});

test('a sampled outline asked for no fill is left unfilled', () => {
  expect(draw(0)).toContain('opacity="0.8" fill="none"></path>');
});
