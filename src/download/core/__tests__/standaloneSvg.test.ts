import { expect, test } from 'vitest';

import {
  FAMILY_FONT,
  FAMILY_TOKEN_VALUES,
} from '../../../tokens/core/familyTokens.ts';
import { standaloneSvg } from '../standaloneSvg.ts';

const ROOT = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="20" viewBox="0 0 40 20" font-family="${FAMILY_FONT}">`;

test('the first figure of the markup is cut out, its tokens written out', () => {
  const markup =
    '<div><svg width="40" height="20"><rect fill="var(--border)" stroke="var(--x-region, rgba(0, 0, 0, 0.5))"/></svg></div>';

  expect(standaloneSvg(markup)).toBe(
    `${ROOT}<rect fill="${FAMILY_TOKEN_VALUES['--border']}" stroke="rgba(0, 0, 0, 0.5)"/></svg>`,
  );
});

test('a named figure is found among others', () => {
  const markup =
    '<svg width="10" height="10"><g/></svg><svg data-figure-name="chart" width="40" height="20"><path d="M0 0"/></svg>';

  expect(standaloneSvg(markup, { name: 'chart' })).toBe(
    `${ROOT}<path d="M0 0"/></svg>`,
  );
  expect(() => standaloneSvg(markup, { name: 'gone' })).toThrow(
    'no figure named gone',
  );
});

test('a figure nesting another, with no size, or reading an unknown token is refused', () => {
  expect(() =>
    standaloneSvg('<svg width="1" height="1"><svg></svg></svg>'),
  ).toThrow('the figure holds another SVG');
  expect(() => standaloneSvg('<svg height="1"><g/></svg>')).toThrow(
    'the figure has no width',
  );
  expect(() =>
    standaloneSvg('<svg width="1" height="1"><g fill="var(--nobody)"/></svg>'),
  ).toThrow('the figure reads a token the family does not declare');
  expect(() => standaloneSvg('<div/>')).toThrow('the markup holds no figure');
});
