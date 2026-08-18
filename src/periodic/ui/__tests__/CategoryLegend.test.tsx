import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { CATEGORY_ORDER, categorySwatch } from '../../core/categories.ts';
import { CategoryLegend } from '../CategoryLegend.tsx';

test('the key names all ten families, each with its colour', () => {
  const html = renderToStaticMarkup(<CategoryLegend />);

  for (const category of CATEGORY_ORDER) {
    expect(html).toContain(`background:${categorySwatch(category).background}`);
  }

  expect(html).toContain('Transition metal');
  expect(html).toContain('Noble gas');
});

test('without a handler nothing in the key is focusable', () => {
  const html = renderToStaticMarkup(<CategoryLegend />);

  expect(html).not.toContain('<button');
});

test('with a handler each family becomes a control, and one can be active', () => {
  const html = renderToStaticMarkup(
    <CategoryLegend onSelect={() => null} selected="halogen" />,
  );

  expect(html.split('<button')).toHaveLength(11);

  const halogen = html.split('aria-pressed="true"', 2)[1] ?? '';

  expect(halogen).toContain('Halogen');
  expect(halogen).toContain('font-weight:700');
});
