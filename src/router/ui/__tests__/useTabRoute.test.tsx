import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, expect, test, vi } from 'vitest';

import { createTabRouter } from '../../core/tabRouter.ts';
import { useTabRoute } from '../useTabRoute.ts';

const router = createTabRouter<'convert' | 'exercises'>({
  tabs: ['convert', { id: 'exercises', takesId: true }],
  home: 'convert',
});

function Probe() {
  const route = useTabRoute(router);
  return (
    <output>{`${route.tab} ${route.id ?? '-'} ${route.params.embed ?? '-'}`}</output>
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

test('a component reads the route of the address on screen', () => {
  vi.stubGlobal('location', {
    pathname: '/exercises/rings',
    search: '?embed=1',
    hash: '',
  });

  expect(renderToStaticMarkup(<Probe />)).toBe(
    '<output>exercises rings 1</output>',
  );
});

test('with no browser the component reads the home route', () => {
  expect(renderToStaticMarkup(<Probe />)).toBe('<output>convert - -</output>');
});
