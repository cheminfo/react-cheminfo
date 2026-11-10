/**
 * Static SVG elements written out as markup, for an image that is no part of
 * the page: attributes spelled as SVG spells them, text escaped, components
 * called with their props.
 */

import type { ReactNode } from 'react';
import { Fragment, createElement, memo } from 'react';
import { expect, test } from 'vitest';

import { svgMarkup } from '../svgMarkup.ts';

function Ring(props: { r: number }): ReactNode {
  return <circle cx={8} cy={8} r={props.r} />;
}

test('attributes are written in SVG spelling, camel case kept where SVG keeps it', () => {
  expect(
    svgMarkup(
      <svg viewBox="0 0 16 16" preserveAspectRatio="none" className="cursor">
        <path
          d="M0 0L16 16"
          strokeWidth={1.5}
          strokeLinecap="round"
          data-part="arm"
          aria-hidden
        />
      </svg>,
    ),
  ).toBe(
    '<svg viewBox="0 0 16 16" preserveAspectRatio="none" class="cursor"><path d="M0 0L16 16" stroke-width="1.5" stroke-linecap="round" data-part="arm" aria-hidden="true"></path></svg>',
  );
});

test('only text, numbers and true are written as attributes, escaped', () => {
  expect(
    svgMarkup(
      <svg focusable={false}>
        <text x={1} fill='a"b<c' opacity={undefined} onClick={() => undefined}>
          {'a < b & c'}
          {3}
          {null}
          {false}
          {true}
        </text>
      </svg>,
    ),
  ).toBe(
    '<svg><text x="1" fill="a&quot;b&lt;c">a &lt; b &amp; c3</text></svg>',
  );
});

test('fragments, arrays and components are written as what they draw', () => {
  expect(
    svgMarkup(
      <g>
        <Ring r={3} />
        {[<line key="a" x1={0} />, <line key="b" x1={1} />]}
      </g>,
    ),
  ).toBe(
    '<g><circle cx="8" cy="8" r="3"></circle><line x1="0"></line><line x1="1"></line></g>',
  );
  expect(svgMarkup(createElement(Fragment, null, 'x', 'y'))).toBe('xy');
});

test('what is not an element of SVG writes nothing', () => {
  expect(svgMarkup(null)).toBe('');
  expect(svgMarkup(undefined)).toBe('');
  expect(svgMarkup(true)).toBe('');
  expect(svgMarkup({} as ReactNode)).toBe('');
  expect(svgMarkup(createElement(memo(Ring), { r: 1 }))).toBe('');
});
